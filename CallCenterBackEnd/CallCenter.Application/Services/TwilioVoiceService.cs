using CallCenter.Application.DTOs.Twilio;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Twilio.Jwt.AccessToken;

namespace CallCenter.Application.Services;

public interface ITwilioVoiceService
{
    string GenerateAccessToken(string identity);
    bool ValidateSignature(string signature, string url, IDictionary<string, string> parameters);
}

public class TwilioVoiceService : ITwilioVoiceService
{
    private readonly TwilioOptions _options;
    private readonly ILogger<TwilioVoiceService> _logger;

    public TwilioVoiceService(IOptions<TwilioOptions> options, ILogger<TwilioVoiceService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public string GenerateAccessToken(string identity)
    {
        // Create a Voice grant for this token
        var grant = new VoiceGrant
        {
            OutgoingApplicationSid = _options.VoiceTwimlAppSid,
            IncomingAllow = true
        };

        // Create an Access Token generator
        var token = new Token(
            _options.AccountSid,
            _options.ApiKeySid,
            _options.ApiKeySecret,
            identity,
            grants: new HashSet<IGrant> { grant }
        );

        _logger.LogInformation("Generated Twilio access token for identity: {Identity}", identity);

        return token.ToJwt();
    }

    public bool ValidateSignature(string signature, string url, IDictionary<string, string> parameters)
    {
        try
        {
            var validator = new Twilio.Security.RequestValidator(_options.WebhookAuthToken);
            var isValid = validator.Validate(url, parameters, signature);

            if (!isValid)
            {
                _logger.LogWarning("Invalid Twilio webhook signature for URL: {Url}", url);
            }

            return isValid;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating Twilio signature");
            return false;
        }
    }
}
