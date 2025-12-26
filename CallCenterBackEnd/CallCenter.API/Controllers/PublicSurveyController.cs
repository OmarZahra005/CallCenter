using CallCenter.Application.DTOs.CallSurvey;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CallCenter.API.Controllers;

/// <summary>
/// Public API for customer survey submissions
/// No authentication required - secured by unique token
/// </summary>
[ApiController]
[Route("api/surveys")]
public class PublicSurveyController : ControllerBase
{
    private readonly ICallSurveyService _surveyService;
    private readonly ILogger<PublicSurveyController> _logger;

    public PublicSurveyController(
        ICallSurveyService surveyService,
        ILogger<PublicSurveyController> logger)
    {
        _surveyService = surveyService;
        _logger = logger;
    }

    /// <summary>
    /// Get survey data for the rating page
    /// Public endpoint - no auth required, secured by token
    /// </summary>
    /// <param name="token">Unique survey token from the URL</param>
    [HttpGet("{token}")]
    [ProducesResponseType(typeof(SurveyPageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status410Gone)]
    public async Task<IActionResult> GetSurvey(string token, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(token) || token.Length < 20)
        {
            _logger.LogWarning("Invalid token format received");
            return NotFound(new { error = "Invalid survey link" });
        }

        var survey = await _surveyService.GetSurveyByTokenAsync(token, cancellationToken);

        if (survey == null)
        {
            _logger.LogWarning("Survey not found for token");
            return NotFound(new SurveyErrorResponse
            {
                Error = "survey_not_found",
                Message = "This survey link is invalid.",
                MessageArabic = "رابط الاستبيان غير صالح."
            });
        }

        if (survey.IsExpired)
        {
            return StatusCode(410, new SurveyErrorResponse
            {
                Error = "survey_expired",
                Message = "This survey has expired.",
                MessageArabic = "انتهت صلاحية هذا الاستبيان."
            });
        }

        return Ok(survey);
    }

    /// <summary>
    /// Submit a rating for a survey
    /// Public endpoint - no auth required, secured by token
    /// Idempotent: first submit wins, subsequent attempts return the existing rating
    /// </summary>
    /// <param name="token">Unique survey token</param>
    /// <param name="request">Rating (1-5)</param>
    [HttpPost("{token}/submit")]
    [ProducesResponseType(typeof(SubmitRatingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status410Gone)]
    public async Task<IActionResult> SubmitRating(
        string token,
        [FromBody] SubmitRatingRequest request,
        CancellationToken cancellationToken)
    {
        // Validate token format
        if (string.IsNullOrEmpty(token) || token.Length < 20)
        {
            _logger.LogWarning("Invalid token format for rating submission");
            return NotFound(new SurveyErrorResponse
            {
                Error = "invalid_token",
                Message = "Invalid survey link.",
                MessageArabic = "رابط الاستبيان غير صالح."
            });
        }

        // Validate rating
        if (request.Rating < 1 || request.Rating > 5)
        {
            return BadRequest(new SurveyErrorResponse
            {
                Error = "invalid_rating",
                Message = "Rating must be between 1 and 5.",
                MessageArabic = "يجب أن يكون التقييم بين 1 و 5."
            });
        }

        // Check if survey exists and get its state
        var surveyState = await _surveyService.GetSurveyByTokenAsync(token, cancellationToken);
        if (surveyState == null)
        {
            return NotFound(new SurveyErrorResponse
            {
                Error = "survey_not_found",
                Message = "This survey link is invalid.",
                MessageArabic = "رابط الاستبيان غير صالح."
            });
        }

        if (surveyState.IsExpired)
        {
            return StatusCode(410, new SurveyErrorResponse
            {
                Error = "survey_expired",
                Message = "This survey has expired.",
                MessageArabic = "انتهت صلاحية هذا الاستبيان."
            });
        }

        // Submit the rating
        var result = await _surveyService.SubmitRatingAsync(token, request, cancellationToken);

        if (result == null)
        {
            _logger.LogError("Failed to submit rating for token");
            return StatusCode(500, new SurveyErrorResponse
            {
                Error = "submission_failed",
                Message = "Failed to submit your rating. Please try again.",
                MessageArabic = "فشل في إرسال تقييمك. يرجى المحاولة مرة أخرى."
            });
        }

        _logger.LogInformation("Rating {Rating} submitted for call {CallId}", result.Rating, result.CallId);

        return Ok(new SubmitRatingSuccessResponse
        {
            CallId = result.CallId,
            Status = result.Status,
            Rating = result.Rating,
            RespondedAt = result.RespondedAt,
            Message = "Thank you for your feedback!",
            MessageArabic = "شكراً لملاحظاتك!"
        });
    }
}

/// <summary>
/// Error response for public survey endpoints
/// </summary>
public class SurveyErrorResponse
{
    public string Error { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string MessageArabic { get; set; } = string.Empty;
}

/// <summary>
/// Success response for rating submission
/// </summary>
public class SubmitRatingSuccessResponse
{
    public string CallId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public byte Rating { get; set; }
    public DateTime RespondedAt { get; set; }
    public string Message { get; set; } = string.Empty;
    public string MessageArabic { get; set; } = string.Empty;
}
