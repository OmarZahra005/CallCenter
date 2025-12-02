namespace CallCenter.Domain.Entities;

public class ArticleSearchLog
{
    public Guid Id { get; set; }
    public Guid AgentId { get; set; }
    public string SearchQuery { get; set; } = string.Empty;
    public Guid? ArticleId { get; set; }
    public bool? WasHelpful { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Agent Agent { get; set; } = null!;
    public virtual KnowledgeBaseArticle? Article { get; set; }
}
