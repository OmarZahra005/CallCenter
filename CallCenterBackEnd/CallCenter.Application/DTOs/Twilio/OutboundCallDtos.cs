using System.ComponentModel.DataAnnotations;

namespace CallCenter.Application.DTOs.Twilio;

/// <summary>
/// Request to initiate an outbound call to a customer
/// </summary>
public record InitiateOutboundRequest
{
    /// <summary>
    /// Customer phone number (will be normalized to E.164 format)
    /// Accepts formats: +966512345678, 0512345678, 00966512345678
    /// </summary>
    [Required(ErrorMessage = "Customer number is required")]
    public string CustomerNumber { get; init; } = string.Empty;

    /// <summary>
    /// Optional customer ID for linking to customer record
    /// </summary>
    public Guid? CustomerId { get; init; }

    /// <summary>
    /// Optional conversation ID for linking to existing conversation
    /// </summary>
    public Guid? ConversationId { get; init; }

    /// <summary>
    /// Idempotency key to prevent duplicate calls from rapid clicks
    /// </summary>
    public string? IdempotencyKey { get; init; }
}

/// <summary>
/// Response after initiating an outbound call
/// </summary>
public record InitiateOutboundResponse
{
    /// <summary>
    /// Internal call log ID
    /// </summary>
    public Guid CallId { get; init; }

    /// <summary>
    /// Twilio CallSid
    /// </summary>
    public string ProviderCallId { get; init; } = string.Empty;

    /// <summary>
    /// Customer phone number in E.164 format
    /// </summary>
    public string CustomerNumber { get; init; } = string.Empty;

    /// <summary>
    /// Current call status (initiating, ringing, etc.)
    /// </summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>
    /// When the call was initiated
    /// </summary>
    public DateTimeOffset InitiatedAt { get; init; }
}

/// <summary>
/// Request to prepare an outbound call (creates CallLog, no dialing yet)
/// Used for direct browser-initiated calls via device.connect()
/// </summary>
public record PrepareOutboundRequest
{
    /// <summary>
    /// Customer phone number (will be normalized to E.164 format)
    /// </summary>
    [Required(ErrorMessage = "Customer number is required")]
    public string CustomerNumber { get; init; } = string.Empty;

    /// <summary>
    /// Optional customer ID for linking to customer record
    /// </summary>
    public Guid? CustomerId { get; init; }

    /// <summary>
    /// Optional customer name for display purposes
    /// </summary>
    public string? CustomerName { get; init; }

    /// <summary>
    /// Optional conversation ID for linking to existing conversation
    /// </summary>
    public Guid? ConversationId { get; init; }

    /// <summary>
    /// Idempotency key to prevent duplicate calls
    /// </summary>
    public string? IdempotencyKey { get; init; }
}

/// <summary>
/// Response after preparing an outbound call
/// </summary>
public record PrepareOutboundResponse
{
    /// <summary>
    /// Internal call log ID - use this for device.connect() params
    /// </summary>
    public Guid CallLogId { get; init; }

    /// <summary>
    /// Customer phone number in E.164 format
    /// </summary>
    public string CustomerNumber { get; init; } = string.Empty;

    /// <summary>
    /// Customer name if provided
    /// </summary>
    public string? CustomerName { get; init; }

    /// <summary>
    /// Current call status (preparing)
    /// </summary>
    public string Status { get; init; } = "preparing";

    /// <summary>
    /// When the call was prepared
    /// </summary>
    public DateTimeOffset PreparedAt { get; init; }
}
