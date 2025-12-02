namespace CallCenter.Domain.Entities;

public class AgentKpi
{
    public Guid Id { get; set; }
    public Guid AgentId { get; set; }
    public DateOnly Date { get; set; }
    public int TotalCalls { get; set; }
    public int InboundCalls { get; set; }
    public int OutboundCalls { get; set; }
    public int AbandonedCalls { get; set; }
    public int? AhtSeconds { get; set; }
    public int? AsaSeconds { get; set; }
    public int? AcwSeconds { get; set; }
    public int TotalTalkTimeSeconds { get; set; }
    public int TotalHoldTimeSeconds { get; set; }
    public int ResolvedTickets { get; set; }
    public int CreatedTickets { get; set; }
    public float? FcrRate { get; set; }
    public float? CustomerSatisfactionScore { get; set; }
    public float? AdherencePercentage { get; set; }
    public float? UtilizationPercentage { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Agent Agent { get; set; } = null!;
}
