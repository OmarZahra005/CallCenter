using CallCenter.Domain.Common.Entities;

namespace CallCenter.Domain.Entities;

/// <summary>
/// Represents a callback request from the IVR system
/// </summary>
public class CallbackRequest : Entity
{
    /// <summary>
    /// Phone number to call back
    /// </summary>
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Original called number (the number the customer dialed)
    /// </summary>
    public string CalledNumber { get; set; } = string.Empty;

    /// <summary>
    /// Optional queue to route the callback to
    /// </summary>
    public Guid? QueueId { get; set; }

    /// <summary>
    /// Status: Pending, InProgress, Completed, Failed, Cancelled
    /// </summary>
    public string Status { get; set; } = "Pending";

    /// <summary>
    /// Priority (higher = more urgent)
    /// </summary>
    public int Priority { get; set; } = 0;

    /// <summary>
    /// Optional notes or context from the IVR session
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// IVR session variables captured at callback request time (JSON)
    /// </summary>
    public string? SessionVariables { get; set; }

    /// <summary>
    /// Original IVR call SID
    /// </summary>
    public string? OriginalCallSid { get; set; }

    /// <summary>
    /// When the callback was requested
    /// </summary>
    public DateTimeOffset RequestedAtUtc { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Preferred callback time (optional)
    /// </summary>
    public DateTimeOffset? PreferredCallbackTime { get; set; }

    /// <summary>
    /// When the callback was attempted
    /// </summary>
    public DateTimeOffset? AttemptedAtUtc { get; set; }

    /// <summary>
    /// When the callback was completed
    /// </summary>
    public DateTimeOffset? CompletedAtUtc { get; set; }

    /// <summary>
    /// Number of callback attempts made
    /// </summary>
    public int AttemptCount { get; set; } = 0;

    /// <summary>
    /// Agent who handled the callback (if any)
    /// </summary>
    public Guid? AssignedAgentId { get; set; }

    // Navigation properties
    public virtual Queue? Queue { get; set; }
    public virtual Agent? AssignedAgent { get; set; }
}
