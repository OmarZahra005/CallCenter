namespace CallCenter.Domain.Entities;

public class QaFormCriteria
{
    public Guid Id { get; set; }
    public Guid FormId { get; set; }
    public string CriteriaName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MaxPoints { get; set; }
    public float Weight { get; set; } = 1.0f;
    public bool IsCritical { get; set; }
    public int DisplayOrder { get; set; }

    // Navigation properties
    public virtual QaEvaluationForm Form { get; set; } = null!;
    public virtual ICollection<QaScorecardDetail> ScorecardDetails { get; set; } = new List<QaScorecardDetail>();
}
