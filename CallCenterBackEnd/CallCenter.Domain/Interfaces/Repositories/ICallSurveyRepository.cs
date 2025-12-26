using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ICallSurveyRepository : IRepository<CallSurvey>
{
    /// <summary>
    /// Get survey by unique token (for public URL)
    /// </summary>
    Task<CallSurvey?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get survey by call ID (one survey per call)
    /// </summary>
    Task<CallSurvey?> GetByCallIdAsync(string callId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get surveys by status (for processing pending, expiring, etc.)
    /// </summary>
    Task<List<CallSurvey>> GetByStatusAsync(CallSurveyStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get expired pending surveys that need to be marked as expired
    /// </summary>
    Task<List<CallSurvey>> GetExpiredSurveysAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get surveys for an agent (for reporting)
    /// </summary>
    Task<List<CallSurvey>> GetByAgentIdAsync(Guid agentId, DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get surveys for a queue (for reporting)
    /// </summary>
    Task<List<CallSurvey>> GetByQueueIdAsync(Guid queueId, DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get completed surveys with ratings for reporting
    /// </summary>
    Task<List<CallSurvey>> GetCompletedSurveysAsync(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if survey already exists for a call
    /// </summary>
    Task<bool> ExistsForCallAsync(string callId, CancellationToken cancellationToken = default);
}
