namespace CallCenter.Domain.Entities;

public class QaScorecardDetail
{
    public Guid Id { get; set; }
    public Guid ScorecardId { get; set; }
    public Guid CriteriaId { get; set; }
    public int PointsEarned { get; set; }
    public int MaxPoints { get; set; }
    public string? Comments { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual QaScorecard Scorecard { get; set; } = null!;
    public virtual QaFormCriteria Criteria { get; set; } = null!;
}
