using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class CtiEvent
{
    public Guid Id { get; set; }
    public string CallId { get; set; } = string.Empty;
    public Guid? AgentId { get; set; }
    public CtiEventType EventType { get; set; }
    public CallDirection Direction { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Metadata { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Agent? Agent { get; set; }
}
