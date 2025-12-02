using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IAgentKpiRepository : IRepository<AgentKpi>
{
    Task<AgentKpi?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AgentKpi>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
    Task<AgentKpi?> GetByAgentIdAndDateAsync(Guid agentId, DateOnly date, CancellationToken cancellationToken = default);
}
