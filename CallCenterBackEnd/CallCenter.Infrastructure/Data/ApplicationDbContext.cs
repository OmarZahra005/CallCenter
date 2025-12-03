using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // CTI Integration
    public DbSet<CtiEvent> CtiEvents => Set<CtiEvent>();
    public DbSet<AgentState> AgentStates => Set<AgentState>();

    // Organization & Teams
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Agent> Agents => Set<Agent>();
    public DbSet<Queue> Queues => Set<Queue>();
    public DbSet<AgentSkill> AgentSkills => Set<AgentSkill>();

    // Customers
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerInteraction> CustomerInteractions => Set<CustomerInteraction>();
    public DbSet<CustomerNote> CustomerNotes => Set<CustomerNote>();

    // Conversations
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ConversationMessage> ConversationMessages => Set<ConversationMessage>();

    // Ticketing
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketStatusHistory> TicketStatusHistories => Set<TicketStatusHistory>();
    public DbSet<TicketNote> TicketNotes => Set<TicketNote>();
    public DbSet<TicketAttachment> TicketAttachments => Set<TicketAttachment>();
    public DbSet<CallDisposition> CallDispositions => Set<CallDisposition>();
    public DbSet<ConversationDisposition> ConversationDispositions => Set<ConversationDisposition>();

    // SLA
    public DbSet<SlaRule> SlaRules => Set<SlaRule>();
    public DbSet<TicketSlaTracking> TicketSlaTrackings => Set<TicketSlaTracking>();

    // AI & Speech
    public DbSet<CallTranscription> CallTranscriptions => Set<CallTranscription>();
    public DbSet<AiSuggestion> AiSuggestions => Set<AiSuggestion>();
    public DbSet<KnowledgeBaseArticle> KnowledgeBaseArticles => Set<KnowledgeBaseArticle>();
    public DbSet<ArticleSearchLog> ArticleSearchLogs => Set<ArticleSearchLog>();

    // Analytics
    public DbSet<AgentKpi> AgentKpis => Set<AgentKpi>();
    public DbSet<QueueMetric> QueueMetrics => Set<QueueMetric>();
    public DbSet<TeamKpi> TeamKpis => Set<TeamKpi>();

    // Customer Satisfaction
    public DbSet<CustomerSatisfactionSurvey> CustomerSatisfactionSurveys => Set<CustomerSatisfactionSurvey>();

    // Workforce Management
    public DbSet<AgentShift> AgentShifts => Set<AgentShift>();
    public DbSet<AgentAdherence> AgentAdherences => Set<AgentAdherence>();
    public DbSet<TimeOffRequest> TimeOffRequests => Set<TimeOffRequest>();

    // QA
    public DbSet<QaEvaluationForm> QaEvaluationForms => Set<QaEvaluationForm>();
    public DbSet<QaFormCriteria> QaFormCriteria => Set<QaFormCriteria>();
    public DbSet<QaScorecard> QaScorecards => Set<QaScorecard>();
    public DbSet<QaScorecardDetail> QaScorecardDetails => Set<QaScorecardDetail>();
    public DbSet<CoachingSession> CoachingSessions => Set<CoachingSession>();
    public DbSet<CallRecording> CallRecordings => Set<CallRecording>();

    // Alerts
    public DbSet<AlertRule> AlertRules => Set<AlertRule>();
    public DbSet<AlertLog> AlertLogs => Set<AlertLog>();

    // System
    public DbSet<DataExportLog> DataExportLogs => Set<DataExportLog>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    // Notifications (from improved version)
    public DbSet<Notification> Notifications => Set<Notification>();

    // Auth
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Seed default admin user
        // Password: Admin123!
        var adminId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        var teamId = Guid.Parse("00000000-0000-0000-0000-000000000001");

        modelBuilder.Entity<Team>().HasData(new Team
        {
            Id = teamId,
            Name = "Default Team",
            Description = "Default team for administrators",
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        modelBuilder.Entity<Agent>().HasData(new Agent
        {
            Id = adminId,
            EmployeeId = "EMP000001",
            Name = "Admin User",
            Email = "admin@callcenter.com",
            PasswordHash = "AQAAAAIAAYagAAAAEOJxuO92MLN7XE7EPQ3Bue31LffoINetW58iZIf3CjeP5alHxX5ikZGiDJ5qpAQpng==", // Qwerty12345_
            Phone = "+1234567890",
            TeamId = teamId,
            Role = Domain.Enums.AgentRole.Supervisor,
            Status = Domain.Enums.AgentStatus.Active,
            HireDate = new DateOnly(2024, 1, 1),
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        // Configure table names to use snake_case
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            entity.SetTableName(ToSnakeCase(entity.GetTableName()!));

            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(ToSnakeCase(property.Name));
            }

            foreach (var key in entity.GetKeys())
            {
                key.SetName(ToSnakeCase(key.GetName()!));
            }

            foreach (var fk in entity.GetForeignKeys())
            {
                fk.SetConstraintName(ToSnakeCase(fk.GetConstraintName()!));
            }

            foreach (var index in entity.GetIndexes())
            {
                index.SetDatabaseName(ToSnakeCase(index.GetDatabaseName()!));
            }
        }
    }

    private static string ToSnakeCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;

        var result = new System.Text.StringBuilder();
        for (int i = 0; i < input.Length; i++)
        {
            var c = input[i];
            if (char.IsUpper(c))
            {
                if (i > 0) result.Append('_');
                result.Append(char.ToLower(c));
            }
            else
            {
                result.Append(c);
            }
        }
        return result.ToString();
    }
}
