using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IAgentAdherenceRepository : IRepository<AgentAdherence>
{
    Task<AgentAdherence?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AgentAdherence>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AgentAdherence>> GetByShiftIdAsync(Guid shiftId, CancellationToken cancellationToken = default);
}
