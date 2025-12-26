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
        return await _dbSet
            .Include(c => c.Customer)
            .Include(c => c.Agent)
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Conversation>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Customer)
            .Include(c => c.Agent)
            .Include(c => c.Messages) // Include messages to get accurate count
            .Where(c => c.CustomerId == customerId)
            .OrderByDescending(c => c.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Conversation>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Customer)
            .Include(c => c.Agent)
            .Include(c => c.Messages) // Include messages to get accurate count
            .Where(c => c.AgentId == agentId)
            .OrderByDescending(c => c.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Conversation>> GetActiveByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Customer)
            .Include(c => c.Agent)
            .Include(c => c.Messages) // Include messages to get accurate count
            .Where(c => c.AgentId == agentId && c.State == ConversationState.Active)
            .OrderByDescending(c => c.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Conversation>> GetByStateAsync(ConversationState state, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Customer)
            .Include(c => c.Agent)
            .Include(c => c.Messages) // Include messages to get accurate count
            .Where(c => c.State == state)
            .OrderByDescending(c => c.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Conversation>> GetByChannelAsync(Channel channel, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Customer)
            .Include(c => c.Agent)
            .Include(c => c.Messages) // Include messages to get accurate count
            .Where(c => c.Channel == channel)
            .OrderByDescending(c => c.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task AddMessageAsync(Guid conversationId, ConversationMessage message, CancellationToken cancellationToken = default)
    {
        // Add message directly to the context to avoid tracking issues
        _context.Set<ConversationMessage>().Add(message);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateStateAsync(Guid conversationId, ConversationState newState, CancellationToken cancellationToken = default)
    {
        // Use raw SQL to update state without loading entity
        await _context.Database.ExecuteSqlRawAsync(
            "UPDATE Conversations SET State = {0} WHERE Id = {1}",
            (int)newState, conversationId);
    }

    public new async Task<CallCenter.Domain.Models.PagedResult<Conversation>> GetPagedAsync(
        int page,
        int pageSize,
        string? searchTerm,
        string? sortBy,
        bool sortDescending,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(c => c.Customer)
            .Include(c => c.Agent)
            .Include(c => c.Messages) // Include messages to get accurate count
            .AsQueryable();

        var totalCount = await query.CountAsync(cancellationToken);
        var pageCount = (int)Math.Ceiling(totalCount / (double)pageSize);

        // Sort by StartTime descending by default
        query = sortDescending || string.IsNullOrEmpty(sortBy)
            ? query.OrderByDescending(c => c.StartTime)
            : query.OrderBy(c => c.StartTime);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new CallCenter.Domain.Models.PagedResult<Conversation>
        {
            Items = items,
            TotalCount = totalCount,
            PageCount = pageCount,
            CurrentPage = page,
            PageSize = pageSize,
            Page = page
        };
    }
}
