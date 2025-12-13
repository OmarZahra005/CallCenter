using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ICallLogRepository : IRepository<CallLog>
{
    Task<CallLog?> GetByProviderIdAsync(string providerCallId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CallLog>> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default);
}
