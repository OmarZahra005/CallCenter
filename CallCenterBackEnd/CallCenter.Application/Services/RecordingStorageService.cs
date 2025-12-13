using CallCenter.Application.DTOs.Recordings;
using CallCenter.Application.DTOs.Twilio;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net.Http;

namespace CallCenter.Application.Services;

/// <summary>
/// Service for downloading, storing, and streaming call recordings from Twilio
/// </summary>
public class RecordingStorageService : IRecordingStorageService
{
    private readonly ICallRecordingService _recordingService;
    private readonly ICallLogService _callLogService;
    private readonly ILogger<RecordingStorageService> _logger;
    private readonly IConfiguration _configuration;
    private readonly TwilioOptions _twilioOptions;
    private readonly HttpClient _httpClient;
    private readonly string _storageBasePath;

    public RecordingStorageService(
        ICallRecordingService recordingService,
        ICallLogService callLogService,
        ILogger<RecordingStorageService> logger,
        IConfiguration configuration,
        IOptions<TwilioOptions> twilioOptions)
    {
        _recordingService = recordingService;
        _callLogService = callLogService;
        _logger = logger;
        _configuration = configuration;
        _twilioOptions = twilioOptions.Value;
        _httpClient = new HttpClient();

        // Get storage path from configuration or use default
        _storageBasePath = _configuration["RecordingStorage:Path"]
            ?? Path.Combine(Directory.GetCurrentDirectory(), "Recordings");

        // Ensure base directory exists
        Directory.CreateDirectory(_storageBasePath);
    }

    /// <summary>
    /// Log to the same file as TwilioVoiceController for unified debugging
    /// </summary>
    private async Task LogToFileAsync(string message)
    {
        try
        {
            var logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Logs");
            Directory.CreateDirectory(logDirectory);
            var logFilePath = Path.Combine(logDirectory, $"TwilioVoice_{DateTime.UtcNow:yyyy-MM-dd}.log");
            var logEntry = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] [RecordingStorage] {message}{Environment.NewLine}";
            await File.AppendAllTextAsync(logFilePath, logEntry);
        }
        catch
        {
            // Ignore logging failures - don't let them affect recording processing
        }
    }

    /// <summary>
    /// Process a completed recording: download from Twilio, store locally, create metadata
    /// </summary>
    public async Task ProcessRecordingAsync(string callSid, string recordingSid, string recordingUrl, int durationSeconds, string channels)
    {
        try
        {
            await LogToFileAsync($"=== ProcessRecordingAsync Started for CallSid: {callSid}, RecordingSid: {recordingSid} ===");
            _logger.LogInformation("Processing recording for CallSid: {CallSid}, RecordingSid: {RecordingSid}", callSid, recordingSid);

            // 1. Download recording from Twilio
            await LogToFileAsync($"Attempting to download recording from Twilio: {recordingUrl}");
            var recordingBytes = await DownloadRecordingAsync(recordingUrl);
            if (recordingBytes == null || recordingBytes.Length == 0)
            {
                await LogToFileAsync($"ERROR: Failed to download recording from Twilio for CallSid: {callSid}");
                _logger.LogError("Failed to download recording from Twilio for CallSid: {CallSid}", callSid);
                return;
            }
            await LogToFileAsync($"Downloaded {recordingBytes.Length} bytes from Twilio");

            // 2. Generate file path (organized by year-month)
            var fileName = $"{callSid}_{recordingSid}_{DateTime.UtcNow:yyyyMMddHHmmss}.wav";
            var relativePath = Path.Combine(DateTime.UtcNow.ToString("yyyy-MM"), fileName);
            var fullPath = Path.Combine(_storageBasePath, relativePath);
            await LogToFileAsync($"Generated file path: {fullPath}");

            // Ensure subdirectory exists
            var directory = Path.GetDirectoryName(fullPath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            // 3. Save to disk
            await File.WriteAllBytesAsync(fullPath, recordingBytes);
            await LogToFileAsync($"Recording saved to disk: {fullPath}, Size: {recordingBytes.Length} bytes");
            _logger.LogInformation("Recording saved to disk: {Path}, Size: {Size} bytes", fullPath, recordingBytes.Length);

            // 4. Create CallRecording entity in database
            await LogToFileAsync($"Creating CallRecording entity in database for CallSid: {callSid}");
            var recording = await _recordingService.CreateRecordingAsync(new CreateRecordingRequest
            {
                CallId = callSid,
                ConversationId = null, // Can be linked later if needed
                Url = relativePath, // Store relative path for portability
                DurationSeconds = durationSeconds,
                SizeBytes = recordingBytes.Length,
                Format = "wav",
                IsEncrypted = false, // Not encrypted at rest (can be enabled later)
                RetentionUntil = CalculateRetentionDate()
            });
            await LogToFileAsync($"CallRecording created with ID: {recording.Id}");

            // 5. Update CallLog with recording reference
            await LogToFileAsync($"Updating CallLog with recording path for CallSid: {callSid}");
            await _callLogService.UpdateStatusAsync(callSid, null, null, relativePath);
            await LogToFileAsync($"CallLog updated successfully");

            await LogToFileAsync($"=== ProcessRecordingAsync Completed Successfully for CallSid: {callSid} ===");
            _logger.LogInformation("Recording saved successfully for CallSid: {CallSid}, RecordingId: {RecordingId}. Transcription can be triggered on-demand from QA screen.", callSid, recording.Id);
        }
        catch (Exception ex)
        {
            await LogToFileAsync($"ERROR: Exception in ProcessRecordingAsync for CallSid: {callSid} - {ex.Message}");
            await LogToFileAsync($"Stack Trace: {ex.StackTrace}");
            _logger.LogError(ex, "Error processing recording for CallSid: {CallSid}", callSid);
            // Don't throw - we don't want to fail the Twilio webhook
        }
    }

    /// <summary>
    /// Download recording from Twilio using Basic Authentication
    /// </summary>
    private async Task<byte[]?> DownloadRecordingAsync(string recordingUrl)
    {
        try
        {
            // Twilio recording URLs need .wav extension for WAV format
            var downloadUrl = $"{recordingUrl}.wav";

            await LogToFileAsync($"Starting download from Twilio: {downloadUrl}");
            _logger.LogInformation("Downloading recording from Twilio: {Url}", recordingUrl);

            // Get Twilio credentials from injected options
            // AuthToken is the main Twilio Auth Token for API calls
            // WebhookAuthToken is a fallback (often the same token)
            var accountSid = _twilioOptions.AccountSid;
            var authToken = !string.IsNullOrEmpty(_twilioOptions.AuthToken)
                ? _twilioOptions.AuthToken
                : _twilioOptions.WebhookAuthToken;

            var usingAuthToken = !string.IsNullOrEmpty(_twilioOptions.AuthToken) ? "AuthToken" : "WebhookAuthToken";
            await LogToFileAsync($"Using credentials - AccountSid: {(accountSid?.Length > 6 ? accountSid.Substring(0, 6) + "..." : "[empty]")}, TokenSource: {usingAuthToken}");

            if (string.IsNullOrEmpty(accountSid) || string.IsNullOrEmpty(authToken))
            {
                await LogToFileAsync($"ERROR: Twilio credentials not configured. AccountSid present: {!string.IsNullOrEmpty(accountSid)}, AuthToken present: {!string.IsNullOrEmpty(authToken)}");
                _logger.LogError("Twilio credentials not configured. AccountSid: {HasAccountSid}, AuthToken: {HasAuthToken}",
                    !string.IsNullOrEmpty(accountSid), !string.IsNullOrEmpty(authToken));
                return null;
            }

            _logger.LogInformation("Using AccountSid: {AccountSid} for recording download", accountSid.Substring(0, 6) + "...");

            // Create request with Basic Authentication
            var request = new HttpRequestMessage(HttpMethod.Get, downloadUrl);
            var credentials = Convert.ToBase64String(
                System.Text.Encoding.ASCII.GetBytes($"{accountSid}:{authToken}")
            );
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);

            // Download the recording
            await LogToFileAsync($"Sending HTTP GET request...");
            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                await LogToFileAsync($"ERROR: Download failed. Status: {(int)response.StatusCode} {response.StatusCode}, Response: {responseContent}");
                _logger.LogError("Failed to download recording. Status: {StatusCode}, Response: {Response}",
                    response.StatusCode, responseContent);
                return null;
            }

            var bytes = await response.Content.ReadAsByteArrayAsync();
            await LogToFileAsync($"Download successful: {bytes.Length} bytes received");
            _logger.LogInformation("Downloaded {Size} bytes from Twilio", bytes.Length);

            return bytes;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error downloading recording from URL: {Url}", recordingUrl);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download recording from URL: {Url}", recordingUrl);
            return null;
        }
    }

    /// <summary>
    /// Get a stream for a recording file by recording ID
    /// </summary>
    public async Task<Stream?> GetRecordingStreamAsync(Guid recordingId)
    {
        try
        {
            var recording = await _recordingService.GetRecordingByIdAsync(recordingId);
            if (recording == null)
            {
                _logger.LogWarning("Recording not found in database: {RecordingId}", recordingId);
                return null;
            }

            var fullPath = Path.Combine(_storageBasePath, recording.Url);
            if (!File.Exists(fullPath))
            {
                _logger.LogWarning("Recording file not found on disk: {Path}", fullPath);
                return null;
            }

            // Return file stream with shared read access (allows concurrent streaming)
            return new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recording stream for ID: {RecordingId}", recordingId);
            return null;
        }
    }

    /// <summary>
    /// Get the local file path for a recording
    /// </summary>
    public async Task<string?> GetRecordingLocalPathAsync(Guid recordingId)
    {
        try
        {
            var recording = await _recordingService.GetRecordingByIdAsync(recordingId);
            if (recording == null)
            {
                return null;
            }

            var fullPath = Path.Combine(_storageBasePath, recording.Url);
            return File.Exists(fullPath) ? fullPath : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recording path for ID: {RecordingId}", recordingId);
            return null;
        }
    }

    /// <summary>
    /// Delete a recording file from disk and database
    /// </summary>
    public async Task<bool> DeleteRecordingFileAsync(Guid recordingId)
    {
        try
        {
            var path = await GetRecordingLocalPathAsync(recordingId);
            if (path != null && File.Exists(path))
            {
                File.Delete(path);
                _logger.LogInformation("Deleted recording file from disk: {Path}", path);
            }

            var success = await _recordingService.DeleteRecordingAsync(recordingId);
            if (success)
            {
                _logger.LogInformation("Deleted recording from database: {RecordingId}", recordingId);
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting recording: {RecordingId}", recordingId);
            return false;
        }
    }

    /// <summary>
    /// Calculate retention date based on configuration (default: 90 days)
    /// </summary>
    private DateTime? CalculateRetentionDate()
    {
        var retentionDays = _configuration.GetValue<int>("RecordingStorage:RetentionDays", 90);
        return DateTime.UtcNow.AddDays(retentionDays);
    }

    /// <summary>
    /// Get the base storage path for recordings
    /// </summary>
    public string GetStorageBasePath()
    {
        return _storageBasePath;
    }
}
