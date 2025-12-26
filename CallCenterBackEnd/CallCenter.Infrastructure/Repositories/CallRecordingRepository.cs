using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class CallRecordingRepository : Repository<CallRecording>, ICallRecordingRepository
{
    public CallRecordingRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<CallRecording?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Conversation)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<CallRecording?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Conversation)
                .ThenInclude(c => c!.Agent)
            .Include(r => r.Conversation)
                .ThenInclude(c => c!.Customer)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<CallRecording?> GetByCallIdAsync(string callId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(r => r.CallId == callId, cancellationToken);
    }

    public async Task<CallRecording?> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(r => r.ConversationId == conversationId, cancellationToken);
    }

    public async Task<(List<CallRecording> Items, int TotalCount)> GetPagedWithDetailsAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(r => r.Conversation)
                .ThenInclude(c => c!.Agent)
            .Include(r => r.Conversation)
                .ThenInclude(c => c!.Customer)
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
