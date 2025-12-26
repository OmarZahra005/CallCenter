using Microsoft.AspNetCore.Authentication;

namespace CallCenter.API.Authentication;

public class SmartBotApiKeyAuthOptions : AuthenticationSchemeOptions
{
    public const string DefaultScheme = "SmartBotApiKey";
    public const string ApiKeyHeaderName = "X-API-Key";

    public string ApiKey { get; set; } = string.Empty;
    public string[] AllowedIpAddresses { get; set; } = Array.Empty<string>();
}
