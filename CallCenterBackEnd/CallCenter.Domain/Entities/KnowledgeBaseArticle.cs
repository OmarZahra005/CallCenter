using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class KnowledgeBaseArticle
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Subcategory { get; set; }
    public string? Tags { get; set; }
    public PreferredLanguage Language { get; set; } = PreferredLanguage.Ar;
    public ArticleStatus Status { get; set; } = ArticleStatus.Draft;
    public int ViewsCount { get; set; }
    public int HelpfulCount { get; set; }
    public int NotHelpfulCount { get; set; }
    public Guid AuthorId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }

    // Navigation properties
    public virtual Agent Author { get; set; } = null!;
    public virtual ICollection<ArticleSearchLog> SearchLogs { get; set; } = new List<ArticleSearchLog>();
}
