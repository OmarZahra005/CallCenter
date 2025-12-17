using CallCenter.Domain.Common.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class DialerRecord : Entity
{
    // List association
    public Guid ListId { get; set; }

    // Contact information
    public required string PhoneNumber { get; set; }
    public string? PhoneNumber2 { get; set; }           // Alternative number
    public string? PhoneNumber3 { get; set; }           // Additional number
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Company { get; set; }

    // Custom fields (JSON storage for flexibility)
    public string? CustomFields { get; set; }

    // Status tracking
    public DialerRecordStatus Status { get; set; } = DialerRecordStatus.Pending;
    public int AttemptCount { get; set; }
    public DateTimeOffset? LastAttemptUtc { get; set; }
    public DateTimeOffset? NextAttemptUtc { get; set; }
    public DateTimeOffset? CompletedAtUtc { get; set; }

    // Outcome tracking
    public string? LastDisposition { get; set; }
    public string? Notes { get; set; }

    // Agent assignment (for preview mode)
    public Guid? AssignedAgentId { get; set; }
    public DateTimeOffset? AssignedAtUtc { get; set; }

    // Callback scheduling
    public DateTimeOffset? CallbackScheduledUtc { get; set; }
    public Guid? CallbackAgentId { get; set; }

    // Customer link (if matched)
    public Guid? CustomerId { get; set; }

    // Priority (higher = dial first)
    public int Priority { get; set; } = 0;

    // Time zone for contact (for calling hours compliance)
    public string? ContactTimeZone { get; set; }

    // Navigation properties
    public virtual DialerList List { get; set; } = null!;
    public virtual Agent? AssignedAgent { get; set; }
    public virtual Agent? CallbackAgent { get; set; }
    public virtual Customer? Customer { get; set; }
    public virtual ICollection<DialerAttempt> Attempts { get; set; } = new List<DialerAttempt>();
}
