using CallCenter.Application.DTOs.WhatsApp;
using CallCenter.Application.Interfaces;
using CallCenter.Application.Services;
using CallCenter.Domain.Interfaces;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using CallCenter.Infrastructure.Repositories;
using CallCenter.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CallCenter.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // DbContext
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

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

        // Mock CTI Services
        services.AddScoped<IMockCtiService, MockCtiService>();

        // WhatsApp Services
        var whatsAppSection = configuration.GetSection("WhatsApp");
        var useMockData = bool.Parse(whatsAppSection["UseMockData"] ?? "true");

        services.Configure<WhatsAppOptions>(options =>
        {
            options.UseMockData = useMockData;
            options.PhoneNumberId = whatsAppSection["PhoneNumberId"] ?? "";
            options.AccessToken = whatsAppSection["AccessToken"] ?? "";
            options.WebhookVerifyToken = whatsAppSection["WebhookVerifyToken"] ?? "";
            options.BusinessAccountId = whatsAppSection["BusinessAccountId"] ?? "";
            options.ApiVersion = whatsAppSection["ApiVersion"] ?? "v17.0";
        });

        if (useMockData)
        {
            services.AddScoped<IWhatsAppService, MockWhatsAppService>();
        }
        else
        {
            services.AddScoped<IWhatsAppService, WhatsAppCloudApiService>();
            services.AddScoped<HttpClient>();
        }

        return services;
    }
}
