using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ISystemSettingRepository : IRepository<SystemSetting>
{
    Task<SystemSetting?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SystemSetting?> GetByKeyAsync(string key, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SystemSetting>> GetByCategoryAsync(SettingCategory category, CancellationToken cancellationToken = default);
}
