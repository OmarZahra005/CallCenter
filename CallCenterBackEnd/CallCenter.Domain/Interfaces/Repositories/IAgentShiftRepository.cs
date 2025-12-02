using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IAgentShiftRepository : IRepository<AgentShift>
{
    Task<AgentShift?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AgentShift>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AgentShift>> GetByDateAsync(DateOnly date, CancellationToken cancellationToken = default);
}
