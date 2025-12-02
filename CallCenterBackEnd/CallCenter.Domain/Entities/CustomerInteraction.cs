using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class CustomerInteraction
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Channel Channel { get; set; }
    public DateTime LastContactAt { get; set; }
    public int TotalCalls { get; set; }
    public int TotalTickets { get; set; }
    public int TotalMessages { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Customer Customer { get; set; } = null!;
}
