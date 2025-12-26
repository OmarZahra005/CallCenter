using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

/// <summary>
/// Tracks escalation requests from SmartBot chatbot
/// </summary>
public class SmartBotEscalation
{
    public Guid Id { get; set; }

    // SmartBot references
    public string SmartBotConversationId { get; set; } = string.Empty;
    public string SmartBotSessionId { get; set; } = string.Empty;
    public string SmartBotChatbotId { get; set; } = string.Empty;

    // CallCenter references
    public Guid TicketId { get; set; }
    public Guid ConversationId { get; set; }
    public Guid? CustomerId { get; set; }

    // Escalation details
    public SmartBotEscalationStatus Status { get; set; }
    public SmartBotEscalationReason Reason { get; set; }
    public SmartBotEscalationMode Mode { get; set; }
    public TicketPriority Priority { get; set; }
    public string? Topic { get; set; }
    public string? Sentiment { get; set; }

    // Customer info from SmartBot
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }
    public string? PreferredLanguage { get; set; }

    // Routing info
    public Guid? AssignedAgentId { get; set; }
    public string? AssignedAgentName { get; set; }
    public Guid? AssignedQueueId { get; set; }
    public int? QueuePosition { get; set; }
    public int? EstimatedWaitTimeSeconds { get; set; }

    // Transcript from SmartBot
    public string? TranscriptJson { get; set; }
    public string? ContextVariablesJson { get; set; }

    // Timestamps
    public DateTime EscalatedAt { get; set; }
    public DateTime? AgentAssignedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Resolution
    public string? Resolution { get; set; }
    public string? ResolutionNotes { get; set; }

    // Navigation properties
    public virtual Ticket Ticket { get; set; } = null!;
    public virtual Conversation Conversation { get; set; } = null!;
    public virtual Customer? Customer { get; set; }
    public virtual Agent? AssignedAgent { get; set; }
    public virtual Queue? AssignedQueue { get; set; }
    public virtual ICollection<SmartBotEscalationLog> Logs { get; set; } = new List<SmartBotEscalationLog>();
}

/// <summary>
/// Audit log for SmartBot escalation events
/// </summary>
public class SmartBotEscalationLog
{
    public Guid Id { get; set; }
    public Guid EscalationId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string? ActorId { get; set; }
    public string? ActorName { get; set; }
    public string Source { get; set; } = "CallCenter";
    public DateTime Timestamp { get; set; }

    // Navigation
    public virtual SmartBotEscalation Escalation { get; set; } = null!;
}
