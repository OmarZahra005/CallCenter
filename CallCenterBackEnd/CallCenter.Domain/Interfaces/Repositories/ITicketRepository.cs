using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ITicketRepository : IRepository<Ticket>
{
    Task<Ticket?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Ticket?> GetByTicketNumberAsync(string ticketNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Ticket>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Ticket>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Ticket>> GetByTeamIdAsync(Guid teamId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Ticket>> GetByStatusAsync(TicketStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Ticket>> GetByPriorityAsync(TicketPriority priority, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Ticket>> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default);
}
