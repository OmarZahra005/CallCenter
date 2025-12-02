using CallCenter.Application.DTOs.Dashboard;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary()
    {
        var summary = await _dashboardService.GetDashboardSummaryAsync();
        return Ok(summary);
    }
}
