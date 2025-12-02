using Microsoft.AspNetCore.SignalR;

namespace CallCenter.API.Hubs;

public class CallCenterHub : Hub
{
    private static readonly Dictionary<string, string> _connectedAgents = new();
    private static readonly Dictionary<string, HashSet<string>> _teamGroups = new();

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier ?? Context.ConnectionId;
        await Groups.AddToGroupAsync(Context.ConnectionId, "AllUsers");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var agentId = _connectedAgents.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;
        if (!string.IsNullOrEmpty(agentId))
        {
            _connectedAgents.Remove(agentId);
            await Clients.All.SendAsync("AgentDisconnected", agentId);
        }
        await base.OnDisconnectedAsync(exception);
    }

    #region Agent Management

    // Agent connects and registers
    public async Task RegisterAgent(string agentId, string agentName, string? teamId = null)
    {
        _connectedAgents[agentId] = Context.ConnectionId;
        await Groups.AddToGroupAsync(Context.ConnectionId, "Agents");

        if (!string.IsNullOrEmpty(teamId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"team_{teamId}");
            if (!_teamGroups.ContainsKey(teamId))
                _teamGroups[teamId] = new HashSet<string>();
            _teamGroups[teamId].Add(agentId);
        }

        await Clients.All.SendAsync("AgentConnected", new { agentId, agentName, teamId, connectionId = Context.ConnectionId });
    }

    // Agent state change
    public async Task UpdateAgentState(string agentId, string state, string? reason = null)
    {
        await Clients.All.SendAsync("AgentStateChanged", new { agentId, state, reason, timestamp = DateTime.UtcNow });
    }

    // Agent joins supervisor monitoring
    public async Task JoinSupervisorMode(string supervisorId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "Supervisors");
        await Groups.AddToGroupAsync(Context.ConnectionId, $"supervisor_{supervisorId}");
    }

    #endregion

    #region Ticket & Conversation

    // New ticket created
    public async Task NotifyNewTicket(object ticket)
    {
        await Clients.All.SendAsync("NewTicketCreated", ticket);
    }

    // Ticket updated
    public async Task NotifyTicketUpdated(object ticket)
    {
        await Clients.All.SendAsync("TicketUpdated", ticket);
    }

    // Ticket assigned
    public async Task NotifyTicketAssigned(string agentId, object ticket)
    {
        if (_connectedAgents.TryGetValue(agentId, out var connectionId))
        {
            await Clients.Client(connectionId).SendAsync("TicketAssigned", ticket);
        }
    }

    // New message in conversation
    public async Task SendMessage(string conversationId, object message)
    {
        await Clients.Group($"conversation_{conversationId}").SendAsync("NewMessage", message);
    }

    // Typing indicator
    public async Task SendTypingIndicator(string conversationId, string agentId, bool isTyping)
    {
        await Clients.Group($"conversation_{conversationId}").SendAsync("TypingIndicator", new { conversationId, agentId, isTyping });
    }

    // Join conversation group
    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
    }

    // Leave conversation group
    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
    }

    #endregion

    #region Call Management

    // Incoming call notification
    public async Task NotifyIncomingCall(string agentId, object callInfo)
    {
        if (_connectedAgents.TryGetValue(agentId, out var connectionId))
        {
            await Clients.Client(connectionId).SendAsync("IncomingCall", callInfo);
        }
    }

    // Call answered
    public async Task NotifyCallAnswered(string agentId, object callInfo)
    {
        await Clients.All.SendAsync("CallAnswered", new { agentId, callInfo, timestamp = DateTime.UtcNow });
    }

    // Call on hold
    public async Task NotifyCallOnHold(string agentId, string callId)
    {
        await Clients.Group("Supervisors").SendAsync("CallOnHold", new { agentId, callId, timestamp = DateTime.UtcNow });
    }

    // Call transferred
    public async Task NotifyCallTransferred(string fromAgentId, string toAgentId, object callInfo)
    {
        if (_connectedAgents.TryGetValue(toAgentId, out var connectionId))
        {
            await Clients.Client(connectionId).SendAsync("IncomingTransfer", new { fromAgentId, callInfo });
        }
        await Clients.All.SendAsync("CallTransferred", new { fromAgentId, toAgentId, callInfo, timestamp = DateTime.UtcNow });
    }

    // Call ended
    public async Task NotifyCallEnded(string agentId, object callSummary)
    {
        if (_connectedAgents.TryGetValue(agentId, out var connectionId))
        {
            await Clients.Client(connectionId).SendAsync("CallEnded", callSummary);
        }
        await Clients.All.SendAsync("CallEnded", callSummary);
    }

    #endregion

    #region Queue & Dashboard

    // Queue update
    public async Task NotifyQueueUpdate(object queueStats)
    {
        await Clients.All.SendAsync("QueueUpdated", queueStats);
    }

    // Dashboard metrics update
    public async Task UpdateDashboardMetrics(object metrics)
    {
        await Clients.Group("Supervisors").SendAsync("DashboardMetricsUpdated", metrics);
        await Clients.Group("Agents").SendAsync("DashboardMetricsUpdated", metrics);
    }

    // Real-time KPI update
    public async Task UpdateKpi(string kpiName, object value)
    {
        await Clients.All.SendAsync("KpiUpdated", new { kpiName, value, timestamp = DateTime.UtcNow });
    }

    #endregion

    #region SLA & Alerts

    // SLA breach warning
    public async Task NotifySlaBreachWarning(string ticketId, string slaType, int minutesRemaining)
    {
        await Clients.Group("Supervisors").SendAsync("SlaBreachWarning", new { ticketId, slaType, minutesRemaining, timestamp = DateTime.UtcNow });
    }

    // SLA breached
    public async Task NotifySlaBreached(string ticketId, string slaType, object details)
    {
        await Clients.All.SendAsync("SlaBreached", new { ticketId, slaType, details, timestamp = DateTime.UtcNow });
    }

    // Alert triggered
    public async Task NotifyAlert(string alertType, string message, string severity, object? data = null)
    {
        await Clients.Group("Supervisors").SendAsync("AlertTriggered", new { alertType, message, severity, data, timestamp = DateTime.UtcNow });
    }

    #endregion

    #region QA & Coaching

    // QA evaluation completed
    public async Task NotifyQaEvaluationCompleted(string agentId, object evaluation)
    {
        if (_connectedAgents.TryGetValue(agentId, out var connectionId))
        {
            await Clients.Client(connectionId).SendAsync("QaEvaluationCompleted", evaluation);
        }
        await Clients.Group("Supervisors").SendAsync("QaEvaluationCompleted", evaluation);
    }

    // Coaching session scheduled
    public async Task NotifyCoachingSessionScheduled(string agentId, object session)
    {
        if (_connectedAgents.TryGetValue(agentId, out var connectionId))
        {
            await Clients.Client(connectionId).SendAsync("CoachingSessionScheduled", session);
        }
    }

    // Coaching session reminder
    public async Task NotifyCoachingReminder(string agentId, string coachId, object session)
    {
        if (_connectedAgents.TryGetValue(agentId, out var agentConnection))
        {
            await Clients.Client(agentConnection).SendAsync("CoachingReminder", session);
        }
        if (_connectedAgents.TryGetValue(coachId, out var coachConnection))
        {
            await Clients.Client(coachConnection).SendAsync("CoachingReminder", session);
        }
    }

    #endregion

    #region Workforce Management

    // Schedule update
    public async Task NotifyScheduleUpdate(string agentId, object schedule)
    {
        if (_connectedAgents.TryGetValue(agentId, out var connectionId))
        {
            await Clients.Client(connectionId).SendAsync("ScheduleUpdated", schedule);
        }
    }

    // Shift reminder
    public async Task NotifyShiftReminder(string agentId, object shiftInfo)
    {
        if (_connectedAgents.TryGetValue(agentId, out var connectionId))
        {
            await Clients.Client(connectionId).SendAsync("ShiftReminder", shiftInfo);
        }
    }

    // Break time notification
    public async Task NotifyBreakTime(string agentId, int durationMinutes)
    {
        if (_connectedAgents.TryGetValue(agentId, out var connectionId))
        {
            await Clients.Client(connectionId).SendAsync("BreakTimeNotification", new { durationMinutes, timestamp = DateTime.UtcNow });
        }
    }

    // Adherence alert (to supervisor)
    public async Task NotifyAdherenceAlert(string agentId, string alertType, object details)
    {
        await Clients.Group("Supervisors").SendAsync("AdherenceAlert", new { agentId, alertType, details, timestamp = DateTime.UtcNow });
    }

    // Team adherence update
    public async Task UpdateTeamAdherence(string teamId, object adherenceData)
    {
        await Clients.Group($"team_{teamId}").SendAsync("TeamAdherenceUpdated", adherenceData);
        await Clients.Group("Supervisors").SendAsync("TeamAdherenceUpdated", new { teamId, adherenceData });
    }

    #endregion

    #region Notifications

    // Broadcast notification to all users
    public async Task BroadcastNotification(string title, string message, string type = "info")
    {
        await Clients.All.SendAsync("Notification", new { title, message, type, timestamp = DateTime.UtcNow });
    }

    // Send notification to specific user
    public async Task SendNotificationToUser(string userId, string title, string message, string type = "info")
    {
        await Clients.User(userId).SendAsync("Notification", new { title, message, type, timestamp = DateTime.UtcNow });
    }

    // Send notification to specific agent
    public async Task SendNotificationToAgent(string agentId, string title, string message, string type = "info")
    {
        if (_connectedAgents.TryGetValue(agentId, out var connectionId))
        {
            await Clients.Client(connectionId).SendAsync("Notification", new { title, message, type, timestamp = DateTime.UtcNow });
        }
    }

    // Send notification to team
    public async Task SendNotificationToTeam(string teamId, string title, string message, string type = "info")
    {
        await Clients.Group($"team_{teamId}").SendAsync("Notification", new { title, message, type, timestamp = DateTime.UtcNow });
    }

    #endregion

    #region Knowledge Base

    // New article published
    public async Task NotifyNewArticlePublished(object article)
    {
        await Clients.Group("Agents").SendAsync("NewArticlePublished", article);
    }

    // Article updated
    public async Task NotifyArticleUpdated(object article)
    {
        await Clients.Group("Agents").SendAsync("ArticleUpdated", article);
    }

    #endregion
}
