using System.Security.Claims;
using CallCenter.API.Authorization;
using CallCenter.Application.DTOs.Rbac;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly IPermissionService _permissionService;

    public PermissionsController(IPermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    /// <summary>
    /// Get all permissions
    /// </summary>
    [HttpGet]
    [RequirePermission("system.permissions_view", "system.roles_manage")]
    public async Task<ActionResult<List<PermissionDto>>> GetAll()
    {
        var permissions = await _permissionService.GetAllPermissionsAsync();
        return Ok(permissions);
    }

    /// <summary>
    /// Get all permissions grouped by module
    /// </summary>
    [HttpGet("grouped")]
    [RequirePermission("system.permissions_view", "system.roles_manage")]
    public async Task<ActionResult<List<PermissionGroupDto>>> GetGrouped()
    {
        var groups = await _permissionService.GetPermissionsGroupedByModuleAsync();
        return Ok(groups);
    }

    /// <summary>
    /// Get all module names
    /// </summary>
    [HttpGet("modules")]
    [RequirePermission("system.permissions_view", "system.roles_manage")]
    public async Task<ActionResult<List<string>>> GetModules()
    {
        var modules = await _permissionService.GetAllModulesAsync();
        return Ok(modules);
    }

    /// <summary>
    /// Get current user's permissions summary
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<AgentPermissionsDto>> GetMyPermissions()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var summary = await _permissionService.GetAgentPermissionsSummaryAsync(userId);
        return Ok(summary);
    }

    /// <summary>
    /// Check if current user has a specific permission
    /// </summary>
    [HttpGet("me/check/{permission}")]
    public async Task<ActionResult<bool>> CheckMyPermission(string permission)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var hasPermission = await _permissionService.HasPermissionAsync(userId, permission);
        return Ok(new { permission, hasPermission });
    }

    /// <summary>
    /// Check if current user has any of the specified permissions
    /// </summary>
    [HttpPost("me/check-any")]
    public async Task<ActionResult> CheckAnyPermissions([FromBody] string[] permissions)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var hasAny = await _permissionService.HasAnyPermissionAsync(userId, permissions);
        return Ok(new { permissions, hasAny });
    }

    /// <summary>
    /// Check if current user has all of the specified permissions
    /// </summary>
    [HttpPost("me/check-all")]
    public async Task<ActionResult> CheckAllPermissions([FromBody] string[] permissions)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var hasAll = await _permissionService.HasAllPermissionsAsync(userId, permissions);
        return Ok(new { permissions, hasAll });
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}
