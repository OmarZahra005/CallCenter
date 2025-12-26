using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

/// <summary>
/// Post-call customer satisfaction survey (CSAT 1-5)
/// Question: "Was your request handled successfully? Rate 1-5"
/// </summary>
public class CallSurvey
{
    public Guid Id { get; set; }

    /// <summary>
    /// The call this survey is for (unique - one survey per call)
    /// </summary>
    public string CallId { get; set; } = string.Empty;

    /// <summary>
    /// Agent who handled the call (optional)
    /// </summary>
    public Guid? AgentId { get; set; }

    /// <summary>
    /// Queue the call was in (optional)
    /// </summary>
    public Guid? QueueId { get; set; }

    /// <summary>
    /// Call direction: inbound/outbound
    /// </summary>
    public string? Direction { get; set; }

    /// <summary>
    /// Customer contact (masked for display privacy)
    /// </summary>
    public string? CustomerContactMasked { get; set; }

    /// <summary>
    /// Customer contact encrypted for sending messages
    /// Encrypted using AES with system encryption key
    /// </summary>
    public string? CustomerContactEncrypted { get; set; }

    /// <summary>
    /// Channel used to send survey: SMS, WhatsApp, Email, IVR, Web
    /// </summary>
    public string Channel { get; set; } = "SMS";

    /// <summary>
    /// Question identifier for multi-question support
    /// Default: RESOLUTION_SUCCESS_1_5
    /// </summary>
    public string QuestionCode { get; set; } = "RESOLUTION_SUCCESS_1_5";

    /// <summary>
    /// Customer rating 1-5 (null until answered)
    /// </summary>
    public byte? Rating { get; set; }

    /// <summary>
    /// Current status of the survey
    /// </summary>
    public CallSurveyStatus Status { get; set; } = CallSurveyStatus.Pending;

    /// <summary>
    /// Unique secure token for the survey URL (cryptographically random)
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// When the survey message was sent
    /// </summary>
    public DateTime? SentAt { get; set; }

    /// <summary>
    /// When the customer submitted their rating
    /// </summary>
    public DateTime? RespondedAt { get; set; }

    /// <summary>
    /// When the survey link expires
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Message provider tracking ID (SMS/WhatsApp message ID)
    /// </summary>
    public string? ProviderMessageId { get; set; }

    /// <summary>
    /// Number of send retry attempts
    /// </summary>
    public int RetryCount { get; set; } = 0;

    /// <summary>
    /// Last error message if failed
    /// </summary>
    public string? LastError { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Agent? Agent { get; set; }
}
