namespace CallCenter.Application.Interfaces;

/// <summary>
/// Service for sending webhook notifications to SmartBot
/// </summary>
public interface ISmartBotWebhookService
{
    /// <summary>
    /// Notify SmartBot that an agent has been assigned to an escalation
    /// </summary>
    Task<bool> NotifyAgentAssignedAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        string callCenterTicketId,
        string agentId,
        string agentName,
        string? agentEmail = null);

    /// <summary>
    /// Send a message from agent to SmartBot (for customer)
    /// </summary>
    Task<bool> SendAgentMessageAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        string message,
        string agentId,
        string agentName);

    /// <summary>
    /// Notify SmartBot of escalation status change
    /// </summary>
    Task<bool> NotifyStatusChangedAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        string oldStatus,
        string newStatus,
        string? reason = null,
        string? agentId = null,
        string? agentName = null);

    /// <summary>
    /// Notify SmartBot that escalation has been resolved
    /// </summary>
    Task<bool> NotifyResolvedAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        string resolution,
        string? notes = null,
        string? agentId = null,
        string? agentName = null);

    /// <summary>
    /// Notify SmartBot of queue position update
    /// </summary>
    Task<bool> NotifyQueueUpdateAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        int position,
        int? estimatedWaitSeconds = null);

    /// <summary>
    /// Send agent typing indicator to SmartBot
    /// </summary>
    Task<bool> SendTypingIndicatorAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        bool isTyping);

    /// <summary>
    /// Notify SmartBot that the agent has disconnected (left the chat)
    /// </summary>
    Task<bool> NotifyAgentDisconnectedAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        string agentId,
        string agentName,
        string reason,
        bool willRequeue = false);

    /// <summary>
    /// Notify SmartBot that no agents are currently available
    /// </summary>
    Task<bool> NotifyNoAgentsAvailableAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        int? queuePosition = null,
        int? estimatedWaitSeconds = null);

    /// <summary>
    /// Check if SmartBot webhook endpoint is reachable
    /// </summary>
    Task<bool> HealthCheckAsync(string smartBotWebhookUrl);
}
