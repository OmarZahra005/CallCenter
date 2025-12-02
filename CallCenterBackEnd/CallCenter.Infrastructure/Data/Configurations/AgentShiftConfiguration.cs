using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CallCenter.Infrastructure.Data.Configurations;

public class AgentShiftConfiguration : IEntityTypeConfiguration<AgentShift>
{
    public void Configure(EntityTypeBuilder<AgentShift> builder)
    {
        builder.HasKey(a => a.Id);

        builder.HasOne(a => a.Agent)
            .WithMany(ag => ag.Shifts)
            .HasForeignKey(a => a.AgentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
