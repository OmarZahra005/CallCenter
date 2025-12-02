using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class AiSuggestion
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid AgentId { get; set; }
    public AiSuggestionType SuggestionType { get; set; }
    public string Content { get; set; } = string.Empty;
    public float ConfidenceScore { get; set; }
    public bool WasUsed { get; set; }
    public AiSuggestionFeedback? Feedback { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Conversation Conversation { get; set; } = null!;
    public virtual Agent Agent { get; set; } = null!;
}
