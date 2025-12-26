using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class AlertRule
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AlertType AlertType { get; set; }
    public string Category { get; set; } = "queue"; // queue, agent, system, quality, sla
    public string Metric { get; set; } = string.Empty;
    public string Operator { get; set; } = "gt"; // gt, lt, eq, gte, lte
    public decimal Threshold { get; set; }
    public string? Unit { get; set; }
    public AlertSeverity Severity { get; set; } = AlertSeverity.Warning;
    public string Channels { get; set; } = "[]"; // JSON array: email, sms, webhook, slack, inApp
    public string Recipients { get; set; } = "[]"; // JSON array of email addresses
    public string? WebhookUrl { get; set; }
    public int CooldownMinutes { get; set; } = 15;
    public DateTime? LastTriggeredAt { get; set; }
    public int TriggerCount { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Legacy - kept for backwards compatibility
    public string Condition { get; set; } = string.Empty;

    // Navigation properties
    public virtual ICollection<AlertLog> AlertLogs { get; set; } = new List<AlertLog>();
}
