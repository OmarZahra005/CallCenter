using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CallCenter.Infrastructure.Data.Configurations;

public class AgentKpiConfiguration : IEntityTypeConfiguration<AgentKpi>
{
    public void Configure(EntityTypeBuilder<AgentKpi> builder)
    {
        builder.HasKey(a => a.Id);

        builder.HasOne(a => a.Agent)
            .WithMany(ag => ag.Kpis)
            .HasForeignKey(a => a.AgentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(a => new { a.AgentId, a.Date }).IsUnique();
    }
}
