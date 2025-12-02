namespace CallCenter.Domain.Entities;

public class AgentAdherence
{
    public Guid Id { get; set; }
    public Guid AgentId { get; set; }
    public Guid ShiftId { get; set; }
    public DateTime Timestamp { get; set; }
    public string ExpectedState { get; set; } = string.Empty;
    public string ActualState { get; set; } = string.Empty;
    public bool IsAdherent { get; set; }
    public int? VarianceMinutes { get; set; }
    public string? Reason { get; set; }

    // Navigation properties
    public virtual Agent Agent { get; set; } = null!;
    public virtual AgentShift Shift { get; set; } = null!;
}
