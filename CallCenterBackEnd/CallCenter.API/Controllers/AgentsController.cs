using System.Security.Claims;
using CallCenter.API.Authorization;
using CallCenter.Application.DTOs.Agents;
using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Rbac;
using CallCenter.Application.Services;
using CallCenter.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AgentsController : ControllerBase
{
    private readonly IAgentService _agentService;
    private readonly IRoleService _roleService;
    private readonly IPermissionService _permissionService;

    public AgentsController(
        IAgentService agentService,
        IRoleService roleService,
        IPermissionService permissionService)
    {
        _agentService = agentService;
        _roleService = roleService;
        _permissionService = permissionService;
    }

    [HttpGet]
    [RequirePermission("agents.view")]
    public async Task<ActionResult<PagedResponse<AgentDto>>> GetAgents(
        [FromQuery] PagedRequest request,
        [FromQuery] Guid? teamId = null,
        [FromQuery] AgentStatus? status = null)
    {
        var result = await _agentService.GetAgentsAsync(request, teamId, status);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [RequirePermission("agents.view")]
    public async Task<ActionResult<AgentDetailDto>> GetAgent(Guid id)
    {
        var agent = await _agentService.GetAgentByIdAsync(id);
        if (agent == null) return NotFound();
        return Ok(agent);
    }

    [HttpPost]
    [RequirePermission("agents.create")]
    public async Task<ActionResult<AgentDto>> CreateAgent([FromBody] CreateAgentRequest request)
    {
        var agent = await _agentService.CreateAgentAsync(request);
        return CreatedAtAction(nameof(GetAgent), new { id = agent.Id }, agent);
    }

    [HttpPut("{id}")]
    [RequirePermission("agents.edit")]
    public async Task<ActionResult<AgentDto>> UpdateAgent(Guid id, [FromBody] UpdateAgentRequest request)
    {
        var agent = await _agentService.UpdateAgentAsync(id, request);
        if (agent == null) return NotFound();
        return Ok(agent);
    }

    [HttpDelete("{id}")]
    [RequirePermission("agents.delete")]
    public async Task<ActionResult> DeleteAgent(Guid id)
    {
        var result = await _agentService.DeleteAgentAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("team/{teamId}")]
    [RequirePermission("agents.view")]
    public async Task<ActionResult<List<AgentDto>>> GetAgentsByTeam(Guid teamId)
    {
        var agents = await _agentService.GetAgentsByTeamAsync(teamId);
        return Ok(agents);
    }

    [HttpGet("status/{status}")]
    [RequirePermission("agents.view")]
    public async Task<ActionResult<List<AgentDto>>> GetAgentsByStatus(AgentStatus status)
    {
        var agents = await _agentService.GetAgentsByStatusAsync(status);
        return Ok(agents);
    }

    #region Agent Roles Management

    /// <summary>
    /// Get roles assigned to an agent
    /// </summary>
    [HttpGet("{id:guid}/roles")]
    [RequirePermission("agents.view")]
    public async Task<ActionResult<List<RoleDto>>> GetAgentRoles(Guid id)
    {
        var agent = await _agentService.GetAgentByIdAsync(id);
        if (agent == null)
            return NotFound(new { message = "Agent not found" });

        var roles = await _roleService.GetAgentRolesAsync(id);
        return Ok(roles);
    }

    /// <summary>
    /// Assign roles to an agent
    /// </summary>
    [HttpPost("{id:guid}/roles")]
    [RequirePermission("agents.assign_roles")]
    public async Task<ActionResult> AssignRoles(Guid id, [FromBody] AssignRolesRequest request)
    {
        var agent = await _agentService.GetAgentByIdAsync(id);
        if (agent == null)
            return NotFound(new { message = "Agent not found" });

        if (request.RoleIds == null || !request.RoleIds.Any())
            return BadRequest(new { message = "At least one role ID is required" });

        var userId = GetCurrentUserId();
        var result = await _roleService.AssignRolesToAgentAsync(id, request, userId);

        if (!result)
            return BadRequest(new { message = "Failed to assign roles" });

        return Ok(new { message = "Roles assigned successfully" });
    }

    /// <summary>
    /// Remove a role from an agent
    /// </summary>
    [HttpDelete("{agentId:guid}/roles/{roleId:guid}")]
    [RequirePermission("agents.assign_roles")]
    public async Task<ActionResult> RemoveRole(Guid agentId, Guid roleId)
    {
        var agent = await _agentService.GetAgentByIdAsync(agentId);
        if (agent == null)
            return NotFound(new { message = "Agent not found" });

        var result = await _roleService.RemoveRoleFromAgentAsync(agentId, roleId);
        if (!result)
            return NotFound(new { message = "Role assignment not found" });

        return NoContent();
    }

    /// <summary>
    /// Get permissions summary for an agent
    /// </summary>
    [HttpGet("{id:guid}/permissions")]
    [RequirePermission("agents.view")]
    public async Task<ActionResult<AgentPermissionsDto>> GetAgentPermissions(Guid id)
    {
        var agent = await _agentService.GetAgentByIdAsync(id);
        if (agent == null)
            return NotFound(new { message = "Agent not found" });

        var summary = await _permissionService.GetAgentPermissionsSummaryAsync(id);
        return Ok(summary);
    }

    #endregion

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}
