namespace CallCenter.Application.Interfaces;

public interface IHubNotificationService
{
    // Ticket notifications
    Task NotifyNewTicketAsync(object ticket);
    Task NotifyTicketUpdatedAsync(object ticket);
    Task NotifyTicketAssignedAsync(string agentId, object ticket);

    // Agent state notifications
    Task NotifyAgentStateChangedAsync(string agentId, string state, string? reason = null);

    // Call notifications
    Task NotifyIncomingCallAsync(string agentId, object callInfo);
    Task NotifyCallAnsweredAsync(string agentId, object callInfo);
    Task NotifyCallEndedAsync(string agentId, object callSummary);

    // Queue notifications
    Task NotifyQueueUpdateAsync(object queueStats);

    // Dashboard notifications
    Task UpdateDashboardMetricsAsync(object metrics);

    // General notifications
    Task BroadcastNotificationAsync(string title, string message, string type = "info");
    Task SendNotificationToAgentAsync(string agentId, string title, string message, string type = "info");

    // Conversation notifications
    Task NotifyConversationCreatedAsync(object conversation);
    Task NotifyConversationUpdatedAsync(object conversation);

    // Timeline notifications
    Task NotifyTimelineEventAsync(Guid conversationId, object timelineEvent);

    // Notes notifications
    Task NotifyNoteAddedAsync(Guid conversationId, object note);
}
