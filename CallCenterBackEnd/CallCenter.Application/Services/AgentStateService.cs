using CallCenter.Application.DTOs.Cti;
using CallCenter.Application.Interfaces;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces;

namespace CallCenter.Application.Services;

public interface IAgentStateService
{
    Task<AgentStateDto?> GetCurrentStateAsync(Guid agentId);
    Task<List<AgentStateDto>> GetStateHistoryAsync(Guid agentId);
    Task<AgentStateDto> UpdateStateAsync(Guid agentId, UpdateAgentStateRequest request);
}

public class AgentStateService : IAgentStateService
{
    private readonly IRepository<AgentState> _repository;
    private readonly IHubNotificationService _hubNotificationService;

    public AgentStateService(IRepository<AgentState> repository, IHubNotificationService hubNotificationService)
    {
        _repository = repository;
        _hubNotificationService = hubNotificationService;
    }

    public async Task<AgentStateDto?> GetCurrentStateAsync(Guid agentId)
    {
        var all = await _repository.GetAllAsync();
        var state = all
            .Where(s => s.AgentId == agentId)
            .OrderByDescending(s => s.ChangedAt)
            .FirstOrDefault();

        return state != null ? MapToDto(state) : null;
    }

    public async Task<List<AgentStateDto>> GetStateHistoryAsync(Guid agentId)
    {
        var all = await _repository.GetAllAsync();
        return all
            .Where(s => s.AgentId == agentId)
            .OrderByDescending(s => s.ChangedAt)
            .Select(MapToDto)
            .ToList();
    }

    public async Task<AgentStateDto> UpdateStateAsync(Guid agentId, UpdateAgentStateRequest request)
    {
        var state = new AgentState
        {
            Id = Guid.NewGuid(),
            AgentId = agentId,
            State = request.State,
            Reason = request.Reason,
            ChangedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(state);
        await _repository.SaveChangesAsync();

        // Notify all clients about the agent state change
        await _hubNotificationService.NotifyAgentStateChangedAsync(
            agentId.ToString(),
            request.State.ToString(),
            request.Reason);

        return MapToDto(state);
    }

    private static AgentStateDto MapToDto(AgentState state)
    {
        return new AgentStateDto
        {
            Id = state.Id,
            AgentId = state.AgentId,
            AgentName = state.Agent?.Name ?? string.Empty,
            State = state.State,
            Reason = state.Reason,
            ChangedAt = state.ChangedAt,
            DurationSeconds = state.DurationSeconds
        };
    }
}
