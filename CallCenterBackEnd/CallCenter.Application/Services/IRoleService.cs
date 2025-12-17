using CallCenter.Application.DTOs.Rbac;

namespace CallCenter.Application.Services;

public interface IRoleService
{
    // Role CRUD
    Task<List<RoleDto>> GetAllRolesAsync();
    Task<RoleDetailDto?> GetRoleByIdAsync(Guid roleId);
    Task<RoleDetailDto?> GetRoleBySystemNameAsync(string systemName);
    Task<RoleDto> CreateRoleAsync(CreateRoleRequest request, Guid createdById);
    Task<RoleDto?> UpdateRoleAsync(Guid roleId, UpdateRoleRequest request);
    Task<bool> DeleteRoleAsync(Guid roleId);

    // Role-Permission management
    Task<bool> AssignPermissionsToRoleAsync(Guid roleId, AssignPermissionsRequest request, Guid assignedById);
    Task<bool> RemovePermissionFromRoleAsync(Guid roleId, Guid permissionId);
    Task<List<PermissionDto>> GetRolePermissionsAsync(Guid roleId);

    // Agent-Role management
    Task<List<RoleDto>> GetAgentRolesAsync(Guid agentId);
    Task<bool> AssignRolesToAgentAsync(Guid agentId, AssignRolesRequest request, Guid assignedById);
    Task<bool> RemoveRoleFromAgentAsync(Guid agentId, Guid roleId);

    // Validation helpers
    Task<bool> RoleExistsAsync(Guid roleId);
    Task<bool> RoleSystemNameExistsAsync(string systemName, Guid? excludeRoleId = null);
}
