namespace CallCenter.Application.DTOs.Teams;

public class TeamDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? SupervisorId { get; set; }
    public string? SupervisorName { get; set; }
    public int AgentCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class TeamDetailDto : TeamDto
{
    public List<TeamAgentDto> Agents { get; set; } = new();
}

public class TeamAgentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class CreateTeamRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? SupervisorId { get; set; }
}

public class UpdateTeamRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? SupervisorId { get; set; }
    public bool IsActive { get; set; }
}
