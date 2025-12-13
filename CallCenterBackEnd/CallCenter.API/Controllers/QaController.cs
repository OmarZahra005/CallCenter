using CallCenter.Application.Services;
using CallCenter.API.Authorization;
using CallCenter.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[RoleAuthorize(AgentRole.Agent, AgentRole.Supervisor, AgentRole.QaEvaluator, AgentRole.Admin)]
public class QaController : ControllerBase
{
    private readonly IQaService _qaService;

    public QaController(IQaService qaService)
    {
        _qaService = qaService;
    }

    // Scorecards
    [HttpGet("scorecards/{id}")]
    public async Task<ActionResult<QaScorecardDto>> GetScorecard(Guid id)
    {
        var scorecard = await _qaService.GetScorecardByIdAsync(id);
        if (scorecard == null) return NotFound();
        return Ok(scorecard);
    }

    [HttpGet("scorecards/agent/{agentId}")]
    public async Task<ActionResult<List<QaScorecardDto>>> GetScorecardsByAgent(Guid agentId)
    {
        var scorecards = await _qaService.GetScorecardsByAgentAsync(agentId);
        return Ok(scorecards);
    }

    [HttpGet("scorecards/evaluator/{evaluatorId}")]
    public async Task<ActionResult<List<QaScorecardDto>>> GetScorecardsByEvaluator(Guid evaluatorId)
    {
        var scorecards = await _qaService.GetScorecardsByEvaluatorAsync(evaluatorId);
        return Ok(scorecards);
    }

    [HttpGet("scorecards/recording/{recordingId}")]
    public async Task<ActionResult<QaScorecardDto>> GetScorecardByRecordingId(Guid recordingId)
    {
        var scorecard = await _qaService.GetScorecardByRecordingIdAsync(recordingId);
        if (scorecard == null) return NotFound();
        return Ok(scorecard);
    }

    [HttpGet("scorecards/call/{callSid}")]
    public async Task<ActionResult<QaScorecardDto>> GetScorecardByCallSid(string callSid)
    {
        var scorecard = await _qaService.GetScorecardByCallSidAsync(callSid);
        if (scorecard == null) return NotFound();
        return Ok(scorecard);
    }

    [HttpPost("scorecards")]
    public async Task<ActionResult<QaScorecardDto>> CreateScorecard(CreateScorecardRequest request)
    {
        var scorecard = await _qaService.CreateScorecardAsync(request);
        return CreatedAtAction(nameof(GetScorecard), new { id = scorecard.Id }, scorecard);
    }

    [HttpPut("scorecards/{id}")]
    public async Task<ActionResult<QaScorecardDto>> UpdateScorecard(Guid id, UpdateScorecardRequest request)
    {
        var scorecard = await _qaService.UpdateScorecardAsync(id, request);
        if (scorecard == null) return NotFound();
        return Ok(scorecard);
    }

    [HttpDelete("scorecards/{id}")]
    public async Task<ActionResult> DeleteScorecard(Guid id)
    {
        var result = await _qaService.DeleteScorecardAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    // Evaluation Forms
    [HttpGet("forms/{id}")]
    public async Task<ActionResult<QaEvaluationFormDto>> GetForm(Guid id)
    {
        var form = await _qaService.GetFormByIdAsync(id);
        if (form == null) return NotFound();
        return Ok(form);
    }

    [HttpGet("forms")]
    public async Task<ActionResult<List<QaEvaluationFormDto>>> GetActiveForms()
    {
        var forms = await _qaService.GetActiveFormsAsync();
        return Ok(forms);
    }

    [HttpPost("forms")]
    public async Task<ActionResult<QaEvaluationFormDto>> CreateForm(CreateEvaluationFormRequest request)
    {
        var form = await _qaService.CreateFormAsync(request);
        return CreatedAtAction(nameof(GetForm), new { id = form.Id }, form);
    }

    [HttpPut("forms/{id}")]
    public async Task<ActionResult<QaEvaluationFormDto>> UpdateForm(Guid id, UpdateEvaluationFormRequest request)
    {
        var form = await _qaService.UpdateFormAsync(id, request);
        if (form == null) return NotFound();
        return Ok(form);
    }

    [HttpDelete("forms/{id}")]
    public async Task<ActionResult> DeleteForm(Guid id)
    {
        var result = await _qaService.DeleteFormAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
