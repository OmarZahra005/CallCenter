using System.Net.Http.Json;
using System.Text.Json;
using CallCenter.Application.DTOs.CrmIntegration;
using CallCenter.Application.Interfaces;
using CallCenter.Application.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CallCenter.Infrastructure.External;

/// <summary>
/// Service for integrating with the CRM system via HTTP API.
/// Implements graceful degradation - call handling continues if CRM is unavailable.
/// </summary>
public class CrmIntegrationService : ICrmIntegrationService
{
    private readonly HttpClient _httpClient;
    private readonly CrmIntegrationOptions _options;
    private readonly ILogger<CrmIntegrationService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    // API endpoints (relative to BaseUrl)
    private const string IncomingCallEndpoint = "/api/call-center/incoming-call";
    private const string CallConnectedEndpoint = "/api/call-center/call-connected";
    private const string CallEndedEndpoint = "/api/call-center/call-ended";
    private const string RecordingReadyEndpoint = "/api/call-center/recording-ready";
    private const string TranscriptReadyEndpoint = "/api/call-center/transcript-ready";
    private const string AiQaReadyEndpoint = "/api/call-center/ai-qa-ready";

    // Correlation ID header for cross-system tracing
    private const string CorrelationIdHeader = "X-Correlation-Id";

    public CrmIntegrationService(
        HttpClient httpClient,
        IOptions<CrmIntegrationOptions> options,
        ILogger<CrmIntegrationService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;

        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };

        // Configure HttpClient
        if (!string.IsNullOrEmpty(_options.BaseUrl))
        {
            _httpClient.BaseAddress = new Uri(_options.BaseUrl.TrimEnd('/'));
        }
        _httpClient.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);

        // Add API Key header if configured
        if (!string.IsNullOrEmpty(_options.ApiKey))
        {
            _httpClient.DefaultRequestHeaders.Add("X-Api-Key", _options.ApiKey);
        }
    }

    /// <inheritdoc />
    public bool IsEnabled => _options.Enabled && !string.IsNullOrEmpty(_options.BaseUrl);

    /// <inheritdoc />
    public async Task<ScreenPopDto?> SendIncomingCallAsync(
        IncomingCallEvent callEvent,
        CancellationToken cancellationToken = default)
    {
        if (!IsEnabled)
        {
            _logger.LogDebug("CRM integration is disabled, skipping incoming call event");
            return null;
        }

        try
        {
            _logger.LogInformation(
                "Sending incoming call event to CRM. CallId: {CallId}, Phone: {Phone}, CorrelationId: {CorrelationId}",
                callEvent.CallId, callEvent.PhoneNumber, callEvent.CallId);

            // Create request with correlation ID header
            var request = new HttpRequestMessage(HttpMethod.Post, IncomingCallEndpoint)
            {
                Content = JsonContent.Create(callEvent, options: _jsonOptions)
            };
            request.Headers.Add(CorrelationIdHeader, callEvent.CallId);

            var response = await _httpClient.SendAsync(request, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning(
                    "CRM returned error for incoming call. Status: {Status}, CallId: {CallId}, CorrelationId: {CorrelationId}, Error: {Error}",
                    response.StatusCode, callEvent.CallId, callEvent.CallId, errorContent);
                return null;
            }

            var screenPop = await response.Content.ReadFromJsonAsync<ScreenPopDto>(
                _jsonOptions, cancellationToken);

            _logger.LogInformation(
                "Received screen pop from CRM. CallId: {CallId}, IsNewCaller: {IsNew}, AccountId: {AccountId}, CorrelationId: {CorrelationId}",
                callEvent.CallId, screenPop?.IsNewCaller, screenPop?.AccountId, callEvent.CallId);

            return screenPop;
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
        {
            _logger.LogWarning(
                "CRM request timed out for incoming call. CallId: {CallId}",
                callEvent.CallId);
            return null;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(
                ex, "HTTP error calling CRM for incoming call. CallId: {CallId}",
                callEvent.CallId);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex, "Unexpected error calling CRM for incoming call. CallId: {CallId}",
                callEvent.CallId);
            return null;
        }
    }

    /// <inheritdoc />
    public async Task<bool> SendCallConnectedAsync(
        CallConnectedEvent callEvent,
        CancellationToken cancellationToken = default)
    {
        return await SendEventAsync(
            CallConnectedEndpoint,
            callEvent,
            callEvent.CallId,
            "call-connected",
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> SendCallEndedAsync(
        CallEndedEvent callEvent,
        CancellationToken cancellationToken = default)
    {
        return await SendEventAsync(
            CallEndedEndpoint,
            callEvent,
            callEvent.CallId,
            "call-ended",
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> SendRecordingReadyAsync(
        RecordingReadyEvent recordingEvent,
        CancellationToken cancellationToken = default)
    {
        return await SendEventAsync(
            RecordingReadyEndpoint,
            recordingEvent,
            recordingEvent.CallId,
            "recording-ready",
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> SendTranscriptReadyAsync(
        TranscriptReadyEvent transcriptEvent,
        CancellationToken cancellationToken = default)
    {
        return await SendEventAsync(
            TranscriptReadyEndpoint,
            transcriptEvent,
            transcriptEvent.CallId,
            "transcript-ready",
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> SendAiQaReadyAsync(
        AiQaReadyEvent qaEvent,
        CancellationToken cancellationToken = default)
    {
        return await SendEventAsync(
            AiQaReadyEndpoint,
            qaEvent,
            qaEvent.CallId,
            "ai-qa-ready",
            cancellationToken);
    }

    /// <summary>
    /// Generic method to send events to CRM with consistent error handling.
    /// </summary>
    private async Task<bool> SendEventAsync<T>(
        string endpoint,
        T eventData,
        string callId,
        string eventType,
        CancellationToken cancellationToken)
    {
        if (!IsEnabled)
        {
            _logger.LogDebug("CRM integration is disabled, skipping {EventType} event", eventType);
            return false;
        }

        try
        {
            _logger.LogInformation(
                "Sending {EventType} event to CRM. CallId: {CallId}, CorrelationId: {CorrelationId}",
                eventType, callId, callId);

            // Create request with correlation ID header
            var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
            {
                Content = JsonContent.Create(eventData, options: _jsonOptions)
            };
            request.Headers.Add(CorrelationIdHeader, callId);

            var response = await _httpClient.SendAsync(request, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning(
                    "CRM returned error for {EventType}. Status: {Status}, CallId: {CallId}, CorrelationId: {CorrelationId}, Error: {Error}",
                    eventType, response.StatusCode, callId, callId, errorContent);
                return false;
            }

            _logger.LogInformation(
                "Successfully sent {EventType} event to CRM. CallId: {CallId}, CorrelationId: {CorrelationId}",
                eventType, callId, callId);
            return true;
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
        {
            _logger.LogWarning(
                "CRM request timed out for {EventType}. CallId: {CallId}, CorrelationId: {CorrelationId}",
                eventType, callId, callId);
            return false;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(
                ex, "HTTP error calling CRM for {EventType}. CallId: {CallId}, CorrelationId: {CorrelationId}",
                eventType, callId, callId);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex, "Unexpected error calling CRM for {EventType}. CallId: {CallId}, CorrelationId: {CorrelationId}",
                eventType, callId, callId);
            return false;
        }
    }
}
