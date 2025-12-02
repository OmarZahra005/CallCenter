using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ITicketSlaTrackingRepository : IRepository<TicketSlaTracking>
{
    Task<TicketSlaTracking?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TicketSlaTracking?> GetByTicketIdAsync(Guid ticketId, CancellationToken cancellationToken = default);
}
