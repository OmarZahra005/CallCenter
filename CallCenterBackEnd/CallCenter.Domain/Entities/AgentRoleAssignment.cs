namespace CallCenter.Domain.Entities;

public class AgentRoleAssignment
{
    public Guid AgentId { get; set; }
    public Guid RoleId { get; set; }
    public DateTime AssignedAt { get; set; }
    public Guid? AssignedById { get; set; }

    // Navigation properties
    public virtual Agent Agent { get; set; } = null!;
    public virtual Role Role { get; set; } = null!;
    public virtual Agent? AssignedBy { get; set; }
}
