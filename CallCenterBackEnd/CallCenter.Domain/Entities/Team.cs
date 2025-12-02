namespace CallCenter.Domain.Entities;

public class Team
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? SupervisorId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual Agent? Supervisor { get; set; }
    public virtual ICollection<Agent> Agents { get; set; } = new List<Agent>();
    public virtual ICollection<Queue> Queues { get; set; } = new List<Queue>();
}
