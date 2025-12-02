using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class CallTranscription
{
    public Guid Id { get; set; }
    public string CallId { get; set; } = string.Empty;
    public Guid? ConversationId { get; set; }
    public string Transcript { get; set; } = string.Empty;
    public PreferredLanguage Language { get; set; } = PreferredLanguage.Ar;
    public Sentiment Sentiment { get; set; }
    public float? EmotionScore { get; set; }
    public string? Summary { get; set; }
    public string? Keywords { get; set; }
    public float? ConfidenceScore { get; set; }
    public int? ProcessingDurationMs { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Conversation? Conversation { get; set; }
}
