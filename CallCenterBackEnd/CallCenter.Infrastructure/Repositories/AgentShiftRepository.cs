using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class AgentShiftRepository : Repository<AgentShift>, IAgentShiftRepository
{
    public AgentShiftRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<AgentShift?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Agent)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<AgentShift>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(s => s.AgentId == agentId)
            .OrderBy(s => s.ShiftDate)
            .ThenBy(s => s.ShiftStart)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AgentShift>> GetByDateAsync(DateOnly date, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Agent)
            .Where(s => s.ShiftDate == date)
            .OrderBy(s => s.ShiftStart)
            .ToListAsync(cancellationToken);
    }
}
