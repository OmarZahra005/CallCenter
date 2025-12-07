using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CallCenter.Application.Services;

public interface IAgentRoutingService
{
    Task<Agent?> SelectNextAvailableAgentAsync();
    Task<List<Agent>> GetAvailableAgentsAsync();
}

public class AgentRoutingService : IAgentRoutingService
{
    private readonly IRepository<Agent> _agentRepository;
    private readonly IRepository<AgentState> _agentStateRepository;
    private readonly ILogger<AgentRoutingService> _logger;

    // In-memory tracking of last assigned agent index for round-robin
    // NOTE: In production with multiple instances, consider Redis or database storage
    private static int _lastAssignedIndex = -1;
    private static readonly object _lockObject = new object();

    public AgentRoutingService(
        IRepository<Agent> agentRepository,
        IRepository<AgentState> agentStateRepository,
        ILogger<AgentRoutingService> logger)
    {
        _agentRepository = agentRepository;
        _agentStateRepository = agentStateRepository;
        _logger = logger;
    }

    public async Task<Agent?> SelectNextAvailableAgentAsync()
    {
        var availableAgents = await GetAvailableAgentsAsync();

        if (!availableAgents.Any())
        {
            _logger.LogWarning("No available agents for incoming call");
            return null;
        }

        // Round-robin selection with thread safety
        lock (_lockObject)
        {
            _lastAssignedIndex = (_lastAssignedIndex + 1) % availableAgents.Count;
            var selectedAgent = availableAgents[_lastAssignedIndex];

            _logger.LogInformation(
                "Selected agent {AgentId} ({AgentName} - {AgentEmail}) for incoming call using round-robin (index: {Index}/{Count})",
                selectedAgent.Id,
                selectedAgent.Name,
                selectedAgent.Email,
                _lastAssignedIndex,
                availableAgents.Count);

            return selectedAgent;
        }
    }

    public async Task<List<Agent>> GetAvailableAgentsAsync()
    {
        // Get all active agents with Agent role (exclude Admin, Supervisor, QaEvaluator)
        var allAgents = await _agentRepository.GetAllAsync();
        var activeAgents = allAgents
            .Where(a => a.Status == AgentStatus.Active && a.Role == AgentRole.Agent)
            .ToList();

        if (!activeAgents.Any())
        {
            _logger.LogInformation("No active agents found");
            return new List<Agent>();
        }

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

            // Agent is available if:
            // 1. They have no state record (null) - new agents default to available
            // 2. Their latest state is "Available"
            if (latestState == null || latestState.State == AgentStateType.Available)
            {
                availableAgents.Add(agent);
                if (latestState == null)
                {
                    _logger.LogInformation(
                        "Agent {AgentId} ({AgentName}) has no state record - treating as available",
                        agent.Id,
                        agent.Name);
                }
            }
        }

        _logger.LogInformation(
            "Found {AvailableCount} available agents out of {ActiveCount} active agents",
            availableAgents.Count,
            activeAgents.Count);

        return availableAgents;
    }
}
