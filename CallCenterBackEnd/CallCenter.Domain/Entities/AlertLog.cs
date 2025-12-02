using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class AlertLog
{
    public Guid Id { get; set; }
    public Guid AlertRuleId { get; set; }
    public AlertType AlertType { get; set; }
    public string Message { get; set; } = string.Empty;
    public AlertSeverity Severity { get; set; }
    public string? Metadata { get; set; }
    public Guid? AcknowledgedBy { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual AlertRule AlertRule { get; set; } = null!;
    public virtual Agent? AcknowledgedByAgent { get; set; }
}
