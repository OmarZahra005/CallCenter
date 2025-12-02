namespace CallCenter.Domain.Entities;

public class AgentSkill
{
    public Guid Id { get; set; }
    public Guid AgentId { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public int ProficiencyLevel { get; set; } = 3;
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Agent Agent { get; set; } = null!;
}
