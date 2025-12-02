using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IQueueMetricRepository : IRepository<QueueMetric>
{
    Task<QueueMetric?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QueueMetric>> GetByQueueIdAsync(Guid queueId, CancellationToken cancellationToken = default);
}
