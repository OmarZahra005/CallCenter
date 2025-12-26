namespace CallCenter.Application.DTOs.CrmIntegration;

/// <summary>
/// Event sent when an incoming call is received.
/// CRM returns ScreenPopDto with customer context.
/// </summary>
public record IncomingCallEvent
{
    public string CallId { get; init; } = null!;
    public string PhoneNumber { get; init; } = null!;
    public Guid? AgentId { get; init; }
    public DateTime Timestamp { get; init; }
}

/// <summary>
/// Event sent when a call is connected/answered.
/// </summary>
public record CallConnectedEvent
{
    public string CallId { get; init; } = null!;
    public DateTime Timestamp { get; init; }
}

/// <summary>
/// Event sent when a call ends.
/// Includes disposition and optional notes.
/// </summary>
public record CallEndedEvent
{
    public string CallId { get; init; } = null!;
    public string Disposition { get; init; } = null!;
    public string? Notes { get; init; }
    public DateTime Timestamp { get; init; }
}

/// <summary>
/// Event sent when call recording is ready/available.
/// </summary>
public record RecordingReadyEvent
{
    public string CallId { get; init; } = null!;
    public string RecordingUrl { get; init; } = null!;
}

/// <summary>
/// Event sent when call transcript is ready.
/// </summary>
public record TranscriptReadyEvent
{
    public string CallId { get; init; } = null!;
    public string TranscriptText { get; init; } = null!;
}

/// <summary>
/// Event sent when AI QA analysis is complete.
/// </summary>
public record AiQaReadyEvent
{
    public string CallId { get; init; } = null!;
    public decimal Score { get; init; }
    public string Sentiment { get; init; } = null!;
    public string Summary { get; init; } = null!;
}
