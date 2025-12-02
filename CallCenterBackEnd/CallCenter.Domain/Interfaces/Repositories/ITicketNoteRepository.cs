using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ITicketNoteRepository : IRepository<TicketNote>
{
    Task<TicketNote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TicketNote>> GetByTicketIdAsync(Guid ticketId, CancellationToken cancellationToken = default);
}
