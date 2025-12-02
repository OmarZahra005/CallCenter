using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IAlertLogRepository : IRepository<AlertLog>
{
    Task<AlertLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AlertLog>> GetByAlertRuleIdAsync(Guid alertRuleId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AlertLog>> GetUnacknowledgedAsync(CancellationToken cancellationToken = default);
}
