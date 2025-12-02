using CallCenter.Application.DTOs.Reports;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary()
    {
        var result = await _reportService.GetDashboardSummaryAsync();
        return Ok(result);
    }

    [HttpGet("agents")]
    public async Task<ActionResult<List<AgentPerformanceReportDto>>> GetAgentPerformance([FromQuery] DateOnly from, [FromQuery] DateOnly to)
    {
        var result = await _reportService.GetAgentPerformanceAsync(from, to);
        return Ok(result);
    }

    [HttpGet("queues")]
    public async Task<ActionResult<List<QueuePerformanceReportDto>>> GetQueuePerformance([FromQuery] DateOnly from, [FromQuery] DateOnly to)
    {
        var result = await _reportService.GetQueuePerformanceAsync(from, to);
        return Ok(result);
    }
}
