namespace CallCenter.Application.Services;

/// <summary>
/// Service for sending post-call survey messages via SMS or WhatsApp
/// </summary>
public interface ISurveyMessageService
{
    /// <summary>
    /// Send survey link to customer via the specified channel
    /// </summary>
    /// <param name="surveyId">Survey ID to send</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if message was sent successfully</returns>
    Task<bool> SendSurveyMessageAsync(Guid surveyId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Process all pending surveys and send messages
    /// Called by background job or manual trigger
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of surveys processed</returns>
    Task<int> ProcessPendingSurveysAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Retry failed survey messages
    /// </summary>
    /// <param name="maxRetries">Maximum retry attempts (default 3)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of surveys retried</returns>
    Task<int> RetryFailedSurveysAsync(int maxRetries = 3, CancellationToken cancellationToken = default);
}
