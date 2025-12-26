using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CallCenter.Infrastructure.Data.Configurations;

public class SmartBotEscalationConfiguration : IEntityTypeConfiguration<SmartBotEscalation>
{
    public void Configure(EntityTypeBuilder<SmartBotEscalation> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.SmartBotConversationId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.SmartBotSessionId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.SmartBotChatbotId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Topic)
            .HasMaxLength(200);

        builder.Property(e => e.Sentiment)
            .HasMaxLength(50);

        builder.Property(e => e.CustomerName)
            .HasMaxLength(200);

        builder.Property(e => e.CustomerEmail)
            .HasMaxLength(200);

        builder.Property(e => e.CustomerPhone)
            .HasMaxLength(50);

        builder.Property(e => e.PreferredLanguage)
            .HasMaxLength(10);

        builder.Property(e => e.AssignedAgentName)
            .HasMaxLength(200);

        builder.Property(e => e.Resolution)
            .HasMaxLength(500);

        builder.Property(e => e.ResolutionNotes)
            .HasMaxLength(2000);

        // Index on SmartBot conversation ID for lookups
        builder.HasIndex(e => e.SmartBotConversationId);

        // Index on status for filtering
        builder.HasIndex(e => e.Status);

        // Index on escalation date
        builder.HasIndex(e => e.EscalatedAt);

        // Relationships
        builder.HasOne(e => e.Ticket)
            .WithMany()
            .HasForeignKey(e => e.TicketId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Conversation)
            .WithOne(c => c.SmartBotEscalation)
            .HasForeignKey<SmartBotEscalation>(e => e.ConversationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Customer)
            .WithMany()
            .HasForeignKey(e => e.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.AssignedAgent)
            .WithMany()
            .HasForeignKey(e => e.AssignedAgentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.AssignedQueue)
            .WithMany()
            .HasForeignKey(e => e.AssignedQueueId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(e => e.Logs)
            .WithOne(l => l.Escalation)
            .HasForeignKey(l => l.EscalationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class SmartBotEscalationLogConfiguration : IEntityTypeConfiguration<SmartBotEscalationLog>
{
    public void Configure(EntityTypeBuilder<SmartBotEscalationLog> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.EventType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(l => l.Action)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(l => l.Details)
            .HasMaxLength(1000);

        builder.Property(l => l.ActorId)
            .HasMaxLength(100);

        builder.Property(l => l.ActorName)
            .HasMaxLength(200);

        builder.Property(l => l.Source)
            .IsRequired()
            .HasMaxLength(50);

        // Index on escalation ID for lookups
        builder.HasIndex(l => l.EscalationId);

        // Index on timestamp for sorting
        builder.HasIndex(l => l.Timestamp);
    }
}
