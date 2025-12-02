using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class QaScorecard
{
    public Guid Id { get; set; }
    public Guid FormId { get; set; }
    public Guid? TicketId { get; set; }
    public Guid? ConversationId { get; set; }
    public Guid? CallRecordingId { get; set; }
    public Guid AgentId { get; set; }
    public Guid EvaluatorId { get; set; }
    public int TotalScore { get; set; }
    public int MaxScore { get; set; }
    public float Percentage { get; set; }
    public QaScorecardStatus Status { get; set; } = QaScorecardStatus.Draft;
    public bool Passed { get; set; }
    public string? Comments { get; set; }
    public string? Strengths { get; set; }
    public string? AreasForImprovement { get; set; }
    public DateOnly EvaluationDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual QaEvaluationForm Form { get; set; } = null!;
    public virtual Ticket? Ticket { get; set; }
    public virtual Conversation? Conversation { get; set; }
    public virtual CallRecording? CallRecording { get; set; }
    public virtual Agent Agent { get; set; } = null!;
    public virtual Agent Evaluator { get; set; } = null!;
    public virtual ICollection<QaScorecardDetail> Details { get; set; } = new List<QaScorecardDetail>();
    public virtual ICollection<CoachingSession> CoachingSessions { get; set; } = new List<CoachingSession>();
}
