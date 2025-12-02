namespace CallCenter.Domain.Entities;

public class TicketNote
{
    public Guid Id { get; set; }
    public Guid TicketId { get; set; }
    public Guid AgentId { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsInternal { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Ticket Ticket { get; set; } = null!;
    public virtual Agent Agent { get; set; } = null!;
}
