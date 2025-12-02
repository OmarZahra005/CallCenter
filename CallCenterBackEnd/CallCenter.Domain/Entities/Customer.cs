using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class Customer
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? NationalId { get; set; }
    public CustomerStatus Status { get; set; } = CustomerStatus.Active;
    public PreferredLanguage PreferredLanguage { get; set; } = PreferredLanguage.Ar;
    public CustomerSegment? Segment { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<CustomerInteraction> Interactions { get; set; } = new List<CustomerInteraction>();
    public virtual ICollection<CustomerNote> CustomerNotes { get; set; } = new List<CustomerNote>();
    public virtual ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();
    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
