namespace CallCenter.Application.Services;

/// <summary>
/// Service for downloading, storing, and streaming call recordings
/// </summary>
public interface IRecordingStorageService
{
    /// <summary>
    /// Process a completed recording: download from Twilio, store locally, create metadata
    /// </summary>
    Task ProcessRecordingAsync(string callSid, string recordingSid, string recordingUrl, int durationSeconds, string channels);

    /// <summary>
    /// Get a stream for a recording file by recording ID
    /// </summary>
    Task<Stream?> GetRecordingStreamAsync(Guid recordingId);

    /// <summary>
    /// Get the local file path for a recording
    /// </summary>
    Task<string?> GetRecordingLocalPathAsync(Guid recordingId);

    /// <summary>
    /// Delete a recording file from disk and database
    /// </summary>
    Task<bool> DeleteRecordingFileAsync(Guid recordingId);

    /// <summary>
    /// Get the base storage path for recordings
    /// </summary>
    string GetStorageBasePath();
}
