using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IConversationNoteRepository : IRepository<ConversationNote>
{
    Task<ConversationNote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ConversationNote>> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default);
}
