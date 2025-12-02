using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class CustomerSatisfactionSurvey
{
    public Guid Id { get; set; }
    public Guid? TicketId { get; set; }
    public Guid? ConversationId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid? AgentId { get; set; }
    public SurveyType SurveyType { get; set; }
    public int Score { get; set; }
    public string? Feedback { get; set; }
    public DateTime SentAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public Channel? Channel { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Ticket? Ticket { get; set; }
    public virtual Conversation? Conversation { get; set; }
    public virtual Customer Customer { get; set; } = null!;
    public virtual Agent? Agent { get; set; }
}
