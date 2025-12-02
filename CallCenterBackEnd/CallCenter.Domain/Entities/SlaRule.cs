using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class SlaRule
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; }
    public int FirstResponseTimeMinutes { get; set; }
    public int ResolveTimeMinutes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<TicketSlaTracking> Trackings { get; set; } = new List<TicketSlaTracking>();
}
