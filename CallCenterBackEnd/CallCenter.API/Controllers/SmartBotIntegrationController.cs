using CallCenter.API.Authentication;
using CallCenter.Application.DTOs.SmartBot;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

/// <summary>
/// API endpoints for SmartBot chatbot integration
/// </summary>
[ApiController]
[Route("api/smartbot")]
[Authorize(AuthenticationSchemes = SmartBotApiKeyAuthOptions.DefaultScheme)]
public class SmartBotIntegrationController : ControllerBase
{
    private readonly ISmartBotEscalationService _escalationService;
    private readonly ILogger<SmartBotIntegrationController> _logger;

    public SmartBotIntegrationController(
        ISmartBotEscalationService escalationService,
        ILogger<SmartBotIntegrationController> logger)
    {
        _escalationService = escalationService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new escalation from SmartBot
    /// </summary>
    /// <param name="request">Escalation request with customer info and transcript</param>
    /// <returns>Escalation response with ticket info and agent availability</returns>
    [HttpPost("escalations")]
    [ProducesResponseType(typeof(SmartBotEscalationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SmartBotEscalationResponse>> CreateEscalation(
        [FromBody] SmartBotEscalationRequest request)
    {
        if (string.IsNullOrEmpty(request.SmartBotConversationId))
        {
            return BadRequest(new { error = "SmartBotConversationId is required" });
        }

        _logger.LogInformation(
            "Received escalation request from SmartBot for conversation {ConversationId}",
            request.SmartBotConversationId);

        var result = await _escalationService.CreateEscalationAsync(request);

        if (!result.Success)
        {
            _logger.LogWarning(
                "Failed to create escalation for SmartBot conversation {ConversationId}: {Error}",
                request.SmartBotConversationId, result.ErrorMessage);

            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result);
    }

    /// <summary>
    /// Get escalation status by SmartBot conversation ID
    /// </summary>
    /// <param name="conversationId">SmartBot conversation ID</param>
    /// <returns>Current escalation status</returns>
    [HttpGet("escalations/by-conversation/{conversationId}")]
    [ProducesResponseType(typeof(SmartBotEscalationStatusResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SmartBotEscalationStatusResponse>> GetEscalationByConversation(
        string conversationId)
    {
        var result = await _escalationService.GetEscalationStatusAsync(conversationId);

        if (result == null)
        {
            return NotFound(new { error = "Escalation not found" });
        }

        return Ok(result);
    }

    /// <summary>
    /// Get escalation status by escalation ID
    /// </summary>
    /// <param name="escalationId">CallCenter escalation ID</param>
    /// <returns>Current escalation status</returns>
    [HttpGet("escalations/{escalationId:guid}")]
    [ProducesResponseType(typeof(SmartBotEscalationStatusResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SmartBotEscalationStatusResponse>> GetEscalationById(
        Guid escalationId)
    {
        var result = await _escalationService.GetEscalationByIdAsync(escalationId);

        if (result == null)
        {
            return NotFound(new { error = "Escalation not found" });
        }

        return Ok(result);
    }

    /// <summary>
    /// Get detailed escalation information including logs
    /// </summary>
    /// <param name="escalationId">CallCenter escalation ID</param>
    /// <returns>Detailed escalation information</returns>
    [HttpGet("escalations/{escalationId:guid}/details")]
    [ProducesResponseType(typeof(SmartBotEscalationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SmartBotEscalationDto>> GetEscalationDetails(
        Guid escalationId)
    {
        var result = await _escalationService.GetEscalationDetailAsync(escalationId);

        if (result == null)
        {
            return NotFound(new { error = "Escalation not found" });
        }

        return Ok(result);
    }

    /// <summary>
    /// Update escalation status from SmartBot
    /// </summary>
    /// <param name="request">Status update request</param>
    /// <returns>Success indicator</returns>
    [HttpPut("escalations/status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateEscalationStatus(
        [FromBody] SmartBotStatusUpdateRequest request)
    {
        var success = await _escalationService.UpdateEscalationStatusAsync(request);

        if (!success)
        {
            return NotFound(new { error = "Escalation not found" });
        }

        return Ok(new { success = true });
    }

    /// <summary>
    /// Send a message from customer to agent via SmartBot
    /// </summary>
    /// <param name="request">Message request</param>
    /// <returns>Success indicator</returns>
    [HttpPost("escalations/messages")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SendMessage(
        [FromBody] SmartBotMessageRequest request)
    {
        var success = await _escalationService.SendMessageToAgentAsync(request);

        if (!success)
        {
            return NotFound(new { error = "Escalation not found" });
        }

        return Ok(new { success = true });
    }

    /// <summary>
    /// Cancel/end escalation from SmartBot (customer ended chat)
    /// </summary>
    /// <param name="request">Cancel request with reason</param>
    /// <returns>Success indicator</returns>
    [HttpPost("escalations/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelEscalation(
        [FromBody] SmartBotCancelRequest request)
    {
        _logger.LogInformation(
            "Received cancel request from SmartBot for conversation {ConversationId}",
            request.SmartBotConversationId);

        var success = await _escalationService.CancelEscalationFromSmartBotAsync(request);

        if (!success)
        {
            return NotFound(new { error = "Escalation not found" });
        }

        return Ok(new { success = true, message = "Escalation cancelled" });
    }

    /// <summary>
    /// Health check endpoint for SmartBot integration
    /// </summary>
    /// <returns>Service status</returns>
    [HttpGet("health")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult HealthCheck()
    {
        return Ok(new
        {
            status = "healthy",
            service = "CallCenter SmartBot Integration",
            timestamp = DateTime.UtcNow
        });
    }
}
