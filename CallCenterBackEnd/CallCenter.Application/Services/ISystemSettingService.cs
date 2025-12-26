using CallCenter.Application.DTOs.Settings;
using CallCenter.Domain.Enums;

namespace CallCenter.Application.Services;

/// <summary>
/// Service for managing system settings.
/// </summary>
public interface ISystemSettingService
{
    // CRUD operations
    Task<List<SystemSettingDto>> GetAllSettingsAsync(CancellationToken cancellationToken = default);
    Task<SystemSettingDto?> GetSettingByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SystemSettingDto?> GetSettingByKeyAsync(string key, CancellationToken cancellationToken = default);
    Task<List<SystemSettingDto>> GetSettingsByCategoryAsync(SettingCategory category, CancellationToken cancellationToken = default);
    Task<List<CategorySettingsDto>> GetSettingsGroupedByCategoryAsync(CancellationToken cancellationToken = default);
    Task<SystemSettingDto> CreateSettingAsync(CreateSettingRequest request, Guid userId);
    Task<SystemSettingDto?> UpdateSettingAsync(Guid id, UpdateSettingRequest request, Guid userId);
    Task<bool> UpdateSettingByKeyAsync(string key, string value, Guid userId);
    Task<bool> BulkUpdateSettingsAsync(BulkUpdateSettingsRequest request, Guid userId);
    Task<bool> DeleteSettingAsync(Guid id);

    // Typed getters for application use (with caching)
    Task<string> GetStringAsync(string key, string defaultValue = "");
    Task<int> GetIntAsync(string key, int defaultValue = 0);
    Task<bool> GetBoolAsync(string key, bool defaultValue = false);
    Task<T?> GetJsonAsync<T>(string key) where T : class;

    // Cache management
    void InvalidateCache(string? key = null);
}
