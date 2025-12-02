using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Teams;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces.Repositories;

namespace CallCenter.Application.Services;

public interface ITeamService
{
    Task<PagedResponse<TeamDto>> GetTeamsAsync(PagedRequest request);
    Task<TeamDetailDto?> GetTeamByIdAsync(Guid id);
    Task<TeamDto> CreateTeamAsync(CreateTeamRequest request);
    Task<TeamDto?> UpdateTeamAsync(Guid id, UpdateTeamRequest request);
    Task<bool> DeleteTeamAsync(Guid id);
    Task<List<TeamDto>> GetActiveTeamsAsync();
}

public class TeamService : ITeamService
{
    private readonly ITeamRepository _teamRepository;

    public TeamService(ITeamRepository teamRepository)
    {
        _teamRepository = teamRepository;
    }

    public async Task<PagedResponse<TeamDto>> GetTeamsAsync(PagedRequest request)
    {
        var teams = await _teamRepository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            null,
            request.SortBy,
            request.SortDescending);

        return new PagedResponse<TeamDto>
        {
            Items = teams.Items.Select(MapToDto).ToList(),
            PageNumber = teams.CurrentPage,
            PageSize = teams.PageSize,
            TotalCount = teams.TotalCount,
            TotalPages = teams.PageCount
        };
    }

    public async Task<TeamDetailDto?> GetTeamByIdAsync(Guid id)
    {
        var team = await _teamRepository.GetByIdAsync(id);
        if (team == null) return null;

        return new TeamDetailDto
        {
            Id = team.Id,
            Name = team.Name,
            Description = team.Description,
            SupervisorId = team.SupervisorId,
            SupervisorName = team.Supervisor?.Name,
            AgentCount = team.Agents?.Count ?? 0,
            IsActive = team.IsActive,
            CreatedAt = team.CreatedAt,
            Agents = team.Agents?.Select(a => new TeamAgentDto
            {
                Id = a.Id,
                Name = a.Name,
                Email = a.Email,
                Role = a.Role.ToString(),
                Status = a.Status.ToString()
            }).ToList() ?? new List<TeamAgentDto>()
        };
    }

    public async Task<TeamDto> CreateTeamAsync(CreateTeamRequest request)
    {
        var team = new Team
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            SupervisorId = request.SupervisorId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _teamRepository.AddAsync(team);
        await _teamRepository.SaveChangesAsync();
        return MapToDto(team);
    }

    public async Task<TeamDto?> UpdateTeamAsync(Guid id, UpdateTeamRequest request)
    {
        var team = await _teamRepository.GetByIdAsync(id);
        if (team == null) return null;

        team.Name = request.Name;
        team.Description = request.Description;
        team.SupervisorId = request.SupervisorId;
        team.IsActive = request.IsActive;
        team.UpdatedAt = DateTime.UtcNow;

        _teamRepository.Update(team);
        await _teamRepository.SaveChangesAsync();
        return MapToDto(team);
    }

    public async Task<bool> DeleteTeamAsync(Guid id)
    {
        var team = await _teamRepository.GetByIdAsync(id);
        if (team == null) return false;

        team.IsActive = false;
        team.UpdatedAt = DateTime.UtcNow;
        _teamRepository.Update(team);
        await _teamRepository.SaveChangesAsync();
        return true;
    }

    public async Task<List<TeamDto>> GetActiveTeamsAsync()
    {
        var teams = await _teamRepository.GetActiveTeamsAsync();
        return teams.Select(MapToDto).ToList();
    }

    private static TeamDto MapToDto(Team team)
    {
        return new TeamDto
        {
            Id = team.Id,
            Name = team.Name,
            Description = team.Description,
            SupervisorId = team.SupervisorId,
            SupervisorName = team.Supervisor?.Name,
            AgentCount = team.Agents?.Count ?? 0,
            IsActive = team.IsActive,
            CreatedAt = team.CreatedAt
        };
    }
}
