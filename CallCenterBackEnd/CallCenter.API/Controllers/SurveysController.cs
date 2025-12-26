using System.Text.Json;
using CallCenter.API.Authorization;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SurveysController : ControllerBase
{
    private readonly IRepository<Survey> _surveyRepository;
    private readonly IRepository<SurveyQuestion> _questionRepository;
    private readonly IRepository<SurveyResponse> _responseRepository;
    private readonly IRepository<Customer> _customerRepository;
    private readonly IRepository<Agent> _agentRepository;

    public SurveysController(
        IRepository<Survey> surveyRepository,
        IRepository<SurveyQuestion> questionRepository,
        IRepository<SurveyResponse> responseRepository,
        IRepository<Customer> customerRepository,
        IRepository<Agent> agentRepository)
    {
        _surveyRepository = surveyRepository;
        _questionRepository = questionRepository;
        _responseRepository = responseRepository;
        _customerRepository = customerRepository;
        _agentRepository = agentRepository;
    }

    [HttpGet]
    [RequirePermission("surveys.view")]
    public async Task<ActionResult<List<SurveyDto>>> GetSurveys()
    {
        var surveys = await _surveyRepository.GetQueryable()
            .Include(s => s.Questions.OrderBy(q => q.Order))
            .Include(s => s.Responses)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        var dtos = surveys.Select(MapToSurveyDto).ToList();
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    [RequirePermission("surveys.view")]
    public async Task<ActionResult<SurveyDto>> GetSurvey(Guid id)
    {
        var survey = await _surveyRepository.GetQueryable()
            .Include(s => s.Questions.OrderBy(q => q.Order))
            .Include(s => s.Responses)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (survey == null)
            return NotFound();

        return Ok(MapToSurveyDto(survey));
    }

    [HttpPost]
    [RequirePermission("surveys.manage")]
    public async Task<ActionResult<SurveyDto>> CreateSurvey([FromBody] CreateSurveyRequest request)
    {
        var survey = new Survey
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            Trigger = request.Trigger,
            IsActive = request.IsActive,
            ThankYouMessage = request.ThankYouMessage,
            ExpirationDays = request.ExpirationDays,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _surveyRepository.AddAsync(survey);
        await _surveyRepository.SaveChangesAsync();

        // Add questions
        if (request.Questions != null)
        {
            foreach (var q in request.Questions)
            {
                var question = new SurveyQuestion
                {
                    Id = Guid.NewGuid(),
                    SurveyId = survey.Id,
                    Type = q.Type,
                    Question = q.Question,
                    Required = q.Required,
                    Options = q.Options != null ? JsonSerializer.Serialize(q.Options) : null,
                    MinValue = q.MinValue,
                    MaxValue = q.MaxValue,
                    Order = q.Order
                };
                await _questionRepository.AddAsync(question);
            }
            await _questionRepository.SaveChangesAsync();
        }

        // Reload with questions
        survey = await _surveyRepository.GetQueryable()
            .Include(s => s.Questions.OrderBy(q => q.Order))
            .FirstOrDefaultAsync(s => s.Id == survey.Id);

        return CreatedAtAction(nameof(GetSurvey), new { id = survey!.Id }, MapToSurveyDto(survey));
    }

    [HttpPut("{id}")]
    [RequirePermission("surveys.manage")]
    public async Task<ActionResult<SurveyDto>> UpdateSurvey(Guid id, [FromBody] UpdateSurveyRequest request)
    {
        var survey = await _surveyRepository.GetQueryable()
            .Include(s => s.Questions)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (survey == null)
            return NotFound();

        survey.Name = request.Name;
        survey.Description = request.Description;
        survey.Type = request.Type;
        survey.Trigger = request.Trigger;
        survey.IsActive = request.IsActive;
        survey.ThankYouMessage = request.ThankYouMessage;
        survey.ExpirationDays = request.ExpirationDays;
        survey.UpdatedAt = DateTime.UtcNow;

        _surveyRepository.Update(survey);
        await _surveyRepository.SaveChangesAsync();

        // Update questions
        if (request.Questions != null)
        {
            // Remove existing questions
            foreach (var q in survey.Questions.ToList())
            {
                _questionRepository.DeleteAsync(q);
            }
            await _questionRepository.SaveChangesAsync();

            // Add new questions
            foreach (var q in request.Questions)
            {
                var question = new SurveyQuestion
                {
                    Id = Guid.NewGuid(),
                    SurveyId = survey.Id,
                    Type = q.Type,
                    Question = q.Question,
                    Required = q.Required,
                    Options = q.Options != null ? JsonSerializer.Serialize(q.Options) : null,
                    MinValue = q.MinValue,
                    MaxValue = q.MaxValue,
                    Order = q.Order
                };
                await _questionRepository.AddAsync(question);
            }
            await _questionRepository.SaveChangesAsync();
        }

        // Reload with questions
        survey = await _surveyRepository.GetQueryable()
            .Include(s => s.Questions.OrderBy(q => q.Order))
            .Include(s => s.Responses)
            .FirstOrDefaultAsync(s => s.Id == survey.Id);

        return Ok(MapToSurveyDto(survey!));
    }

    [HttpDelete("{id}")]
    [RequirePermission("surveys.manage")]
    public async Task<ActionResult> DeleteSurvey(Guid id)
    {
        var survey = await _surveyRepository.GetQueryable()
            .FirstOrDefaultAsync(s => s.Id == id);

        if (survey == null)
            return NotFound();

        _surveyRepository.DeleteAsync(survey);
        await _surveyRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id}/status")]
    [RequirePermission("surveys.manage")]
    public async Task<ActionResult> ToggleSurveyStatus(Guid id, [FromBody] ToggleSurveyStatusRequest request)
    {
        var survey = await _surveyRepository.GetQueryable()
            .FirstOrDefaultAsync(s => s.Id == id);

        if (survey == null)
            return NotFound();

        survey.IsActive = request.IsActive;
        survey.UpdatedAt = DateTime.UtcNow;

        _surveyRepository.Update(survey);
        await _surveyRepository.SaveChangesAsync();

        return Ok(new { success = true });
    }

    // Survey Responses
    [HttpGet("{surveyId}/responses")]
    [RequirePermission("surveys.view")]
    public async Task<ActionResult<List<SurveyResponseDto>>> GetResponses(Guid surveyId)
    {
        var responses = await _responseRepository.GetQueryable()
            .Include(r => r.Customer)
            .Include(r => r.Agent)
            .Where(r => r.SurveyId == surveyId)
            .OrderByDescending(r => r.SubmittedAt)
            .ToListAsync();

        var survey = await _surveyRepository.GetQueryable()
            .Include(s => s.Questions)
            .FirstOrDefaultAsync(s => s.Id == surveyId);

        var dtos = responses.Select(r => MapToResponseDto(r, survey?.Questions.ToList())).ToList();
        return Ok(dtos);
    }

    [HttpPost("{surveyId}/responses")]
    public async Task<ActionResult<SurveyResponseDto>> SubmitResponse(Guid surveyId, [FromBody] SubmitSurveyResponseRequest request)
    {
        var survey = await _surveyRepository.GetQueryable()
            .Include(s => s.Questions)
            .FirstOrDefaultAsync(s => s.Id == surveyId);

        if (survey == null || !survey.IsActive)
            return NotFound();

        var response = new SurveyResponse
        {
            Id = Guid.NewGuid(),
            SurveyId = surveyId,
            CustomerId = request.CustomerId,
            AgentId = request.AgentId,
            Answers = JsonSerializer.Serialize(request.Answers),
            OverallScore = CalculateOverallScore(request.Answers, survey.Questions.ToList()),
            Channel = request.Channel,
            SubmittedAt = DateTime.UtcNow
        };

        await _responseRepository.AddAsync(response);
        await _responseRepository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetResponses), new { surveyId }, MapToResponseDto(response, survey.Questions.ToList()));
    }

    private static SurveyDto MapToSurveyDto(Survey survey)
    {
        var responses = survey.Responses?.ToList() ?? new List<SurveyResponse>();
        return new SurveyDto
        {
            Id = survey.Id.ToString(),
            Name = survey.Name,
            Description = survey.Description,
            Type = survey.Type,
            Trigger = survey.Trigger,
            IsActive = survey.IsActive,
            ThankYouMessage = survey.ThankYouMessage,
            ExpirationDays = survey.ExpirationDays,
            Questions = survey.Questions?.Select(MapToQuestionDto).ToList() ?? new(),
            ResponseCount = responses.Count,
            AverageScore = responses.Any() && responses.Any(r => r.OverallScore.HasValue)
                ? (double)responses.Where(r => r.OverallScore.HasValue).Average(r => r.OverallScore!.Value)
                : null,
            CreatedAt = survey.CreatedAt.ToString("o"),
            UpdatedAt = survey.UpdatedAt.ToString("o")
        };
    }

    private static SurveyQuestionDto MapToQuestionDto(SurveyQuestion q)
    {
        List<string>? options = null;
        if (!string.IsNullOrEmpty(q.Options))
        {
            try
            {
                options = JsonSerializer.Deserialize<List<string>>(q.Options);
            }
            catch { }
        }

        return new SurveyQuestionDto
        {
            Id = q.Id.ToString(),
            Type = q.Type,
            Question = q.Question,
            Required = q.Required,
            Options = options,
            MinValue = q.MinValue,
            MaxValue = q.MaxValue,
            Order = q.Order
        };
    }

    private static SurveyResponseDto MapToResponseDto(SurveyResponse r, List<SurveyQuestion>? questions)
    {
        List<SurveyAnswerDto> answers = new();
        try
        {
            var rawAnswers = JsonSerializer.Deserialize<List<SurveyAnswerInput>>(r.Answers) ?? new();
            answers = rawAnswers.Select(a =>
            {
                var question = questions?.FirstOrDefault(q => q.Id.ToString() == a.QuestionId);
                return new SurveyAnswerDto
                {
                    QuestionId = a.QuestionId,
                    QuestionText = question?.Question ?? "",
                    QuestionType = question?.Type ?? "text",
                    Answer = a.Answer
                };
            }).ToList();
        }
        catch { }

        return new SurveyResponseDto
        {
            Id = r.Id.ToString(),
            SurveyId = r.SurveyId.ToString(),
            CustomerId = r.CustomerId?.ToString(),
            CustomerName = r.Customer?.Name,
            AgentId = r.AgentId?.ToString(),
            AgentName = r.Agent?.Name,
            Responses = answers,
            OverallScore = r.OverallScore.HasValue ? (double)r.OverallScore.Value : null,
            SubmittedAt = r.SubmittedAt.ToString("o"),
            Channel = r.Channel
        };
    }

    private static decimal? CalculateOverallScore(List<SurveyAnswerInput> answers, List<SurveyQuestion> questions)
    {
        var numericAnswers = answers
            .Where(a =>
            {
                var q = questions.FirstOrDefault(q => q.Id.ToString() == a.QuestionId);
                return q != null && (q.Type == "rating" || q.Type == "nps");
            })
            .Select(a =>
            {
                if (decimal.TryParse(a.Answer?.ToString(), out var value))
                    return value;
                return (decimal?)null;
            })
            .Where(v => v.HasValue)
            .Select(v => v!.Value)
            .ToList();

        return numericAnswers.Any() ? numericAnswers.Average() : null;
    }
}

// DTOs
public class SurveyDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Type { get; set; } = "CSAT";
    public string Trigger { get; set; } = "manual";
    public bool IsActive { get; set; }
    public List<SurveyQuestionDto> Questions { get; set; } = new();
    public string? ThankYouMessage { get; set; }
    public int? ExpirationDays { get; set; }
    public int? ResponseCount { get; set; }
    public double? AverageScore { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
}

public class SurveyQuestionDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = "rating";
    public string Question { get; set; } = string.Empty;
    public bool Required { get; set; } = true;
    public List<string>? Options { get; set; }
    public int? MinValue { get; set; }
    public int? MaxValue { get; set; }
    public int Order { get; set; }
}

public class CreateSurveyRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Type { get; set; } = "CSAT";
    public string Trigger { get; set; } = "manual";
    public bool IsActive { get; set; } = true;
    public List<CreateQuestionRequest>? Questions { get; set; }
    public string? ThankYouMessage { get; set; }
    public int? ExpirationDays { get; set; }
}

public class CreateQuestionRequest
{
    public string Type { get; set; } = "rating";
    public string Question { get; set; } = string.Empty;
    public bool Required { get; set; } = true;
    public List<string>? Options { get; set; }
    public int? MinValue { get; set; }
    public int? MaxValue { get; set; }
    public int Order { get; set; }
}

public class UpdateSurveyRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Type { get; set; } = "CSAT";
    public string Trigger { get; set; } = "manual";
    public bool IsActive { get; set; } = true;
    public List<CreateQuestionRequest>? Questions { get; set; }
    public string? ThankYouMessage { get; set; }
    public int? ExpirationDays { get; set; }
}

public class ToggleSurveyStatusRequest
{
    public bool IsActive { get; set; }
}

public class SurveyResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string SurveyId { get; set; } = string.Empty;
    public string? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public string? AgentId { get; set; }
    public string? AgentName { get; set; }
    public List<SurveyAnswerDto> Responses { get; set; } = new();
    public double? OverallScore { get; set; }
    public string SubmittedAt { get; set; } = string.Empty;
    public string? Channel { get; set; }
}

public class SurveyAnswerDto
{
    public string QuestionId { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public object? Answer { get; set; }
}

public class SubmitSurveyResponseRequest
{
    public Guid? CustomerId { get; set; }
    public Guid? AgentId { get; set; }
    public List<SurveyAnswerInput> Answers { get; set; } = new();
    public string? Channel { get; set; }
}

public class SurveyAnswerInput
{
    public string QuestionId { get; set; } = string.Empty;
    public object? Answer { get; set; }
}
