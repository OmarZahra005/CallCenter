using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class CallLogRepository : Repository<CallLog>, ICallLogRepository
{
    public CallLogRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<CallLog?> GetByProviderIdAsync(string providerCallId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(c => c.ProviderCallId == providerCallId, cancellationToken);
    }
}
