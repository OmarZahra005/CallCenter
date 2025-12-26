namespace CallCenter.Domain.Entities;

public class NotificationPreference
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string CategoryId { get; set; } = string.Empty;
    public bool InApp { get; set; } = true;
    public bool Email { get; set; } = false;
    public bool Push { get; set; } = false;
    public bool Sound { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual Agent? User { get; set; }
}
