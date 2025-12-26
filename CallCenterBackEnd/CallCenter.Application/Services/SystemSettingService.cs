using System.Text.Json;
using CallCenter.Application.DTOs.Settings;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Caching.Memory;

namespace CallCenter.Application.Services;

/// <summary>
/// Implementation of system settings service with encryption and caching.
/// </summary>
public class SystemSettingService : ISystemSettingService
{
    private readonly ISystemSettingRepository _repository;
    private readonly IEncryptionService _encryptionService;
    private readonly IMemoryCache _cache;
    private const string CacheKeyPrefix = "SystemSetting_";
    private const string AllSettingsCacheKey = "SystemSettings_All";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    public SystemSettingService(
        ISystemSettingRepository repository,
        IEncryptionService encryptionService,
        IMemoryCache cache)
    {
        _repository = repository;
        _encryptionService = encryptionService;
        _cache = cache;
    }

    public async Task<List<SystemSettingDto>> GetAllSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _repository.GetAllAsync(cancellationToken);
        return settings.Select(s => MapToDto(s, maskSensitive: true)).ToList();
    }

    public async Task<SystemSettingDto?> GetSettingByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var setting = await _repository.GetByIdAsync(id, cancellationToken);
        return setting != null ? MapToDto(setting, maskSensitive: true) : null;
    }

    public async Task<SystemSettingDto?> GetSettingByKeyAsync(string key, CancellationToken cancellationToken = default)
    {
        var setting = await _repository.GetByKeyAsync(key, cancellationToken);
        return setting != null ? MapToDto(setting, maskSensitive: true) : null;
    }

    public async Task<List<SystemSettingDto>> GetSettingsByCategoryAsync(SettingCategory category, CancellationToken cancellationToken = default)
    {
        var settings = await _repository.GetByCategoryAsync(category, cancellationToken);
        return settings.Select(s => MapToDto(s, maskSensitive: true)).ToList();
    }

    public async Task<List<CategorySettingsDto>> GetSettingsGroupedByCategoryAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _repository.GetAllAsync(cancellationToken);

        return settings
            .GroupBy(s => s.Category)
            .Select(g => new CategorySettingsDto
            {
                Category = g.Key,
                CategoryName = g.Key.ToString(),
                Settings = g.Select(s => MapToDto(s, maskSensitive: true)).ToList()
            })
            .OrderBy(c => c.Category)
            .ToList();
    }

    public async Task<SystemSettingDto> CreateSettingAsync(CreateSettingRequest request, Guid userId)
    {
        var value = request.IsSensitive
            ? _encryptionService.Encrypt(request.Value)
            : request.Value;

        var setting = new SystemSetting
        {
            Id = Guid.NewGuid(),
            Key = request.Key,
            Value = value,
            DataType = request.DataType,
            Category = request.Category,
            Description = request.Description,
            IsSensitive = request.IsSensitive,
            UpdatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(setting);
        await _repository.SaveChangesAsync();
        InvalidateCache(setting.Key);

        return MapToDto(setting, maskSensitive: true);
    }

    public async Task<SystemSettingDto?> UpdateSettingAsync(Guid id, UpdateSettingRequest request, Guid userId)
    {
        var setting = await _repository.GetByIdAsync(id);
        if (setting == null) return null;

        setting.Value = setting.IsSensitive
            ? _encryptionService.Encrypt(request.Value)
            : request.Value;
        setting.Description = request.Description ?? setting.Description;
        setting.UpdatedBy = userId;
        setting.UpdatedAt = DateTime.UtcNow;

        _repository.Update(setting);
        await _repository.SaveChangesAsync();
        InvalidateCache(setting.Key);

        return MapToDto(setting, maskSensitive: true);
    }

    public async Task<bool> UpdateSettingByKeyAsync(string key, string value, Guid userId)
    {
        var setting = await _repository.GetByKeyAsync(key);
        if (setting == null) return false;

        setting.Value = setting.IsSensitive
            ? _encryptionService.Encrypt(value)
            : value;
        setting.UpdatedBy = userId;
        setting.UpdatedAt = DateTime.UtcNow;

        _repository.Update(setting);
        await _repository.SaveChangesAsync();
        InvalidateCache(key);

        return true;
    }

    public async Task<bool> BulkUpdateSettingsAsync(BulkUpdateSettingsRequest request, Guid userId)
    {
        foreach (var item in request.Settings)
        {
            var setting = await _repository.GetByKeyAsync(item.Key);
            if (setting != null)
            {
                setting.Value = setting.IsSensitive
                    ? _encryptionService.Encrypt(item.Value)
                    : item.Value;
                setting.UpdatedBy = userId;
                setting.UpdatedAt = DateTime.UtcNow;
                _repository.Update(setting);
            }
        }

        await _repository.SaveChangesAsync();
        InvalidateCache();
        return true;
    }

    public async Task<bool> DeleteSettingAsync(Guid id)
    {
        var setting = await _repository.GetByIdAsync(id);
        if (setting == null) return false;

        _repository.DeleteAsync(setting);
        await _repository.SaveChangesAsync();
        InvalidateCache(setting.Key);

        return true;
    }

    // Typed getters with caching
    public async Task<string> GetStringAsync(string key, string defaultValue = "")
    {
        var cacheKey = CacheKeyPrefix + key;
        if (_cache.TryGetValue(cacheKey, out string? cached))
            return cached ?? defaultValue;

        var setting = await _repository.GetByKeyAsync(key);
        if (setting == null) return defaultValue;

        var value = setting.IsSensitive
            ? _encryptionService.Decrypt(setting.Value)
            : setting.Value;

        _cache.Set(cacheKey, value, CacheDuration);
        return value ?? defaultValue;
    }

    public async Task<int> GetIntAsync(string key, int defaultValue = 0)
    {
        var value = await GetStringAsync(key);
        return int.TryParse(value, out var result) ? result : defaultValue;
    }

    public async Task<bool> GetBoolAsync(string key, bool defaultValue = false)
    {
        var value = await GetStringAsync(key);
        return bool.TryParse(value, out var result) ? result : defaultValue;
    }

    public async Task<T?> GetJsonAsync<T>(string key) where T : class
    {
        var value = await GetStringAsync(key);
        if (string.IsNullOrEmpty(value)) return null;
        try
        {
            return JsonSerializer.Deserialize<T>(value);
        }
        catch
        {
            return null;
        }
    }

    public void InvalidateCache(string? key = null)
    {
        if (key != null)
        {
            _cache.Remove(CacheKeyPrefix + key);
        }
        _cache.Remove(AllSettingsCacheKey);
    }

    private SystemSettingDto MapToDto(SystemSetting setting, bool maskSensitive)
    {
        var value = setting.Value;

        if (maskSensitive && setting.IsSensitive && !string.IsNullOrEmpty(value))
        {
            // Mask sensitive values for display
            value = "********";
        }
        else if (setting.IsSensitive && _encryptionService.IsEncrypted(setting.Value))
        {
            // Decrypt for internal use
            value = _encryptionService.Decrypt(setting.Value);
        }

        return new SystemSettingDto
        {
            Id = setting.Id,
            Key = setting.Key,
            Value = value,
            DataType = setting.DataType,
            Category = setting.Category,
            Description = setting.Description,
            IsSensitive = setting.IsSensitive,
            UpdatedAt = setting.UpdatedAt
        };
    }
}
