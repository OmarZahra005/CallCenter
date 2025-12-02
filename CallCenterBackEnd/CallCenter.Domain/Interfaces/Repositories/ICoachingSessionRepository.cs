using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ICoachingSessionRepository : IRepository<CoachingSession>
{
    Task<CoachingSession?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CoachingSession>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CoachingSession>> GetByCoachIdAsync(Guid coachId, CancellationToken cancellationToken = default);
}
