namespace CallCenter.Domain.Entities;

public class CustomerNote
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid AgentId { get; set; }
    public string Note { get; set; } = string.Empty;
    public bool IsImportant { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Customer Customer { get; set; } = null!;
    public virtual Agent Agent { get; set; } = null!;
}
