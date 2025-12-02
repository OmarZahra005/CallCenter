using CallCenter.Application.DTOs.Agents;
using CallCenter.Application.DTOs.Common;
using CallCenter.Application.Services;
using CallCenter.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgentsController : ControllerBase
{
    private readonly IAgentService _agentService;

    public AgentsController(IAgentService agentService)
    {
        _agentService = agentService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<AgentDto>>> GetAgents(
        [FromQuery] PagedRequest request,
        [FromQuery] Guid? teamId = null,
        [FromQuery] AgentStatus? status = null)
    {
        var result = await _agentService.GetAgentsAsync(request, teamId, status);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AgentDetailDto>> GetAgent(Guid id)
    {
        var agent = await _agentService.GetAgentByIdAsync(id);
        if (agent == null) return NotFound();
        return Ok(agent);
    }

    [HttpPost]
    public async Task<ActionResult<AgentDto>> CreateAgent(CreateAgentRequest request)
    {
        var agent = await _agentService.CreateAgentAsync(request);
        return CreatedAtAction(nameof(GetAgent), new { id = agent.Id }, agent);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AgentDto>> UpdateAgent(Guid id, UpdateAgentRequest request)
    {
        var agent = await _agentService.UpdateAgentAsync(id, request);
        if (agent == null) return NotFound();
        return Ok(agent);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAgent(Guid id)
    {
        var result = await _agentService.DeleteAgentAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("team/{teamId}")]
    public async Task<ActionResult<List<AgentDto>>> GetAgentsByTeam(Guid teamId)
    {
        var agents = await _agentService.GetAgentsByTeamAsync(teamId);
        return Ok(agents);
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<List<AgentDto>>> GetAgentsByStatus(AgentStatus status)
    {
        var agents = await _agentService.GetAgentsByStatusAsync(status);
        return Ok(agents);
    }
}
