using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ITeamKpiRepository : IRepository<TeamKpi>
{
    Task<TeamKpi?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TeamKpi>> GetByTeamIdAsync(Guid teamId, CancellationToken cancellationToken = default);
    Task<TeamKpi?> GetByTeamIdAndDateAsync(Guid teamId, DateOnly date, CancellationToken cancellationToken = default);
}
