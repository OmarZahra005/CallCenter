using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class AlertRule
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AlertType AlertType { get; set; }
    public string Condition { get; set; } = string.Empty;
    public string? Threshold { get; set; }
    public string Recipients { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<AlertLog> AlertLogs { get; set; } = new List<AlertLog>();
}
