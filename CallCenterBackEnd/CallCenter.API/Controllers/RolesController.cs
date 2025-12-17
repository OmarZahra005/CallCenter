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
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;
    private readonly ILogger<RolesController> _logger;

    public RolesController(IRoleService roleService, ILogger<RolesController> logger)
    {
        _roleService = roleService;
        _logger = logger;
    }

    /// <summary>
    /// Get all roles
    /// </summary>
    [HttpGet]
    [RequirePermission("system.roles_manage")]
    public async Task<ActionResult<List<RoleDto>>> GetAll()
    {
        var roles = await _roleService.GetAllRolesAsync();
        return Ok(roles);
    }

    /// <summary>
    /// Get role by ID with permissions
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("system.roles_manage")]
    public async Task<ActionResult<RoleDetailDto>> GetById(Guid id)
    {
        var role = await _roleService.GetRoleByIdAsync(id);
        if (role == null)
            return NotFound(new { message = "Role not found" });

        return Ok(role);
    }

    /// <summary>
    /// Get role by system name with permissions
    /// </summary>
    [HttpGet("by-name/{systemName}")]
    [RequirePermission("system.roles_manage")]
    public async Task<ActionResult<RoleDetailDto>> GetBySystemName(string systemName)
    {
        var role = await _roleService.GetRoleBySystemNameAsync(systemName);
        if (role == null)
            return NotFound(new { message = "Role not found" });

        return Ok(role);
    }

    /// <summary>
    /// Create a new role
    /// </summary>
    [HttpPost]
    [RequirePermission("system.roles_manage")]
    public async Task<ActionResult<RoleDto>> Create([FromBody] CreateRoleRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Role name is required" });

        if (string.IsNullOrWhiteSpace(request.SystemName))
            return BadRequest(new { message = "System name is required" });

        // Check if system name already exists
        if (await _roleService.RoleSystemNameExistsAsync(request.SystemName))
            return Conflict(new { message = "A role with this system name already exists" });

        var userId = GetCurrentUserId();
        var role = await _roleService.CreateRoleAsync(request, userId);

        _logger.LogInformation("Role {RoleName} created by user {UserId}", role.Name, userId);

        return CreatedAtAction(nameof(GetById), new { id = role.Id }, role);
    }

    /// <summary>
    /// Update an existing role
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("system.roles_manage")]
    public async Task<ActionResult<RoleDto>> Update(Guid id, [FromBody] UpdateRoleRequest request)
    {
        // Check if system name is being changed to an existing one
        if (!string.IsNullOrWhiteSpace(request.SystemName) &&
            await _roleService.RoleSystemNameExistsAsync(request.SystemName, id))
        {
            return Conflict(new { message = "A role with this system name already exists" });
        }

        var role = await _roleService.UpdateRoleAsync(id, request);
        if (role == null)
            return NotFound(new { message = "Role not found" });

        _logger.LogInformation("Role {RoleId} updated by user {UserId}", id, GetCurrentUserId());

        return Ok(role);
    }

    /// <summary>
    /// Delete a role (only non-system roles can be deleted)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("system.roles_manage")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await _roleService.DeleteRoleAsync(id);
        if (!result)
            return BadRequest(new { message = "Role not found or cannot be deleted (system roles cannot be deleted)" });

        _logger.LogInformation("Role {RoleId} deleted by user {UserId}", id, GetCurrentUserId());

        return NoContent();
    }

    /// <summary>
    /// Get permissions assigned to a role
    /// </summary>
    [HttpGet("{id:guid}/permissions")]
    [RequirePermission("system.roles_manage")]
    public async Task<ActionResult<List<PermissionDto>>> GetRolePermissions(Guid id)
    {
        if (!await _roleService.RoleExistsAsync(id))
            return NotFound(new { message = "Role not found" });

        var permissions = await _roleService.GetRolePermissionsAsync(id);
        return Ok(permissions);
    }

    /// <summary>
    /// Assign permissions to a role
    /// </summary>
    [HttpPost("{id:guid}/permissions")]
    [RequirePermission("system.roles_manage")]
    public async Task<ActionResult> AssignPermissions(Guid id, [FromBody] AssignPermissionsRequest request)
    {
        if (request.PermissionIds == null || !request.PermissionIds.Any())
            return BadRequest(new { message = "At least one permission ID is required" });

        var userId = GetCurrentUserId();
        var result = await _roleService.AssignPermissionsToRoleAsync(id, request, userId);

        if (!result)
            return NotFound(new { message = "Role not found" });

        _logger.LogInformation("Permissions assigned to role {RoleId} by user {UserId}", id, userId);

        return Ok(new { message = "Permissions assigned successfully" });
    }

    /// <summary>
    /// Remove a permission from a role
    /// </summary>
    [HttpDelete("{roleId:guid}/permissions/{permissionId:guid}")]
    [RequirePermission("system.roles_manage")]
    public async Task<ActionResult> RemovePermission(Guid roleId, Guid permissionId)
    {
        var result = await _roleService.RemovePermissionFromRoleAsync(roleId, permissionId);
        if (!result)
            return NotFound(new { message = "Role or permission assignment not found" });

        _logger.LogInformation(
            "Permission {PermissionId} removed from role {RoleId} by user {UserId}",
            permissionId, roleId, GetCurrentUserId());

        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}
