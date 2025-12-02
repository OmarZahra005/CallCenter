using CallCenter.Application.DTOs.Dashboard;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;

namespace CallCenter.Application.Services;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetDashboardSummaryAsync();
}

public class DashboardService : IDashboardService
{
    private readonly IRepository<Agent> _agentRepository;
    private readonly IRepository<Ticket> _ticketRepository;
    private readonly IRepository<Customer> _customerRepository;
    private readonly IRepository<Queue> _queueRepository;
    private readonly IRepository<QueueMetric> _queueMetricRepository;
    private readonly IRepository<TicketSlaTracking> _slaTrackingRepository;
    private readonly IRepository<AgentState> _agentStateRepository;

    public DashboardService(
        IRepository<Agent> agentRepository,
        IRepository<Ticket> ticketRepository,
        IRepository<Customer> customerRepository,
        IRepository<Queue> queueRepository,
        IRepository<QueueMetric> queueMetricRepository,
        IRepository<TicketSlaTracking> slaTrackingRepository,
        IRepository<AgentState> agentStateRepository)
    {
        _agentRepository = agentRepository;
        _ticketRepository = ticketRepository;
        _customerRepository = customerRepository;
        _queueRepository = queueRepository;
        _queueMetricRepository = queueMetricRepository;
        _slaTrackingRepository = slaTrackingRepository;
        _agentStateRepository = agentStateRepository;
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
    {
        var agents = (await _agentRepository.GetAllAsync()).ToList();
        var tickets = (await _ticketRepository.GetAllAsync()).ToList();
        var customers = (await _customerRepository.GetAllAsync()).ToList();
        var queues = (await _queueRepository.GetAllAsync()).Where(q => q.IsActive).ToList();
        var queueMetrics = (await _queueMetricRepository.GetAllAsync()).ToList();
        var slaTrackings = (await _slaTrackingRepository.GetAllAsync()).ToList();

        var today = DateTime.UtcNow.Date;

        // Basic counts
        var activeAgents = agents.Count(a => a.Status == AgentStatus.Active);
        var openTickets = tickets.Count(t => t.Status == TicketStatus.New ||
                                              t.Status == TicketStatus.Open ||
                                              t.Status == TicketStatus.Pending);
        var resolvedToday = tickets.Count(t => t.Status == TicketStatus.Resolved &&
                                               t.UpdatedAt.Date == today);

        // Get latest state for each agent
        var allAgentStates = (await _agentStateRepository.GetAllAsync()).ToList();
        var latestStatesByAgent = allAgentStates
            .GroupBy(s => s.AgentId)
            .Select(g => g.OrderByDescending(s => s.ChangedAt).First())
            .ToList();

        // Agent states breakdown
        var agentStates = new List<AgentStateCountDto>
        {
            new() { State = "Available", Count = latestStatesByAgent.Count(s => s.State == AgentStateType.Available) },
            new() { State = "Busy", Count = latestStatesByAgent.Count(s => s.State == AgentStateType.Busy) },
            new() { State = "Break", Count = latestStatesByAgent.Count(s => s.State == AgentStateType.Break) },
            new() { State = "ACW", Count = latestStatesByAgent.Count(s => s.State == AgentStateType.AfterCallWork) },
            new() { State = "Offline", Count = agents.Count - latestStatesByAgent.Count }
        };

        // Queue status with latest metrics
        var queueStatuses = queues.Select(q =>
        {
            var latestMetric = queueMetrics
                .Where(m => m.QueueId == q.Id)
                .OrderByDescending(m => m.Timestamp)
                .FirstOrDefault();

            return new QueueStatusDto
            {
                Id = q.Id,
                Name = q.Name,
                Waiting = latestMetric?.WaitingCalls ?? 0,
                AvgWaitTime = latestMetric?.AverageWaitSeconds ?? 0,
                ServiceLevelPercent = latestMetric?.ServiceLevelPercentage ?? 100,
                AgentsAvailable = latestMetric?.AvailableAgents ?? 0
            };
        }).ToList();

        // SLA Performance from active trackings
        var activeTrackings = slaTrackings.Where(s =>
            s.Status != SlaTrackingStatus.Completed &&
            s.Status != SlaTrackingStatus.Paused).ToList();

        var onTrackCount = activeTrackings.Count(s => s.Status == SlaTrackingStatus.OnTrack);
        var atRiskCount = activeTrackings.Count(s => s.Status == SlaTrackingStatus.AtRisk);
        var breachedCount = activeTrackings.Count(s => s.Status == SlaTrackingStatus.Breached ||
                                                       s.ResponseBreached ||
                                                       s.ResolutionBreached);
        var totalActive = activeTrackings.Count;

        // Calculate average times from completed tickets today
        var completedToday = slaTrackings.Where(s =>
            s.Status == SlaTrackingStatus.Completed &&
            s.FirstResponseAt.HasValue &&
            s.CreatedAt.Date == today).ToList();

        var avgResponseTime = completedToday.Any()
            ? (int)completedToday.Average(s => (s.FirstResponseAt!.Value - s.CreatedAt).TotalSeconds)
            : 0;

        // FCR - tickets resolved without reopening (simplified)
        var resolvedTickets = tickets.Where(t => t.Status == TicketStatus.Resolved).ToList();
        var fcrRate = resolvedTickets.Any() ? 78f : 0f; // Placeholder - would need reopening tracking

        return new DashboardSummaryDto
        {
            ActiveAgents = activeAgents,
            OpenTickets = openTickets,
            TotalCustomers = customers.Count,
            ResolvedToday = resolvedToday,
            Queues = queueStatuses,
            AgentStates = agentStates,
            SlaPerformance = new SlaPerformanceDto
            {
                OnTrackCount = onTrackCount,
                AtRiskCount = atRiskCount,
                BreachedCount = breachedCount,
                OnTrackPercent = totalActive > 0 ? (float)onTrackCount / totalActive * 100 : 100,
                AtRiskPercent = totalActive > 0 ? (float)atRiskCount / totalActive * 100 : 0,
                BreachedPercent = totalActive > 0 ? (float)breachedCount / totalActive * 100 : 0,
                AverageResponseTimeSeconds = avgResponseTime,
                AverageResolutionTimeSeconds = 930, // ~15m30s placeholder
                FirstContactResolutionRate = fcrRate
            }
        };
    }
}
