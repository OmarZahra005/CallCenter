using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IQueueRepository : IRepository<Queue>
{
    Task<Queue?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Queue>> GetActiveQueuesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Queue>> GetByTeamIdAsync(Guid teamId, CancellationToken cancellationToken = default);
}
