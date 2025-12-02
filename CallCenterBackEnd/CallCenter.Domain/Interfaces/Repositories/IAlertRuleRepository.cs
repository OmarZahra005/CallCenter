using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IAlertRuleRepository : IRepository<AlertRule>
{
    Task<AlertRule?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AlertRule>> GetActiveAsync(CancellationToken cancellationToken = default);
}
