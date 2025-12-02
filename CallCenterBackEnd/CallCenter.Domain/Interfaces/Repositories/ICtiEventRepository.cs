using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ICtiEventRepository : IRepository<CtiEvent>
{
    Task<CtiEvent?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CtiEvent>> GetByCallIdAsync(string callId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CtiEvent>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
}
