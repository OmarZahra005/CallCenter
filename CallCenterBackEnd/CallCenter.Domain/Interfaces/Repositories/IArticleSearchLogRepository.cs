using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IArticleSearchLogRepository : IRepository<ArticleSearchLog>
{
    Task<ArticleSearchLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ArticleSearchLog>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
}
