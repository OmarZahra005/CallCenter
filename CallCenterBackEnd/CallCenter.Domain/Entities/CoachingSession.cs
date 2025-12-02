using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class CoachingSession
{
    public Guid Id { get; set; }
    public Guid AgentId { get; set; }
    public Guid CoachId { get; set; }
    public Guid? ScorecardId { get; set; }
    public CoachingSessionType SessionType { get; set; }
    public DateTime SessionDate { get; set; }
    public int DurationMinutes { get; set; } = 30;
    public CoachingSessionStatus Status { get; set; } = CoachingSessionStatus.Scheduled;
    public string? TopicsCovered { get; set; }
    public string? ActionItems { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Agent Agent { get; set; } = null!;
    public virtual Agent Coach { get; set; } = null!;
    public virtual QaScorecard? Scorecard { get; set; }
}
