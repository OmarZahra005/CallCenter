using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ITeamRepository : IRepository<Team>
{
    Task<Team?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Team>> GetActiveTeamsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Team>> GetBySupervisorIdAsync(Guid supervisorId, CancellationToken cancellationToken = default);
}
