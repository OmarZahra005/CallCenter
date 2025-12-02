using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class AlertRuleRepository : Repository<AlertRule>, IAlertRuleRepository
{
    public AlertRuleRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<AlertRule?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<AlertRule>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.IsActive)
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);
    }
}
