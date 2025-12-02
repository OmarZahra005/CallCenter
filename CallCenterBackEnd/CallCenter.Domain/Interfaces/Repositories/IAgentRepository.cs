using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IAgentRepository : IRepository<Agent>
{
    Task<Agent?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Agent?> GetByEmployeeIdAsync(string employeeId, CancellationToken cancellationToken = default);
    Task<Agent?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Agent>> GetByTeamIdAsync(Guid teamId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Agent>> GetByStatusAsync(AgentStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Agent>> GetByRoleAsync(AgentRole role, CancellationToken cancellationToken = default);
}
