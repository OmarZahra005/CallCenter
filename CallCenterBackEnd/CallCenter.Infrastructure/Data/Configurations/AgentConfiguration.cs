using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CallCenter.Infrastructure.Data.Configurations;

public class AgentConfiguration : IEntityTypeConfiguration<Agent>
{
    public void Configure(EntityTypeBuilder<Agent> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.EmployeeId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(a => a.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(a => a.Email)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(a => a.Phone)
            .HasMaxLength(20);

        builder.HasIndex(a => a.EmployeeId).IsUnique();
        builder.HasIndex(a => a.Email).IsUnique();

        builder.HasOne(a => a.Team)
            .WithMany(t => t.Agents)
            .HasForeignKey(a => a.TeamId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
