using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ICallRecordingRepository : IRepository<CallRecording>
{
    Task<CallRecording?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CallRecording?> GetByCallIdAsync(string callId, CancellationToken cancellationToken = default);
    Task<CallRecording?> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default);
    Task<(List<CallRecording> Items, int TotalCount)> GetPagedWithDetailsAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<CallRecording?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
}
