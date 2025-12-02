using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IAgentStateRepository : IRepository<AgentState>
{
    Task<AgentState?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AgentState>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
}
