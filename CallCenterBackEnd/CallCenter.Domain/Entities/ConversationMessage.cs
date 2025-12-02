using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class ConversationMessage
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public SenderType SenderType { get; set; }
    public Guid? SenderId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? MediaUrl { get; set; }
    public string? AttachmentUrl { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Conversation Conversation { get; set; } = null!;
    public virtual Agent? Sender { get; set; }
}
