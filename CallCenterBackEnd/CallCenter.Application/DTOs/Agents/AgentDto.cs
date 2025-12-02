using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.Agents;

public class AgentDto
{
    public Guid Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public Guid? TeamId { get; set; }
    public string? TeamName { get; set; }
    public AgentRole Role { get; set; }
    public int SkillLevel { get; set; }
    public AgentStatus Status { get; set; }
    public DateOnly? HireDate { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AgentDetailDto : AgentDto
{
    public string? Languages { get; set; }
    public List<AgentSkillDto> Skills { get; set; } = new();
}

public class AgentSkillDto
{
    public Guid Id { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public int ProficiencyLevel { get; set; }
}

public class CreateAgentRequest
{
    public Guid? TeamId { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public AgentRole Role { get; set; }
    public int SkillLevel { get; set; } = 1;
    public string? Languages { get; set; }
    public DateOnly? HireDate { get; set; }
}

public class UpdateAgentRequest
{
    public Guid? TeamId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public AgentRole Role { get; set; }
    public int SkillLevel { get; set; }
    public string? Languages { get; set; }
    public AgentStatus Status { get; set; }
}
