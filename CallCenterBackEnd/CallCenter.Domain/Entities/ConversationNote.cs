namespace CallCenter.Domain.Entities;

public class ConversationNote
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid AgentId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Conversation Conversation { get; set; } = null!;
    public virtual Agent Agent { get; set; } = null!;
}
