using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ICustomerNoteRepository : IRepository<CustomerNote>
{
    Task<CustomerNote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CustomerNote>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
}
