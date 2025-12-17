using CallCenter.Application.DTOs.Rbac;

namespace CallCenter.Application.Services;

public interface IPermissionService
{
    // Permission checking
    Task<bool> HasPermissionAsync(Guid agentId, string permissionSystemName);
    Task<bool> HasAnyPermissionAsync(Guid agentId, params string[] permissionSystemNames);
    Task<bool> HasAllPermissionsAsync(Guid agentId, params string[] permissionSystemNames);
    Task<bool> IsSuperAdminAsync(Guid agentId);

    // Get permissions for an agent
    Task<List<string>> GetAgentPermissionsAsync(Guid agentId);
    Task<List<RoleDto>> GetAgentRolesAsync(Guid agentId);
    Task<AgentPermissionsDto> GetAgentPermissionsSummaryAsync(Guid agentId);

    // Get all permissions and roles
    Task<List<PermissionDto>> GetAllPermissionsAsync();
    Task<List<PermissionGroupDto>> GetPermissionsGroupedByModuleAsync();
    Task<List<string>> GetAllModulesAsync();

    // Cache management
    void InvalidateAgentCache(Guid agentId);
    void InvalidateRoleCache(Guid roleId);
    void InvalidateAllCache();
}
