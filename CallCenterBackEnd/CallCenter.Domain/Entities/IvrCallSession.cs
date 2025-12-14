using CallCenter.Domain.Common.Entities;

namespace CallCenter.Domain.Entities;

/// <summary>
/// Tracks a caller's progress through an IVR flow
/// </summary>
public class IvrCallSession : Entity
{
    /// <summary>
    /// Twilio Call SID
    /// </summary>
    public string CallSid { get; set; } = string.Empty;

    /// <summary>
    /// The IVR flow being executed
    /// </summary>
    public Guid FlowId { get; set; }

    /// <summary>
    /// Current node in the flow
    /// </summary>
    public Guid CurrentNodeId { get; set; }

    /// <summary>
    /// Caller's phone number
    /// </summary>
    public string CallerNumber { get; set; } = string.Empty;

    /// <summary>
    /// Called number (the number the caller dialed)
    /// </summary>
    public string CalledNumber { get; set; } = string.Empty;

    /// <summary>
    /// Session variables stored as JSON
    /// </summary>
    public string? Variables { get; set; }

    /// <summary>
    /// Path of node IDs traversed (JSON array)
    /// </summary>
    public string? NodePath { get; set; }

    /// <summary>
    /// Number of invalid input attempts at current node
    /// </summary>
    public int InvalidAttempts { get; set; }

    /// <summary>
    /// Last DTMF digits entered
    /// </summary>
    public string? LastDigits { get; set; }

    /// <summary>
    /// Whether the IVR session is still active
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Final outcome of the session
    /// </summary>
    public string? Outcome { get; set; }

    /// <summary>
    /// When the session started
    /// </summary>
    public DateTimeOffset StartedAtUtc { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// When the session ended (transferred, hung up, etc.)
    /// </summary>
    public DateTimeOffset? EndedAtUtc { get; set; }

    // Navigation properties
    public virtual IvrFlow Flow { get; set; } = null!;
    public virtual IvrNode CurrentNode { get; set; } = null!;
}
