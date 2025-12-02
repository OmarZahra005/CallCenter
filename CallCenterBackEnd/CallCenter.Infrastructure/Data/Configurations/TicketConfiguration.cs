using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CallCenter.Infrastructure.Data.Configurations;

public class TicketConfiguration : IEntityTypeConfiguration<Ticket>
{
    public void Configure(EntityTypeBuilder<Ticket> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.TicketNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(t => t.Category)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Subcategory)
            .HasMaxLength(50);

        builder.Property(t => t.Subject)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasIndex(t => t.TicketNumber).IsUnique();

        builder.HasOne(t => t.Customer)
            .WithMany(c => c.Tickets)
            .HasForeignKey(t => t.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Agent)
            .WithMany()
            .HasForeignKey(t => t.AgentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(t => t.Team)
            .WithMany()
            .HasForeignKey(t => t.TeamId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(t => t.Conversation)
            .WithMany(c => c.Tickets)
            .HasForeignKey(t => t.ConversationId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
