using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ITicketAttachmentRepository : IRepository<TicketAttachment>
{
    Task<TicketAttachment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TicketAttachment>> GetByTicketIdAsync(Guid ticketId, CancellationToken cancellationToken = default);
}
