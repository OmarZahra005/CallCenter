using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class QaScorecardRepository : Repository<QaScorecard>, IQaScorecardRepository
{
    public QaScorecardRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<QaScorecard?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Form)
            .Include(s => s.Agent)
            .Include(s => s.Evaluator)
            .Include(s => s.Details)
            .Include(s => s.CallRecording)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<QaScorecard>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Form)
            .Include(s => s.Evaluator)
            .Where(s => s.AgentId == agentId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<QaScorecard>> GetByEvaluatorIdAsync(Guid evaluatorId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Form)
            .Include(s => s.Agent)
            .Where(s => s.EvaluatorId == evaluatorId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
