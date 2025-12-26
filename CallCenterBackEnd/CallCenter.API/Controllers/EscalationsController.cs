using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.SmartBot;
using CallCenter.Application.Services;
using CallCenter.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

/// <summary>
/// Admin API endpoints for managing and viewing SmartBot escalations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EscalationsController : ControllerBase
{
    private readonly ISmartBotEscalationService _escalationService;
    private readonly ILogger<EscalationsController> _logger;

    public EscalationsController(
        ISmartBotEscalationService escalationService,
        ILogger<EscalationsController> logger)
    {
        _escalationService = escalationService;
        _logger = logger;
    }

    /// <summary>
    /// Get all escalations with filtering and pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<SmartBotEscalationDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResponse<SmartBotEscalationDto>>> GetEscalations(
        [FromQuery] PagedRequest request,
        [FromQuery] SmartBotEscalationStatus? status = null,
        [FromQuery] Guid? agentId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _escalationService.GetEscalationsPagedAsync(request, status, agentId, fromDate, toDate);
        return Ok(result);
    }

    /// <summary>
    /// Get escalation details including full log history
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SmartBotEscalationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SmartBotEscalationDto>> GetEscalation(Guid id)
    {
        var result = await _escalationService.GetEscalationDetailAsync(id);
        if (result == null)
        {
            return NotFound(new { error = "Escalation not found" });
        }
        return Ok(result);
    }

    /// <summary>
    /// Get escalation by conversation ID
    /// </summary>
    [HttpGet("by-conversation/{conversationId:guid}")]
    [ProducesResponseType(typeof(SmartBotEscalationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SmartBotEscalationDto>> GetEscalationByConversation(Guid conversationId)
    {
        var result = await _escalationService.GetEscalationByConversationIdAsync(conversationId);
        if (result == null)
        {
            return NotFound(new { error = "Escalation not found for this conversation" });
        }
        return Ok(result);
    }

    /// <summary>
    /// Get active escalations (pending, queued, assigned, active)
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(List<SmartBotEscalationDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SmartBotEscalationDto>>> GetActiveEscalations()
    {
        var result = await _escalationService.GetActiveEscalationsAsync();
        return Ok(result);
    }

    /// <summary>
    /// Get escalation statistics for dashboard
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(EscalationStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<EscalationStatsDto>> GetEscalationStats(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _escalationService.GetEscalationStatsAsync(fromDate, toDate);
        return Ok(result);
    }
}
