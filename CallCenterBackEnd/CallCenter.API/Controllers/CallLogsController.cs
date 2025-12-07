using CallCenter.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/call-logs")]
[Authorize]
public class CallLogsController : ControllerBase
{
    private readonly ICallLogService _callLogService;

    public CallLogsController(ICallLogService callLogService)
    {
        _callLogService = callLogService;
    }

    /// <summary>
    /// Get recent call history
    /// </summary>
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecentHistory([FromQuery] int take = 50)
    {
        var callLogs = await _callLogService.GetRecentHistoryAsync(take);
        return Ok(callLogs);
    }

    /// <summary>
    /// Get active calls
    /// </summary>
    [HttpGet("active")]
    public async Task<IActionResult> GetActiveCalls()
    {
        var callLogs = await _callLogService.GetActiveCallsAsync();
        return Ok(callLogs);
    }

    /// <summary>
    /// Get call log by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var callLog = await _callLogService.GetByIdAsync(id);
        if (callLog == null)
            return NotFound();

        return Ok(callLog);
    }

    /// <summary>
    /// Get call log by provider call ID
    /// </summary>
    [HttpGet("provider/{providerCallId}")]
    public async Task<IActionResult> GetByProviderCallId(string providerCallId)
    {
        var callLog = await _callLogService.GetByProviderIdAsync(providerCallId);
        if (callLog == null)
            return NotFound();

        return Ok(callLog);
    }
}
