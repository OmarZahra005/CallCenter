namespace CallCenter.Application.Options;

/// <summary>
/// Configuration options for CRM integration.
/// </summary>
public class CrmIntegrationOptions
{
    /// <summary>
    /// Configuration section name in appsettings.json
    /// </summary>
    public const string SectionName = "CrmIntegration";

    /// <summary>
    /// Base URL of the CRM API (e.g., https://localhost:5001)
    /// </summary>
    public string BaseUrl { get; set; } = string.Empty;

    /// <summary>
    /// API Key for authentication (sent as X-Api-Key header)
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// HTTP request timeout in seconds
    /// </summary>
    public int TimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// Number of retry attempts for failed requests
    /// </summary>
    public int RetryCount { get; set; } = 3;

    /// <summary>
    /// Enable or disable CRM integration
    /// </summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// Base delay between retries in milliseconds (exponential backoff)
    /// </summary>
    public int RetryDelayMs { get; set; } = 500;

    /// <summary>
    /// Circuit breaker failure threshold before opening
    /// </summary>
    public int CircuitBreakerThreshold { get; set; } = 5;

    /// <summary>
    /// Circuit breaker duration of break in seconds
    /// </summary>
    public int CircuitBreakerDurationSeconds { get; set; } = 30;
}
