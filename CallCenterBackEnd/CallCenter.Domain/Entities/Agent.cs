using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class Agent
{
    public Guid Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string? Phone { get; set; }
    public Guid? TeamId { get; set; }
    public AgentRole Role { get; set; }
    public int SkillLevel { get; set; } = 1;
    public string? Languages { get; set; }
    public DateOnly? HireDate { get; set; }
    public AgentStatus Status { get; set; } = AgentStatus.Active;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Team? Team { get; set; }
    public virtual ICollection<AgentSkill> Skills { get; set; } = new List<AgentSkill>();
    public virtual ICollection<AgentState> States { get; set; } = new List<AgentState>();
    public virtual ICollection<AgentShift> Shifts { get; set; } = new List<AgentShift>();
    public virtual ICollection<AgentKpi> Kpis { get; set; } = new List<AgentKpi>();
}
