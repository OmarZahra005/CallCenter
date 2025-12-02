using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class QueueRepository : Repository<Queue>, IQueueRepository
{
    public QueueRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Queue?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(q => q.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Queue>> GetActiveQueuesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(q => q.IsActive).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Queue>> GetByTeamIdAsync(Guid teamId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(q => q.TeamId == teamId).ToListAsync(cancellationToken);
    }
}
