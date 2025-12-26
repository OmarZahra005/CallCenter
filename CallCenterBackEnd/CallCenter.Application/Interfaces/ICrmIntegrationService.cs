using CallCenter.Application.DTOs.CrmIntegration;

namespace CallCenter.Application.Interfaces;

/// <summary>
/// Service for integrating with the CRM system.
/// Sends call events to CRM and retrieves customer context.
/// </summary>
public interface ICrmIntegrationService
{
    /// <summary>
    /// Sends incoming call event to CRM and retrieves screen pop data.
    /// </summary>
    /// <param name="callEvent">Incoming call details</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Screen pop data with customer context, or null if CRM unavailable</returns>
    Task<ScreenPopDto?> SendIncomingCallAsync(
        IncomingCallEvent callEvent,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Notifies CRM that a call was connected/answered.
    /// </summary>
    Task<bool> SendCallConnectedAsync(
        CallConnectedEvent callEvent,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Notifies CRM that a call has ended with disposition.
    /// </summary>
    Task<bool> SendCallEndedAsync(
        CallEndedEvent callEvent,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Notifies CRM that call recording is available.
    /// </summary>
    Task<bool> SendRecordingReadyAsync(
        RecordingReadyEvent recordingEvent,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends call transcript to CRM.
    /// </summary>
    Task<bool> SendTranscriptReadyAsync(
        TranscriptReadyEvent transcriptEvent,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends AI QA analysis results to CRM.
    /// </summary>
    Task<bool> SendAiQaReadyAsync(
        AiQaReadyEvent qaEvent,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if CRM integration is enabled and available.
    /// </summary>
    bool IsEnabled { get; }
}
