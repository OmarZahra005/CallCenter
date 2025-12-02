using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class CustomerRepository : Repository<Customer>, ICustomerRepository
{
    public CustomerRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Customer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<Customer?> GetByPhoneAsync(string phone, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(c => c.Phone == phone, cancellationToken);
    }

    public async Task<Customer?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(c => c.Email == email, cancellationToken);
    }

    public async Task<Customer?> GetByNationalIdAsync(string nationalId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(c => c.NationalId == nationalId, cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> GetByStatusAsync(CustomerStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(c => c.Status == status).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> GetBySegmentAsync(CustomerSegment segment, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(c => c.Segment == segment).ToListAsync(cancellationToken);
    }
}
