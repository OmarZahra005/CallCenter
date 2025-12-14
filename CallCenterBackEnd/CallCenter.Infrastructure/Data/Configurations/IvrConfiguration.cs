using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CallCenter.Infrastructure.Data.Configurations;

public class IvrFlowConfiguration : IEntityTypeConfiguration<IvrFlow>
{
    public void Configure(EntityTypeBuilder<IvrFlow> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(f => f.Description)
            .HasMaxLength(500);

        builder.Property(f => f.PhoneNumbers)
            .HasMaxLength(500);

        builder.Property(f => f.DefaultLanguage)
            .HasMaxLength(10)
            .HasDefaultValue("en-US");

        builder.Property(f => f.DefaultVoice)
            .HasMaxLength(50)
            .HasDefaultValue("Polly.Joanna");

        builder.Property(f => f.BusinessHoursStart)
            .HasMaxLength(10);

        builder.Property(f => f.BusinessHoursEnd)
            .HasMaxLength(10);

        builder.Property(f => f.BusinessDays)
            .HasMaxLength(100);

        builder.HasMany(f => f.Nodes)
            .WithOne(n => n.Flow)
            .HasForeignKey(n => n.FlowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(f => f.IsDefault);
        builder.HasIndex(f => f.IsActive);
    }
}

public class IvrNodeConfiguration : IEntityTypeConfiguration<IvrNode>
{
    public void Configure(EntityTypeBuilder<IvrNode> builder)
    {
        builder.HasKey(n => n.Id);

        builder.Property(n => n.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(n => n.MessageText)
            .HasMaxLength(2000);

        builder.Property(n => n.AudioUrl)
            .HasMaxLength(500);

        builder.Property(n => n.Language)
            .HasMaxLength(10);

        builder.Property(n => n.Voice)
            .HasMaxLength(50);

        builder.Property(n => n.InvalidInputMessage)
            .HasMaxLength(500);

        builder.Property(n => n.TimeoutMessage)
            .HasMaxLength(500);

        builder.Property(n => n.TransferPhoneNumber)
            .HasMaxLength(20);

        builder.Property(n => n.FinishOnKey)
            .HasMaxLength(5);

        builder.Property(n => n.DigitsVariableName)
            .HasMaxLength(50);

        builder.Property(n => n.ConditionVariable)
            .HasMaxLength(50);

        builder.Property(n => n.ConditionOperator)
            .HasMaxLength(20);

        builder.Property(n => n.ConditionValue)
            .HasMaxLength(200);

        builder.Property(n => n.HttpUrl)
            .HasMaxLength(500);

        builder.Property(n => n.HttpMethod)
            .HasMaxLength(10);

        builder.Property(n => n.VoicemailEmail)
            .HasMaxLength(200);

        builder.HasMany(n => n.MenuOptions)
            .WithOne(o => o.Node)
            .HasForeignKey(o => o.NodeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(n => n.FlowId);
        builder.HasIndex(n => n.NodeType);
    }
}

public class IvrMenuOptionConfiguration : IEntityTypeConfiguration<IvrMenuOption>
{
    public void Configure(EntityTypeBuilder<IvrMenuOption> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Digit)
            .IsRequired()
            .HasMaxLength(5);

        builder.Property(o => o.Label)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(o => o.Description)
            .HasMaxLength(500);

        // Explicit relationship for TargetNode (no cascade delete since target might be referenced elsewhere)
        builder.HasOne(o => o.TargetNode)
            .WithMany()
            .HasForeignKey(o => o.TargetNodeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(o => o.NodeId);
        builder.HasIndex(o => new { o.NodeId, o.Digit }).IsUnique();
    }
}

public class IvrCallSessionConfiguration : IEntityTypeConfiguration<IvrCallSession>
{
    public void Configure(EntityTypeBuilder<IvrCallSession> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.CallSid)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.CallerNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(s => s.CalledNumber)
            .HasMaxLength(20);

        builder.Property(s => s.Variables)
            .HasColumnType("nvarchar(max)");

        builder.Property(s => s.NodePath)
            .HasColumnType("nvarchar(max)");

        builder.Property(s => s.LastDigits)
            .HasMaxLength(50);

        builder.Property(s => s.Outcome)
            .HasMaxLength(100);

        builder.HasOne(s => s.Flow)
            .WithMany()
            .HasForeignKey(s => s.FlowId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.CurrentNode)
            .WithMany()
            .HasForeignKey(s => s.CurrentNodeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(s => s.CallSid).IsUnique();
        builder.HasIndex(s => s.IsActive);
        builder.HasIndex(s => s.StartedAtUtc);
    }
}
