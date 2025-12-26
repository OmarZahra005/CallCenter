using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CallCenter.Infrastructure.Data.Configurations;

public class CallSurveyConfiguration : IEntityTypeConfiguration<CallSurvey>
{
    public void Configure(EntityTypeBuilder<CallSurvey> builder)
    {
        builder.ToTable("call_surveys");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.CallId)
            .HasColumnName("call_id")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.AgentId)
            .HasColumnName("agent_id");

        builder.Property(x => x.QueueId)
            .HasColumnName("queue_id");

        builder.Property(x => x.Direction)
            .HasColumnName("direction")
            .HasMaxLength(20);

        builder.Property(x => x.CustomerContactMasked)
            .HasColumnName("customer_contact_masked")
            .HasMaxLength(100);

        builder.Property(x => x.Channel)
            .HasColumnName("channel")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.QuestionCode)
            .HasColumnName("question_code")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Rating)
            .HasColumnName("rating");

        builder.Property(x => x.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Token)
            .HasColumnName("token")
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(x => x.SentAt)
            .HasColumnName("sent_at");

        builder.Property(x => x.RespondedAt)
            .HasColumnName("responded_at");

        builder.Property(x => x.ExpiresAt)
            .HasColumnName("expires_at")
            .IsRequired();

        builder.Property(x => x.ProviderMessageId)
            .HasColumnName("provider_message_id")
            .HasMaxLength(100);

        builder.Property(x => x.RetryCount)
            .HasColumnName("retry_count")
            .HasDefaultValue(0);

        builder.Property(x => x.LastError)
            .HasColumnName("last_error")
            .HasMaxLength(500);

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Unique index on CallId (one survey per call)
        builder.HasIndex(x => x.CallId)
            .IsUnique()
            .HasDatabaseName("ix_call_surveys_call_id");

        // Unique index on Token (for secure URL lookup)
        builder.HasIndex(x => x.Token)
            .IsUnique()
            .HasDatabaseName("ix_call_surveys_token");

        // Index for status queries (pending surveys, expired cleanup, etc.)
        builder.HasIndex(x => x.Status)
            .HasDatabaseName("ix_call_surveys_status");

        // Index for reporting by agent
        builder.HasIndex(x => x.AgentId)
            .HasDatabaseName("ix_call_surveys_agent_id");

        // Composite index for reporting queries
        builder.HasIndex(x => new { x.Status, x.CreatedAt })
            .HasDatabaseName("ix_call_surveys_status_created");

        // Navigation to Agent
        builder.HasOne(x => x.Agent)
            .WithMany()
            .HasForeignKey(x => x.AgentId)
            .OnDelete(DeleteBehavior.SetNull);

        // Check constraint for rating (1-5)
        builder.ToTable(t => t.HasCheckConstraint(
            "ck_call_surveys_rating",
            "rating IS NULL OR (rating >= 1 AND rating <= 5)"));
    }
}
