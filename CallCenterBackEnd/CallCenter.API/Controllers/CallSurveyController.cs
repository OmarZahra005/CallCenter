using CallCenter.Application.DTOs.CallSurvey;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

/// <summary>
/// Internal API for managing post-call customer surveys (CSAT 1-5)
/// Requires authentication
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CallSurveyController : ControllerBase
{
    private readonly ICallSurveyService _surveyService;
    private readonly ISurveyMessageService _messageService;
    private readonly ILogger<CallSurveyController> _logger;

    public CallSurveyController(
        ICallSurveyService surveyService,
        ISurveyMessageService messageService,
        ILogger<CallSurveyController> logger)
    {
        _surveyService = surveyService;
        _messageService = messageService;
        _logger = logger;
    }

    /// <summary>
    /// Create a survey for a call (internal use - typically called after call ends)
    /// </summary>
    /// <param name="callId">The call ID to create survey for</param>
    /// <param name="request">Survey creation options</param>
    [HttpPost("/api/calls/{callId}/survey/create")]
    [ProducesResponseType(typeof(CreateCallSurveyResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSurvey(
        string callId,
        [FromBody] CreateCallSurveyRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(callId))
            return BadRequest(new { error = "CallId is required" });

        try
        {
            var result = await _surveyService.CreateSurveyAsync(callId, request, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating survey for call {CallId}", callId);
            return StatusCode(500, new { error = "Failed to create survey" });
        }
    }

    /// <summary>
    /// Get survey by call ID
    /// </summary>
    [HttpGet("by-call/{callId}")]
    [ProducesResponseType(typeof(CallSurveyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByCallId(string callId, CancellationToken cancellationToken)
    {
        var survey = await _surveyService.GetByCallIdAsync(callId, cancellationToken);
        if (survey == null)
            return NotFound(new { error = "Survey not found for this call" });

        return Ok(survey);
    }

    /// <summary>
    /// Check if survey exists for a call
    /// </summary>
    [HttpGet("exists/{callId}")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> SurveyExists(string callId, CancellationToken cancellationToken)
    {
        var exists = await _surveyService.SurveyExistsForCallAsync(callId, cancellationToken);
        return Ok(new { callId, exists });
    }

    /// <summary>
    /// Mark survey as sent (after message delivery)
    /// </summary>
    [HttpPost("{surveyId:guid}/mark-sent")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsSent(
        Guid surveyId,
        [FromBody] MarkSentRequest? request,
        CancellationToken cancellationToken)
    {
        var success = await _surveyService.MarkAsSentAsync(
            surveyId,
            request?.ProviderMessageId,
            cancellationToken);

        if (!success)
            return NotFound(new { error = "Survey not found" });

        return Ok(new { surveyId, status = "Sent" });
    }

    /// <summary>
    /// Mark survey as failed (after message delivery failure)
    /// </summary>
    [HttpPost("{surveyId:guid}/mark-failed")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsFailed(
        Guid surveyId,
        [FromBody] MarkFailedRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.Error))
            return BadRequest(new { error = "Error message is required" });

        var success = await _surveyService.MarkAsFailedAsync(surveyId, request.Error, cancellationToken);

        if (!success)
            return NotFound(new { error = "Survey not found" });

        return Ok(new { surveyId, status = "Failed" });
    }

    /// <summary>
    /// Process expired surveys (for background job or manual trigger)
    /// </summary>
    [HttpPost("process-expired")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> ProcessExpired(CancellationToken cancellationToken)
    {
        var count = await _surveyService.ProcessExpiredSurveysAsync(cancellationToken);
        return Ok(new { processedCount = count, message = $"Marked {count} surveys as expired" });
    }

    /// <summary>
    /// Get survey statistics for a date range
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(SurveyStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken cancellationToken)
    {
        var from = fromDate ?? DateTime.UtcNow.AddDays(-30);
        var to = toDate ?? DateTime.UtcNow;

        var stats = await _surveyService.GetStatsAsync(from, to, cancellationToken);
        return Ok(stats);
    }

    /// <summary>
    /// Get agent survey statistics
    /// </summary>
    [HttpGet("stats/agents")]
    [ProducesResponseType(typeof(List<AgentSurveyStatsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAgentStats(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken cancellationToken)
    {
        var from = fromDate ?? DateTime.UtcNow.AddDays(-30);
        var to = toDate ?? DateTime.UtcNow;

        var stats = await _surveyService.GetAgentStatsAsync(from, to, cancellationToken);
        return Ok(stats);
    }

    /// <summary>
    /// Get comprehensive survey report with trends, breakdowns, and agent rankings
    /// </summary>
    [HttpGet("report")]
    [ProducesResponseType(typeof(SurveyReportDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReport(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken cancellationToken)
    {
        var from = fromDate ?? DateTime.UtcNow.AddDays(-30);
        var to = toDate ?? DateTime.UtcNow;

        var report = await _surveyService.GetReportAsync(from, to, cancellationToken);
        return Ok(report);
    }

    /// <summary>
    /// Get paginated list of surveys with filtering options
    /// </summary>
    [HttpGet("list")]
    [ProducesResponseType(typeof(SurveyListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSurveyList(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] Guid? agentId,
        [FromQuery] string? status,
        [FromQuery] byte? minRating,
        [FromQuery] byte? maxRating,
        [FromQuery] string? channel,
        [FromQuery] string? direction,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var filter = new SurveyListFilter
        {
            FromDate = fromDate,
            ToDate = toDate,
            AgentId = agentId,
            Status = status,
            MinRating = minRating,
            MaxRating = maxRating,
            Channel = channel,
            Direction = direction,
            Page = page,
            PageSize = Math.Min(pageSize, 100) // Cap at 100
        };

        var result = await _surveyService.GetSurveyListAsync(filter, cancellationToken);
        return Ok(result);
    }

    #region Message Sending Endpoints

    /// <summary>
    /// Send survey message to a specific survey
    /// </summary>
    [HttpPost("{surveyId:guid}/send")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SendSurveyMessage(
        Guid surveyId,
        CancellationToken cancellationToken)
    {
        var success = await _messageService.SendSurveyMessageAsync(surveyId, cancellationToken);

        if (!success)
        {
            return BadRequest(new { error = "Failed to send survey message", surveyId });
        }

        return Ok(new { surveyId, message = "Survey message sent successfully" });
    }

    /// <summary>
    /// Process all pending surveys and send messages
    /// Can be called by a background job or manually triggered
    /// </summary>
    [HttpPost("send-pending")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> ProcessPendingSurveys(CancellationToken cancellationToken)
    {
        var processedCount = await _messageService.ProcessPendingSurveysAsync(cancellationToken);
        return Ok(new { processedCount, message = $"Processed {processedCount} pending surveys" });
    }

    /// <summary>
    /// Retry failed survey messages
    /// </summary>
    [HttpPost("retry-failed")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> RetryFailedSurveys(
        [FromQuery] int maxRetries = 3,
        CancellationToken cancellationToken = default)
    {
        var retriedCount = await _messageService.RetryFailedSurveysAsync(maxRetries, cancellationToken);
        return Ok(new { retriedCount, message = $"Retried {retriedCount} failed surveys" });
    }

    #endregion
}

/// <summary>
/// Request to mark survey as sent
/// </summary>
public class MarkSentRequest
{
    public string? ProviderMessageId { get; set; }
}

/// <summary>
/// Request to mark survey as failed
/// </summary>
public class MarkFailedRequest
{
    public string Error { get; set; } = string.Empty;
}
