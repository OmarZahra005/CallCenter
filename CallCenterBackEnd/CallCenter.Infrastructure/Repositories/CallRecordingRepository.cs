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
}
