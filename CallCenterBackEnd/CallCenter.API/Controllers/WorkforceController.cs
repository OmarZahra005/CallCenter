using CallCenter.API.Authorization;
using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Workforce;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkforceController : ControllerBase
{
    private readonly IWorkforceService _workforceService;

    public WorkforceController(IWorkforceService workforceService)
    {
        _workforceService = workforceService;
    }

    // Shifts
    [HttpGet("shifts")]
    [RequirePermission("wfm.view")]
    public async Task<ActionResult<PagedResponse<AgentShiftDto>>> GetShifts([FromQuery] PagedRequest request, [FromQuery] Guid? agentId = null)
    {
        var result = await _workforceService.GetShiftsAsync(request, agentId);
        return Ok(result);
    }

    [HttpGet("shifts/{id:guid}")]
    [RequirePermission("wfm.view")]
    public async Task<ActionResult<AgentShiftDto>> GetShift(Guid id)
    {
        var result = await _workforceService.GetShiftByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("shifts")]
    [RequirePermission("wfm.schedules_manage")]
    public async Task<ActionResult<AgentShiftDto>> CreateShift(CreateAgentShiftRequest request)
    {
        var result = await _workforceService.CreateShiftAsync(request);
        return CreatedAtAction(nameof(GetShift), new { id = result.Id }, result);
    }

    [HttpPut("shifts/{id:guid}")]
    [RequirePermission("wfm.schedules_manage")]
    public async Task<ActionResult<AgentShiftDto>> UpdateShift(Guid id, UpdateAgentShiftRequest request)
    {
        var result = await _workforceService.UpdateShiftAsync(id, request);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("shifts/{id:guid}")]
    [RequirePermission("wfm.schedules_manage")]
    public async Task<ActionResult> DeleteShift(Guid id)
    {
        var result = await _workforceService.DeleteShiftAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("agents/{agentId:guid}/shifts")]
    [RequirePermission("wfm.view")]
    public async Task<ActionResult<List<AgentShiftDto>>> GetAgentShifts(Guid agentId, [FromQuery] DateOnly? from = null, [FromQuery] DateOnly? to = null)
    {
        var result = await _workforceService.GetAgentShiftsAsync(agentId, from, to);
        return Ok(result);
    }

    // Time Off Requests
    [HttpGet("timeoff")]
    [RequirePermission("wfm.view")]
    public async Task<ActionResult<PagedResponse<TimeOffRequestDto>>> GetTimeOffRequests([FromQuery] PagedRequest request, [FromQuery] Guid? agentId = null)
    {
        var result = await _workforceService.GetTimeOffRequestsAsync(request, agentId);
        return Ok(result);
    }

    [HttpGet("timeoff/{id:guid}")]
    [RequirePermission("wfm.view")]
    public async Task<ActionResult<TimeOffRequestDto>> GetTimeOffRequest(Guid id)
    {
        var result = await _workforceService.GetTimeOffRequestByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("timeoff")]
    [RequirePermission("wfm.view")]
    public async Task<ActionResult<TimeOffRequestDto>> CreateTimeOffRequest(CreateTimeOffRequest request)
    {
        var result = await _workforceService.CreateTimeOffRequestAsync(request);
        return CreatedAtAction(nameof(GetTimeOffRequest), new { id = result.Id }, result);
    }

    [HttpPost("timeoff/{id:guid}/approve")]
    [RequirePermission("wfm.timeoff_approve")]
    public async Task<ActionResult<TimeOffRequestDto>> ApproveTimeOffRequest(Guid id, ApproveTimeOffRequest request)
    {
        var result = await _workforceService.ApproveTimeOffRequestAsync(id, request);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("timeoff/{id:guid}/reject")]
    [RequirePermission("wfm.timeoff_approve")]
    public async Task<ActionResult<TimeOffRequestDto>> RejectTimeOffRequest(Guid id, ApproveTimeOffRequest request)
    {
        var result = await _workforceService.RejectTimeOffRequestAsync(id, request);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("timeoff/pending")]
    [RequirePermission("wfm.timeoff_approve")]
    public async Task<ActionResult<List<TimeOffRequestDto>>> GetPendingRequests()
    {
        var result = await _workforceService.GetPendingRequestsAsync();
        return Ok(result);
    }
}
