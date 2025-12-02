using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.KnowledgeBase;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;

namespace CallCenter.Application.Services;

public interface IKnowledgeBaseService
{
    Task<PagedResponse<ArticleDto>> GetArticlesAsync(PagedRequest request, string? category = null);
    Task<ArticleDto?> GetArticleByIdAsync(Guid id);
    Task<ArticleDto> CreateArticleAsync(CreateArticleRequest request);
    Task<ArticleDto?> UpdateArticleAsync(Guid id, UpdateArticleRequest request);
    Task<bool> DeleteArticleAsync(Guid id);
    Task<List<ArticleDto>> GetPublishedArticlesAsync(string? category = null);
    Task<ArticleDto?> PublishArticleAsync(Guid id);
    Task<bool> IncrementViewCountAsync(Guid id);
    Task<bool> MarkHelpfulAsync(Guid id, bool helpful);
    Task<List<ArticleDto>> SearchArticlesAsync(string searchTerm);
}

public class KnowledgeBaseService : IKnowledgeBaseService
{
    private readonly IRepository<KnowledgeBaseArticle> _repository;

    public KnowledgeBaseService(IRepository<KnowledgeBaseArticle> repository)
    {
        _repository = repository;
    }

    public async Task<PagedResponse<ArticleDto>> GetArticlesAsync(PagedRequest request, string? category = null)
    {
        var articles = await _repository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            null,
            request.SortBy,
            request.SortDescending);

        var items = articles.Items.AsEnumerable();
        if (!string.IsNullOrEmpty(category))
            items = items.Where(a => a.Category == category);

        return new PagedResponse<ArticleDto>
        {
            Items = items.Select(MapToDto).ToList(),
            PageNumber = articles.CurrentPage,
            PageSize = articles.PageSize,
            TotalCount = articles.TotalCount,
            TotalPages = articles.PageCount
        };
    }

    public async Task<ArticleDto?> GetArticleByIdAsync(Guid id)
    {
        var all = await _repository.GetAllAsync();
        var article = all.FirstOrDefault(a => a.Id == id);
        return article != null ? MapToDto(article) : null;
    }

    public async Task<ArticleDto> CreateArticleAsync(CreateArticleRequest request)
    {
        var article = new KnowledgeBaseArticle
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Content = request.Content,
            Category = request.Category,
            Subcategory = request.Subcategory,
            Tags = request.Tags,
            Language = request.Language,
            AuthorId = request.AuthorId,
            Status = ArticleStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(article);
        await _repository.SaveChangesAsync();
        return MapToDto(article);
    }

    public async Task<ArticleDto?> UpdateArticleAsync(Guid id, UpdateArticleRequest request)
    {
        var all = await _repository.GetAllAsync();
        var article = all.FirstOrDefault(a => a.Id == id);
        if (article == null) return null;

        article.Title = request.Title;
        article.Content = request.Content;
        article.Category = request.Category;
        article.Subcategory = request.Subcategory;
        article.Tags = request.Tags;
        article.Language = request.Language;
        article.Status = request.Status;
        article.UpdatedAt = DateTime.UtcNow;

        _repository.Update(article);
        await _repository.SaveChangesAsync();
        return MapToDto(article);
    }

    public async Task<bool> DeleteArticleAsync(Guid id)
    {
        var all = await _repository.GetAllAsync();
        var article = all.FirstOrDefault(a => a.Id == id);
        if (article == null) return false;

        _repository.DeleteAsync(article);
        await _repository.SaveChangesAsync();
        return true;
    }

    public async Task<List<ArticleDto>> GetPublishedArticlesAsync(string? category = null)
    {
        var all = await _repository.GetAllAsync();
        var query = all.Where(a => a.Status == ArticleStatus.Published);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(a => a.Category == category);

        return query.OrderByDescending(a => a.PublishedAt).Select(MapToDto).ToList();
    }

    public async Task<ArticleDto?> PublishArticleAsync(Guid id)
    {
        var all = await _repository.GetAllAsync();
        var article = all.FirstOrDefault(a => a.Id == id);
        if (article == null) return null;

        article.Status = ArticleStatus.Published;
        article.PublishedAt = DateTime.UtcNow;
        article.UpdatedAt = DateTime.UtcNow;

        _repository.Update(article);
        await _repository.SaveChangesAsync();
        return MapToDto(article);
    }

    public async Task<bool> IncrementViewCountAsync(Guid id)
    {
        var all = await _repository.GetAllAsync();
        var article = all.FirstOrDefault(a => a.Id == id);
        if (article == null) return false;

        article.ViewsCount++;
        _repository.Update(article);
        await _repository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkHelpfulAsync(Guid id, bool helpful)
    {
        var all = await _repository.GetAllAsync();
        var article = all.FirstOrDefault(a => a.Id == id);
        if (article == null) return false;

        if (helpful)
            article.HelpfulCount++;
        else
            article.NotHelpfulCount++;

        _repository.Update(article);
        await _repository.SaveChangesAsync();
        return true;
    }

    public async Task<List<ArticleDto>> SearchArticlesAsync(string searchTerm)
    {
        var all = await _repository.GetAllAsync();
        var term = searchTerm.ToLower();
        return all
            .Where(a => a.Status == ArticleStatus.Published &&
                       (a.Title.ToLower().Contains(term) ||
                        a.Content.ToLower().Contains(term) ||
                        (a.Tags != null && a.Tags.ToLower().Contains(term))))
            .OrderByDescending(a => a.ViewsCount)
            .Select(MapToDto)
            .ToList();
    }

    private static ArticleDto MapToDto(KnowledgeBaseArticle article) => new()
    {
        Id = article.Id,
        Title = article.Title,
        Content = article.Content,
        Category = article.Category,
        Subcategory = article.Subcategory,
        Tags = article.Tags,
        Language = article.Language,
        Status = article.Status,
        ViewsCount = article.ViewsCount,
        HelpfulCount = article.HelpfulCount,
        NotHelpfulCount = article.NotHelpfulCount,
        AuthorId = article.AuthorId,
        AuthorName = article.Author?.Name ?? string.Empty,
        CreatedAt = article.CreatedAt,
        PublishedAt = article.PublishedAt
    };
}
