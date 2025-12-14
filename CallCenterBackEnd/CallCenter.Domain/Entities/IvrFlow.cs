using CallCenter.Domain.Common.Entities;

namespace CallCenter.Domain.Entities;

/// <summary>
/// Represents a complete IVR (Interactive Voice Response) flow configuration
/// </summary>
public class IvrFlow : Entity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    /// <summary>
    /// Whether this flow is active and can be used for incoming calls
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Whether this is the default flow for incoming calls
    /// </summary>
    public bool IsDefault { get; set; }

    /// <summary>
    /// The phone number(s) this IVR is associated with (comma-separated)
    /// If null, applies to all numbers or as default
    /// </summary>
    public string? PhoneNumbers { get; set; }

    /// <summary>
    /// The ID of the entry node (first node in the flow)
    /// </summary>
    public Guid? EntryNodeId { get; set; }

    /// <summary>
    /// Default language for TTS (e.g., "en-US", "ar-SA")
    /// </summary>
    public string DefaultLanguage { get; set; } = "en-US";

    /// <summary>
    /// Default TTS voice (e.g., "Polly.Joanna", "Polly.Zeina")
    /// </summary>
    public string DefaultVoice { get; set; } = "Polly.Joanna";

    /// <summary>
    /// Maximum number of invalid input attempts before fallback
    /// </summary>
    public int MaxInvalidAttempts { get; set; } = 3;

    /// <summary>
    /// Timeout in seconds for DTMF input
    /// </summary>
    public int InputTimeout { get; set; } = 5;

    /// <summary>
    /// Business hours start time (e.g., "09:00")
    /// </summary>
    public string? BusinessHoursStart { get; set; }

    /// <summary>
    /// Business hours end time (e.g., "17:00")
    /// </summary>
    public string? BusinessHoursEnd { get; set; }

    /// <summary>
    /// Days of week for business hours (comma-separated: "Monday,Tuesday,Wednesday,Thursday,Friday")
    /// </summary>
    public string? BusinessDays { get; set; }

    /// <summary>
    /// Node to use for after-hours calls
    /// </summary>
    public Guid? AfterHoursNodeId { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAtUtc { get; set; }

    // Navigation properties
    public virtual ICollection<IvrNode> Nodes { get; set; } = new List<IvrNode>();
}
