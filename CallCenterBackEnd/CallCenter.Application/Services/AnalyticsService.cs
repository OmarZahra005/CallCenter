using CallCenter.Application.DTOs.Analytics;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces;

namespace CallCenter.Application.Services;

public interface IAnalyticsService
{
    Task<List<AgentKpiDto>> GetAgentKpisAsync(Guid agentId, DateOnly? from = null, DateOnly? to = null);
    Task<List<QueueMetricDto>> GetQueueMetricsAsync(Guid queueId, DateOnly? from = null, DateOnly? to = null);
    Task<List<TeamKpiDto>> GetTeamKpisAsync(Guid teamId, DateOnly? from = null, DateOnly? to = null);
}

public class AnalyticsService : IAnalyticsService
{
    private readonly IRepository<AgentKpi> _agentKpiRepository;
    private readonly IRepository<QueueMetric> _queueMetricRepository;
    private readonly IRepository<TeamKpi> _teamKpiRepository;

    public AnalyticsService(
        IRepository<AgentKpi> agentKpiRepository,
        IRepository<QueueMetric> queueMetricRepository,
        IRepository<TeamKpi> teamKpiRepository)
    {
        _agentKpiRepository = agentKpiRepository;
        _queueMetricRepository = queueMetricRepository;
        _teamKpiRepository = teamKpiRepository;
    }

    public async Task<List<AgentKpiDto>> GetAgentKpisAsync(Guid agentId, DateOnly? from = null, DateOnly? to = null)
    {
        var all = await _agentKpiRepository.GetAllAsync();
        var query = all.Where(k => k.AgentId == agentId);

        if (from.HasValue)
            query = query.Where(k => k.Date >= from.Value);
        if (to.HasValue)
            query = query.Where(k => k.Date <= to.Value);

        return query.OrderByDescending(k => k.Date).Select(k => new AgentKpiDto
        {
            Id = k.Id,
            AgentId = k.AgentId,
            AgentName = k.Agent?.Name ?? string.Empty,
            Date = k.Date,
            TotalCalls = k.TotalCalls,
            InboundCalls = k.InboundCalls,
            OutboundCalls = k.OutboundCalls,
            AbandonedCalls = k.AbandonedCalls,
            AhtSeconds = k.AhtSeconds,
            AsaSeconds = k.AsaSeconds,
            ResolvedTickets = k.ResolvedTickets,
            CreatedTickets = k.CreatedTickets,
            FcrRate = k.FcrRate,
            CustomerSatisfactionScore = k.CustomerSatisfactionScore,
            AdherencePercentage = k.AdherencePercentage,
            UtilizationPercentage = k.UtilizationPercentage
        }).ToList();
    }

    public async Task<List<QueueMetricDto>> GetQueueMetricsAsync(Guid queueId, DateOnly? from = null, DateOnly? to = null)
    {
        var all = await _queueMetricRepository.GetAllAsync();
        var query = all.Where(m => m.QueueId == queueId);

        if (from.HasValue)
            query = query.Where(m => DateOnly.FromDateTime(m.Timestamp) >= from.Value);
        if (to.HasValue)
            query = query.Where(m => DateOnly.FromDateTime(m.Timestamp) <= to.Value);

        return query.OrderByDescending(m => m.Timestamp).Select(m => new QueueMetricDto
        {
            Id = m.Id,
            QueueId = m.QueueId,
            QueueName = m.Queue?.Name ?? string.Empty,
            Timestamp = m.Timestamp,
            WaitingCalls = m.WaitingCalls,
            ActiveCalls = m.ActiveCalls,
            AvailableAgents = m.AvailableAgents,
            BusyAgents = m.BusyAgents,
            AverageWaitSeconds = m.AverageWaitSeconds,
            LongestWaitSeconds = m.LongestWaitSeconds,
            AbandonedCount = m.AbandonedCount,
            ServiceLevelPercentage = m.ServiceLevelPercentage
        }).ToList();
    }

    public async Task<List<TeamKpiDto>> GetTeamKpisAsync(Guid teamId, DateOnly? from = null, DateOnly? to = null)
    {
        var all = await _teamKpiRepository.GetAllAsync();
        var query = all.Where(k => k.TeamId == teamId);

        if (from.HasValue)
            query = query.Where(k => k.Date >= from.Value);
        if (to.HasValue)
            query = query.Where(k => k.Date <= to.Value);

        return query.OrderByDescending(k => k.Date).Select(k => new TeamKpiDto
        {
            Id = k.Id,
            TeamId = k.TeamId,
            TeamName = k.Team?.Name ?? string.Empty,
            Date = k.Date,
            TotalCalls = k.TotalCalls,
            TotalTicketsResolved = k.TotalTicketsResolved,
            AverageAhtSeconds = k.AverageAhtSeconds,
            AverageAsaSeconds = k.AverageAsaSeconds,
            ServiceLevelPercentage = k.ServiceLevelPercentage,
            FcrRate = k.FcrRate,
            CustomerSatisfactionScore = k.CustomerSatisfactionScore,
            SlaCompliancePercentage = k.SlaCompliancePercentage
        }).ToList();
    }
}
