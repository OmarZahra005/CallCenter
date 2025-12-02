using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ICallTranscriptionRepository : IRepository<CallTranscription>
{
    Task<CallTranscription?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CallTranscription?> GetByCallIdAsync(string callId, CancellationToken cancellationToken = default);
    Task<CallTranscription?> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default);
}
