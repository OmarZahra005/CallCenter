namespace CallCenter.Domain.Entities;

public class ConversationDisposition
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid DispositionId { get; set; }
    public Guid AgentId { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Conversation Conversation { get; set; } = null!;
    public virtual CallDisposition Disposition { get; set; } = null!;
    public virtual Agent Agent { get; set; } = null!;
}
