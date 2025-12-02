using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CallCenter.Infrastructure.Data.Configurations;

public class TimeOffRequestConfiguration : IEntityTypeConfiguration<TimeOffRequest>
{
    public void Configure(EntityTypeBuilder<TimeOffRequest> builder)
    {
        builder.HasKey(t => t.Id);

        builder.HasOne(t => t.Agent)
            .WithMany()
            .HasForeignKey(t => t.AgentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.ApprovedByAgent)
            .WithMany()
            .HasForeignKey(t => t.ApprovedBy)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
