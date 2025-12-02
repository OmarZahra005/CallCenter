using CallCenter.Application.DTOs.Reports;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;

namespace CallCenter.Application.Services;

public interface IReportService
{
    Task<DashboardSummaryDto> GetDashboardSummaryAsync();
    Task<List<AgentPerformanceReportDto>> GetAgentPerformanceAsync(DateOnly from, DateOnly to);
    Task<List<QueuePerformanceReportDto>> GetQueuePerformanceAsync(DateOnly from, DateOnly to);
}

public class ReportService : IReportService
{
    private readonly IRepository<Agent> _agentRepository;
    private readonly IRepository<Ticket> _ticketRepository;
    private readonly IRepository<AgentKpi> _agentKpiRepository;
    private readonly IRepository<QueueMetric> _queueMetricRepository;
    private readonly IRepository<Queue> _queueRepository;

    public ReportService(
        IRepository<Agent> agentRepository,
        IRepository<Ticket> ticketRepository,
        IRepository<AgentKpi> agentKpiRepository,
        IRepository<QueueMetric> queueMetricRepository,
        IRepository<Queue> queueRepository)
    {
        _agentRepository = agentRepository;
        _ticketRepository = ticketRepository;
        _agentKpiRepository = agentKpiRepository;
        _queueMetricRepository = queueMetricRepository;
        _queueRepository = queueRepository;
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var agents = await _agentRepository.GetAllAsync();
        var tickets = await _ticketRepository.GetAllAsync();
        var agentKpis = await _agentKpiRepository.GetAllAsync();
        var queueMetrics = await _queueMetricRepository.GetAllAsync();

        var todayTickets = tickets.Where(t => DateOnly.FromDateTime(t.CreatedAt) == today).ToList();
        var todayKpis = agentKpis.Where(k => k.Date == today).ToList();
        var todayMetrics = queueMetrics.Where(m => DateOnly.FromDateTime(m.Timestamp) == today).ToList();

        return new DashboardSummaryDto
        {
            TotalAgents = agents.Count(),
            ActiveAgents = agents.Count(a => a.Status == AgentStatus.Active),
            TotalTicketsToday = todayTickets.Count,
            OpenTickets = tickets.Count(t => t.Status == TicketStatus.Open || t.Status == TicketStatus.Pending),
            ResolvedTicketsToday = todayTickets.Count(t => t.Status == TicketStatus.Resolved),
            TotalCallsToday = todayKpis.Sum(k => k.TotalCalls),
            AvgHandleTimeSeconds = todayKpis.Any() ? todayKpis.Average(k => k.AhtSeconds ?? 0) : 0,
            ServiceLevelPercentage = todayMetrics.Any() ? todayMetrics.Average(m => m.ServiceLevelPercentage ?? 0) : 0,
            CustomerSatisfactionScore = todayKpis.Any() ? todayKpis.Average(k => k.CustomerSatisfactionScore ?? 0) : 0
        };
    }

    public async Task<List<AgentPerformanceReportDto>> GetAgentPerformanceAsync(DateOnly from, DateOnly to)
    {
        var agents = await _agentRepository.GetAllAsync();
        var agentKpis = await _agentKpiRepository.GetAllAsync();
        var tickets = await _ticketRepository.GetAllAsync();

        var result = new List<AgentPerformanceReportDto>();

        foreach (var agent in agents.Where(a => a.Status == AgentStatus.Active))
        {
            var kpis = agentKpis.Where(k => k.AgentId == agent.Id && k.Date >= from && k.Date <= to).ToList();
            var agentTickets = tickets.Where(t => t.AgentId == agent.Id &&
                DateOnly.FromDateTime(t.CreatedAt) >= from &&
                DateOnly.FromDateTime(t.CreatedAt) <= to).ToList();

            result.Add(new AgentPerformanceReportDto
            {
                AgentId = agent.Id,
                AgentName = agent.Name,
                TotalCalls = kpis.Sum(k => k.TotalCalls),
                TotalTickets = agentTickets.Count,
                ResolvedTickets = agentTickets.Count(t => t.Status == TicketStatus.Resolved),
                AvgHandleTimeSeconds = kpis.Any() ? kpis.Average(k => k.AhtSeconds ?? 0) : 0,
                CustomerSatisfactionScore = kpis.Any() ? kpis.Average(k => k.CustomerSatisfactionScore) : null,
                AdherencePercentage = kpis.Any() ? kpis.Average(k => k.AdherencePercentage) : null
            });
        }

        return result.OrderByDescending(r => r.TotalCalls).ToList();
    }

    public async Task<List<QueuePerformanceReportDto>> GetQueuePerformanceAsync(DateOnly from, DateOnly to)
    {
        var queues = await _queueRepository.GetAllAsync();
        var queueMetrics = await _queueMetricRepository.GetAllAsync();

        var result = new List<QueuePerformanceReportDto>();

        foreach (var queue in queues.Where(q => q.IsActive))
        {
            var metrics = queueMetrics.Where(m => m.QueueId == queue.Id &&
                DateOnly.FromDateTime(m.Timestamp) >= from &&
                DateOnly.FromDateTime(m.Timestamp) <= to).ToList();

            result.Add(new QueuePerformanceReportDto
            {
                QueueId = queue.Id,
                QueueName = queue.Name,
                TotalCalls = metrics.Sum(m => m.WaitingCalls + m.ActiveCalls),
                AnsweredCalls = metrics.Sum(m => m.ActiveCalls),
                AbandonedCalls = metrics.Sum(m => m.AbandonedCount),
                AvgWaitTimeSeconds = metrics.Any() ? metrics.Average(m => m.AverageWaitSeconds ?? 0) : 0,
                ServiceLevelPercentage = metrics.Any() ? metrics.Average(m => m.ServiceLevelPercentage ?? 0) : 0
            });
        }

        return result.OrderByDescending(r => r.TotalCalls).ToList();
    }
}
