namespace CallCenter.Application.DTOs.Timeline;

public class TimelineEventDto
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public Guid? AgentId { get; set; }
    public string? AgentName { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Timeline event types for categorization.
/// </summary>
public static class TimelineEventTypes
{
    public const string CallStarted = "CallStarted";
    public const string CallAnswered = "CallAnswered";
    public const string CallEnded = "CallEnded";
    public const string OnHold = "OnHold";
    public const string Resumed = "Resumed";
    public const string Muted = "Muted";
    public const string Unmuted = "Unmuted";
    public const string Transferred = "Transferred";
    public const string NoteAdded = "NoteAdded";
    public const string TicketCreated = "TicketCreated";
    public const string TicketUpdated = "TicketUpdated";
    public const string MessageSent = "MessageSent";
    public const string DispositionSet = "DispositionSet";
    public const string AgentAssigned = "AgentAssigned";
    public const string CallFailed = "CallFailed";
    public const string CallAbandoned = "CallAbandoned";
}
