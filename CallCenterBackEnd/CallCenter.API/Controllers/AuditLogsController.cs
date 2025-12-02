using CallCenter.Application.DTOs.AuditLogs;
using CallCenter.Application.DTOs.Common;
using CallCenter.Application.Services;
using CallCenter.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<AuditLogDto>>> GetLogs([FromQuery] PagedRequest request, [FromQuery] AuditEntityType? entityType = null)
    {
        var result = await _auditLogService.GetLogsAsync(request, entityType);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AuditLogDto>> GetLog(Guid id)
    {
        var result = await _auditLogService.GetLogByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<AuditLogDto>> CreateLog(CreateAuditLogRequest request)
    {
        var result = await _auditLogService.CreateLogAsync(request);
        return CreatedAtAction(nameof(GetLog), new { id = result.Id }, result);
    }

    [HttpGet("entity/{entityType}/{entityId}")]
    public async Task<ActionResult<List<AuditLogDto>>> GetByEntity(AuditEntityType entityType, string entityId)
    {
        var result = await _auditLogService.GetByEntityAsync(entityType, entityId);
        return Ok(result);
    }

    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<List<AuditLogDto>>> GetByUser(Guid userId, [FromQuery] DateOnly? from = null, [FromQuery] DateOnly? to = null)
    {
        var result = await _auditLogService.GetByUserAsync(userId, from, to);
        return Ok(result);
    }
}
