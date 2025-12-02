using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class AgentState
{
    public Guid Id { get; set; }
    public Guid AgentId { get; set; }
    public AgentStateType State { get; set; }
    public string? Reason { get; set; }
    public DateTime ChangedAt { get; set; }
    public int? DurationSeconds { get; set; }

    // Navigation properties
    public virtual Agent Agent { get; set; } = null!;
}
