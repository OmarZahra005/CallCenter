using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.CallSurvey;

/// <summary>
/// Request to create a post-call survey
/// </summary>
public class CreateCallSurveyRequest
{
    public Guid? AgentId { get; set; }
    public Guid? QueueId { get; set; }
    public string? Direction { get; set; }
    public string? CustomerContact { get; set; }
    public string Channel { get; set; } = "SMS";
    public int ExpiryHours { get; set; } = 24;
}

/// <summary>
/// Response after creating a survey
/// </summary>
public class CreateCallSurveyResponse
{
    public Guid SurveyId { get; set; }
    public string CallId { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public string? SurveyUrl { get; set; }
}

/// <summary>
/// Public survey data for the rating page
/// </summary>
public class SurveyPageDto
{
    public string Token { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string QuestionCode { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionTextArabic { get; set; } = string.Empty;
    public bool IsExpired { get; set; }
    public bool IsCompleted { get; set; }
    public byte? Rating { get; set; }
    public DateTime? RespondedAt { get; set; }
}

/// <summary>
/// Request to submit a rating
/// </summary>
public class SubmitRatingRequest
{
    public byte Rating { get; set; }
}

/// <summary>
/// Response after submitting a rating
/// </summary>
public class SubmitRatingResponse
{
    public string CallId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public byte Rating { get; set; }
    public DateTime RespondedAt { get; set; }
}

/// <summary>
/// Full survey details for admin/reporting
/// </summary>
public class CallSurveyDto
{
    public Guid Id { get; set; }
    public string CallId { get; set; } = string.Empty;
    public Guid? AgentId { get; set; }
    public string? AgentName { get; set; }
    public Guid? QueueId { get; set; }
    public string? Direction { get; set; }
    public string? CustomerContactMasked { get; set; }
    public string Channel { get; set; } = string.Empty;
    public string QuestionCode { get; set; } = string.Empty;
    public byte? Rating { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? SentAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public int RetryCount { get; set; }
    public string? LastError { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Survey statistics for reporting
/// </summary>
public class SurveyStatsDto
{
    public int TotalSurveys { get; set; }
    public int CompletedCount { get; set; }
    public int PendingCount { get; set; }
    public int ExpiredCount { get; set; }
    public int FailedCount { get; set; }
    public double ResponseRate { get; set; }
    public double AverageRating { get; set; }
    public Dictionary<byte, int> RatingDistribution { get; set; } = new();
}

/// <summary>
/// Agent survey statistics
/// </summary>
public class AgentSurveyStatsDto
{
    public Guid AgentId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public int TotalSurveys { get; set; }
    public int CompletedCount { get; set; }
    public double ResponseRate { get; set; }
    public double AverageRating { get; set; }
}

/// <summary>
/// Daily survey trend data point
/// </summary>
public class DailyTrendDto
{
    public DateTime Date { get; set; }
    public int TotalSurveys { get; set; }
    public int CompletedCount { get; set; }
    public double ResponseRate { get; set; }
    public double AverageRating { get; set; }
}

/// <summary>
/// Comprehensive survey report with trends
/// </summary>
public class SurveyReportDto
{
    public SurveyStatsDto OverallStats { get; set; } = new();
    public List<DailyTrendDto> DailyTrends { get; set; } = new();
    public List<AgentSurveyStatsDto> TopAgents { get; set; } = new();
    public List<AgentSurveyStatsDto> BottomAgents { get; set; } = new();
    public Dictionary<string, int> ChannelBreakdown { get; set; } = new();
    public Dictionary<string, int> DirectionBreakdown { get; set; } = new();
}

/// <summary>
/// Filter parameters for survey list
/// </summary>
public class SurveyListFilter
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Guid? AgentId { get; set; }
    public string? Status { get; set; }
    public byte? MinRating { get; set; }
    public byte? MaxRating { get; set; }
    public string? Channel { get; set; }
    public string? Direction { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Paginated survey list response
/// </summary>
public class SurveyListResponse
{
    public List<CallSurveyDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}
