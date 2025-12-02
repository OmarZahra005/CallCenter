namespace CallCenter.Domain.Entities;

public class QaEvaluationForm
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MaxScore { get; set; } = 100;
    public int PassingScore { get; set; } = 80;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<QaFormCriteria> Criteria { get; set; } = new List<QaFormCriteria>();
    public virtual ICollection<QaScorecard> Scorecards { get; set; } = new List<QaScorecard>();
}
