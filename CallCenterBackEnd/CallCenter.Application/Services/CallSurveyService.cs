using System.Security.Cryptography;
using CallCenter.Application.DTOs.CallSurvey;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CallCenter.Application.Services;

public class CallSurveyService : ICallSurveyService
{
    private readonly ICallSurveyRepository _repository;
    private readonly IAgentRepository _agentRepository;
    private readonly IEncryptionService _encryptionService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CallSurveyService> _logger;

    // Question texts
    private const string QuestionTextEnglish = "Was your request handled successfully? Rate 1-5";
    private const string QuestionTextArabic = "هل تم معالجة طلبك بنجاح؟ قيّم من 1 إلى 5";

    public CallSurveyService(
        ICallSurveyRepository repository,
        IAgentRepository agentRepository,
        IEncryptionService encryptionService,
        IConfiguration configuration,
        ILogger<CallSurveyService> logger)
    {
        _repository = repository;
        _agentRepository = agentRepository;
        _encryptionService = encryptionService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<CreateCallSurveyResponse> CreateSurveyAsync(
        string callId,
        CreateCallSurveyRequest request,
        CancellationToken cancellationToken = default)
    {
        // Check if survey already exists for this call
        if (await _repository.ExistsForCallAsync(callId, cancellationToken))
        {
            var existing = await _repository.GetByCallIdAsync(callId, cancellationToken);
            if (existing != null)
            {
                _logger.LogWarning("Survey already exists for call {CallId}", callId);
                return new CreateCallSurveyResponse
                {
                    SurveyId = existing.Id,
                    CallId = existing.CallId,
                    Token = existing.Token,
                    Status = existing.Status.ToString(),
                    ExpiresAt = existing.ExpiresAt,
                    SurveyUrl = GenerateSurveyUrl(existing.Token)
                };
            }
        }

        // Determine if customer is eligible (has contact info)
        var status = string.IsNullOrEmpty(request.CustomerContact)
            ? CallSurveyStatus.NotEligible
            : CallSurveyStatus.Pending;

        // Generate secure token
        var token = GenerateSecureToken();

        // Mask customer contact for privacy (display)
        var maskedContact = MaskContact(request.CustomerContact);

        // Encrypt customer contact for secure storage (for message sending)
        string? encryptedContact = null;
        if (!string.IsNullOrEmpty(request.CustomerContact))
        {
            try
            {
                encryptedContact = _encryptionService.Encrypt(request.CustomerContact);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to encrypt customer contact for survey");
            }
        }

        var survey = new CallSurvey
        {
            Id = Guid.NewGuid(),
            CallId = callId,
            AgentId = request.AgentId,
            QueueId = request.QueueId,
            Direction = request.Direction,
            CustomerContactMasked = maskedContact,
            CustomerContactEncrypted = encryptedContact,
            Channel = request.Channel,
            QuestionCode = "RESOLUTION_SUCCESS_1_5",
            Status = status,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(request.ExpiryHours > 0 ? request.ExpiryHours : 24),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(survey);
        await _repository.SaveChangesAsync();

        _logger.LogInformation("Created survey {SurveyId} for call {CallId} with status {Status}",
            survey.Id, callId, status);

        return new CreateCallSurveyResponse
        {
            SurveyId = survey.Id,
            CallId = survey.CallId,
            Token = survey.Token,
            Status = survey.Status.ToString(),
            ExpiresAt = survey.ExpiresAt,
            SurveyUrl = GenerateSurveyUrl(survey.Token)
        };
    }

    public async Task<SurveyPageDto?> GetSurveyByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var survey = await _repository.GetByTokenAsync(token, cancellationToken);
        if (survey == null) return null;

        var isExpired = survey.ExpiresAt < DateTime.UtcNow;
        var isCompleted = survey.Status == CallSurveyStatus.Completed;

        return new SurveyPageDto
        {
            Token = survey.Token,
            Status = survey.Status.ToString(),
            QuestionCode = survey.QuestionCode,
            QuestionText = QuestionTextEnglish,
            QuestionTextArabic = QuestionTextArabic,
            IsExpired = isExpired,
            IsCompleted = isCompleted,
            Rating = survey.Rating,
            RespondedAt = survey.RespondedAt
        };
    }

    public async Task<SubmitRatingResponse?> SubmitRatingAsync(
        string token,
        SubmitRatingRequest request,
        CancellationToken cancellationToken = default)
    {
        var survey = await _repository.GetByTokenAsync(token, cancellationToken);
        if (survey == null)
        {
            _logger.LogWarning("Survey not found for token");
            return null;
        }

        // Validate rating
        if (request.Rating < 1 || request.Rating > 5)
        {
            _logger.LogWarning("Invalid rating {Rating} for survey {SurveyId}", request.Rating, survey.Id);
            return null;
        }

        // Check if expired
        if (survey.ExpiresAt < DateTime.UtcNow)
        {
            _logger.LogWarning("Survey {SurveyId} is expired", survey.Id);
            // Update status to expired if not already
            if (survey.Status != CallSurveyStatus.Expired)
            {
                survey.Status = CallSurveyStatus.Expired;
                survey.UpdatedAt = DateTime.UtcNow;
                await _repository.SaveChangesAsync();
            }
            return null;
        }

        // Idempotency: if already completed, return existing rating (first submit wins)
        if (survey.Status == CallSurveyStatus.Completed)
        {
            _logger.LogInformation("Survey {SurveyId} already completed, returning existing rating", survey.Id);
            return new SubmitRatingResponse
            {
                CallId = survey.CallId,
                Status = survey.Status.ToString(),
                Rating = survey.Rating!.Value,
                RespondedAt = survey.RespondedAt!.Value
            };
        }

        // Submit the rating
        survey.Rating = request.Rating;
        survey.Status = CallSurveyStatus.Completed;
        survey.RespondedAt = DateTime.UtcNow;
        survey.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync();

        _logger.LogInformation("Survey {SurveyId} completed with rating {Rating}", survey.Id, request.Rating);

        return new SubmitRatingResponse
        {
            CallId = survey.CallId,
            Status = survey.Status.ToString(),
            Rating = survey.Rating.Value,
            RespondedAt = survey.RespondedAt.Value
        };
    }

    public async Task<CallSurveyDto?> GetByCallIdAsync(string callId, CancellationToken cancellationToken = default)
    {
        var survey = await _repository.GetByCallIdAsync(callId, cancellationToken);
        return survey != null ? MapToDto(survey) : null;
    }

    public async Task<bool> SurveyExistsForCallAsync(string callId, CancellationToken cancellationToken = default)
    {
        return await _repository.ExistsForCallAsync(callId, cancellationToken);
    }

    public async Task<bool> MarkAsSentAsync(Guid surveyId, string? providerMessageId = null, CancellationToken cancellationToken = default)
    {
        var surveys = await _repository.GetAllAsync();
        var survey = surveys.FirstOrDefault(s => s.Id == surveyId);
        if (survey == null) return false;

        survey.Status = CallSurveyStatus.Sent;
        survey.SentAt = DateTime.UtcNow;
        survey.ProviderMessageId = providerMessageId;
        survey.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync();
        _logger.LogInformation("Survey {SurveyId} marked as sent", surveyId);
        return true;
    }

    public async Task<bool> MarkAsFailedAsync(Guid surveyId, string error, CancellationToken cancellationToken = default)
    {
        var surveys = await _repository.GetAllAsync();
        var survey = surveys.FirstOrDefault(s => s.Id == surveyId);
        if (survey == null) return false;

        survey.Status = CallSurveyStatus.Failed;
        survey.LastError = error;
        survey.RetryCount++;
        survey.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync();
        _logger.LogWarning("Survey {SurveyId} marked as failed: {Error}", surveyId, error);
        return true;
    }

    public async Task<int> ProcessExpiredSurveysAsync(CancellationToken cancellationToken = default)
    {
        var expiredSurveys = await _repository.GetExpiredSurveysAsync(cancellationToken);
        var count = 0;

        foreach (var survey in expiredSurveys)
        {
            survey.Status = CallSurveyStatus.Expired;
            survey.UpdatedAt = DateTime.UtcNow;
            count++;
        }

        if (count > 0)
        {
            await _repository.SaveChangesAsync();
            _logger.LogInformation("Marked {Count} surveys as expired", count);
        }

        return count;
    }

    public async Task<SurveyStatsDto> GetStatsAsync(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default)
    {
        var surveys = await _repository.GetAllAsync();
        var filtered = surveys
            .Where(s => s.CreatedAt >= fromDate && s.CreatedAt <= toDate)
            .ToList();

        var completed = filtered.Where(s => s.Status == CallSurveyStatus.Completed).ToList();

        return new SurveyStatsDto
        {
            TotalSurveys = filtered.Count,
            CompletedCount = completed.Count,
            PendingCount = filtered.Count(s => s.Status == CallSurveyStatus.Pending || s.Status == CallSurveyStatus.Sent),
            ExpiredCount = filtered.Count(s => s.Status == CallSurveyStatus.Expired),
            FailedCount = filtered.Count(s => s.Status == CallSurveyStatus.Failed),
            ResponseRate = filtered.Count > 0 ? Math.Round((double)completed.Count / filtered.Count * 100, 2) : 0,
            AverageRating = completed.Count > 0 ? Math.Round(completed.Average(s => s.Rating ?? 0), 2) : 0,
            RatingDistribution = completed
                .Where(s => s.Rating.HasValue)
                .GroupBy(s => s.Rating!.Value)
                .ToDictionary(g => g.Key, g => g.Count())
        };
    }

    public async Task<List<AgentSurveyStatsDto>> GetAgentStatsAsync(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default)
    {
        var surveys = await _repository.GetAllAsync();
        var agents = await _agentRepository.GetAllAsync();

        var agentStats = surveys
            .Where(s => s.CreatedAt >= fromDate && s.CreatedAt <= toDate)
            .Where(s => s.AgentId.HasValue)
            .GroupBy(s => s.AgentId!.Value)
            .Select(g =>
            {
                var completed = g.Where(s => s.Status == CallSurveyStatus.Completed).ToList();
                var agent = agents.FirstOrDefault(a => a.Id == g.Key);
                return new AgentSurveyStatsDto
                {
                    AgentId = g.Key,
                    AgentName = agent?.Name ?? "Unknown",
                    TotalSurveys = g.Count(),
                    CompletedCount = completed.Count,
                    ResponseRate = g.Count() > 0 ? Math.Round((double)completed.Count / g.Count() * 100, 2) : 0,
                    AverageRating = completed.Count > 0 ? Math.Round(completed.Average(s => s.Rating ?? 0), 2) : 0
                };
            })
            .OrderByDescending(s => s.AverageRating)
            .ToList();

        return agentStats;
    }

    public async Task<SurveyReportDto> GetReportAsync(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default)
    {
        var surveys = await _repository.GetAllAsync();
        var agents = await _agentRepository.GetAllAsync();

        var filtered = surveys
            .Where(s => s.CreatedAt >= fromDate && s.CreatedAt <= toDate)
            .ToList();

        // Overall stats
        var completed = filtered.Where(s => s.Status == CallSurveyStatus.Completed).ToList();
        var overallStats = new SurveyStatsDto
        {
            TotalSurveys = filtered.Count,
            CompletedCount = completed.Count,
            PendingCount = filtered.Count(s => s.Status == CallSurveyStatus.Pending || s.Status == CallSurveyStatus.Sent),
            ExpiredCount = filtered.Count(s => s.Status == CallSurveyStatus.Expired),
            FailedCount = filtered.Count(s => s.Status == CallSurveyStatus.Failed),
            ResponseRate = filtered.Count > 0 ? Math.Round((double)completed.Count / filtered.Count * 100, 2) : 0,
            AverageRating = completed.Count > 0 ? Math.Round(completed.Average(s => s.Rating ?? 0), 2) : 0,
            RatingDistribution = completed
                .Where(s => s.Rating.HasValue)
                .GroupBy(s => s.Rating!.Value)
                .ToDictionary(g => g.Key, g => g.Count())
        };

        // Daily trends
        var dailyTrends = filtered
            .GroupBy(s => s.CreatedAt.Date)
            .OrderBy(g => g.Key)
            .Select(g =>
            {
                var dayCompleted = g.Where(s => s.Status == CallSurveyStatus.Completed).ToList();
                return new DailyTrendDto
                {
                    Date = g.Key,
                    TotalSurveys = g.Count(),
                    CompletedCount = dayCompleted.Count,
                    ResponseRate = g.Count() > 0 ? Math.Round((double)dayCompleted.Count / g.Count() * 100, 2) : 0,
                    AverageRating = dayCompleted.Count > 0 ? Math.Round(dayCompleted.Average(s => s.Rating ?? 0), 2) : 0
                };
            })
            .ToList();

        // Agent stats
        var agentStats = filtered
            .Where(s => s.AgentId.HasValue)
            .GroupBy(s => s.AgentId!.Value)
            .Select(g =>
            {
                var agentCompleted = g.Where(s => s.Status == CallSurveyStatus.Completed).ToList();
                var agent = agents.FirstOrDefault(a => a.Id == g.Key);
                return new AgentSurveyStatsDto
                {
                    AgentId = g.Key,
                    AgentName = agent?.Name ?? "Unknown",
                    TotalSurveys = g.Count(),
                    CompletedCount = agentCompleted.Count,
                    ResponseRate = g.Count() > 0 ? Math.Round((double)agentCompleted.Count / g.Count() * 100, 2) : 0,
                    AverageRating = agentCompleted.Count > 0 ? Math.Round(agentCompleted.Average(s => s.Rating ?? 0), 2) : 0
                };
            })
            .ToList();

        // Top and bottom agents (by average rating, min 3 completed surveys)
        var rankedAgents = agentStats.Where(a => a.CompletedCount >= 3).OrderByDescending(a => a.AverageRating).ToList();
        var topAgents = rankedAgents.Take(5).ToList();
        var bottomAgents = rankedAgents.TakeLast(5).Reverse().ToList();

        // Channel breakdown
        var channelBreakdown = filtered
            .GroupBy(s => s.Channel ?? "Unknown")
            .ToDictionary(g => g.Key, g => g.Count());

        // Direction breakdown
        var directionBreakdown = filtered
            .Where(s => !string.IsNullOrEmpty(s.Direction))
            .GroupBy(s => s.Direction!)
            .ToDictionary(g => g.Key, g => g.Count());

        return new SurveyReportDto
        {
            OverallStats = overallStats,
            DailyTrends = dailyTrends,
            TopAgents = topAgents,
            BottomAgents = bottomAgents,
            ChannelBreakdown = channelBreakdown,
            DirectionBreakdown = directionBreakdown
        };
    }

    public async Task<SurveyListResponse> GetSurveyListAsync(SurveyListFilter filter, CancellationToken cancellationToken = default)
    {
        var surveys = await _repository.GetAllAsync();
        var query = surveys.AsQueryable();

        // Apply filters
        if (filter.FromDate.HasValue)
            query = query.Where(s => s.CreatedAt >= filter.FromDate.Value);

        if (filter.ToDate.HasValue)
            query = query.Where(s => s.CreatedAt <= filter.ToDate.Value);

        if (filter.AgentId.HasValue)
            query = query.Where(s => s.AgentId == filter.AgentId.Value);

        if (!string.IsNullOrEmpty(filter.Status) && Enum.TryParse<CallSurveyStatus>(filter.Status, true, out var status))
            query = query.Where(s => s.Status == status);

        if (filter.MinRating.HasValue)
            query = query.Where(s => s.Rating >= filter.MinRating.Value);

        if (filter.MaxRating.HasValue)
            query = query.Where(s => s.Rating <= filter.MaxRating.Value);

        if (!string.IsNullOrEmpty(filter.Channel))
            query = query.Where(s => s.Channel == filter.Channel);

        if (!string.IsNullOrEmpty(filter.Direction))
            query = query.Where(s => s.Direction == filter.Direction);

        // Get total count before pagination
        var totalCount = query.Count();

        // Apply pagination
        var items = query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(MapToDto)
            .ToList();

        return new SurveyListResponse
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize)
        };
    }

    public string GenerateSurveyUrl(string token)
    {
        var baseUrl = _configuration["App:BaseUrl"] ?? "https://localhost";
        return $"{baseUrl}/survey/{token}";
    }

    #region Private Methods

    private static string GenerateSecureToken()
    {
        // Generate 32 bytes of random data and convert to URL-safe base64
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }

    private static string? MaskContact(string? contact)
    {
        if (string.IsNullOrEmpty(contact)) return null;

        // Mask phone number: +966xxxxxxx123 -> +966****123
        if (contact.StartsWith("+") && contact.Length > 6)
        {
            var prefix = contact.Substring(0, 4);
            var suffix = contact.Substring(contact.Length - 3);
            var masked = new string('*', contact.Length - 7);
            return $"{prefix}{masked}{suffix}";
        }

        // Mask email: user@example.com -> u***@example.com
        if (contact.Contains("@"))
        {
            var parts = contact.Split('@');
            if (parts[0].Length > 1)
            {
                var masked = parts[0][0] + new string('*', parts[0].Length - 1);
                return $"{masked}@{parts[1]}";
            }
        }

        return contact;
    }

    private static CallSurveyDto MapToDto(CallSurvey survey) => new()
    {
        Id = survey.Id,
        CallId = survey.CallId,
        AgentId = survey.AgentId,
        AgentName = survey.Agent?.Name,
        QueueId = survey.QueueId,
        Direction = survey.Direction,
        CustomerContactMasked = survey.CustomerContactMasked,
        Channel = survey.Channel,
        QuestionCode = survey.QuestionCode,
        Rating = survey.Rating,
        Status = survey.Status.ToString(),
        SentAt = survey.SentAt,
        RespondedAt = survey.RespondedAt,
        ExpiresAt = survey.ExpiresAt,
        RetryCount = survey.RetryCount,
        LastError = survey.LastError,
        CreatedAt = survey.CreatedAt
    };

    #endregion
}
