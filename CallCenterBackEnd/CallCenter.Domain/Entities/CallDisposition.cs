using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class CallDisposition
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DispositionCategory Category { get; set; }
    public bool RequiresFollowup { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<ConversationDisposition> ConversationDispositions { get; set; } = new List<ConversationDisposition>();
}
