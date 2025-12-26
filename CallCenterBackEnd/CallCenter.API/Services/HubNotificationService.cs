using CallCenter.API.Hubs;
using CallCenter.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace CallCenter.API.Services;

public class HubNotificationService : IHubNotificationService
{
    private readonly IHubContext<CallCenterHub> _hubContext;

    public HubNotificationService(IHubContext<CallCenterHub> hubContext)
    {
        _hubContext = hubContext;
    }

    #region Ticket Notifications

    public async Task NotifyNewTicketAsync(object ticket)
    {
        await _hubContext.Clients.All.SendAsync("NewTicketCreated", ticket);
    }

    public async Task NotifyTicketUpdatedAsync(object ticket)
    {
        await _hubContext.Clients.All.SendAsync("TicketUpdated", ticket);
    }

    public async Task NotifyTicketAssignedAsync(string agentId, object ticket)
    {
        await _hubContext.Clients.All.SendAsync("TicketAssigned", new { agentId, ticket });
    }

    #endregion

    #region Agent State Notifications

    public async Task NotifyAgentStateChangedAsync(string agentId, string state, string? reason = null)
    {
        await _hubContext.Clients.All.SendAsync("AgentStateChanged", new
        {
            agentId,
            state,
            reason,
            timestamp = DateTime.UtcNow
        });
    }

    #endregion

    #region Call Notifications

    public async Task NotifyIncomingCallAsync(string agentId, object callInfo)
    {
        await _hubContext.Clients.All.SendAsync("IncomingCall", new { agentId, callInfo });
    }

    public async Task NotifyCallAnsweredAsync(string agentId, object callInfo)
    {
        await _hubContext.Clients.All.SendAsync("CallAnswered", new
        {
            agentId,
            callInfo,
            timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyCallEndedAsync(string agentId, object callSummary)
    {
        await _hubContext.Clients.All.SendAsync("CallEnded", new { agentId, callSummary });
    }

    #endregion

    #region Queue Notifications

    public async Task NotifyQueueUpdateAsync(object queueStats)
    {
        await _hubContext.Clients.All.SendAsync("QueueUpdated", queueStats);
    }

    #endregion

    #region Dashboard Notifications

    public async Task UpdateDashboardMetricsAsync(object metrics)
    {
        await _hubContext.Clients.Groups("Supervisors", "Agents").SendAsync("DashboardMetricsUpdated", metrics);
    }

    #endregion

    #region General Notifications

    public async Task BroadcastNotificationAsync(string title, string message, string type = "info")
    {
        await _hubContext.Clients.All.SendAsync("Notification", new
        {
            title,
            message,
            type,
            timestamp = DateTime.UtcNow
        });
    }

    public async Task SendNotificationToAgentAsync(string agentId, string title, string message, string type = "info")
    {
        await _hubContext.Clients.All.SendAsync("Notification", new
        {
            agentId,
            title,
            message,
            type,
            timestamp = DateTime.UtcNow
        });
    }

    #endregion

    #region Conversation Notifications

    public async Task NotifyConversationCreatedAsync(object conversation)
    {
        await _hubContext.Clients.All.SendAsync("ConversationCreated", conversation);
    }

    public async Task NotifyConversationUpdatedAsync(object conversation)
    {
        await _hubContext.Clients.All.SendAsync("ConversationUpdated", conversation);
    }

    #endregion

    #region Timeline Notifications

    public async Task NotifyTimelineEventAsync(Guid conversationId, object timelineEvent)
    {
        await _hubContext.Clients.All.SendAsync("TimelineEvent", new
        {
            conversationId,
            timelineEvent,
            timestamp = DateTime.UtcNow
        });
    }

    #endregion

    #region Notes Notifications

    public async Task NotifyNoteAddedAsync(Guid conversationId, object note)
    {
        await _hubContext.Clients.All.SendAsync("NoteAdded", new
        {
            conversationId,
            note,
            timestamp = DateTime.UtcNow
        });
    }

    #endregion

    #region SmartBot Escalation Notifications

    public async Task NotifySmartBotEscalationAsync(Guid escalationId, string eventType)
    {
        await _hubContext.Clients.All.SendAsync("SmartBotEscalation", new
        {
            escalationId,
            eventType,
            timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifySmartBotMessageAsync(Guid escalationId, Guid conversationId, string message, string senderType)
    {
        await _hubContext.Clients.All.SendAsync("SmartBotMessage", new
        {
            escalationId,
            conversationId,
            message,
            senderType,
            timestamp = DateTime.UtcNow
        });
    }

    #endregion
}
