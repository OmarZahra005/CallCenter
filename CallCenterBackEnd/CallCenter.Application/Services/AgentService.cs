using CallCenter.Application.DTOs.Agents;
using CallCenter.Application.DTOs.Common;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;
using CallCenter.Domain.Interfaces.Repositories;

namespace CallCenter.Application.Services;

public interface IAgentService
{
    Task<PagedResponse<AgentDto>> GetAgentsAsync(PagedRequest request, Guid? teamId = null, AgentStatus? status = null);
    Task<AgentDetailDto?> GetAgentByIdAsync(Guid id);
    Task<AgentDto?> GetAgentByEmailAsync(string email);
    Task<AgentDto> CreateAgentAsync(CreateAgentRequest request);
    Task<AgentDto?> UpdateAgentAsync(Guid id, UpdateAgentRequest request);
    Task<bool> DeleteAgentAsync(Guid id);
    Task<List<AgentDto>> GetAgentsByTeamAsync(Guid teamId);
    Task<List<AgentDto>> GetAgentsByStatusAsync(AgentStatus status);
}

public class AgentService : IAgentService
{
    private readonly IAgentRepository _agentRepository;
    private readonly IRepository<AgentState> _agentStateRepository;

    public AgentService(IAgentRepository agentRepository, IRepository<AgentState> agentStateRepository)
    {
        _agentRepository = agentRepository;
        _agentStateRepository = agentStateRepository;
    }

    public async Task<PagedResponse<AgentDto>> GetAgentsAsync(PagedRequest request, Guid? teamId = null, AgentStatus? status = null)
    {
        var agents = await _agentRepository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            null,
            request.SortBy,
            request.SortDescending);

        var items = agents.Items.AsEnumerable();

        if (teamId.HasValue)
            items = items.Where(a => a.TeamId == teamId.Value);

        if (status.HasValue)
            items = items.Where(a => a.Status == status.Value);

        var agentList = items.ToList();

        // Get latest agent states for all agents
        var allAgentStates = (await _agentStateRepository.GetAllAsync()).ToList();
        var latestStatesByAgent = allAgentStates
            .GroupBy(s => s.AgentId)
            .ToDictionary(
                g => g.Key,
                g => g.OrderByDescending(s => s.ChangedAt).First()
            );

        return new PagedResponse<AgentDto>
        {
            Items = agentList.Select(a => MapToDtoWithState(a, latestStatesByAgent)).ToList(),
            PageNumber = agents.CurrentPage,
            PageSize = agents.PageSize,
            TotalCount = agents.TotalCount,
            TotalPages = agents.PageCount
        };
    }

    public async Task<AgentDetailDto?> GetAgentByIdAsync(Guid id)
    {
        var agent = await _agentRepository.GetByIdAsync(id);
        if (agent == null) return null;

        return new AgentDetailDto
        {
            Id = agent.Id,
            EmployeeId = agent.EmployeeId,
            Name = agent.Name,
            Email = agent.Email,
            Phone = agent.Phone,
            TeamId = agent.TeamId,
            TeamName = agent.Team?.Name,
            Role = agent.Role,
            SkillLevel = agent.SkillLevel,
            Languages = agent.Languages,
            Status = agent.Status,
            HireDate = agent.HireDate,
            CreatedAt = agent.CreatedAt,
            Skills = agent.Skills?.Select(s => new AgentSkillDto
            {
                Id = s.Id,
                SkillName = s.SkillName,
                ProficiencyLevel = s.ProficiencyLevel
            }).ToList() ?? new List<AgentSkillDto>()
        };
    }

    public async Task<AgentDto?> GetAgentByEmailAsync(string email)
    {
        var agent = await _agentRepository.GetByEmailAsync(email);
        if (agent == null) return null;

        return new AgentDto
        {
            Id = agent.Id,
            EmployeeId = agent.EmployeeId,
            Name = agent.Name,
            Email = agent.Email,
            Phone = agent.Phone,
            TeamId = agent.TeamId,
            TeamName = agent.Team?.Name,
            Role = agent.Role,
            SkillLevel = agent.SkillLevel,
            Status = agent.Status
        };
    }

    public async Task<AgentDto> CreateAgentAsync(CreateAgentRequest request)
    {
        var agent = new Agent
        {
            Id = Guid.NewGuid(),
            TeamId = request.TeamId,
            EmployeeId = request.EmployeeId,
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Role = request.Role,
            SkillLevel = request.SkillLevel,
            Languages = request.Languages,
            Status = AgentStatus.Active,
            HireDate = request.HireDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _agentRepository.AddAsync(agent);
        await _agentRepository.SaveChangesAsync();
        return MapToDto(agent);
    }

    public async Task<AgentDto?> UpdateAgentAsync(Guid id, UpdateAgentRequest request)
    {
        var agent = await _agentRepository.GetByIdAsync(id);
        if (agent == null) return null;

        agent.TeamId = request.TeamId;
        agent.Name = request.Name;
        agent.Email = request.Email;
        agent.Phone = request.Phone;
        agent.Role = request.Role;
        agent.SkillLevel = request.SkillLevel;
        agent.Languages = request.Languages;
        agent.Status = request.Status;
        agent.UpdatedAt = DateTime.UtcNow;

        _agentRepository.Update(agent);
        await _agentRepository.SaveChangesAsync();
        return MapToDto(agent);
    }

    public async Task<bool> DeleteAgentAsync(Guid id)
    {
        var agent = await _agentRepository.GetByIdAsync(id);
        if (agent == null) return false;

        agent.Status = AgentStatus.Inactive;
        agent.UpdatedAt = DateTime.UtcNow;
        _agentRepository.Update(agent);
        await _agentRepository.SaveChangesAsync();
        return true;
    }

    public async Task<List<AgentDto>> GetAgentsByTeamAsync(Guid teamId)
    {
        var agents = await _agentRepository.GetByTeamIdAsync(teamId);
        return agents.Select(MapToDto).ToList();
    }

    public async Task<List<AgentDto>> GetAgentsByStatusAsync(AgentStatus status)
    {
        var agents = await _agentRepository.GetByStatusAsync(status);
        return agents.Select(MapToDto).ToList();
    }

    private static AgentDto MapToDto(Agent agent)
    {
        return new AgentDto
        {
            Id = agent.Id,
            EmployeeId = agent.EmployeeId,
            Name = agent.Name,
            Email = agent.Email,
            Phone = agent.Phone,
            TeamId = agent.TeamId,
            TeamName = agent.Team?.Name,
            Role = agent.Role,
            SkillLevel = agent.SkillLevel,
            Status = agent.Status,
            HireDate = agent.HireDate,
            CreatedAt = agent.CreatedAt
        };
    }

    private static AgentDto MapToDtoWithState(Agent agent, Dictionary<Guid, AgentState> latestStatesByAgent)
    {
        var dto = MapToDto(agent);

        // Add current state information if available
        if (latestStatesByAgent.TryGetValue(agent.Id, out var state))
        {
            dto.CurrentState = state.State.ToString();
            dto.StateChangedAt = state.ChangedAt;
        }

        return dto;
    }
}
