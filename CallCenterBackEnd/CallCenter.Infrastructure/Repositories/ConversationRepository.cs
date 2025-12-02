using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class ConversationRepository : Repository<Conversation>, IConversationRepository
{
    public ConversationRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Conversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Conversation>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(c => c.CustomerId == customerId).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Conversation>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(c => c.AgentId == agentId).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Conversation>> GetActiveByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.AgentId == agentId && c.State == ConversationState.Active)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Conversation>> GetByStateAsync(ConversationState state, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(c => c.State == state).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Conversation>> GetByChannelAsync(Channel channel, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(c => c.Channel == channel).ToListAsync(cancellationToken);
    }
}
