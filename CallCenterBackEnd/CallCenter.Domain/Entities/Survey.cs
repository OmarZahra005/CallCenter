namespace CallCenter.Domain.Entities;

public class Survey
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Type { get; set; } = "CSAT"; // CSAT, NPS, Custom
    public string Trigger { get; set; } = "manual"; // afterCall, afterChat, afterTicket, manual
    public bool IsActive { get; set; } = true;
    public string? ThankYouMessage { get; set; }
    public int? ExpirationDays { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<SurveyQuestion> Questions { get; set; } = new List<SurveyQuestion>();
    public virtual ICollection<SurveyResponse> Responses { get; set; } = new List<SurveyResponse>();
}

public class SurveyQuestion
{
    public Guid Id { get; set; }
    public Guid SurveyId { get; set; }
    public string Type { get; set; } = "rating"; // rating, nps, text, multiChoice, yesNo
    public string Question { get; set; } = string.Empty;
    public bool Required { get; set; } = true;
    public string? Options { get; set; } // JSON array for multiChoice
    public int? MinValue { get; set; }
    public int? MaxValue { get; set; }
    public int Order { get; set; }

    // Navigation properties
    public virtual Survey Survey { get; set; } = null!;
}

public class SurveyResponse
{
    public Guid Id { get; set; }
    public Guid SurveyId { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? AgentId { get; set; }
    public string Answers { get; set; } = "[]"; // JSON array of answers
    public decimal? OverallScore { get; set; }
    public string? Channel { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Survey Survey { get; set; } = null!;
    public virtual Customer? Customer { get; set; }
    public virtual Agent? Agent { get; set; }
}
