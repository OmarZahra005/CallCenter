using System.Text;
using CallCenter.Application;
using CallCenter.Application.DTOs.WhatsApp;
using CallCenter.Application.DTOs.Transcription;
using CallCenter.Application.Interfaces;
using CallCenter.Application.Services;
using CallCenter.Infrastructure;
using CallCenter.Infrastructure.Data;
using CallCenter.API.Authorization;
using CallCenter.API.Authentication;
using CallCenter.API.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Ensure camelCase for JSON responses (required for frontend compatibility)
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        // Allow string values for enums (e.g., "Agent" instead of 0)
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddMemoryCache(); // For permission caching

// Add Swagger configuration with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Call Center API", Version = "v1" });
    //c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    //{
    //    Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
    //    Name = "Authorization",
    //    In = ParameterLocation.Header,
    //    Type = SecuritySchemeType.ApiKey,
    //    Scheme = "Bearer"
    //});
    //c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    //{
    //    [new OpenApiSecuritySchemeReference("bearer", document)] = []
    //});
});

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "DefaultSecretKeyThatShouldBeChangedInProduction123!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "CallCenterAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "CallCenterClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
})
.AddScheme<SmartBotApiKeyAuthOptions, SmartBotApiKeyAuthHandler>(
    SmartBotApiKeyAuthOptions.DefaultScheme,
    options =>
    {
        options.ApiKey = builder.Configuration["SmartBotIntegration:ApiKey"] ?? "sb_live_default_key_change_me";
        var allowedIps = builder.Configuration.GetSection("SmartBotIntegration:AllowedIpAddresses").Get<string[]>();
        options.AllowedIpAddresses = allowedIps ?? Array.Empty<string>();
    });

// Configure Authorization with permission-based policies
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
builder.Services.AddAuthorization();

// Configure CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add Clean Architecture layers
builder.Services.AddApplication(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);

// Add SignalR
builder.Services.AddSignalR();

// Register HubNotificationService
builder.Services.AddScoped<CallCenter.Application.Interfaces.IHubNotificationService, CallCenter.API.Services.HubNotificationService>();

// Register AgentRoutingService
builder.Services.AddScoped<IAgentRoutingService, AgentRoutingService>();

// Register Enhanced Routing Service for SmartBot escalations
builder.Services.AddScoped<IEnhancedRoutingService, EnhancedRoutingService>();

// Register SmartBot Escalation Service
builder.Services.AddScoped<ISmartBotEscalationService, SmartBotEscalationService>();

// Register SmartBot Webhook Service for sending notifications to SmartBot
builder.Services.AddHttpClient<ISmartBotWebhookService, SmartBotWebhookService>()
    .ConfigurePrimaryHttpMessageHandler(() =>
    {
        var handler = new HttpClientHandler();
        // Allow self-signed certificates for localhost in development
        handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) =>
        {
            // Allow localhost certificates
            if (message.RequestUri?.Host == "localhost" || message.RequestUri?.Host == "127.0.0.1")
                return true;
            // For other hosts, only allow if no errors
            return errors == System.Net.Security.SslPolicyErrors.None;
        };
        return handler;
    });

// Configure TranscriptionApi options
builder.Services.Configure<TranscriptionApiOptions>(builder.Configuration.GetSection("TranscriptionApi"));

// Register ExternalTranscriptionService with HttpClient
builder.Services.AddHttpClient<IExternalTranscriptionService, ExternalTranscriptionService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/openapi/v1.json", "Call Center API v1");
        c.RoutePrefix = string.Empty;
    });
}

// app.UseHttpsRedirection(); // Disabled for local development
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Map SignalR hub
app.MapHub<CallCenterHub>("/hubs/callcenter");

// Auto-migrate database on startup (creates DB + applies all migrations)
try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseMigration");

        logger.LogInformation("Checking database and applying pending migrations...");
        await db.Database.MigrateAsync();
        logger.LogInformation("Database is up to date.");
    }
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseMigration");
    logger.LogError(ex, "Failed to auto-migrate database. Ensure SQL Server is running and the connection string is correct.");
    throw; // Cannot start without a database
}

// Initialize mock WhatsApp data if enabled
try
{
    using var scope = app.Services.CreateScope();
    var whatsAppOptions = scope.ServiceProvider.GetRequiredService<IOptions<WhatsAppOptions>>().Value;
    if (whatsAppOptions.UseMockData)
    {
        var whatsAppService = scope.ServiceProvider.GetRequiredService<IWhatsAppService>();
        if (whatsAppService is MockWhatsAppService mockService)
        {
            await mockService.InitializeMockDataAsync();
        }
    }
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("Program");
    logger.LogWarning(ex, "Failed to initialize mock WhatsApp data. Continuing without mock data.");
}

app.Run();
