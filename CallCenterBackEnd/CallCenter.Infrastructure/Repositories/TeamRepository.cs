using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class TeamRepository : Repository<Team>, ITeamRepository
{
    public TeamRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Team?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Team>> GetActiveTeamsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(t => t.IsActive).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Team>> GetBySupervisorIdAsync(Guid supervisorId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(t => t.SupervisorId == supervisorId).ToListAsync(cancellationToken);
    }
}
