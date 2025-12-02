using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.Cti;

public class CtiEventDto
{
    public Guid Id { get; set; }
    public string CallId { get; set; } = string.Empty;
    public Guid? AgentId { get; set; }
    public string? AgentName { get; set; }
    public CtiEventType EventType { get; set; }
    public CallDirection Direction { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Metadata { get; set; }
}

public class CreateCtiEventRequest
{
    public string CallId { get; set; } = string.Empty;
    public Guid? AgentId { get; set; }
    public CtiEventType EventType { get; set; }
    public CallDirection Direction { get; set; }
    public string? Metadata { get; set; }
}

public class AgentStateDto
{
    public Guid Id { get; set; }
    public Guid AgentId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public AgentStateType State { get; set; }
    public string? Reason { get; set; }
    public DateTime ChangedAt { get; set; }
    public int? DurationSeconds { get; set; }
}

public class UpdateAgentStateRequest
{
    public AgentStateType State { get; set; }
    public string? Reason { get; set; }
}
