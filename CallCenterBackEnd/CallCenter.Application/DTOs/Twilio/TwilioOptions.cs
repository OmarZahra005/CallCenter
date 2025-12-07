namespace CallCenter.Application.DTOs.Twilio;

public class TwilioOptions
{
    public string AccountSid { get; set; } = string.Empty;
    public string ApiKeySid { get; set; } = string.Empty;
    public string ApiKeySecret { get; set; } = string.Empty;
    public string VoiceTwimlAppSid { get; set; } = string.Empty;
    public string CallerId { get; set; } = string.Empty;
    public string WebhookAuthToken { get; set; } = string.Empty;
}
