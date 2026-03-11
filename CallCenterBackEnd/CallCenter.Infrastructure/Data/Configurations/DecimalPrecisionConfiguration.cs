using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CallCenter.Infrastructure.Data.Configurations;

public class AlertLogConfiguration : IEntityTypeConfiguration<AlertLog>
{
    public void Configure(EntityTypeBuilder<AlertLog> builder)
    {
        builder.Property(x => x.MetricValue).HasPrecision(18, 2);
        builder.Property(x => x.ThresholdValue).HasPrecision(18, 2);
    }
}

public class AlertRuleConfiguration : IEntityTypeConfiguration<AlertRule>
{
    public void Configure(EntityTypeBuilder<AlertRule> builder)
    {
        builder.Property(x => x.Threshold).HasPrecision(18, 2);
    }
}

public class DialerAttemptConfiguration : IEntityTypeConfiguration<DialerAttempt>
{
    public void Configure(EntityTypeBuilder<DialerAttempt> builder)
    {
        builder.Property(x => x.SentimentScore).HasPrecision(5, 4);
    }
}

public class DialerCampaignConfiguration : IEntityTypeConfiguration<DialerCampaign>
{
    public void Configure(EntityTypeBuilder<DialerCampaign> builder)
    {
        builder.Property(x => x.TargetAbandonmentRate).HasPrecision(5, 2);
    }
}

public class SurveyResponseConfiguration : IEntityTypeConfiguration<SurveyResponse>
{
    public void Configure(EntityTypeBuilder<SurveyResponse> builder)
    {
        builder.Property(x => x.OverallScore).HasPrecision(5, 2);
    }
}
