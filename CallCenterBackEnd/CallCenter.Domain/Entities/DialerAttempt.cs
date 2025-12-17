using CallCenter.Domain.Common.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class DialerAttempt : Entity
{
    // Record and campaign reference
    public Guid RecordId { get; set; }
    public Guid CampaignId { get; set; }

    // Call details
    public required string PhoneNumberDialed { get; set; }
    public int AttemptNumber { get; set; }
    public DateTimeOffset StartedAtUtc { get; set; }
    public DateTimeOffset? ConnectedAtUtc { get; set; }
    public DateTimeOffset? EndedAtUtc { get; set; }

    // Duration
    public int? RingDurationSeconds { get; set; }
    public int? TalkDurationSeconds { get; set; }
    public int? WrapUpDurationSeconds { get; set; }

    // Outcome
    public DialerRecordStatus Outcome { get; set; }
    public string? DispositionCode { get; set; }
    public string? DispositionNotes { get; set; }

    // Agent
    public Guid? AgentId { get; set; }

    // Call provider reference
    public string? ProviderCallId { get; set; }         // Twilio Call SID
    public string? RecordingUrl { get; set; }

    // Quality metrics
    public decimal? SentimentScore { get; set; }        // -1 to 1
    public bool? IsConversion { get; set; }             // Did this result in a sale/success?

    // Callback details (if scheduled)
    public DateTimeOffset? CallbackScheduledUtc { get; set; }
    public string? CallbackNotes { get; set; }

    // Navigation properties
    public virtual DialerRecord Record { get; set; } = null!;
    public virtual DialerCampaign Campaign { get; set; } = null!;
    public virtual Agent? Agent { get; set; }
}
