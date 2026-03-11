using System.Security.Cryptography;
using System.Text;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Data.Seeds;

public static class SystemSettingSeedData
{
    private static readonly DateTime SeedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    public static void SeedSystemSettings(ModelBuilder modelBuilder)
    {
        var settings = new List<SystemSetting>();

        // WhatsApp settings
        settings.AddRange(CreateCategorySettings(SettingCategory.WhatsApp, new[]
        {
            ("WhatsApp:UseMockData", "true", SettingDataType.Bool, "Use mock data for WhatsApp (development)", false),
            ("WhatsApp:PhoneNumberId", "", SettingDataType.String, "WhatsApp Phone Number ID", true),
            ("WhatsApp:AccessToken", "", SettingDataType.String, "WhatsApp Access Token", true),
            ("WhatsApp:WebhookVerifyToken", "", SettingDataType.String, "Webhook Verify Token", true),
            ("WhatsApp:BusinessAccountId", "", SettingDataType.String, "WhatsApp Business Account ID", true),
            ("WhatsApp:ApiVersion", "v17.0", SettingDataType.String, "WhatsApp API Version", false),
        }));

        // Twilio settings
        settings.AddRange(CreateCategorySettings(SettingCategory.Twilio, new[]
        {
            ("Twilio:AccountSid", "", SettingDataType.String, "Twilio Account SID", true),
            ("Twilio:ApiKeySid", "", SettingDataType.String, "Twilio API Key SID", true),
            ("Twilio:ApiKeySecret", "", SettingDataType.String, "Twilio API Key Secret", true),
            ("Twilio:VoiceTwimlAppSid", "", SettingDataType.String, "Voice TwiML App SID", true),
            ("Twilio:CallerId", "", SettingDataType.String, "Default Caller ID", false),
            ("Twilio:AuthToken", "", SettingDataType.String, "Twilio Auth Token", true),
            ("Twilio:WebhookAuthToken", "", SettingDataType.String, "Webhook Auth Token", true),
            ("Twilio:BaseWebhookUrl", "", SettingDataType.String, "Base Webhook URL", false),
            ("Twilio:BypassSignatureValidation", "false", SettingDataType.Bool, "Bypass Signature Validation (dev only)", false),
        }));

        // SMS settings
        settings.AddRange(CreateCategorySettings(SettingCategory.Sms, new[]
        {
            ("Sms:Provider", "twilio", SettingDataType.String, "SMS Provider (twilio, vonage, etc.)", false),
            ("Sms:FromNumber", "", SettingDataType.String, "Default SMS From Number", false),
            ("Sms:Enabled", "false", SettingDataType.Bool, "Enable SMS messaging", false),
        }));

        // Transcription settings
        settings.AddRange(CreateCategorySettings(SettingCategory.Transcription, new[]
        {
            ("Transcription:BaseUrl", "", SettingDataType.String, "Transcription API Base URL", false),
            ("Transcription:Endpoint", "/api/Transcription", SettingDataType.String, "Transcription Endpoint", false),
            ("Transcription:TimeoutSeconds", "300", SettingDataType.Int, "API Timeout (seconds)", false),
        }));

        // Recording Storage settings
        settings.AddRange(CreateCategorySettings(SettingCategory.RecordingStorage, new[]
        {
            ("RecordingStorage:Path", "./recordings", SettingDataType.String, "Recording Storage Path", false),
            ("RecordingStorage:RetentionDays", "90", SettingDataType.Int, "Retention Period (days)", false),
            ("RecordingStorage:MaxFileSizeMB", "100", SettingDataType.Int, "Max File Size (MB)", false),
        }));

        // JWT settings
        settings.AddRange(CreateCategorySettings(SettingCategory.Jwt, new[]
        {
            ("Jwt:Key", "", SettingDataType.String, "JWT Secret Key (min 32 chars)", true),
            ("Jwt:Issuer", "CallCenterAPI", SettingDataType.String, "JWT Issuer", false),
            ("Jwt:Audience", "CallCenterClient", SettingDataType.String, "JWT Audience", false),
            ("Jwt:ExpirationMinutes", "60", SettingDataType.Int, "Token Expiration (minutes)", false),
        }));

        // Email settings
        settings.AddRange(CreateCategorySettings(SettingCategory.Email, new[]
        {
            ("Email:SmtpHost", "", SettingDataType.String, "SMTP Server Hostname", false),
            ("Email:SmtpPort", "587", SettingDataType.Int, "SMTP Port", false),
            ("Email:SmtpUsername", "", SettingDataType.String, "SMTP Username", false),
            ("Email:SmtpPassword", "", SettingDataType.String, "SMTP Password", true),
            ("Email:FromEmail", "", SettingDataType.String, "Default From Email", false),
            ("Email:FromName", "Call Center", SettingDataType.String, "Default From Name", false),
            ("Email:UseSsl", "true", SettingDataType.Bool, "Use SSL/TLS", false),
        }));

        // General settings
        settings.AddRange(CreateCategorySettings(SettingCategory.General, new[]
        {
            ("General:CompanyName", "Call Center", SettingDataType.String, "Company Name", false),
            ("General:Timezone", "UTC", SettingDataType.String, "Default Timezone", false),
            ("General:DateFormat", "MM/dd/yyyy", SettingDataType.String, "Date Display Format", false),
            ("General:TimeFormat", "HH:mm:ss", SettingDataType.String, "Time Display Format", false),
            ("General:Language", "en", SettingDataType.String, "Default Language", false),
        }));

        // SLA settings
        settings.AddRange(CreateCategorySettings(SettingCategory.Sla, new[]
        {
            ("Sla:DefaultResponseTime", "30", SettingDataType.Int, "Default Response Time (seconds)", false),
            ("Sla:DefaultServiceLevel", "80", SettingDataType.Int, "Default Service Level (%)", false),
            ("Sla:WarningThreshold", "20", SettingDataType.Int, "Warning Threshold (seconds before breach)", false),
        }));

        // Notification settings
        settings.AddRange(CreateCategorySettings(SettingCategory.Notification, new[]
        {
            ("Notification:EnableEmail", "true", SettingDataType.Bool, "Enable Email Notifications", false),
            ("Notification:EnablePush", "true", SettingDataType.Bool, "Enable Push Notifications", false),
            ("Notification:EnableInApp", "true", SettingDataType.Bool, "Enable In-App Notifications", false),
            ("Notification:EnableSound", "true", SettingDataType.Bool, "Enable Sound Alerts", false),
        }));

        modelBuilder.Entity<SystemSetting>().HasData(settings);
    }

    private static IEnumerable<SystemSetting> CreateCategorySettings(
        SettingCategory category,
        (string key, string value, SettingDataType dataType, string description, bool isSensitive)[] settingDefs)
    {
        return settingDefs.Select(s => new SystemSetting
        {
            Id = GenerateSettingId(s.key),
            Key = s.key,
            Value = s.value,
            DataType = s.dataType,
            Category = category,
            Description = s.description,
            IsSensitive = s.isSensitive,
            CreatedAt = SeedDate,
            UpdatedAt = SeedDate
        });
    }

    /// <summary>
    /// Generates a deterministic GUID based on the setting key.
    /// This ensures the same key always gets the same GUID for migrations.
    /// </summary>
    private static Guid GenerateSettingId(string key)
    {
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes("setting_" + key));
        // Take first 16 bytes of SHA256 hash to form a GUID
        var guidBytes = new byte[16];
        Array.Copy(hash, guidBytes, 16);
        return new Guid(guidBytes);
    }
}
