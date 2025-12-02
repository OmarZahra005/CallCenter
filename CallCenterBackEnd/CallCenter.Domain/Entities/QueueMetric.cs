namespace CallCenter.Domain.Entities;

public class QueueMetric
{
    public Guid Id { get; set; }
    public Guid QueueId { get; set; }
    public DateTime Timestamp { get; set; }
    public int WaitingCalls { get; set; }
    public int ActiveCalls { get; set; }
    public int AvailableAgents { get; set; }
    public int BusyAgents { get; set; }
    public int? AverageWaitSeconds { get; set; }
    public int? LongestWaitSeconds { get; set; }
    public int AbandonedCount { get; set; }
    public float? ServiceLevelPercentage { get; set; }

    // Navigation properties
    public virtual Queue Queue { get; set; } = null!;
}
