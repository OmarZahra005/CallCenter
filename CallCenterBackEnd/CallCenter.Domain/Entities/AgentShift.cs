using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class AgentShift
{
    public Guid Id { get; set; }
    public Guid AgentId { get; set; }
    public DateOnly ShiftDate { get; set; }
    public DateTime ShiftStart { get; set; }
    public DateTime ShiftEnd { get; set; }
    public int BreakMinutes { get; set; }
    public ShiftStatus Status { get; set; } = ShiftStatus.Scheduled;
    public DateTime? ActualStart { get; set; }
    public DateTime? ActualEnd { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Agent Agent { get; set; } = null!;
    public virtual ICollection<AgentAdherence> Adherences { get; set; } = new List<AgentAdherence>();
}
