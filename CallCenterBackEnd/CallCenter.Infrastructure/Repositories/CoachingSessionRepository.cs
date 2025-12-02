using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class CoachingSessionRepository : Repository<CoachingSession>, ICoachingSessionRepository
{
    public CoachingSessionRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<CoachingSession?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Agent)
            .Include(c => c.Coach)
            .Include(c => c.Scorecard)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<CoachingSession>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Coach)
            .Where(c => c.AgentId == agentId)
            .OrderByDescending(c => c.SessionDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CoachingSession>> GetByCoachIdAsync(Guid coachId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Agent)
            .Where(c => c.CoachId == coachId)
            .OrderByDescending(c => c.SessionDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CoachingSession>> GetUpcomingAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.Today;
        return await _dbSet
            .Include(c => c.Agent)
            .Include(c => c.Coach)
            .Where(c => c.SessionDate >= today && c.Status == Domain.Enums.CoachingSessionStatus.Scheduled)
            .OrderBy(c => c.SessionDate)
            .ToListAsync(cancellationToken);
    }
}
