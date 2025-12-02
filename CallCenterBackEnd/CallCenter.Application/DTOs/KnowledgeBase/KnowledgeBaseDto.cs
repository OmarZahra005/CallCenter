using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.KnowledgeBase;

public class ArticleDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Subcategory { get; set; }
    public string? Tags { get; set; }
    public PreferredLanguage Language { get; set; }
    public ArticleStatus Status { get; set; }
    public int ViewsCount { get; set; }
    public int HelpfulCount { get; set; }
    public int NotHelpfulCount { get; set; }
    public Guid AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
}

public class CreateArticleRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Subcategory { get; set; }
    public string? Tags { get; set; }
    public PreferredLanguage Language { get; set; } = PreferredLanguage.Ar;
    public Guid AuthorId { get; set; }
}

public class UpdateArticleRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Subcategory { get; set; }
    public string? Tags { get; set; }
    public PreferredLanguage Language { get; set; }
    public ArticleStatus Status { get; set; }
}
