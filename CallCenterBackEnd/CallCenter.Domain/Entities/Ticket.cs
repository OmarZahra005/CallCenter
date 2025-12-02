using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class Ticket
{
    public Guid Id { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public Guid? ConversationId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid? AgentId { get; set; }
    public Guid? TeamId { get; set; }
    public TicketStatus Status { get; set; }
    public TicketPriority Priority { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Subcategory { get; set; }
    public TicketSource Source { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Resolution { get; set; }
    public DateTime? FirstResponseAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public int? ResolutionTimeMinutes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }

    // Navigation properties
    public virtual Conversation? Conversation { get; set; }
    public virtual Customer Customer { get; set; } = null!;
    public virtual Agent? Agent { get; set; }
    public virtual Team? Team { get; set; }
    public virtual ICollection<TicketNote> Notes { get; set; } = new List<TicketNote>();
    public virtual ICollection<TicketAttachment> Attachments { get; set; } = new List<TicketAttachment>();
    public virtual ICollection<TicketStatusHistory> StatusHistory { get; set; } = new List<TicketStatusHistory>();
    public virtual TicketSlaTracking? SlaTracking { get; set; }
}
