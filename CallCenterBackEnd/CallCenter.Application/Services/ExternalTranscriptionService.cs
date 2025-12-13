using System.Text.Json;
using CallCenter.Application.DTOs.Transcription;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CallCenter.Application.Services;

/// <summary>
/// Result from external transcription API analysis
/// </summary>
public class TranscriptionAnalysisResult
{
    public string Transcript { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Sentiment { get; set; } = string.Empty;
    public List<string> DetectedIssues { get; set; } = new();
    public List<string> ActionItems { get; set; } = new();
}

/// <summary>
/// Interface for external transcription API integration
/// </summary>
public interface IExternalTranscriptionService
{
    Task<TranscriptionAnalysisResult?> AnalyzeRecordingAsync(string filePath);
}

/// <summary>
/// Service to call external transcription API and analyze call recordings
/// </summary>
public class ExternalTranscriptionService : IExternalTranscriptionService
{
    private readonly HttpClient _httpClient;
    private readonly TranscriptionApiOptions _options;
    private readonly ILogger<ExternalTranscriptionService> _logger;

    public ExternalTranscriptionService(
        HttpClient httpClient,
        IOptions<TranscriptionApiOptions> options,
        ILogger<ExternalTranscriptionService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;

        // Configure timeout
        _httpClient.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
    }

    /// <summary>
    /// Sends audio file to external API and returns analysis results
    /// </summary>
    /// <param name="filePath">Full path to the WAV recording file</param>
    /// <returns>Analysis result with transcript, summary, sentiment, issues, and action items</returns>
    public async Task<TranscriptionAnalysisResult?> AnalyzeRecordingAsync(string filePath)
    {
        try
        {
            _logger.LogInformation("Starting transcription analysis for file: {FilePath}", filePath);

            if (!File.Exists(filePath))
            {
                _logger.LogError("Recording file not found: {FilePath}", filePath);
                return null;
            }

            // Read file and prepare multipart form data
            using var fileStream = File.OpenRead(filePath);
            using var content = new MultipartFormDataContent();
            using var fileContent = new StreamContent(fileStream);

            // Set content type for WAV audio
            fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("audio/wav");
            content.Add(fileContent, "File", Path.GetFileName(filePath));

            // Build full URL
            var url = $"{_options.BaseUrl.TrimEnd('/')}{_options.Endpoint}";
            _logger.LogInformation("Sending request to transcription API: {Url}", url);

            // Send request
            var response = await _httpClient.PostAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Transcription API returned error. Status: {Status}, Content: {Content}",
                    response.StatusCode, errorContent);
                return null;
            }

            // Parse response
            var jsonResponse = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("Received transcription response, parsing...");

            var result = JsonSerializer.Deserialize<TranscriptionApiResponse>(jsonResponse, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (result == null)
            {
                _logger.LogError("Failed to deserialize transcription API response");
                return null;
            }

            _logger.LogInformation("Transcription analysis completed successfully. Sentiment: {Sentiment}", result.Sentiment);

            return new TranscriptionAnalysisResult
            {
                Transcript = result.Transcript ?? string.Empty,
                Summary = result.Summary ?? string.Empty,
                Sentiment = result.Sentiment ?? "neutral",
                DetectedIssues = result.DetectedIssues ?? new List<string>(),
                ActionItems = result.ActionItems ?? new List<string>()
            };
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "Transcription API request timed out after {Timeout} seconds", _options.TimeoutSeconds);
            return null;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error calling transcription API: {Message}", ex.Message);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during transcription analysis: {Message}", ex.Message);
            return null;
        }
    }
}

/// <summary>
/// Model for deserializing external API response
/// </summary>
internal class TranscriptionApiResponse
{
    public string? Transcript { get; set; }
    public string? Summary { get; set; }
    public string? Sentiment { get; set; }
    public List<string>? DetectedIssues { get; set; }
    public List<string>? ActionItems { get; set; }
}
