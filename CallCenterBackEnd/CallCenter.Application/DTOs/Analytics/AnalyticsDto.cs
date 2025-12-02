namespace CallCenter.Application.DTOs.Analytics;

public class AgentKpiDto
{
    public Guid Id { get; set; }
    public Guid AgentId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public int TotalCalls { get; set; }
    public int InboundCalls { get; set; }
    public int OutboundCalls { get; set; }
    public int AbandonedCalls { get; set; }
    public int? AhtSeconds { get; set; }
    public int? AsaSeconds { get; set; }
    public int ResolvedTickets { get; set; }
    public int CreatedTickets { get; set; }
    public float? FcrRate { get; set; }
    public float? CustomerSatisfactionScore { get; set; }
    public float? AdherencePercentage { get; set; }
    public float? UtilizationPercentage { get; set; }
}

public class QueueMetricDto
{
    public Guid Id { get; set; }
    public Guid QueueId { get; set; }
    public string QueueName { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public int WaitingCalls { get; set; }
    public int ActiveCalls { get; set; }
    public int AvailableAgents { get; set; }
    public int BusyAgents { get; set; }
    public int? AverageWaitSeconds { get; set; }
    public int? LongestWaitSeconds { get; set; }
    public int AbandonedCount { get; set; }
    public float? ServiceLevelPercentage { get; set; }
}

public class TeamKpiDto
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public int TotalCalls { get; set; }
    public int TotalTicketsResolved { get; set; }
    public int? AverageAhtSeconds { get; set; }
    public int? AverageAsaSeconds { get; set; }
    public float? ServiceLevelPercentage { get; set; }
    public float? FcrRate { get; set; }
    public float? CustomerSatisfactionScore { get; set; }
    public float? SlaCompliancePercentage { get; set; }
}
