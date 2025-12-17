using CallCenter.Domain.Common.Entities;

namespace CallCenter.Domain.Entities;

/// <summary>
/// Links agents to campaigns and tracks their dialer session state
/// </summary>
public class DialerCampaignAgent : Entity
{
    public Guid CampaignId { get; set; }
    public Guid AgentId { get; set; }

    // Session state
    public bool IsActive { get; set; }
    public DateTimeOffset? LoggedInAtUtc { get; set; }
    public DateTimeOffset? LoggedOutAtUtc { get; set; }
    public DateTimeOffset? LastCallAtUtc { get; set; }

    // Current assignment (for preview mode)
    public Guid? CurrentRecordId { get; set; }
    public DateTimeOffset? RecordAssignedAtUtc { get; set; }

    // Agent state for predictive algorithm
    public bool IsOnCall { get; set; }
    public bool IsInWrapUp { get; set; }
    public DateTimeOffset? WrapUpEndsAtUtc { get; set; }

    // Session statistics
    public int TotalCallsHandled { get; set; }
    public int TotalConnectedCalls { get; set; }
    public int TotalTalkTimeSeconds { get; set; }
    public int TotalWrapUpTimeSeconds { get; set; }

    // Navigation properties
    public virtual DialerCampaign Campaign { get; set; } = null!;
    public virtual Agent Agent { get; set; } = null!;
    public virtual DialerRecord? CurrentRecord { get; set; }
}
