using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;

namespace CallCenter.Application.Services;

public interface IQaService
{
    // Scorecards
    Task<QaScorecardDto?> GetScorecardByIdAsync(Guid id);
    Task<List<QaScorecardDto>> GetScorecardsByAgentAsync(Guid agentId);
    Task<List<QaScorecardDto>> GetScorecardsByEvaluatorAsync(Guid evaluatorId);
    Task<QaScorecardDto> CreateScorecardAsync(CreateScorecardRequest request);
    Task<QaScorecardDto?> UpdateScorecardAsync(Guid id, UpdateScorecardRequest request);
    Task<bool> DeleteScorecardAsync(Guid id);

    // Evaluation Forms
    Task<QaEvaluationFormDto?> GetFormByIdAsync(Guid id);
    Task<List<QaEvaluationFormDto>> GetActiveFormsAsync();
    Task<QaEvaluationFormDto> CreateFormAsync(CreateEvaluationFormRequest request);
    Task<QaEvaluationFormDto?> UpdateFormAsync(Guid id, UpdateEvaluationFormRequest request);
    Task<bool> DeleteFormAsync(Guid id);
}

public class QaService : IQaService
{
    private readonly IQaScorecardRepository _scorecardRepository;
    private readonly IQaEvaluationFormRepository _formRepository;

    public QaService(
        IQaScorecardRepository scorecardRepository,
        IQaEvaluationFormRepository formRepository)
    {
        _scorecardRepository = scorecardRepository;
        _formRepository = formRepository;
    }

    public async Task<QaScorecardDto?> GetScorecardByIdAsync(Guid id)
    {
        var scorecard = await _scorecardRepository.GetByIdAsync(id);
        return scorecard != null ? MapToDto(scorecard) : null;
    }

    public async Task<List<QaScorecardDto>> GetScorecardsByAgentAsync(Guid agentId)
    {
        var scorecards = await _scorecardRepository.GetByAgentIdAsync(agentId);
        return scorecards.Select(MapToDto).ToList();
    }

    public async Task<List<QaScorecardDto>> GetScorecardsByEvaluatorAsync(Guid evaluatorId)
    {
        var scorecards = await _scorecardRepository.GetByEvaluatorIdAsync(evaluatorId);
        return scorecards.Select(MapToDto).ToList();
    }

    public async Task<QaScorecardDto> CreateScorecardAsync(CreateScorecardRequest request)
    {
        var scorecard = new QaScorecard
        {
            Id = Guid.NewGuid(),
            FormId = request.FormId,
            TicketId = request.TicketId,
            ConversationId = request.ConversationId,
            CallRecordingId = request.CallRecordingId,
            AgentId = request.AgentId,
            EvaluatorId = request.EvaluatorId,
            TotalScore = request.TotalScore,
            MaxScore = request.MaxScore,
            Percentage = request.MaxScore > 0 ? (float)request.TotalScore / request.MaxScore * 100 : 0,
            Status = request.Status,
            Passed = request.TotalScore >= request.PassingScore,
            Comments = request.Comments,
            Strengths = request.Strengths,
            AreasForImprovement = request.AreasForImprovement,
            EvaluationDate = request.EvaluationDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _scorecardRepository.AddAsync(scorecard);
        return MapToDto(scorecard);
    }

    public async Task<QaScorecardDto?> UpdateScorecardAsync(Guid id, UpdateScorecardRequest request)
    {
        var scorecard = await _scorecardRepository.GetByIdAsync(id);
        if (scorecard == null) return null;

        scorecard.TotalScore = request.TotalScore ?? scorecard.TotalScore;
        scorecard.MaxScore = request.MaxScore ?? scorecard.MaxScore;
        scorecard.Percentage = scorecard.MaxScore > 0 ? (float)scorecard.TotalScore / scorecard.MaxScore * 100 : 0;
        scorecard.Status = request.Status ?? scorecard.Status;
        scorecard.Passed = request.PassingScore.HasValue
            ? scorecard.TotalScore >= request.PassingScore.Value
            : scorecard.Passed;
        scorecard.Comments = request.Comments ?? scorecard.Comments;
        scorecard.Strengths = request.Strengths ?? scorecard.Strengths;
        scorecard.AreasForImprovement = request.AreasForImprovement ?? scorecard.AreasForImprovement;
        scorecard.UpdatedAt = DateTime.UtcNow;

        _scorecardRepository.Update(scorecard);
        await _scorecardRepository.SaveChangesAsync();
        return MapToDto(scorecard);
    }

    public async Task<bool> DeleteScorecardAsync(Guid id)
    {
        var scorecard = await _scorecardRepository.GetByIdAsync(id);
        if (scorecard == null) return false;

        _scorecardRepository.DeleteAsync(scorecard);
        await _scorecardRepository.SaveChangesAsync();
        return true;
    }

    public async Task<QaEvaluationFormDto?> GetFormByIdAsync(Guid id)
    {
        var form = await _formRepository.GetByIdAsync(id);
        return form != null ? MapToDto(form) : null;
    }

    public async Task<List<QaEvaluationFormDto>> GetActiveFormsAsync()
    {
        var forms = await _formRepository.GetActiveAsync();
        return forms.Select(MapToDto).ToList();
    }

    public async Task<QaEvaluationFormDto> CreateFormAsync(CreateEvaluationFormRequest request)
    {
        var form = new QaEvaluationForm
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            MaxScore = request.MaxScore,
            PassingScore = request.PassingScore,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _formRepository.AddAsync(form);
        return MapToDto(form);
    }

    public async Task<QaEvaluationFormDto?> UpdateFormAsync(Guid id, UpdateEvaluationFormRequest request)
    {
        var form = await _formRepository.GetByIdAsync(id);
        if (form == null) return null;

        form.Name = request.Name ?? form.Name;
        form.Description = request.Description ?? form.Description;
        form.MaxScore = request.MaxScore ?? form.MaxScore;
        form.PassingScore = request.PassingScore ?? form.PassingScore;
        form.IsActive = request.IsActive ?? form.IsActive;
        form.UpdatedAt = DateTime.UtcNow;

        _formRepository.Update(form);
        await _formRepository.SaveChangesAsync();
        return MapToDto(form);
    }

    public async Task<bool> DeleteFormAsync(Guid id)
    {
        var form = await _formRepository.GetByIdAsync(id);
        if (form == null) return false;

        _formRepository.DeleteAsync(form);
        await _formRepository.SaveChangesAsync();
        return true;
    }

    private static QaScorecardDto MapToDto(QaScorecard scorecard) => new()
    {
        Id = scorecard.Id,
        FormId = scorecard.FormId,
        FormName = scorecard.Form?.Name,
        TicketId = scorecard.TicketId,
        ConversationId = scorecard.ConversationId,
        CallRecordingId = scorecard.CallRecordingId,
        AgentId = scorecard.AgentId,
        AgentName = scorecard.Agent?.Name,
        EvaluatorId = scorecard.EvaluatorId,
        EvaluatorName = scorecard.Evaluator?.Name,
        TotalScore = scorecard.TotalScore,
        MaxScore = scorecard.MaxScore,
        Percentage = scorecard.Percentage,
        Status = scorecard.Status,
        Passed = scorecard.Passed,
        Comments = scorecard.Comments,
        Strengths = scorecard.Strengths,
        AreasForImprovement = scorecard.AreasForImprovement,
        EvaluationDate = scorecard.EvaluationDate,
        CreatedAt = scorecard.CreatedAt
    };

    private static QaEvaluationFormDto MapToDto(QaEvaluationForm form) => new()
    {
        Id = form.Id,
        Name = form.Name,
        Description = form.Description,
        MaxScore = form.MaxScore,
        PassingScore = form.PassingScore,
        IsActive = form.IsActive,
        CreatedAt = form.CreatedAt,
        Criteria = form.Criteria?.Select(c => new QaFormCriteriaDto
        {
            Id = c.Id,
            Name = c.CriteriaName,
            Description = c.Description,
            MaxScore = c.MaxPoints,
            Weight = c.Weight,
            Order = c.DisplayOrder,
            IsCritical = c.IsCritical
        }).ToList() ?? new List<QaFormCriteriaDto>()
    };
}

// DTOs
public record QaScorecardDto
{
    public Guid Id { get; init; }
    public Guid FormId { get; init; }
    public string? FormName { get; init; }
    public Guid? TicketId { get; init; }
    public Guid? ConversationId { get; init; }
    public Guid? CallRecordingId { get; init; }
    public Guid AgentId { get; init; }
    public string? AgentName { get; init; }
    public Guid EvaluatorId { get; init; }
    public string? EvaluatorName { get; init; }
    public int TotalScore { get; init; }
    public int MaxScore { get; init; }
    public float Percentage { get; init; }
    public QaScorecardStatus Status { get; init; }
    public bool Passed { get; init; }
    public string? Comments { get; init; }
    public string? Strengths { get; init; }
    public string? AreasForImprovement { get; init; }
    public DateOnly EvaluationDate { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record QaEvaluationFormDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int MaxScore { get; init; }
    public int PassingScore { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public List<QaFormCriteriaDto> Criteria { get; init; } = new();
}

public record QaFormCriteriaDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int MaxScore { get; init; }
    public float Weight { get; init; }
    public int Order { get; init; }
    public bool IsCritical { get; init; }
}

public record CreateScorecardRequest
{
    public Guid FormId { get; init; }
    public Guid? TicketId { get; init; }
    public Guid? ConversationId { get; init; }
    public Guid? CallRecordingId { get; init; }
    public Guid AgentId { get; init; }
    public Guid EvaluatorId { get; init; }
    public int TotalScore { get; init; }
    public int MaxScore { get; init; }
    public int PassingScore { get; init; }
    public QaScorecardStatus Status { get; init; } = QaScorecardStatus.Draft;
    public string? Comments { get; init; }
    public string? Strengths { get; init; }
    public string? AreasForImprovement { get; init; }
    public DateOnly EvaluationDate { get; init; }
}

public record UpdateScorecardRequest
{
    public int? TotalScore { get; init; }
    public int? MaxScore { get; init; }
    public int? PassingScore { get; init; }
    public QaScorecardStatus? Status { get; init; }
    public string? Comments { get; init; }
    public string? Strengths { get; init; }
    public string? AreasForImprovement { get; init; }
}

public record CreateEvaluationFormRequest
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int MaxScore { get; init; } = 100;
    public int PassingScore { get; init; } = 80;
}

public record UpdateEvaluationFormRequest
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public int? MaxScore { get; init; }
    public int? PassingScore { get; init; }
    public bool? IsActive { get; init; }
}
