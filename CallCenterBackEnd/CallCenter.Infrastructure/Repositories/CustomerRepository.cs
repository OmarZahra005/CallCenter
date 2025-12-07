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
        // Normalize phone number by removing non-digit characters
        var digits = new string(phone.Where(char.IsDigit).ToArray());

        // Extract the significant part of the phone number (last 9 digits for Saudi numbers)
        string significantDigits;

        if (digits.StartsWith("966") && digits.Length >= 12)
        {
            // +966546652410 or 966546652410 -> 546652410
            significantDigits = digits.Substring(3);
        }
        else if (digits.StartsWith("0") && digits.Length >= 10)
        {
            // 0546652410 -> 546652410
            significantDigits = digits.Substring(1);
        }
        else
        {
            significantDigits = digits;
        }

        // Search using EndsWith to match any format stored in DB
        return await _dbSet.FirstOrDefaultAsync(c =>
            c.Phone != null && (
                c.Phone.EndsWith(significantDigits) ||
                c.Phone == phone ||
                c.Phone == digits ||
                c.Phone == "0" + significantDigits ||
                c.Phone == "+966" + significantDigits ||
                c.Phone == "966" + significantDigits
            ), cancellationToken);
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
