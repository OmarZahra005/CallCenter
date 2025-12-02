using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IQaScorecardDetailRepository : IRepository<QaScorecardDetail>
{
    Task<QaScorecardDetail?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QaScorecardDetail>> GetByScorecardIdAsync(Guid scorecardId, CancellationToken cancellationToken = default);
}
