using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.SmartBot;

#region Request DTOs

/// <summary>
/// Request from SmartBot to create a new escalation
/// </summary>
public class SmartBotEscalationRequest
{
    // SmartBot identifiers
    public string SmartBotConversationId { get; set; } = string.Empty;
    public string SmartBotSessionId { get; set; } = string.Empty;
    public string SmartBotChatbotId { get; set; } = string.Empty;

    // Customer information
    public SmartBotCustomerInfo? Customer { get; set; }

    // Escalation details
    public string Reason { get; set; } = string.Empty;
    public string Mode { get; set; } = "LiveChat";
    public string Priority { get; set; } = "Normal";
    public string? Topic { get; set; }
    public string? Sentiment { get; set; }

    // Context from SmartBot
    public List<SmartBotTranscriptMessage> Transcript { get; set; } = new();
    public Dictionary<string, object>? ContextVariables { get; set; }

    // Routing preferences
    public string? PreferredLanguage { get; set; }
    public Guid? PreferredQueueId { get; set; }
}

public class SmartBotCustomerInfo
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? ExternalId { get; set; }
}

public class SmartBotTranscriptMessage
{
    public string Role { get; set; } = string.Empty; // "user" or "bot"
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string? IntentName { get; set; }
    public double? Confidence { get; set; }
}

/// <summary>
/// Request from SmartBot to send a message during escalation
/// </summary>
public class SmartBotMessageRequest
{
    public string SmartBotConversationId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string SenderType { get; set; } = "customer"; // customer or bot
}

/// <summary>
/// Request from SmartBot to update escalation status
/// </summary>
public class SmartBotStatusUpdateRequest
{
    public string SmartBotConversationId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Reason { get; set; }
}

#endregion

#region Response DTOs

/// <summary>
/// Response after creating escalation
/// </summary>
public class SmartBotEscalationResponse
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }

    // IDs for tracking
    public Guid EscalationId { get; set; }
    public Guid TicketId { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public Guid ConversationId { get; set; }

    // Current status
    public string Status { get; set; } = string.Empty;

    // Agent availability
    public bool AgentAvailable { get; set; }
    public int? QueuePosition { get; set; }
    public int? EstimatedWaitTimeSeconds { get; set; }

    // Assigned agent (if available)
    public SmartBotAgentInfo? AssignedAgent { get; set; }
}

public class SmartBotAgentInfo
{
    public Guid AgentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}

/// <summary>
/// Response for status queries
/// </summary>
public class SmartBotEscalationStatusResponse
{
    public Guid EscalationId { get; set; }
    public string SmartBotConversationId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

    // Queue info
    public int? QueuePosition { get; set; }
    public int? EstimatedWaitTimeSeconds { get; set; }

    // Agent info
    public SmartBotAgentInfo? AssignedAgent { get; set; }
    public DateTime? AgentAssignedAt { get; set; }

    // Resolution
    public string? Resolution { get; set; }
    public DateTime? ResolvedAt { get; set; }
}

/// <summary>
/// Agent message to be sent to SmartBot widget
/// </summary>
public class SmartBotAgentMessageResponse
{
    public Guid EscalationId { get; set; }
    public string SmartBotConversationId { get; set; } = string.Empty;
    public Guid MessageId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public SmartBotAgentInfo Agent { get; set; } = null!;
}

#endregion

#region Webhook DTOs (CallCenter -> SmartBot)

/// <summary>
/// Webhook payload for agent assignment
/// </summary>
public class AgentAssignedWebhook
{
    public string EventType { get; set; } = "agent_assigned";
    public Guid EscalationId { get; set; }
    public string SmartBotConversationId { get; set; } = string.Empty;
    public SmartBotAgentInfo Agent { get; set; } = null!;
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// Webhook payload for status changes
/// </summary>
public class StatusChangedWebhook
{
    public string EventType { get; set; } = "status_changed";
    public Guid EscalationId { get; set; }
    public string SmartBotConversationId { get; set; } = string.Empty;
    public string OldStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// Webhook payload for agent messages
/// </summary>
public class AgentMessageWebhook
{
    public string EventType { get; set; } = "agent_message";
    public Guid EscalationId { get; set; }
    public string SmartBotConversationId { get; set; } = string.Empty;
    public Guid MessageId { get; set; }
    public string Content { get; set; } = string.Empty;
    public SmartBotAgentInfo Agent { get; set; } = null!;
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// Webhook payload for queue position updates
/// </summary>
public class QueuePositionWebhook
{
    public string EventType { get; set; } = "queue_position_updated";
    public Guid EscalationId { get; set; }
    public string SmartBotConversationId { get; set; } = string.Empty;
    public int QueuePosition { get; set; }
    public int EstimatedWaitTimeSeconds { get; set; }
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// Webhook payload for escalation resolution
/// </summary>
public class EscalationResolvedWebhook
{
    public string EventType { get; set; } = "escalation_resolved";
    public Guid EscalationId { get; set; }
    public string SmartBotConversationId { get; set; } = string.Empty;
    public string Resolution { get; set; } = string.Empty;
    public string? ResolutionNotes { get; set; }
    public SmartBotAgentInfo? ResolvedByAgent { get; set; }
    public DateTime Timestamp { get; set; }
}

#endregion

#region Internal DTOs

/// <summary>
/// Internal DTO for escalation details
/// </summary>
public class SmartBotEscalationDto
{
    public Guid Id { get; set; }
    public string SmartBotConversationId { get; set; } = string.Empty;
    public string SmartBotSessionId { get; set; } = string.Empty;
    public string SmartBotChatbotId { get; set; } = string.Empty;

    public Guid TicketId { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public Guid ConversationId { get; set; }
    public Guid? CustomerId { get; set; }
    public string? CustomerName { get; set; }

    public SmartBotEscalationStatus Status { get; set; }
    public SmartBotEscalationReason Reason { get; set; }
    public SmartBotEscalationMode Mode { get; set; }
    public TicketPriority Priority { get; set; }

    public string? Topic { get; set; }
    public string? Sentiment { get; set; }

    public Guid? AssignedAgentId { get; set; }
    public string? AssignedAgentName { get; set; }
    public Guid? AssignedQueueId { get; set; }
    public int? QueuePosition { get; set; }
    public int? EstimatedWaitTimeSeconds { get; set; }

    public DateTime EscalatedAt { get; set; }
    public DateTime? AgentAssignedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? Resolution { get; set; }

    public List<SmartBotEscalationLogDto> Logs { get; set; } = new();
}

public class SmartBotEscalationLogDto
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string? ActorName { get; set; }
    public string Source { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// Statistics for SmartBot escalations dashboard
/// </summary>
public class EscalationStatsDto
{
    public int TotalEscalations { get; set; }
    public int PendingCount { get; set; }
    public int QueuedCount { get; set; }
    public int AssignedCount { get; set; }
    public int ActiveCount { get; set; }
    public int ResolvedCount { get; set; }
    public int ClosedCount { get; set; }
    public int AbandonedCount { get; set; }

    public double AverageWaitTimeSeconds { get; set; }
    public double AverageHandleTimeSeconds { get; set; }
    public double ResolutionRate { get; set; }

    public Dictionary<string, int> ByReason { get; set; } = new();
    public Dictionary<string, int> ByPriority { get; set; } = new();
    public Dictionary<string, int> ByAgent { get; set; } = new();

    public DateTime? OldestPendingEscalation { get; set; }
}

#endregion
