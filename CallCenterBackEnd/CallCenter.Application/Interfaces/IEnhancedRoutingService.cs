using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Application.Interfaces;

/// <summary>
/// Enhanced routing service for SmartBot escalations with skill-based,
/// priority-aware, and working-hours-checked routing logic
/// </summary>
public interface IEnhancedRoutingService
{
    /// <summary>
    /// Route an escalation to an available agent based on skill matching,
    /// priority, and working hours
    /// </summary>
    Task<EscalationRoutingResult> RouteEscalationAsync(EscalationRoutingRequest request);

    /// <summary>
    /// Get available agents matching a specific skill/topic
    /// </summary>
    Task<List<Agent>> GetAvailableAgentsBySkillAsync(string skill);

    /// <summary>
    /// Check if any agents are within working hours
    /// </summary>
    Task<bool> IsWithinWorkingHoursAsync();

    /// <summary>
    /// Get current queue position for an escalation
    /// </summary>
    Task<QueuePositionInfo> GetQueuePositionAsync(Guid escalationId);

    /// <summary>
    /// Add escalation to queue when no agent is available
    /// </summary>
    Task<QueuePositionInfo> AddToQueueAsync(Guid escalationId, string? skill, TicketPriority priority);

    /// <summary>
    /// Remove escalation from queue (when cancelled or assigned)
    /// </summary>
    Task RemoveFromQueueAsync(Guid escalationId);

    /// <summary>
    /// Get estimated wait time based on queue position and average handle time
    /// </summary>
    Task<int> GetEstimatedWaitTimeSecondsAsync(int queuePosition);
}

/// <summary>
/// Request for routing an escalation
/// </summary>
public class EscalationRoutingRequest
{
    public Guid EscalationId { get; set; }
    public string? Topic { get; set; }
    public TicketPriority Priority { get; set; }
    public string? PreferredLanguage { get; set; }
}

/// <summary>
/// Result of routing an escalation
/// </summary>
public class EscalationRoutingResult
{
    public bool Success { get; set; }
    public bool AgentAssigned { get; set; }
    public Agent? AssignedAgent { get; set; }
    public bool AddedToQueue { get; set; }
    public int? QueuePosition { get; set; }
    public int? EstimatedWaitTimeSeconds { get; set; }
    public string? FailureReason { get; set; }
    public bool IsOutsideWorkingHours { get; set; }

    public static EscalationRoutingResult AgentFound(Agent agent) => new()
    {
        Success = true,
        AgentAssigned = true,
        AssignedAgent = agent
    };

    public static EscalationRoutingResult Queued(int position, int estimatedWaitSeconds) => new()
    {
        Success = true,
        AgentAssigned = false,
        AddedToQueue = true,
        QueuePosition = position,
        EstimatedWaitTimeSeconds = estimatedWaitSeconds
    };

    public static EscalationRoutingResult OutsideHours() => new()
    {
        Success = false,
        IsOutsideWorkingHours = true,
        FailureReason = "No agents are available outside working hours"
    };

    public static EscalationRoutingResult Failed(string reason) => new()
    {
        Success = false,
        FailureReason = reason
    };
}

/// <summary>
/// Queue position information
/// </summary>
public class QueuePositionInfo
{
    public Guid EscalationId { get; set; }
    public int Position { get; set; }
    public int EstimatedWaitTimeSeconds { get; set; }
    public DateTime QueuedAt { get; set; }
}
