using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IAgentSkillRepository : IRepository<AgentSkill>
{
    Task<AgentSkill?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AgentSkill>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
}
