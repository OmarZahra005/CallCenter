using System.Collections.Concurrent;
using CallCenter.Application.Interfaces;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CallCenter.Application.Services;

/// <summary>
/// Enhanced routing service for SmartBot escalations with skill-based,
/// priority-aware, and working-hours-checked routing logic
/// </summary>
public class EnhancedRoutingService : IEnhancedRoutingService
{
    private readonly IRepository<Agent> _agentRepository;
    private readonly IRepository<AgentState> _agentStateRepository;
    private readonly IRepository<AgentShift> _shiftRepository;
    private readonly IRepository<AgentSkill> _skillRepository;
    private readonly IRepository<SmartBotEscalation> _escalationRepository;
    private readonly ILogger<EnhancedRoutingService> _logger;

    // In-memory queue for escalations (consider Redis for production with multiple instances)
    private static readonly ConcurrentDictionary<Guid, QueuedEscalation> _escalationQueue = new();
    private static int _lastAssignedIndex = -1;
    private static readonly object _lockObject = new();

    // Average handle time in seconds (could be made configurable or calculated from metrics)
    private const int AverageHandleTimeSeconds = 480; // 8 minutes

    public EnhancedRoutingService(
        IRepository<Agent> agentRepository,
        IRepository<AgentState> agentStateRepository,
        IRepository<AgentShift> shiftRepository,
        IRepository<AgentSkill> skillRepository,
        IRepository<SmartBotEscalation> escalationRepository,
        ILogger<EnhancedRoutingService> logger)
    {
        _agentRepository = agentRepository;
        _agentStateRepository = agentStateRepository;
        _shiftRepository = shiftRepository;
        _skillRepository = skillRepository;
        _escalationRepository = escalationRepository;
        _logger = logger;
    }

    public async Task<EscalationRoutingResult> RouteEscalationAsync(EscalationRoutingRequest request)
    {
        _logger.LogInformation(
            "Routing escalation {EscalationId}, Topic: {Topic}, Priority: {Priority}",
            request.EscalationId, request.Topic, request.Priority);

        // 1. Check working hours
        var isWithinHours = await IsWithinWorkingHoursAsync();
        if (!isWithinHours)
        {
            _logger.LogWarning("Escalation {EscalationId} requested outside working hours", request.EscalationId);
            return EscalationRoutingResult.OutsideHours();
        }

        // 2. Get available agents
        var availableAgents = string.IsNullOrEmpty(request.Topic)
            ? await GetAvailableAgentsAsync()
            : await GetAvailableAgentsBySkillAsync(request.Topic);

        // 3. Filter by language if specified
        if (!string.IsNullOrEmpty(request.PreferredLanguage))
        {
            var languageFilteredAgents = availableAgents
                .Where(a => !string.IsNullOrEmpty(a.Languages) &&
                           a.Languages.Contains(request.PreferredLanguage, StringComparison.OrdinalIgnoreCase))
                .ToList();

            // If we have language-matching agents, prefer them
            if (languageFilteredAgents.Any())
            {
                availableAgents = languageFilteredAgents;
            }
        }

        // 4. Sort by skill level for priority handling
        if (request.Priority == TicketPriority.High ||
            request.Priority == TicketPriority.Urgent)
        {
            // For high priority, prefer agents with higher skill levels
            availableAgents = availableAgents.OrderByDescending(a => a.SkillLevel).ToList();
        }

        if (!availableAgents.Any())
        {
            _logger.LogInformation(
                "No available agents for escalation {EscalationId}, adding to queue",
                request.EscalationId);

            var queueInfo = await AddToQueueAsync(request.EscalationId, request.Topic, request.Priority);
            return EscalationRoutingResult.Queued(queueInfo.Position, queueInfo.EstimatedWaitTimeSeconds);
        }

        // 5. Round-robin selection with thread safety
        Agent selectedAgent;
        lock (_lockObject)
        {
            _lastAssignedIndex = (_lastAssignedIndex + 1) % availableAgents.Count;
            selectedAgent = availableAgents[_lastAssignedIndex];
        }

        _logger.LogInformation(
            "Selected agent {AgentId} ({AgentName}) for escalation {EscalationId}",
            selectedAgent.Id, selectedAgent.Name, request.EscalationId);

        return EscalationRoutingResult.AgentFound(selectedAgent);
    }

    public async Task<List<Agent>> GetAvailableAgentsBySkillAsync(string skill)
    {
        var availableAgents = await GetAvailableAgentsAsync();

        if (string.IsNullOrEmpty(skill))
            return availableAgents;

        // Get all skills
        var allSkills = await _skillRepository.GetAllAsync();

        // Find agents with matching skill
        var agentIdsWithSkill = allSkills
            .Where(s => s.SkillName.Equals(skill, StringComparison.OrdinalIgnoreCase))
            .Select(s => s.AgentId)
            .ToHashSet();

        var matchingAgents = availableAgents
            .Where(a => agentIdsWithSkill.Contains(a.Id))
            .ToList();

        _logger.LogInformation(
            "Found {Count} available agents with skill '{Skill}'",
            matchingAgents.Count, skill);

        // If no agents with matching skill, fall back to all available agents
        if (!matchingAgents.Any())
        {
            _logger.LogInformation(
                "No agents with skill '{Skill}', falling back to all available agents",
                skill);
            return availableAgents;
        }

        // Sort by proficiency level (highest first)
        var agentProficiencyMap = allSkills
            .Where(s => s.SkillName.Equals(skill, StringComparison.OrdinalIgnoreCase))
            .ToDictionary(s => s.AgentId, s => s.ProficiencyLevel);

        return matchingAgents
            .OrderByDescending(a => agentProficiencyMap.GetValueOrDefault(a.Id, 0))
            .ToList();
    }

    public async Task<bool> IsWithinWorkingHoursAsync()
    {
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);

        // Get all shifts for today
        var allShifts = await _shiftRepository.GetAllAsync();
        var todayShifts = allShifts
            .Where(s => s.ShiftDate == today && s.Status == ShiftStatus.Scheduled)
            .ToList();

        if (!todayShifts.Any())
        {
            _logger.LogInformation("No scheduled shifts found for today");
            return false;
        }

        // Check if current time falls within any shift
        var isWithinShift = todayShifts.Any(s =>
            now >= s.ShiftStart && now <= s.ShiftEnd);

        _logger.LogInformation(
            "Working hours check: {Result} (found {ShiftCount} shifts for today)",
            isWithinShift, todayShifts.Count);

        return isWithinShift;
    }

    public async Task<QueuePositionInfo> GetQueuePositionAsync(Guid escalationId)
    {
        if (_escalationQueue.TryGetValue(escalationId, out var queuedEscalation))
        {
            // Recalculate position based on current queue state
            var position = CalculateQueuePosition(escalationId);
            var waitTime = await GetEstimatedWaitTimeSecondsAsync(position);

            return new QueuePositionInfo
            {
                EscalationId = escalationId,
                Position = position,
                EstimatedWaitTimeSeconds = waitTime,
                QueuedAt = queuedEscalation.QueuedAt
            };
        }

        // Not in queue, check if already assigned
        return new QueuePositionInfo
        {
            EscalationId = escalationId,
            Position = 0,
            EstimatedWaitTimeSeconds = 0,
            QueuedAt = DateTime.UtcNow
        };
    }

    public async Task<QueuePositionInfo> AddToQueueAsync(
        Guid escalationId,
        string? skill,
        TicketPriority priority)
    {
        var queuedEscalation = new QueuedEscalation
        {
            EscalationId = escalationId,
            Skill = skill,
            Priority = priority,
            QueuedAt = DateTime.UtcNow
        };

        _escalationQueue[escalationId] = queuedEscalation;

        var position = CalculateQueuePosition(escalationId);
        var waitTime = await GetEstimatedWaitTimeSecondsAsync(position);

        _logger.LogInformation(
            "Added escalation {EscalationId} to queue at position {Position}, estimated wait: {WaitTime}s",
            escalationId, position, waitTime);

        return new QueuePositionInfo
        {
            EscalationId = escalationId,
            Position = position,
            EstimatedWaitTimeSeconds = waitTime,
            QueuedAt = queuedEscalation.QueuedAt
        };
    }

    public Task RemoveFromQueueAsync(Guid escalationId)
    {
        if (_escalationQueue.TryRemove(escalationId, out _))
        {
            _logger.LogInformation("Removed escalation {EscalationId} from queue", escalationId);
        }

        return Task.CompletedTask;
    }

    public async Task<int> GetEstimatedWaitTimeSecondsAsync(int queuePosition)
    {
        if (queuePosition <= 0)
            return 0;

        // Get count of available agents
        var availableAgents = await GetAvailableAgentsAsync();
        var agentCount = Math.Max(availableAgents.Count, 1);

        // Estimate: (position / agents) * average handle time
        var estimatedWaitTime = (int)Math.Ceiling((double)queuePosition / agentCount * AverageHandleTimeSeconds);

        return estimatedWaitTime;
    }

    #region Private Methods

    private async Task<List<Agent>> GetAvailableAgentsAsync()
    {
        // Get all active agents with Agent role
        var allAgents = await _agentRepository.GetAllAsync();
        var activeAgents = allAgents
            .Where(a => a.Status == AgentStatus.Active && a.Role == AgentRole.Agent)
            .ToList();

        if (!activeAgents.Any())
            return new List<Agent>();

        // Get all agent states
        var allStates = await _agentStateRepository.GetAllAsync();

        var availableAgents = new List<Agent>();

        foreach (var agent in activeAgents)
        {
            // Get the most recent state for this agent
            var latestState = allStates
                .Where(s => s.AgentId == agent.Id)
                .OrderByDescending(s => s.ChangedAt)
                .FirstOrDefault();

            // Agent is available if no state or state is Available
            if (latestState == null || latestState.State == AgentStateType.Available)
            {
                // Also check if agent is within their shift
                if (await IsAgentWithinShiftAsync(agent.Id))
                {
                    availableAgents.Add(agent);
                }
            }
        }

        return availableAgents;
    }

    private async Task<bool> IsAgentWithinShiftAsync(Guid agentId)
    {
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);

        var allShifts = await _shiftRepository.GetAllAsync();
        var agentShift = allShifts
            .Where(s => s.AgentId == agentId &&
                       s.ShiftDate == today &&
                       s.Status == ShiftStatus.Scheduled)
            .FirstOrDefault();

        if (agentShift == null)
            return false;

        return now >= agentShift.ShiftStart && now <= agentShift.ShiftEnd;
    }

    private int CalculateQueuePosition(Guid escalationId)
    {
        if (!_escalationQueue.TryGetValue(escalationId, out var currentEscalation))
            return 0;

        // Sort queue by priority (Urgent > High > Normal > Low) then by queue time
        var sortedQueue = _escalationQueue.Values
            .OrderByDescending(e => (int)e.Priority)
            .ThenBy(e => e.QueuedAt)
            .ToList();

        var position = sortedQueue.FindIndex(e => e.EscalationId == escalationId) + 1;
        return position;
    }

    #endregion

    #region Private Classes

    private class QueuedEscalation
    {
        public Guid EscalationId { get; set; }
        public string? Skill { get; set; }
        public TicketPriority Priority { get; set; }
        public DateTime QueuedAt { get; set; }
    }

    #endregion
}
