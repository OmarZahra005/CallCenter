using System.Security.Claims;
using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.DataExports;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/admin/exports")]
[Authorize]
public class DataExportsController : ControllerBase
{
    private readonly IDataExportService _exportService;

    public DataExportsController(IDataExportService exportService)
    {
        _exportService = exportService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<DataExportDto>>> GetExports([FromQuery] PagedRequest request)
    {
        var result = await _exportService.GetExportsAsync(request);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DataExportDto>> GetExport(Guid id)
    {
        var result = await _exportService.GetExportByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<DataExportDto>> CreateExport([FromBody] CreateDataExportRequest request)
    {
        var userId = GetCurrentUserId();
        var userName = GetCurrentUserName();
        var result = await _exportService.CreateExportAsync(request, userId, userName);
        return CreatedAtAction(nameof(GetExport), new { id = result.Id }, result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteExport(Guid id)
    {
        var result = await _exportService.DeleteExportAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("scheduled")]
    public async Task<ActionResult<List<ScheduledExportDto>>> GetScheduledExports()
    {
        var result = await _exportService.GetScheduledExportsAsync();
        return Ok(result);
    }

    [HttpGet("scheduled/{id:guid}")]
    public async Task<ActionResult<ScheduledExportDto>> GetScheduledExport(Guid id)
    {
        var result = await _exportService.GetScheduledExportByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("scheduled")]
    public async Task<ActionResult<ScheduledExportDto>> CreateScheduledExport([FromBody] CreateScheduledExportRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _exportService.CreateScheduledExportAsync(request, userId);
        return CreatedAtAction(nameof(GetScheduledExport), new { id = result.Id }, result);
    }

    [HttpPut("scheduled/{id:guid}")]
    public async Task<ActionResult<ScheduledExportDto>> UpdateScheduledExport(Guid id, [FromBody] UpdateScheduledExportRequest request)
    {
        var result = await _exportService.UpdateScheduledExportAsync(id, request);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("scheduled/{id:guid}")]
    public async Task<ActionResult> DeleteScheduledExport(Guid id)
    {
        var result = await _exportService.DeleteScheduledExportAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPatch("scheduled/{id:guid}/toggle")]
    public async Task<ActionResult> ToggleScheduledExport(Guid id, [FromBody] ToggleScheduleRequest request)
    {
        var result = await _exportService.ToggleScheduledExportAsync(id, request.IsActive);
        if (!result) return NotFound();
        return Ok();
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }

    private string GetCurrentUserName()
    {
        return User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";
    }
}

public class ToggleScheduleRequest
{
    public bool IsActive { get; set; }
}
