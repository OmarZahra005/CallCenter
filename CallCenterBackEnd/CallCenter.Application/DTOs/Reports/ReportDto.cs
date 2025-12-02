namespace CallCenter.Application.DTOs.Reports;

public class DashboardSummaryDto
{
    public int TotalAgents { get; set; }
    public int ActiveAgents { get; set; }
    public int TotalTicketsToday { get; set; }
    public int OpenTickets { get; set; }
    public int ResolvedTicketsToday { get; set; }
    public int TotalCallsToday { get; set; }
    public double AvgHandleTimeSeconds { get; set; }
    public double ServiceLevelPercentage { get; set; }
    public double CustomerSatisfactionScore { get; set; }
}

public class AgentPerformanceReportDto
{
    public Guid AgentId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public int TotalCalls { get; set; }
    public int TotalTickets { get; set; }
    public int ResolvedTickets { get; set; }
    public double AvgHandleTimeSeconds { get; set; }
    public double? CustomerSatisfactionScore { get; set; }
    public double? AdherencePercentage { get; set; }
}

public class QueuePerformanceReportDto
{
    public Guid QueueId { get; set; }
    public string QueueName { get; set; } = string.Empty;
    public int TotalCalls { get; set; }
    public int AnsweredCalls { get; set; }
    public int AbandonedCalls { get; set; }
    public double AvgWaitTimeSeconds { get; set; }
    public double ServiceLevelPercentage { get; set; }
}

public class DateRangeRequest
{
    public DateOnly From { get; set; }
    public DateOnly To { get; set; }
}
