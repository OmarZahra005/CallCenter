using CallCenter.Application.DTOs.Twilio;
using Microsoft.Extensions.Logging;
using Twilio.Jwt.AccessToken;

namespace CallCenter.Application.Services;

public interface ITwilioVoiceService
{
    Task<string> GenerateAccessTokenAsync(string identity);
    Task<bool> ValidateSignatureAsync(string signature, string url, IDictionary<string, string> parameters);
    Task<string> InitiateOutboundCallAsync(string toNumber, string fromNumber, string agentIdentity);
    Task<TwilioOptions> GetOptionsAsync();
}

public class TwilioVoiceService : ITwilioVoiceService
{
    private readonly IDatabaseOptionsProvider _optionsProvider;
    private readonly ILogger<TwilioVoiceService> _logger;

    public TwilioVoiceService(IDatabaseOptionsProvider optionsProvider, ILogger<TwilioVoiceService> logger)
    {
        _optionsProvider = optionsProvider;
        _logger = logger;
    }

    public async Task<TwilioOptions> GetOptionsAsync()
    {
        return await _optionsProvider.GetTwilioOptionsAsync();
    }

    public async Task<string> GenerateAccessTokenAsync(string identity)
    {
        var options = await _optionsProvider.GetTwilioOptionsAsync();

        // Create a Voice grant for this token
        var grant = new VoiceGrant
        {
            OutgoingApplicationSid = options.VoiceTwimlAppSid,
            IncomingAllow = true
        };

        // Create an Access Token generator
        var token = new Token(
            options.AccountSid,
            options.ApiKeySid,
            options.ApiKeySecret,
            identity,
            grants: new HashSet<IGrant> { grant }
        );

        _logger.LogInformation("Generated Twilio access token for identity: {Identity}", identity);

        return token.ToJwt();
    }

    public async Task<bool> ValidateSignatureAsync(string signature, string url, IDictionary<string, string> parameters)
    {
        try
        {
            var options = await _optionsProvider.GetTwilioOptionsAsync();

            // Check if signature validation is bypassed (for local development only)
            if (options.BypassSignatureValidation)
            {
                _logger.LogWarning("SIGNATURE VALIDATION BYPASSED - This should ONLY be used for local development!");
                return true;
            }

            var validator = new Twilio.Security.RequestValidator(options.WebhookAuthToken);
            var isValid = validator.Validate(url, parameters, signature);

            if (!isValid)
            {
                _logger.LogWarning("Invalid Twilio webhook signature");
                _logger.LogWarning("URL being validated: {Url}", url);
                _logger.LogWarning("Signature received: {Signature}", signature);
                _logger.LogWarning("Auth Token (first 8 chars): {TokenStart}...", options.WebhookAuthToken?.Substring(0, Math.Min(8, options.WebhookAuthToken?.Length ?? 0)));
                _logger.LogWarning("Parameters count: {Count}", parameters.Count);

                // Log parameter keys (but not values for security)
                _logger.LogWarning("Parameter keys: {Keys}", string.Join(", ", parameters.Keys));
            }
            else
            {
                _logger.LogInformation("Twilio signature validation successful");
            }

            return isValid;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating Twilio signature");
            return false;
        }
    }

    public async Task<string> InitiateOutboundCallAsync(string toNumber, string fromNumber, string agentIdentity)
    {
        try
        {
            var options = await _optionsProvider.GetTwilioOptionsAsync();

            // Initialize Twilio client
            Twilio.TwilioClient.Init(options.AccountSid, options.WebhookAuthToken);

            // Create the outbound call
            // The call will connect to the agent via the TwiML app
            var call = await Twilio.Rest.Api.V2010.Account.CallResource.CreateAsync(
                to: new Twilio.Types.PhoneNumber(toNumber),
                from: new Twilio.Types.PhoneNumber(fromNumber),
                url: new Uri($"{options.BaseWebhookUrl}/api/twilio/voice/dialer-connect?agentIdentity={Uri.EscapeDataString(agentIdentity)}"),
                statusCallback: new Uri($"{options.BaseWebhookUrl}/api/twilio/voice/status"),
                statusCallbackEvent: new List<string> { "initiated", "ringing", "answered", "completed" },
                record: true,
                recordingStatusCallback: $"{options.BaseWebhookUrl}/api/twilio/voice/recording-status"
            );

            _logger.LogInformation("Initiated outbound call {CallSid} to {ToNumber} for agent {AgentIdentity}",
                call.Sid, toNumber, agentIdentity);

            return call.Sid;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initiate outbound call to {ToNumber}", toNumber);
            throw;
        }
    }
}
