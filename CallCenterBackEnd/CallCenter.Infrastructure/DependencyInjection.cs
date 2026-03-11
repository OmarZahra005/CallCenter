using CallCenter.Application.Interfaces;
using CallCenter.Application.Options;
using CallCenter.Application.Services;
using CallCenter.Domain.Interfaces;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using CallCenter.Infrastructure.External;
using CallCenter.Infrastructure.Repositories;
using CallCenter.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;
using Polly.Extensions.Http;

namespace CallCenter.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // DbContext
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"),
                sqlOptions => sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorNumbersToAdd: null)));

        // CRM Integration Options
        services.Configure<CrmIntegrationOptions>(
            configuration.GetSection(CrmIntegrationOptions.SectionName));

        // Generic Repository
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        // Specific Repositories
        services.AddScoped<IAgentRepository, AgentRepository>();
        services.AddScoped<ITeamRepository, TeamRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<ITicketRepository, TicketRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddScoped<IQueueRepository, QueueRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IQaScorecardRepository, QaScorecardRepository>();
        services.AddScoped<IQaEvaluationFormRepository, QaEvaluationFormRepository>();
        services.AddScoped<ICallRecordingRepository, CallRecordingRepository>();
        services.AddScoped<IKnowledgeBaseArticleRepository, KnowledgeBaseArticleRepository>();
        services.AddScoped<IAgentShiftRepository, AgentShiftRepository>();
        services.AddScoped<ISlaRuleRepository, SlaRuleRepository>();
        services.AddScoped<ICoachingSessionRepository, CoachingSessionRepository>();
        services.AddScoped<IAlertRuleRepository, AlertRuleRepository>();
        services.AddScoped<ICallLogRepository, CallLogRepository>();
        services.AddScoped<IConversationNoteRepository, ConversationNoteRepository>();
        services.AddScoped<IConversationMessageRepository, ConversationMessageRepository>();
        services.AddScoped<ISystemSettingRepository, SystemSettingRepository>();
        services.AddScoped<ICallSurveyRepository, CallSurveyRepository>();

        // Encryption Service (singleton for performance)
        services.AddSingleton<IEncryptionService, EncryptionService>();

        // Services
        services.AddSingleton<ILocalizationService, LocalizationService>();
        services.AddScoped<INotificationService, NotificationService>();

        // Application Services
        services.AddScoped<IAgentService, AgentService>();
        services.AddScoped<ITeamService, TeamService>();
        services.AddScoped<IQueueService, QueueService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ITicketService, TicketService>();
        services.AddScoped<IConversationService, ConversationService>();

        // Phase 2 Services
        services.AddScoped<ICtiService, CtiService>();
        services.AddScoped<IAgentStateService, AgentStateService>();
        services.AddScoped<ISlaService, SlaService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();
        services.AddScoped<IWorkforceService, WorkforceService>();

        // Phase 3 Services
        services.AddScoped<IKnowledgeBaseService, KnowledgeBaseService>();
        services.AddScoped<INotificationApiService, NotificationApiService>();

        // Auth Services
        services.AddScoped<IAuthService, AuthService>();

        // RBAC Services
        services.AddScoped<IPermissionService, PermissionService>();
        services.AddScoped<IRoleService, RoleService>();

        // Phase 5 Services
        services.AddScoped<ICallRecordingService, CallRecordingService>();
        services.AddScoped<IRecordingStorageService, RecordingStorageService>();
        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddScoped<IReportService, ReportService>();

        // QA Services
        services.AddScoped<IQaService, QaService>();

        // Transcription Services
        services.AddScoped<ITranscriptionService, TranscriptionService>();

        // Adherence Services
        services.AddScoped<IAdherenceService, AdherenceService>();

        // Export Services
        services.AddScoped<IExportService, ExportService>();

        // Dashboard Services
        services.AddScoped<IDashboardService, DashboardService>();

        // Timeline Services
        services.AddScoped<ITimelineService, TimelineService>();

        // Dialer Services
        services.AddScoped<IDialerService, Services.DialerService>();

        // IVR Services
        services.AddScoped<IIvrService, Services.IvrService>();

        // System Settings Services
        services.AddScoped<ISystemSettingService, SystemSettingService>();
        services.AddScoped<IDatabaseOptionsProvider, DatabaseOptionsProvider>();

        // Post-Call Survey Services
        services.AddScoped<ICallSurveyService, CallSurveyService>();
        services.AddScoped<ISurveyMessageService, SurveyMessageService>();

        // Mock CTI Services
        services.AddScoped<IMockCtiService, MockCtiService>();

        // WhatsApp Services
        // Note: WhatsApp options are now loaded from database via IDatabaseOptionsProvider
        // The UseMockData flag in config only controls which service implementation is used at startup
        var useMockData = bool.Parse(configuration["WhatsApp:UseMockData"] ?? "true");

        if (useMockData)
        {
            services.AddScoped<IWhatsAppService, MockWhatsAppService>();
        }
        else
        {
            services.AddScoped<IWhatsAppService, WhatsAppCloudApiService>();
            services.AddHttpClient<WhatsAppCloudApiService>();
        }

        // CRM Integration Service with Polly resilience policies
        var crmOptions = configuration.GetSection(CrmIntegrationOptions.SectionName).Get<CrmIntegrationOptions>()
            ?? new CrmIntegrationOptions();

        services.AddHttpClient<ICrmIntegrationService, CrmIntegrationService>()
            .AddPolicyHandler(GetRetryPolicy(crmOptions))
            .AddPolicyHandler(GetCircuitBreakerPolicy(crmOptions));

        return services;
    }

    /// <summary>
    /// Creates a retry policy with exponential backoff for transient HTTP errors.
    /// </summary>
    private static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy(CrmIntegrationOptions options)
    {
        return HttpPolicyExtensions
            .HandleTransientHttpError()
            .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
            .WaitAndRetryAsync(
                options.RetryCount,
                retryAttempt => TimeSpan.FromMilliseconds(options.RetryDelayMs * Math.Pow(2, retryAttempt - 1)),
                onRetry: (outcome, timespan, retryAttempt, context) =>
                {
                    // Logging is handled by the service itself
                });
    }

    /// <summary>
    /// Creates a circuit breaker policy to prevent cascading failures.
    /// Opens after threshold failures, stays open for duration.
    /// </summary>
    private static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy(CrmIntegrationOptions options)
    {
        return HttpPolicyExtensions
            .HandleTransientHttpError()
            .CircuitBreakerAsync(
                options.CircuitBreakerThreshold,
                TimeSpan.FromSeconds(options.CircuitBreakerDurationSeconds));
    }
}
