using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ICustomerInteractionRepository : IRepository<CustomerInteraction>
{
    Task<CustomerInteraction?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CustomerInteraction>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
}
