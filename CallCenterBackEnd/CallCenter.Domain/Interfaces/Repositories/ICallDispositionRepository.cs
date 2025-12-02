using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ICallDispositionRepository : IRepository<CallDisposition>
{
    Task<CallDisposition?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CallDisposition>> GetActiveAsync(CancellationToken cancellationToken = default);
}
