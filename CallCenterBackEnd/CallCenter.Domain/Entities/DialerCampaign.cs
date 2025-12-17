using CallCenter.Domain.Common.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class DialerCampaign : Entity
{
    public required string Name { get; set; }
    public string? Description { get; set; }

    // Dialing configuration
    public DialingMode DialingMode { get; set; } = DialingMode.Preview;
    public DialerCampaignStatus Status { get; set; } = DialerCampaignStatus.Draft;

    // Schedule
    public DateTimeOffset? ScheduledStartUtc { get; set; }
    public DateTimeOffset? ScheduledEndUtc { get; set; }
    public DateTimeOffset? ActualStartUtc { get; set; }
    public DateTimeOffset? ActualEndUtc { get; set; }

    // Calling hours (local time)
    public TimeOnly CallWindowStart { get; set; } = new TimeOnly(9, 0);  // 9 AM
    public TimeOnly CallWindowEnd { get; set; } = new TimeOnly(21, 0);   // 9 PM
    public string TimeZone { get; set; } = "UTC";

    // Days of week to dial (comma-separated: "Mon,Tue,Wed,Thu,Fri")
    public string ActiveDays { get; set; } = "Mon,Tue,Wed,Thu,Fri";

    // Predictive dialer settings
    public int MaxLinesPerAgent { get; set; } = 1;           // For power/predictive mode
    public decimal TargetAbandonmentRate { get; set; } = 3;  // Target abandonment rate %
    public int MaxAttempts { get; set; } = 3;                // Max dial attempts per record
    public int RetryDelayMinutes { get; set; } = 60;         // Minutes between retry attempts
    public int RingDurationSeconds { get; set; } = 30;       // How long to let it ring
    public int AgentWrapUpSeconds { get; set; } = 60;        // After-call work time

    // Caller ID settings
    public string? CallerId { get; set; }                    // Outbound caller ID
    public string? CallerIdName { get; set; }

    // Team/Queue assignment
    public Guid? TeamId { get; set; }
    public Guid? QueueId { get; set; }

    // Statistics (denormalized for quick access)
    public int TotalRecords { get; set; }
    public int PendingRecords { get; set; }
    public int CompletedRecords { get; set; }
    public int ConnectedCalls { get; set; }
    public int TotalAttempts { get; set; }

    // Navigation properties
    public virtual Team? Team { get; set; }
    public virtual Queue? Queue { get; set; }
    public virtual ICollection<DialerList> DialerLists { get; set; } = new List<DialerList>();
    public virtual ICollection<DialerCampaignAgent> CampaignAgents { get; set; } = new List<DialerCampaignAgent>();
}
