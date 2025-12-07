using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CallCenter.Infrastructure.Data.Configurations;

public class CallLogConfiguration : IEntityTypeConfiguration<CallLog>
{
    public void Configure(EntityTypeBuilder<CallLog> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.ProviderCallId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.FromNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.ToNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.Direction)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(c => c.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.RecordingUrl)
            .HasMaxLength(500);

        // Index for fast lookups by ProviderCallId (unique to avoid duplicates)
        builder.HasIndex(c => c.ProviderCallId).IsUnique();

        // Index for filtering by status and date
        builder.HasIndex(c => new { c.Status, c.StartedAtUtc });
    }
}
