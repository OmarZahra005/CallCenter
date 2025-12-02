using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class SlaRuleRepository : Repository<SlaRule>, ISlaRuleRepository
{
    public SlaRuleRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<SlaRule?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<SlaRule>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.IsActive)
            .OrderBy(r => r.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<SlaRule?> GetByCategoryAndPriorityAsync(string category, TicketPriority priority, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.IsActive && r.Category == category && r.Priority == priority)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
