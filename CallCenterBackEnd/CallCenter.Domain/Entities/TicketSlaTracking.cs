using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class TicketSlaTracking
{
    public Guid Id { get; set; }
    public Guid TicketId { get; set; }
    public Guid SlaRuleId { get; set; }
    public SlaTrackingStatus Status { get; set; }
    public DateTime FirstResponseDeadline { get; set; }
    public DateTime ResolutionDeadline { get; set; }
    public DateTime? FirstResponseAt { get; set; }
    public bool ResponseBreached { get; set; }
    public bool ResolutionBreached { get; set; }
    public DateTime? PausedAt { get; set; }
    public string? PauseReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Ticket Ticket { get; set; } = null!;
    public virtual SlaRule SlaRule { get; set; } = null!;
}
