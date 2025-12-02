using CallCenter.Application.DTOs.Analytics;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("agents/{agentId:guid}/kpis")]
    public async Task<ActionResult<List<AgentKpiDto>>> GetAgentKpis(Guid agentId, [FromQuery] DateOnly? from = null, [FromQuery] DateOnly? to = null)
    {
        var result = await _analyticsService.GetAgentKpisAsync(agentId, from, to);
        return Ok(result);
    }

    [HttpGet("queues/{queueId:guid}/metrics")]
    public async Task<ActionResult<List<QueueMetricDto>>> GetQueueMetrics(Guid queueId, [FromQuery] DateOnly? from = null, [FromQuery] DateOnly? to = null)
    {
        var result = await _analyticsService.GetQueueMetricsAsync(queueId, from, to);
        return Ok(result);
    }

    [HttpGet("teams/{teamId:guid}/kpis")]
    public async Task<ActionResult<List<TeamKpiDto>>> GetTeamKpis(Guid teamId, [FromQuery] DateOnly? from = null, [FromQuery] DateOnly? to = null)
    {
        var result = await _analyticsService.GetTeamKpisAsync(teamId, from, to);
        return Ok(result);
    }
}
