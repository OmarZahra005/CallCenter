using CallCenter.Application.DTOs.Transcription;
using CallCenter.Application.DTOs.Twilio;
using CallCenter.Application.DTOs.WhatsApp;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;

namespace CallCenter.Application.Services;

/// <summary>
/// Provides options classes populated from database settings.
/// Replaces IOptions&lt;T&gt; pattern for database-backed settings.
/// </summary>
public interface IDatabaseOptionsProvider
{
    Task<TwilioOptions> GetTwilioOptionsAsync();
    Task<WhatsAppOptions> GetWhatsAppOptionsAsync();
    Task<TranscriptionApiOptions> GetTranscriptionApiOptionsAsync();
    Task<RecordingStorageOptions> GetRecordingStorageOptionsAsync();
    Task<JwtOptions> GetJwtOptionsAsync();
    Task<EmailOptions> GetEmailOptionsAsync();
    void InvalidateCache();
}

/// <summary>
/// Recording storage configuration options.
/// </summary>
public class RecordingStorageOptions
{
    public string Path { get; set; } = string.Empty;
    public int RetentionDays { get; set; } = 90;
    public int MaxFileSizeMB { get; set; } = 100;
}

/// <summary>
/// JWT authentication configuration options.
/// </summary>
public class JwtOptions
{
    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; } = 60;
}

/// <summary>
/// Email/SMTP configuration options.
/// </summary>
public class EmailOptions
{
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string SmtpUsername { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = string.Empty;
    public bool UseSsl { get; set; } = true;
}

/// <summary>
/// Implementation of database-backed options provider with caching.
/// Falls back to IConfiguration (appsettings.json) when database values are empty.
/// </summary>
public class DatabaseOptionsProvider : IDatabaseOptionsProvider
{
    private readonly ISystemSettingService _settingService;
    private readonly IConfiguration _configuration;
    private readonly IMemoryCache _cache;

    private const string TwilioCacheKey = "Options_Twilio";
    private const string WhatsAppCacheKey = "Options_WhatsApp";
    private const string TranscriptionCacheKey = "Options_Transcription";
    private const string RecordingCacheKey = "Options_Recording";
    private const string JwtCacheKey = "Options_Jwt";
    private const string EmailCacheKey = "Options_Email";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    public DatabaseOptionsProvider(ISystemSettingService settingService, IConfiguration configuration, IMemoryCache cache)
    {
        _settingService = settingService;
        _configuration = configuration;
        _cache = cache;
    }

    /// <summary>
    /// Gets a string setting from database, falling back to IConfiguration if empty.
    /// </summary>
    private async Task<string> GetStringWithFallbackAsync(string key, string defaultValue = "")
    {
        var dbValue = await _settingService.GetStringAsync(key);
        if (!string.IsNullOrEmpty(dbValue))
            return dbValue;

        // Fallback to IConfiguration (appsettings.json)
        var configValue = _configuration[key];
        return !string.IsNullOrEmpty(configValue) ? configValue : defaultValue;
    }

    /// <summary>
    /// Gets a bool setting from database, falling back to IConfiguration if not set.
    /// </summary>
    private async Task<bool> GetBoolWithFallbackAsync(string key, bool defaultValue = false)
    {
        var dbValue = await _settingService.GetStringAsync(key);
        if (!string.IsNullOrEmpty(dbValue))
        {
            return dbValue.Equals("true", StringComparison.OrdinalIgnoreCase)
                || dbValue.Equals("1", StringComparison.Ordinal);
        }

        // Fallback to IConfiguration (appsettings.json)
        var configValue = _configuration[key];
        if (!string.IsNullOrEmpty(configValue))
        {
            return configValue.Equals("true", StringComparison.OrdinalIgnoreCase)
                || configValue.Equals("1", StringComparison.Ordinal);
        }

        return defaultValue;
    }

    /// <summary>
    /// Gets an int setting from database, falling back to IConfiguration if not set.
    /// </summary>
    private async Task<int> GetIntWithFallbackAsync(string key, int defaultValue = 0)
    {
        var dbValue = await _settingService.GetStringAsync(key);
        if (!string.IsNullOrEmpty(dbValue) && int.TryParse(dbValue, out var dbInt))
            return dbInt;

        // Fallback to IConfiguration (appsettings.json)
        var configValue = _configuration[key];
        if (!string.IsNullOrEmpty(configValue) && int.TryParse(configValue, out var configInt))
            return configInt;

        return defaultValue;
    }

    public async Task<TwilioOptions> GetTwilioOptionsAsync()
    {
        if (_cache.TryGetValue(TwilioCacheKey, out TwilioOptions? cached) && cached != null)
            return cached;

        var options = new TwilioOptions
        {
            AccountSid = await GetStringWithFallbackAsync("Twilio:AccountSid"),
            ApiKeySid = await GetStringWithFallbackAsync("Twilio:ApiKeySid"),
            ApiKeySecret = await GetStringWithFallbackAsync("Twilio:ApiKeySecret"),
            VoiceTwimlAppSid = await GetStringWithFallbackAsync("Twilio:VoiceTwimlAppSid"),
            CallerId = await GetStringWithFallbackAsync("Twilio:CallerId"),
            AuthToken = await GetStringWithFallbackAsync("Twilio:AuthToken"),
            WebhookAuthToken = await GetStringWithFallbackAsync("Twilio:WebhookAuthToken"),
            BaseWebhookUrl = await GetStringWithFallbackAsync("Twilio:BaseWebhookUrl"),
            BypassSignatureValidation = await GetBoolWithFallbackAsync("Twilio:BypassSignatureValidation")
        };

        _cache.Set(TwilioCacheKey, options, CacheDuration);
        return options;
    }

    public async Task<WhatsAppOptions> GetWhatsAppOptionsAsync()
    {
        if (_cache.TryGetValue(WhatsAppCacheKey, out WhatsAppOptions? cached) && cached != null)
            return cached;

        var options = new WhatsAppOptions
        {
            UseMockData = await GetBoolWithFallbackAsync("WhatsApp:UseMockData", true),
            PhoneNumberId = await GetStringWithFallbackAsync("WhatsApp:PhoneNumberId"),
            AccessToken = await GetStringWithFallbackAsync("WhatsApp:AccessToken"),
            WebhookVerifyToken = await GetStringWithFallbackAsync("WhatsApp:WebhookVerifyToken"),
            BusinessAccountId = await GetStringWithFallbackAsync("WhatsApp:BusinessAccountId"),
            ApiVersion = await GetStringWithFallbackAsync("WhatsApp:ApiVersion", "v17.0")
        };

        _cache.Set(WhatsAppCacheKey, options, CacheDuration);
        return options;
    }

    public async Task<TranscriptionApiOptions> GetTranscriptionApiOptionsAsync()
    {
        if (_cache.TryGetValue(TranscriptionCacheKey, out TranscriptionApiOptions? cached) && cached != null)
            return cached;

        var options = new TranscriptionApiOptions
        {
            BaseUrl = await GetStringWithFallbackAsync("Transcription:BaseUrl"),
            Endpoint = await GetStringWithFallbackAsync("Transcription:Endpoint", "/api/Transcription"),
            TimeoutSeconds = await GetIntWithFallbackAsync("Transcription:TimeoutSeconds", 300)
        };

        _cache.Set(TranscriptionCacheKey, options, CacheDuration);
        return options;
    }

    public async Task<RecordingStorageOptions> GetRecordingStorageOptionsAsync()
    {
        if (_cache.TryGetValue(RecordingCacheKey, out RecordingStorageOptions? cached) && cached != null)
            return cached;

        var options = new RecordingStorageOptions
        {
            Path = await GetStringWithFallbackAsync("RecordingStorage:Path", "C:\\CallCenterRecordings"),
            RetentionDays = await GetIntWithFallbackAsync("RecordingStorage:RetentionDays", 90),
            MaxFileSizeMB = await GetIntWithFallbackAsync("RecordingStorage:MaxFileSizeMB", 100)
        };

        _cache.Set(RecordingCacheKey, options, CacheDuration);
        return options;
    }

    public async Task<JwtOptions> GetJwtOptionsAsync()
    {
        if (_cache.TryGetValue(JwtCacheKey, out JwtOptions? cached) && cached != null)
            return cached;

        var options = new JwtOptions
        {
            Key = await GetStringWithFallbackAsync("Jwt:Key"),
            Issuer = await GetStringWithFallbackAsync("Jwt:Issuer", "CallCenterAPI"),
            Audience = await GetStringWithFallbackAsync("Jwt:Audience", "CallCenterClient"),
            ExpirationMinutes = await GetIntWithFallbackAsync("Jwt:ExpirationMinutes", 60)
        };

        _cache.Set(JwtCacheKey, options, CacheDuration);
        return options;
    }

    public async Task<EmailOptions> GetEmailOptionsAsync()
    {
        if (_cache.TryGetValue(EmailCacheKey, out EmailOptions? cached) && cached != null)
            return cached;

        var options = new EmailOptions
        {
            SmtpHost = await GetStringWithFallbackAsync("Email:SmtpHost"),
            SmtpPort = await GetIntWithFallbackAsync("Email:SmtpPort", 587),
            SmtpUsername = await GetStringWithFallbackAsync("Email:SmtpUsername"),
            SmtpPassword = await GetStringWithFallbackAsync("Email:SmtpPassword"),
            FromEmail = await GetStringWithFallbackAsync("Email:FromEmail"),
            FromName = await GetStringWithFallbackAsync("Email:FromName", "Call Center"),
            UseSsl = await GetBoolWithFallbackAsync("Email:UseSsl", true)
        };

        _cache.Set(EmailCacheKey, options, CacheDuration);
        return options;
    }

    public void InvalidateCache()
    {
        _cache.Remove(TwilioCacheKey);
        _cache.Remove(WhatsAppCacheKey);
        _cache.Remove(TranscriptionCacheKey);
        _cache.Remove(RecordingCacheKey);
        _cache.Remove(JwtCacheKey);
        _cache.Remove(EmailCacheKey);
    }
}
