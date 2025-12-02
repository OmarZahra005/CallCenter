using System.Text;
using CallCenter.Application;
using CallCenter.Application.DTOs.WhatsApp;
using CallCenter.Application.Interfaces;
using CallCenter.Application.Services;
using CallCenter.Infrastructure;
using CallCenter.API.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Call Center API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
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
});

builder.Services.AddAuthorization();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5175")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add Clean Architecture layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Add SignalR
builder.Services.AddSignalR();

// Register HubNotificationService
builder.Services.AddScoped<CallCenter.Application.Interfaces.IHubNotificationService, CallCenter.API.Services.HubNotificationService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Call Center API v1");
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

// Initialize mock WhatsApp data if enabled
using (var scope = app.Services.CreateScope())
{
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

app.Run();
