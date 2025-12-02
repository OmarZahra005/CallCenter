using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IConversationMessageRepository : IRepository<ConversationMessage>
{
    Task<ConversationMessage?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ConversationMessage>> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default);
}
