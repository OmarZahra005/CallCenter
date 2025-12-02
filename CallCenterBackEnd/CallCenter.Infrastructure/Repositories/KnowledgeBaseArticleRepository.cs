using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class KnowledgeBaseArticleRepository : Repository<KnowledgeBaseArticle>, IKnowledgeBaseArticleRepository
{
    public KnowledgeBaseArticleRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<KnowledgeBaseArticle?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(a => a.Author)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<KnowledgeBaseArticle>> GetByStatusAsync(ArticleStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.Status == status)
            .OrderBy(a => a.Title)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<KnowledgeBaseArticle>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.Category == category)
            .OrderBy(a => a.Title)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<KnowledgeBaseArticle>> GetPublishedAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.Status == ArticleStatus.Published)
            .OrderByDescending(a => a.PublishedAt)
            .ToListAsync(cancellationToken);
    }
}
