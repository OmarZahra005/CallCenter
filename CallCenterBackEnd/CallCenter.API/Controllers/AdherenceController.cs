using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdherenceController : ControllerBase
{
    private readonly IAdherenceService _adherenceService;

    public AdherenceController(IAdherenceService adherenceService)
    {
        _adherenceService = adherenceService;
    }

    [HttpGet("agent/{agentId}")]
    public async Task<ActionResult<AdherenceDto>> GetAgentAdherence(Guid agentId, [FromQuery] DateTime? date = null)
    {
        var adherence = await _adherenceService.GetAgentAdherenceAsync(agentId, date ?? DateTime.Today);
        return Ok(adherence);
    }

    [HttpGet("team/{teamId}")]
    public async Task<ActionResult<List<AdherenceDto>>> GetTeamAdherence(Guid teamId, [FromQuery] DateTime? date = null)
    {
        var adherence = await _adherenceService.GetTeamAdherenceAsync(teamId, date ?? DateTime.Today);
        return Ok(adherence);
    }

    [HttpPost]
    public async Task<ActionResult<AdherenceDto>> RecordAdherence(RecordAdherenceRequest request)
    {
        var adherence = await _adherenceService.RecordAdherenceEventAsync(request);
        return Ok(adherence);
    }

    [HttpGet("summary/{agentId}")]
    public async Task<ActionResult<AdherenceSummaryDto>> GetSummary(
        Guid agentId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.Today.AddDays(-7);
        var end = endDate ?? DateTime.Today;
        var summary = await _adherenceService.GetAdherenceSummaryAsync(agentId, start, end);
        return Ok(summary);
    }
}
