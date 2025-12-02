using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ITimeOffRequestRepository : IRepository<TimeOffRequest>
{
    Task<TimeOffRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TimeOffRequest>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TimeOffRequest>> GetByStatusAsync(TimeOffRequestStatus status, CancellationToken cancellationToken = default);
}
