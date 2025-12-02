using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CallCenter.Infrastructure.Data.Configurations;

public class QaScorecardConfiguration : IEntityTypeConfiguration<QaScorecard>
{
    public void Configure(EntityTypeBuilder<QaScorecard> builder)
    {
        builder.HasKey(q => q.Id);

        builder.HasOne(q => q.Agent)
            .WithMany()
            .HasForeignKey(q => q.AgentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(q => q.Evaluator)
            .WithMany()
            .HasForeignKey(q => q.EvaluatorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(q => q.Form)
            .WithMany(f => f.Scorecards)
            .HasForeignKey(q => q.FormId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
