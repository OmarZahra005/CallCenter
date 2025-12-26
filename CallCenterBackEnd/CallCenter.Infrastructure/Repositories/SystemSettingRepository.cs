using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class SystemSettingRepository : Repository<SystemSetting>, ISystemSettingRepository
{
    public SystemSettingRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<SystemSetting?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<SystemSetting?> GetByKeyAsync(string key, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(s => s.Key == key, cancellationToken);
    }

    public async Task<IReadOnlyList<SystemSetting>> GetByCategoryAsync(SettingCategory category, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(s => s.Category == category)
            .OrderBy(s => s.Key)
            .ToListAsync(cancellationToken);
    }
}
