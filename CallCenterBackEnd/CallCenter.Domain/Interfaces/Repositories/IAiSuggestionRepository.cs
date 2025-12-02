using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IAiSuggestionRepository : IRepository<AiSuggestion>
{
    Task<AiSuggestion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AiSuggestion>> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AiSuggestion>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
}
