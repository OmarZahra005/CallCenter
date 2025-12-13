using CallCenter.Application.DTOs.Recordings;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http;

namespace CallCenter.Application.Services;

/// <summary>
/// Service for downloading, storing, and streaming call recordings from Twilio
/// </summary>
public class RecordingStorageService : IRecordingStorageService
{
    private readonly ICallRecordingService _recordingService;
    private readonly ICallLogService _callLogService;
    private readonly ITranscriptionService _transcriptionService;
    private readonly ILogger<RecordingStorageService> _logger;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly string _storageBasePath;

    public RecordingStorageService(
        ICallRecordingService recordingService,
        ICallLogService callLogService,
        ITranscriptionService transcriptionService,
        ILogger<RecordingStorageService> logger,
        IConfiguration configuration)
    {
        _recordingService = recordingService;
        _callLogService = callLogService;
        _transcriptionService = transcriptionService;
        _logger = logger;
        _configuration = configuration;
        _httpClient = new HttpClient();

        // Get storage path from configuration or use default
        _storageBasePath = _configuration["RecordingStorage:Path"]
            ?? Path.Combine(Directory.GetCurrentDirectory(), "Recordings");

        // Ensure base directory exists
        Directory.CreateDirectory(_storageBasePath);
    }

    /// <summary>
    /// Process a completed recording: download from Twilio, store locally, create metadata
    /// </summary>
    public async Task ProcessRecordingAsync(string callSid, string recordingSid, string recordingUrl, int durationSeconds, string channels)
    {
        try
        {
            _logger.LogInformation("Processing recording for CallSid: {CallSid}, RecordingSid: {RecordingSid}", callSid, recordingSid);

            // 1. Download recording from Twilio
            var recordingBytes = await DownloadRecordingAsync(recordingUrl);
            if (recordingBytes == null || recordingBytes.Length == 0)
            {
                _logger.LogError("Failed to download recording from Twilio for CallSid: {CallSid}", callSid);
                return;
            }

            // 2. Generate file path (organized by year-month)
            var fileName = $"{callSid}_{recordingSid}_{DateTime.UtcNow:yyyyMMddHHmmss}.wav";
            var relativePath = Path.Combine(DateTime.UtcNow.ToString("yyyy-MM"), fileName);
            var fullPath = Path.Combine(_storageBasePath, relativePath);

            // Ensure subdirectory exists
            var directory = Path.GetDirectoryName(fullPath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            // 3. Save to disk
            await File.WriteAllBytesAsync(fullPath, recordingBytes);
            _logger.LogInformation("Recording saved to disk: {Path}, Size: {Size} bytes", fullPath, recordingBytes.Length);

            // 4. Create CallRecording entity in database
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

            // 5. Update CallLog with recording reference
            await _callLogService.UpdateStatusAsync(callSid, null, null, relativePath);

            _logger.LogInformation("Recording processing completed for CallSid: {CallSid}, RecordingId: {RecordingId}", callSid, recording.Id);

            // 6. Trigger automatic transcription and analysis
            _ = Task.Run(async () =>
            {
                try
                {
                    _logger.LogInformation("Starting automatic transcription for recording: {RecordingId}", recording.Id);
                    await _transcriptionService.ProcessTranscriptionAsync(recording.Id, fullPath);
                    _logger.LogInformation("Automatic transcription completed for recording: {RecordingId}", recording.Id);
                }
                catch (Exception transcriptionEx)
                {
                    _logger.LogError(transcriptionEx, "Error during automatic transcription for recording: {RecordingId}", recording.Id);
                }
            });
        }
        catch (Exception ex)
        {
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

            _logger.LogInformation("Downloading recording from Twilio: {Url}", recordingUrl);

            // Get Twilio credentials from configuration
            var accountSid = _configuration["Twilio:AccountSid"];
            var authToken = _configuration["Twilio:WebhookAuthToken"];

            if (string.IsNullOrEmpty(accountSid) || string.IsNullOrEmpty(authToken))
            {
                _logger.LogError("Twilio credentials not configured");
                return null;
            }

            // Create request with Basic Authentication
            var request = new HttpRequestMessage(HttpMethod.Get, downloadUrl);
            var credentials = Convert.ToBase64String(
                System.Text.Encoding.ASCII.GetBytes($"{accountSid}:{authToken}")
            );
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);

            // Download the recording
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var bytes = await response.Content.ReadAsByteArrayAsync();
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
