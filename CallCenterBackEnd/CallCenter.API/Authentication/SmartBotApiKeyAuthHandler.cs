using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace CallCenter.API.Authentication;

public class SmartBotApiKeyAuthHandler : AuthenticationHandler<SmartBotApiKeyAuthOptions>
{
    public SmartBotApiKeyAuthHandler(
        IOptionsMonitor<SmartBotApiKeyAuthOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder) : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Check if API key header exists
        if (!Request.Headers.TryGetValue(SmartBotApiKeyAuthOptions.ApiKeyHeaderName, out var apiKeyHeaderValues))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var providedApiKey = apiKeyHeaderValues.FirstOrDefault();

        if (string.IsNullOrWhiteSpace(providedApiKey))
        {
            return Task.FromResult(AuthenticateResult.Fail("API Key is missing."));
        }

        // Validate API key
        if (!string.Equals(providedApiKey, Options.ApiKey, StringComparison.Ordinal))
        {
            Logger.LogWarning("Invalid SmartBot API key provided from {RemoteIp}",
                Context.Connection.RemoteIpAddress);
            return Task.FromResult(AuthenticateResult.Fail("Invalid API Key."));
        }

        // Optionally validate IP address
        if (Options.AllowedIpAddresses.Length > 0)
        {
            var remoteIp = Context.Connection.RemoteIpAddress?.ToString();
            if (remoteIp != null && !Options.AllowedIpAddresses.Contains(remoteIp))
            {
                Logger.LogWarning("SmartBot API request from unauthorized IP: {RemoteIp}", remoteIp);
                return Task.FromResult(AuthenticateResult.Fail("IP address not allowed."));
            }
        }

        // Create claims for SmartBot service account
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, "SmartBot"),
            new Claim(ClaimTypes.NameIdentifier, "smartbot-service"),
            new Claim(ClaimTypes.Role, "ServiceAccount"),
            new Claim("service", "SmartBot"),
            new Claim("source", "escalation-api")
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        Logger.LogInformation("SmartBot API authentication successful from {RemoteIp}",
            Context.Connection.RemoteIpAddress);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    protected override Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = 401;
        Response.Headers.Append("WWW-Authenticate", $"{SmartBotApiKeyAuthOptions.ApiKeyHeaderName} realm=\"SmartBot API\"");
        return Task.CompletedTask;
    }

    protected override Task HandleForbiddenAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = 403;
        return Task.CompletedTask;
    }
}
