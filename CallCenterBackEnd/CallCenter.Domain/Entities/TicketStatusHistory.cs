using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class TicketStatusHistory
{
    public Guid Id { get; set; }
    public Guid TicketId { get; set; }
    public TicketStatus? FromStatus { get; set; }
    public TicketStatus ToStatus { get; set; }
    public Guid ChangedBy { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Ticket Ticket { get; set; } = null!;
    public virtual Agent ChangedByAgent { get; set; } = null!;
}
