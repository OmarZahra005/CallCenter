namespace CallCenter.Domain.Entities;

public class TeamKpi
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public DateOnly Date { get; set; }
    public int TotalCalls { get; set; }
    public int? AverageAhtSeconds { get; set; }
    public int? AverageAsaSeconds { get; set; }
    public float? ServiceLevelPercentage { get; set; }
    public float? FcrRate { get; set; }
    public float? CustomerSatisfactionScore { get; set; }
    public int TotalTicketsResolved { get; set; }
    public float? SlaCompliancePercentage { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Team Team { get; set; } = null!;
}
