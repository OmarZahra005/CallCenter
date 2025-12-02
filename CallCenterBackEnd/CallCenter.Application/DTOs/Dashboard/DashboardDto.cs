namespace CallCenter.Application.DTOs.Dashboard;

public class DashboardSummaryDto
{
    public int ActiveAgents { get; set; }
    public int OpenTickets { get; set; }
    public int TotalCustomers { get; set; }
    public int ResolvedToday { get; set; }
    public List<QueueStatusDto> Queues { get; set; } = new();
    public List<AgentStateCountDto> AgentStates { get; set; } = new();
    public SlaPerformanceDto SlaPerformance { get; set; } = new();
}

public class QueueStatusDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Waiting { get; set; }
    public int AvgWaitTime { get; set; }
    public float ServiceLevelPercent { get; set; }
    public int AgentsAvailable { get; set; }
}

public class AgentStateCountDto
{
    public string State { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class SlaPerformanceDto
{
    public int OnTrackCount { get; set; }
    public int AtRiskCount { get; set; }
    public int BreachedCount { get; set; }
    public float OnTrackPercent { get; set; }
    public float AtRiskPercent { get; set; }
    public float BreachedPercent { get; set; }
    public int AverageResponseTimeSeconds { get; set; }
    public int AverageResolutionTimeSeconds { get; set; }
    public float FirstContactResolutionRate { get; set; }
}
