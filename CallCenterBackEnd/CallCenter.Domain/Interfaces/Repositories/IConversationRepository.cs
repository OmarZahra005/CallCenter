using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IConversationRepository : IRepository<Conversation>
{
    Task<Conversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Conversation>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Conversation>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Conversation>> GetActiveByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Conversation>> GetByStateAsync(ConversationState state, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Conversation>> GetByChannelAsync(Channel channel, CancellationToken cancellationToken = default);
}
