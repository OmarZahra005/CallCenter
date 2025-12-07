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
            // Check if signature validation is bypassed (for local development only)
            if (_options.BypassSignatureValidation)
            {
                _logger.LogWarning("⚠️  SIGNATURE VALIDATION BYPASSED - This should ONLY be used for local development!");
                return true;
            }

            var validator = new Twilio.Security.RequestValidator(_options.WebhookAuthToken);
            var isValid = validator.Validate(url, parameters, signature);

            if (!isValid)
            {
                _logger.LogWarning("❌ Invalid Twilio webhook signature");
                _logger.LogWarning("URL being validated: {Url}", url);
                _logger.LogWarning("Signature received: {Signature}", signature);
                _logger.LogWarning("Auth Token (first 8 chars): {TokenStart}...", _options.WebhookAuthToken?.Substring(0, Math.Min(8, _options.WebhookAuthToken?.Length ?? 0)));
                _logger.LogWarning("Parameters count: {Count}", parameters.Count);

                // Log parameter keys (but not values for security)
                _logger.LogWarning("Parameter keys: {Keys}", string.Join(", ", parameters.Keys));
            }
            else
            {
                _logger.LogInformation("✅ Twilio signature validation successful");
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
