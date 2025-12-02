using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class QaEvaluationFormRepository : Repository<QaEvaluationForm>, IQaEvaluationFormRepository
{
    public QaEvaluationFormRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<QaEvaluationForm?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(f => f.Criteria.OrderBy(c => c.DisplayOrder))
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<QaEvaluationForm>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => f.IsActive)
            .Include(f => f.Criteria.OrderBy(c => c.DisplayOrder))
            .OrderBy(f => f.Name)
            .ToListAsync(cancellationToken);
    }
}
