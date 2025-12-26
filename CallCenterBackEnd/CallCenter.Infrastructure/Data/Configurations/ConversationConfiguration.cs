using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CallCenter.Infrastructure.Data.Configurations;

public class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.HasKey(c => c.Id);

        builder.HasOne(c => c.Customer)
            .WithMany(cust => cust.Conversations)
            .HasForeignKey(c => c.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Agent)
            .WithMany()
            .HasForeignKey(c => c.AgentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(c => c.Queue)
            .WithMany(q => q.Conversations)
            .HasForeignKey(c => c.QueueId)
            .OnDelete(DeleteBehavior.SetNull);

        // SmartBot Handoff configuration
        builder.Property(c => c.HandoffStatus)
            .HasDefaultValue(CallCenter.Domain.Enums.HandoffStatus.None);

        builder.Property(c => c.SmartBotSessionId)
            .HasMaxLength(200);

        builder.Property(c => c.HandoffEndedBy)
            .HasMaxLength(50);

        // Index for efficient handoff queries
        builder.HasIndex(c => c.HandoffStatus);
        builder.HasIndex(c => c.SmartBotSessionId);
    }
}
