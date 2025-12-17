using CallCenter.API.Authorization;
using CallCenter.Application.DTOs.Analytics;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("agents/{agentId:guid}/kpis")]
    [RequirePermission("analytics.agents")]
    public async Task<ActionResult<List<AgentKpiDto>>> GetAgentKpis(Guid agentId, [FromQuery] DateOnly? from = null, [FromQuery] DateOnly? to = null)
    {
        var result = await _analyticsService.GetAgentKpisAsync(agentId, from, to);
        return Ok(result);
    }

    [HttpGet("queues/{queueId:guid}/metrics")]
    [RequirePermission("analytics.queues")]
    public async Task<ActionResult<List<QueueMetricDto>>> GetQueueMetrics(Guid queueId, [FromQuery] DateOnly? from = null, [FromQuery] DateOnly? to = null)
    {
        var result = await _analyticsService.GetQueueMetricsAsync(queueId, from, to);
        return Ok(result);
    }

    [HttpGet("teams/{teamId:guid}/kpis")]
    [RequirePermission("analytics.teams")]
    public async Task<ActionResult<List<TeamKpiDto>>> GetTeamKpis(Guid teamId, [FromQuery] DateOnly? from = null, [FromQuery] DateOnly? to = null)
    {
        var result = await _analyticsService.GetTeamKpisAsync(teamId, from, to);
        return Ok(result);
    }
}
