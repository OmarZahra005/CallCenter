using CallCenter.Application.DTOs.Timeline;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;

namespace CallCenter.Application.Services;

public interface ITimelineService
{
    Task<List<TimelineEventDto>> GetConversationTimelineAsync(Guid conversationId, CancellationToken cancellationToken = default);
}

public class TimelineService : ITimelineService
{
    private readonly IConversationRepository _conversationRepository;
    private readonly ICallLogRepository _callLogRepository;
    private readonly ITicketRepository _ticketRepository;

    public TimelineService(
        IConversationRepository conversationRepository,
        ICallLogRepository callLogRepository,
        ITicketRepository ticketRepository)
    {
        _conversationRepository = conversationRepository;
        _callLogRepository = callLogRepository;
        _ticketRepository = ticketRepository;
    }

    public async Task<List<TimelineEventDto>> GetConversationTimelineAsync(Guid conversationId, CancellationToken cancellationToken = default)
    {
        var events = new List<TimelineEventDto>();

        // Get the conversation with messages
        var conversation = await _conversationRepository.GetByIdAsync(conversationId, cancellationToken);
        if (conversation == null)
            return events;

        // Add conversation creation event
        events.Add(new TimelineEventDto
        {
            Id = conversation.Id,
            EventType = TimelineEventTypes.CallStarted,
            Description = $"Conversation started via {conversation.Channel}",
            Timestamp = conversation.StartTime,
            Metadata = new Dictionary<string, object>
            {
                { "channel", conversation.Channel.ToString() },
                { "customerId", conversation.CustomerId }
            }
        });

        // Add agent assignment event if agent was assigned
        if (conversation.AgentId.HasValue)
        {
            events.Add(new TimelineEventDto
            {
                Id = Guid.NewGuid(),
                EventType = TimelineEventTypes.AgentAssigned,
                Description = $"Agent {conversation.Agent?.Name ?? "Unknown"} assigned to conversation",
                Timestamp = conversation.StartTime.AddSeconds(1), // Slightly after start
                AgentId = conversation.AgentId,
                AgentName = conversation.Agent?.Name
            });
        }

        // Add call log events (status changes)
        var callLogs = await _callLogRepository.GetByConversationIdAsync(conversationId, cancellationToken);
        foreach (var callLog in callLogs)
        {
            // Map call log status to timeline event
            var (eventType, description) = MapCallStatusToEvent(callLog.Status, callLog.Direction);

            events.Add(new TimelineEventDto
            {
                Id = callLog.Id,
                EventType = eventType,
                Description = description,
                Timestamp = callLog.StartedAtUtc.DateTime,
                AgentId = callLog.AssignedAgentId,
                AgentName = callLog.AssignedAgent?.Name,
                Metadata = new Dictionary<string, object>
                {
                    { "status", callLog.Status },
                    { "direction", callLog.Direction },
                    { "fromNumber", callLog.FromNumber },
                    { "toNumber", callLog.ToNumber }
                }
            });

            // Add call ended event if call has ended
            if (callLog.EndedAtUtc.HasValue)
            {
                var duration = (callLog.EndedAtUtc.Value - callLog.StartedAtUtc).TotalSeconds;
                events.Add(new TimelineEventDto
                {
                    Id = Guid.NewGuid(),
                    EventType = TimelineEventTypes.CallEnded,
                    Description = $"Call ended after {FormatDuration((int)duration)}",
                    Timestamp = callLog.EndedAtUtc.Value.DateTime,
                    AgentId = callLog.AssignedAgentId,
                    AgentName = callLog.AssignedAgent?.Name,
                    Metadata = new Dictionary<string, object>
                    {
                        { "durationSeconds", (int)duration }
                    }
                });
            }
        }

        // Add conversation messages (excluding system messages that duplicate other events)
        if (conversation.Messages != null)
        {
            foreach (var message in conversation.Messages.OrderBy(m => m.CreatedAt))
            {
                var senderName = message.SenderType switch
                {
                    SenderType.Agent => message.Sender?.Name ?? "Agent",
                    SenderType.Customer => "Customer",
                    SenderType.System => "System",
                    SenderType.Bot => "Bot",
                    _ => "Unknown"
                };

                events.Add(new TimelineEventDto
                {
                    Id = message.Id,
                    EventType = TimelineEventTypes.MessageSent,
                    Description = $"{senderName}: {TruncateMessage(message.Message, 100)}",
                    Timestamp = message.CreatedAt,
                    AgentId = message.SenderType == SenderType.Agent ? message.SenderId : null,
                    AgentName = message.SenderType == SenderType.Agent ? senderName : null,
                    Metadata = new Dictionary<string, object>
                    {
                        { "senderType", message.SenderType.ToString() },
                        { "fullMessage", message.Message },
                        { "hasMedia", !string.IsNullOrEmpty(message.MediaUrl) }
                    }
                });
            }
        }

        // Add ticket events
        var tickets = await _ticketRepository.GetByConversationIdAsync(conversationId, cancellationToken);
        foreach (var ticket in tickets)
        {
            events.Add(new TimelineEventDto
            {
                Id = ticket.Id,
                EventType = TimelineEventTypes.TicketCreated,
                Description = $"Ticket #{ticket.TicketNumber} created: {ticket.Subject}",
                Timestamp = ticket.CreatedAt,
                AgentId = ticket.AgentId,
                AgentName = ticket.Agent?.Name,
                Metadata = new Dictionary<string, object>
                {
                    { "ticketNumber", ticket.TicketNumber },
                    { "subject", ticket.Subject },
                    { "status", ticket.Status.ToString() },
                    { "priority", ticket.Priority.ToString() }
                }
            });
        }

        // Add conversation close event if closed
        if (conversation.State == ConversationState.Closed && conversation.EndTime.HasValue)
        {
            events.Add(new TimelineEventDto
            {
                Id = Guid.NewGuid(),
                EventType = TimelineEventTypes.CallEnded,
                Description = "Conversation closed",
                Timestamp = conversation.EndTime.Value,
                AgentId = conversation.AgentId,
                AgentName = conversation.Agent?.Name,
                Metadata = new Dictionary<string, object>
                {
                    { "state", conversation.State.ToString() },
                    { "durationSeconds", conversation.DurationSeconds ?? 0 }
                }
            });
        }

        // Add abandoned event if applicable
        if (conversation.State == ConversationState.Abandoned)
        {
            events.Add(new TimelineEventDto
            {
                Id = Guid.NewGuid(),
                EventType = TimelineEventTypes.CallAbandoned,
                Description = "Call was abandoned",
                Timestamp = conversation.EndTime ?? DateTime.UtcNow,
                Metadata = new Dictionary<string, object>
                {
                    { "state", conversation.State.ToString() }
                }
            });
        }

        // Sort all events by timestamp
        return events.OrderBy(e => e.Timestamp).ToList();
    }

    private static (string eventType, string description) MapCallStatusToEvent(string status, string direction)
    {
        return status.ToLowerInvariant() switch
        {
            "ringing" => (TimelineEventTypes.CallStarted, $"Incoming call {direction}"),
            "in-progress" => (TimelineEventTypes.CallAnswered, "Call answered"),
            "on-hold" => (TimelineEventTypes.OnHold, "Call placed on hold"),
            "completed" => (TimelineEventTypes.CallEnded, "Call completed"),
            "failed" => (TimelineEventTypes.CallFailed, "Call failed"),
            "busy" => (TimelineEventTypes.CallFailed, "Line busy"),
            "no-answer" => (TimelineEventTypes.CallAbandoned, "No answer"),
            "canceled" => (TimelineEventTypes.CallAbandoned, "Call canceled"),
            _ => (TimelineEventTypes.CallStarted, $"Call status: {status}")
        };
    }

    private static string FormatDuration(int seconds)
    {
        if (seconds < 60)
            return $"{seconds}s";

        var minutes = seconds / 60;
        var remainingSeconds = seconds % 60;

        if (minutes < 60)
            return remainingSeconds > 0 ? $"{minutes}m {remainingSeconds}s" : $"{minutes}m";

        var hours = minutes / 60;
        var remainingMinutes = minutes % 60;
        return $"{hours}h {remainingMinutes}m";
    }

    private static string TruncateMessage(string message, int maxLength)
    {
        if (string.IsNullOrEmpty(message))
            return string.Empty;

        return message.Length <= maxLength ? message : message[..maxLength] + "...";
    }
}
