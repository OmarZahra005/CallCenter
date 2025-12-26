using CallCenter.Application.DTOs.Cti;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgentStatesController : ControllerBase
{
    private readonly IAgentStateService _agentStateService;

    public AgentStatesController(IAgentStateService agentStateService)
    {
        _agentStateService = agentStateService;
    }

    /// <summary>
    /// Get current states for all agents.
    /// Used by CRM integration for real-time agent status display.
    /// </summary>
    [HttpGet("current")]
    public async Task<ActionResult<List<AgentStateDto>>> GetAllCurrentStates()
    {
        var result = await _agentStateService.GetAllCurrentStatesAsync();
        return Ok(result);
    }

    [HttpGet("{agentId:guid}/current")]
    public async Task<ActionResult<AgentStateDto>> GetCurrentState(Guid agentId)
    {
        var result = await _agentStateService.GetCurrentStateAsync(agentId);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("{agentId:guid}/history")]
    public async Task<ActionResult<List<AgentStateDto>>> GetStateHistory(Guid agentId)
    {
        var result = await _agentStateService.GetStateHistoryAsync(agentId);
        return Ok(result);
    }

    [HttpPost("{agentId:guid}")]
    public async Task<ActionResult<AgentStateDto>> UpdateState(Guid agentId, UpdateAgentStateRequest request)
    {
        var result = await _agentStateService.UpdateStateAsync(agentId, request);
        return Ok(result);
    }
}
