using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ICallRecordingRepository : IRepository<CallRecording>
{
    Task<CallRecording?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CallRecording?> GetByCallIdAsync(string callId, CancellationToken cancellationToken = default);
    Task<CallRecording?> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default);
}
