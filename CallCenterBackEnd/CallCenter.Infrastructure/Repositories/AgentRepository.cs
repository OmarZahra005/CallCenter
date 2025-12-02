using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class AgentRepository : Repository<Agent>, IAgentRepository
{
    public AgentRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Agent?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<Agent?> GetByEmployeeIdAsync(string employeeId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(a => a.EmployeeId == employeeId, cancellationToken);
    }

    public async Task<Agent?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(a => a.Email == email, cancellationToken);
    }

    public async Task<IReadOnlyList<Agent>> GetByTeamIdAsync(Guid teamId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(a => a.TeamId == teamId).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Agent>> GetByStatusAsync(AgentStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(a => a.Status == status).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Agent>> GetByRoleAsync(AgentRole role, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(a => a.Role == role).ToListAsync(cancellationToken);
    }
}
