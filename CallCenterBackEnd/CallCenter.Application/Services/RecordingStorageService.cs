using CallCenter.Application.DTOs.Recordings;
using CallCenter.Application.DTOs.Twilio;
using Microsoft.Extensions.Logging;

namespace CallCenter.Application.Services;

/// <summary>
/// Service for downloading, storing, and streaming call recordings from Twilio
/// </summary>
public class RecordingStorageService : IRecordingStorageService
{
    private readonly ICallRecordingService _recordingService;
    private readonly ICallLogService _callLogService;
    private readonly ILogger<RecordingStorageService> _logger;
    private readonly IDatabaseOptionsProvider _optionsProvider;
    private readonly HttpClient _httpClient;
    private string? _storageBasePath;

    public RecordingStorageService(
        ICallRecordingService recordingService,
        ICallLogService callLogService,
        ILogger<RecordingStorageService> logger,
        IDatabaseOptionsProvider optionsProvider)
    {
        _recordingService = recordingService;
        _callLogService = callLogService;
        _logger = logger;
        _optionsProvider = optionsProvider;
        _httpClient = new HttpClient();
    }

    /// <summary>
    /// Get storage base path, initializing from database settings if needed
    /// </summary>
    private async Task<string> GetStorageBasePathAsync()
    {
        if (_storageBasePath == null)
        {
            var options = await _optionsProvider.GetRecordingStorageOptionsAsync();
            _storageBasePath = !string.IsNullOrEmpty(options.Path)
                ? options.Path
                : Path.Combine(Directory.GetCurrentDirectory(), "Recordings");

            // Ensure base directory exists
            Directory.CreateDirectory(_storageBasePath);
        }
        return _storageBasePath;
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
            var storageBasePath = await GetStorageBasePathAsync();
            var fileName = $"{callSid}_{recordingSid}_{DateTime.UtcNow:yyyyMMddHHmmss}.wav";
            var relativePath = Path.Combine(DateTime.UtcNow.ToString("yyyy-MM"), fileName);
            var fullPath = Path.Combine(storageBasePath, relativePath);
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

            // 4. Get CallLog to retrieve ConversationId for linking
            await LogToFileAsync($"Looking up CallLog for CallSid: {callSid} to get ConversationId");
            var callLog = await _callLogService.GetByProviderIdAsync(callSid);
            Guid? conversationId = callLog?.ConversationId;
            await LogToFileAsync($"CallLog found: {callLog != null}, ConversationId: {conversationId?.ToString() ?? "null"}");

            // 5. Create CallRecording entity in database
            await LogToFileAsync($"Creating CallRecording entity in database for CallSid: {callSid}");
            var recording = await _recordingService.CreateRecordingAsync(new CreateRecordingRequest
            {
                CallId = callSid,
                ConversationId = conversationId, // Link to conversation from CallLog
                Url = relativePath, // Store relative path for portability
                DurationSeconds = durationSeconds,
                SizeBytes = recordingBytes.Length,
                Format = "wav",
                IsEncrypted = false, // Not encrypted at rest (can be enabled later)
                RetentionUntil = await CalculateRetentionDateAsync()
            });
            await LogToFileAsync($"CallRecording created with ID: {recording.Id}, ConversationId: {conversationId?.ToString() ?? "null"}");

            // 6. Update CallLog with recording reference
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

            // Get Twilio credentials from database options provider
            var twilioOptions = await _optionsProvider.GetTwilioOptionsAsync();

            // AuthToken is the main Twilio Auth Token for API calls
            // WebhookAuthToken is a fallback (often the same token)
            var accountSid = twilioOptions.AccountSid;
            var authToken = !string.IsNullOrEmpty(twilioOptions.AuthToken)
                ? twilioOptions.AuthToken
                : twilioOptions.WebhookAuthToken;

            var usingAuthToken = !string.IsNullOrEmpty(twilioOptions.AuthToken) ? "AuthToken" : "WebhookAuthToken";
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

            var storageBasePath = await GetStorageBasePathAsync();
            var fullPath = Path.Combine(storageBasePath, recording.Url);
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

            var storageBasePath = await GetStorageBasePathAsync();
            var fullPath = Path.Combine(storageBasePath, recording.Url);
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
    /// Calculate retention date based on database settings (default: 90 days)
    /// </summary>
    private async Task<DateTime?> CalculateRetentionDateAsync()
    {
        var options = await _optionsProvider.GetRecordingStorageOptionsAsync();
        return DateTime.UtcNow.AddDays(options.RetentionDays);
    }

    /// <summary>
    /// Synchronous version for backwards compatibility (uses cached path if available)
    /// </summary>
    public string GetStorageBasePath()
    {
        // Use cached path if available, otherwise return default
        return _storageBasePath ?? Path.Combine(Directory.GetCurrentDirectory(), "Recordings");
    }
}
