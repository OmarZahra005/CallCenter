using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IKnowledgeBaseArticleRepository : IRepository<KnowledgeBaseArticle>
{
    Task<KnowledgeBaseArticle?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KnowledgeBaseArticle>> GetByStatusAsync(ArticleStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KnowledgeBaseArticle>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KnowledgeBaseArticle>> GetPublishedAsync(CancellationToken cancellationToken = default);
}
