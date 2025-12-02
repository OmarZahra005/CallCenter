using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ITicketStatusHistoryRepository : IRepository<TicketStatusHistory>
{
    Task<TicketStatusHistory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TicketStatusHistory>> GetByTicketIdAsync(Guid ticketId, CancellationToken cancellationToken = default);
}
