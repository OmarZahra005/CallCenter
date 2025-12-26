using CallCenter.Application.DTOs.CallSurvey;

namespace CallCenter.Application.Services;

public interface ICallSurveyService
{
    /// <summary>
    /// Create a new post-call survey for a call
    /// </summary>
    Task<CreateCallSurveyResponse> CreateSurveyAsync(string callId, CreateCallSurveyRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get survey data for the public rating page
    /// </summary>
    Task<SurveyPageDto?> GetSurveyByTokenAsync(string token, CancellationToken cancellationToken = default);

    /// <summary>
    /// Submit a rating for a survey (public endpoint)
    /// </summary>
    Task<SubmitRatingResponse?> SubmitRatingAsync(string token, SubmitRatingRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get survey by call ID
    /// </summary>
    Task<CallSurveyDto?> GetByCallIdAsync(string callId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if a survey already exists for a call
    /// </summary>
    Task<bool> SurveyExistsForCallAsync(string callId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Mark survey as sent after message is delivered
    /// </summary>
    Task<bool> MarkAsSentAsync(Guid surveyId, string? providerMessageId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Mark survey as failed with error message
    /// </summary>
    Task<bool> MarkAsFailedAsync(Guid surveyId, string error, CancellationToken cancellationToken = default);

    /// <summary>
    /// Process expired surveys (background job)
    /// </summary>
    Task<int> ProcessExpiredSurveysAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get survey statistics for a date range
    /// </summary>
    Task<SurveyStatsDto> GetStatsAsync(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get agent survey statistics
    /// </summary>
    Task<List<AgentSurveyStatsDto>> GetAgentStatsAsync(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get comprehensive survey report with trends
    /// </summary>
    Task<SurveyReportDto> GetReportAsync(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get paginated list of surveys with filtering
    /// </summary>
    Task<SurveyListResponse> GetSurveyListAsync(SurveyListFilter filter, CancellationToken cancellationToken = default);

    /// <summary>
    /// Generate the survey URL for a token
    /// </summary>
    string GenerateSurveyUrl(string token);
}
