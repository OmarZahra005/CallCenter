using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class TicketRepository : Repository<Ticket>, ITicketRepository
{
    public TicketRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Ticket?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<Ticket?> GetByTicketNumberAsync(string ticketNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(t => t.TicketNumber == ticketNumber, cancellationToken);
    }

    public async Task<IReadOnlyList<Ticket>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(t => t.CustomerId == customerId).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Ticket>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(t => t.AgentId == agentId).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Ticket>> GetByTeamIdAsync(Guid teamId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(t => t.TeamId == teamId).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Ticket>> GetByStatusAsync(TicketStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(t => t.Status == status).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Ticket>> GetByPriorityAsync(TicketPriority priority, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(t => t.Priority == priority).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Ticket>> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.Agent)
            .Where(t => t.ConversationId == conversationId)
            .OrderBy(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
