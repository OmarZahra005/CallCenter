using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class Conversation
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid? AgentId { get; set; }
    public Guid? QueueId { get; set; }
    public Channel Channel { get; set; }
    public ConversationState State { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int? WaitTimeSeconds { get; set; }
    public int? DurationSeconds { get; set; }
    public string? LastMessage { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Customer Customer { get; set; } = null!;
    public virtual Agent? Agent { get; set; }
    public virtual Queue? Queue { get; set; }
    public virtual ICollection<ConversationMessage> Messages { get; set; } = new List<ConversationMessage>();
    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public virtual ICollection<ConversationDisposition> Dispositions { get; set; } = new List<ConversationDisposition>();
}
