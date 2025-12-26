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
    private readonly IRepository<TicketStatusHistory> _statusHistoryRepository;

    public DashboardService(
        IRepository<Agent> agentRepository,
        IRepository<Ticket> ticketRepository,
        IRepository<Customer> customerRepository,
        IRepository<Queue> queueRepository,
        IRepository<QueueMetric> queueMetricRepository,
        IRepository<TicketSlaTracking> slaTrackingRepository,
        IRepository<AgentState> agentStateRepository,
        IRepository<TicketStatusHistory> statusHistoryRepository)
    {
        _agentRepository = agentRepository;
        _ticketRepository = ticketRepository;
        _customerRepository = customerRepository;
        _queueRepository = queueRepository;
        _queueMetricRepository = queueMetricRepository;
        _slaTrackingRepository = slaTrackingRepository;
        _agentStateRepository = agentStateRepository;
        _statusHistoryRepository = statusHistoryRepository;
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

        // FCR - tickets resolved without reopening
        // Get all status history to identify reopened tickets
        var statusHistory = (await _statusHistoryRepository.GetAllAsync()).ToList();

        // Find tickets that were reopened (status changed from Resolved/Closed back to New/Open/Reopened)
        var reopenedTicketIds = statusHistory
            .Where(sh =>
                (sh.FromStatus == TicketStatus.Resolved || sh.FromStatus == TicketStatus.Closed) &&
                (sh.ToStatus == TicketStatus.New || sh.ToStatus == TicketStatus.Open || sh.ToStatus == TicketStatus.Reopened))
            .Select(sh => sh.TicketId)
            .Distinct()
            .ToHashSet();

        // Calculate FCR rate: resolved tickets that were never reopened
        var resolvedTickets = tickets.Where(t =>
            t.Status == TicketStatus.Resolved || t.Status == TicketStatus.Closed).ToList();
        var resolvedWithoutReopening = resolvedTickets.Count(t => !reopenedTicketIds.Contains(t.Id));
        var fcrRate = resolvedTickets.Any()
            ? (float)resolvedWithoutReopening / resolvedTickets.Count * 100
            : 0f;

        // Calculate average resolution time from resolved tickets with ResolvedAt
        var ticketsWithResolutionTime = tickets
            .Where(t => t.ResolvedAt.HasValue && t.CreatedAt < t.ResolvedAt.Value)
            .ToList();
        var avgResolutionTime = ticketsWithResolutionTime.Any()
            ? (int)ticketsWithResolutionTime.Average(t => (t.ResolvedAt!.Value - t.CreatedAt).TotalSeconds)
            : 0;

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
                AverageResolutionTimeSeconds = avgResolutionTime,
                FirstContactResolutionRate = fcrRate
            }
        };
    }
}
