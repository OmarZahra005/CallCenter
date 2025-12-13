namespace CallCenter.Application.DTOs.Twilio;

public class TwilioOptions
{
    public string AccountSid { get; set; } = string.Empty;
    public string ApiKeySid { get; set; } = string.Empty;
    public string ApiKeySecret { get; set; } = string.Empty;
    public string VoiceTwimlAppSid { get; set; } = string.Empty;
    public string CallerId { get; set; } = string.Empty;
    public string WebhookAuthToken { get; set; } = string.Empty;
    public string AuthToken { get; set; } = string.Empty;

    /// <summary>
    /// Set to true to bypass signature validation (for local development ONLY)
    /// WARNING: Never enable this in production!
    /// </summary>
    public bool BypassSignatureValidation { get; set; } = false;
}
