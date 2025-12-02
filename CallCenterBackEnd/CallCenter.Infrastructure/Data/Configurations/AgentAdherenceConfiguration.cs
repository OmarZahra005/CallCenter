using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CallCenter.Infrastructure.Data.Configurations;

public class AgentAdherenceConfiguration : IEntityTypeConfiguration<AgentAdherence>
{
    public void Configure(EntityTypeBuilder<AgentAdherence> builder)
    {
        builder.HasKey(a => a.Id);

        builder.HasOne(a => a.Agent)
            .WithMany()
            .HasForeignKey(a => a.AgentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Shift)
            .WithMany(s => s.Adherences)
            .HasForeignKey(a => a.ShiftId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
