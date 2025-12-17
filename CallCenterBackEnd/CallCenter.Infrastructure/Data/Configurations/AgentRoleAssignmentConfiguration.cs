using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CallCenter.Infrastructure.Data.Configurations;

public class AgentRoleAssignmentConfiguration : IEntityTypeConfiguration<AgentRoleAssignment>
{
    public void Configure(EntityTypeBuilder<AgentRoleAssignment> builder)
    {
        builder.HasKey(ara => new { ara.AgentId, ara.RoleId });

        builder.HasOne(ara => ara.Agent)
            .WithMany(a => a.RoleAssignments)
            .HasForeignKey(ara => ara.AgentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ara => ara.Role)
            .WithMany(r => r.AgentRoles)
            .HasForeignKey(ara => ara.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ara => ara.AssignedBy)
            .WithMany()
            .HasForeignKey(ara => ara.AssignedById)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
