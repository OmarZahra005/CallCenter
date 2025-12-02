using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ICustomerRepository : IRepository<Customer>
{
    Task<Customer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Customer?> GetByPhoneAsync(string phone, CancellationToken cancellationToken = default);
    Task<Customer?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<Customer?> GetByNationalIdAsync(string nationalId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Customer>> GetByStatusAsync(CustomerStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Customer>> GetBySegmentAsync(CustomerSegment segment, CancellationToken cancellationToken = default);
}
