using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IConversationDispositionRepository : IRepository<ConversationDisposition>
{
    Task<ConversationDisposition?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ConversationDisposition>> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default);
}
