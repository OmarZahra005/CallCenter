using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ISlaRuleRepository : IRepository<SlaRule>
{
    Task<SlaRule?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SlaRule>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<SlaRule?> GetByCategoryAndPriorityAsync(string category, TicketPriority priority, CancellationToken cancellationToken = default);
}
