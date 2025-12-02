using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CallCenter.Infrastructure.Data.Configurations;

public class CoachingSessionConfiguration : IEntityTypeConfiguration<CoachingSession>
{
    public void Configure(EntityTypeBuilder<CoachingSession> builder)
    {
        builder.HasKey(c => c.Id);

        builder.HasOne(c => c.Agent)
            .WithMany()
            .HasForeignKey(c => c.AgentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Coach)
            .WithMany()
            .HasForeignKey(c => c.CoachId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Scorecard)
            .WithMany(s => s.CoachingSessions)
            .HasForeignKey(c => c.ScorecardId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
