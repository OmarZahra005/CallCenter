using CallCenter.Domain.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace AssetManagement.Infrastructure.Services;
public class CacheService : ICacheService
{
    private readonly IMemoryCache _memoryCache;
    private readonly IDistributedCache? _distributedCache;
    private readonly ILogger<CacheService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;
    private readonly bool _hasDistributedCache;

    public CacheService(
        IMemoryCache memoryCache,
        ILogger<CacheService> logger,
        IDistributedCache? distributedCache = null)
    {
        _memoryCache = memoryCache;
        _distributedCache = distributedCache;
        _logger = logger;
        _hasDistributedCache = distributedCache != null;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            ReferenceHandler = ReferenceHandler.Preserve
        };
    }

    public async Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null)
    {
        // Try memory cache first
        if (_memoryCache.TryGetValue(key, out T memoryResult))
        {
            return memoryResult;
        }

        // Try distributed cache if available
        if (_hasDistributedCache)
        {
            try
            {
                var distributedValue = await _distributedCache!.GetStringAsync(key);
                if (!string.IsNullOrEmpty(distributedValue))
                {
                    var result = JsonSerializer.Deserialize<T>(distributedValue, _jsonOptions);
                    _memoryCache.Set(key, result, expiration ?? TimeSpan.FromMinutes(5));
                    return result;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error reading from distributed cache - falling back to memory cache");
            }
        }

        // Execute factory and cache result
        var value = await factory();
        await SetAsync(key, value, expiration);
        return value;
    }

    public async Task<T> GetAsync<T>(string key)
    {
        if (_memoryCache.TryGetValue(key, out T memoryResult))
        {
            return memoryResult;
        }

        if (_hasDistributedCache)
        {
            try
            {
                var distributedValue = await _distributedCache!.GetStringAsync(key);
                if (!string.IsNullOrEmpty(distributedValue))
                {
                    var result = JsonSerializer.Deserialize<T>(distributedValue, _jsonOptions);
                    _memoryCache.Set(key, result, TimeSpan.FromMinutes(5));
                    return result;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error reading from distributed cache");
            }
        }

        return default;
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        var memoryCacheOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiration ?? TimeSpan.FromHours(1)
        };

        _memoryCache.Set(key, value, memoryCacheOptions);

        if (_hasDistributedCache)
        {
            try
            {
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = expiration ?? TimeSpan.FromHours(1)
                };

                var jsonValue = JsonSerializer.Serialize(value, _jsonOptions);
                await _distributedCache!.SetStringAsync(key, jsonValue, options);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting distributed cache value");
            }
        }
    }

    public async Task RemoveAsync(string key)
    {
        _memoryCache.Remove(key);

        if (_hasDistributedCache)
        {
            try
            {
                await _distributedCache!.RemoveAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing distributed cache value");
            }
        }
    }

    public async Task RemoveByPrefixAsync(string prefix)
    {
        // Note: This implementation is simplified for memory cache
        // For a production scenario, you might want to keep track of keys with their prefixes
        if (_hasDistributedCache)
        {
            var keys = await GetCacheKeysAsync(prefix);
            foreach (var key in keys)
            {
                await RemoveAsync(key);
            }
        }
    }

    private async Task<IEnumerable<string>> GetCacheKeysAsync(string prefix)
    {
        if (_hasDistributedCache)
        {
            var keysKey = $"cache_keys:{prefix}";
            return await GetAsync<List<string>>(keysKey) ?? new List<string>();
        }
        return Array.Empty<string>();
    }
}
