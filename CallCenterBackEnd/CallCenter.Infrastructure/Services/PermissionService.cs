using CallCenter.Application.DTOs.Rbac;
using CallCenter.Application.Services;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace CallCenter.Infrastructure.Services;

public class PermissionService : IPermissionService
{
    private readonly IRepository<Agent> _agentRepository;
    private readonly IRepository<Role> _roleRepository;
    private readonly IRepository<Permission> _permissionRepository;
    private readonly IRepository<AgentRoleAssignment> _agentRoleRepository;
    private readonly IRepository<RolePermission> _rolePermissionRepository;
    private readonly IMemoryCache _cache;

    private const string AgentPermissionsCacheKey = "agent_permissions_{0}";
    private const string AgentRolesCacheKey = "agent_roles_{0}";
    private const string AgentIsSuperAdminCacheKey = "agent_is_superadmin_{0}";
    private const string AllPermissionsCacheKey = "all_permissions";
    private const string AllModulesCacheKey = "all_modules";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(15);

    public PermissionService(
        IRepository<Agent> agentRepository,
        IRepository<Role> roleRepository,
        IRepository<Permission> permissionRepository,
        IRepository<AgentRoleAssignment> agentRoleRepository,
        IRepository<RolePermission> rolePermissionRepository,
        IMemoryCache cache)
    {
        _agentRepository = agentRepository;
        _roleRepository = roleRepository;
        _permissionRepository = permissionRepository;
        _agentRoleRepository = agentRoleRepository;
        _rolePermissionRepository = rolePermissionRepository;
        _cache = cache;
    }

    public async Task<bool> HasPermissionAsync(Guid agentId, string permissionSystemName)
    {
        // Super admin bypasses all permission checks
        if (await IsSuperAdminAsync(agentId))
            return true;

        var permissions = await GetAgentPermissionsAsync(agentId);
        return permissions.Contains(permissionSystemName, StringComparer.OrdinalIgnoreCase);
    }

    public async Task<bool> HasAnyPermissionAsync(Guid agentId, params string[] permissionSystemNames)
    {
        if (await IsSuperAdminAsync(agentId))
            return true;

        var permissions = await GetAgentPermissionsAsync(agentId);
        return permissionSystemNames.Any(p => permissions.Contains(p, StringComparer.OrdinalIgnoreCase));
    }

    public async Task<bool> HasAllPermissionsAsync(Guid agentId, params string[] permissionSystemNames)
    {
        if (await IsSuperAdminAsync(agentId))
            return true;

        var permissions = await GetAgentPermissionsAsync(agentId);
        return permissionSystemNames.All(p => permissions.Contains(p, StringComparer.OrdinalIgnoreCase));
    }

    public async Task<bool> IsSuperAdminAsync(Guid agentId)
    {
        var cacheKey = string.Format(AgentIsSuperAdminCacheKey, agentId);

        if (_cache.TryGetValue(cacheKey, out bool isSuperAdmin))
            return isSuperAdmin;

        // Check if agent has any role with IsSuperAdmin = true
        var agentRoles = await _agentRoleRepository.GetQueryable()
            .Include(ar => ar.Role)
            .Where(ar => ar.AgentId == agentId && ar.Role.IsActive)
            .Select(ar => ar.Role)
            .ToListAsync();

        isSuperAdmin = agentRoles.Any(r => r.IsSuperAdmin);

        _cache.Set(cacheKey, isSuperAdmin, CacheDuration);
        return isSuperAdmin;
    }

    public async Task<List<string>> GetAgentPermissionsAsync(Guid agentId)
    {
        var cacheKey = string.Format(AgentPermissionsCacheKey, agentId);

        if (_cache.TryGetValue(cacheKey, out List<string>? cachedPermissions) && cachedPermissions != null)
            return cachedPermissions;

        // Get all role IDs for this agent
        var roleIds = await _agentRoleRepository.GetQueryable()
            .Include(ar => ar.Role)
            .Where(ar => ar.AgentId == agentId && ar.Role.IsActive)
            .Select(ar => ar.RoleId)
            .ToListAsync();

        if (!roleIds.Any())
        {
            _cache.Set(cacheKey, new List<string>(), CacheDuration);
            return new List<string>();
        }

        // Get all permissions for these roles (combined/merged)
        var permissions = await _rolePermissionRepository.GetQueryable()
            .Include(rp => rp.Permission)
            .Where(rp => roleIds.Contains(rp.RoleId))
            .Select(rp => rp.Permission.SystemName)
            .Distinct()
            .ToListAsync();

        _cache.Set(cacheKey, permissions, CacheDuration);
        return permissions;
    }

    public async Task<List<RoleDto>> GetAgentRolesAsync(Guid agentId)
    {
        var cacheKey = string.Format(AgentRolesCacheKey, agentId);

        if (_cache.TryGetValue(cacheKey, out List<RoleDto>? cachedRoles) && cachedRoles != null)
            return cachedRoles;

        var roles = await _agentRoleRepository.GetQueryable()
            .Include(ar => ar.Role)
            .Where(ar => ar.AgentId == agentId && ar.Role.IsActive)
            .Select(ar => new RoleDto
            {
                Id = ar.Role.Id,
                Name = ar.Role.Name,
                SystemName = ar.Role.SystemName,
                Description = ar.Role.Description,
                IsSystemRole = ar.Role.IsSystemRole,
                IsSuperAdmin = ar.Role.IsSuperAdmin,
                IsActive = ar.Role.IsActive,
                CreatedAt = ar.Role.CreatedAt
            })
            .ToListAsync();

        _cache.Set(cacheKey, roles, CacheDuration);
        return roles;
    }

    public async Task<AgentPermissionsDto> GetAgentPermissionsSummaryAsync(Guid agentId)
    {
        var agents = await _agentRepository.GetAllAsync();
        var agent = agents.FirstOrDefault(a => a.Id == agentId);
        if (agent == null)
        {
            return new AgentPermissionsDto { AgentId = agentId };
        }

        var isSuperAdmin = await IsSuperAdminAsync(agentId);
        var roles = await GetAgentRolesAsync(agentId);
        var permissions = await GetAgentPermissionsAsync(agentId);

        return new AgentPermissionsDto
        {
            AgentId = agentId,
            AgentName = agent.Name,
            Email = agent.Email,
            IsSuperAdmin = isSuperAdmin,
            Roles = roles.Select(r => r.SystemName).ToList(),
            Permissions = permissions
        };
    }

    public async Task<List<PermissionDto>> GetAllPermissionsAsync()
    {
        if (_cache.TryGetValue(AllPermissionsCacheKey, out List<PermissionDto>? cachedPermissions) && cachedPermissions != null)
            return cachedPermissions;

        var permissions = await _permissionRepository.GetQueryable()
            .OrderBy(p => p.Module)
            .ThenBy(p => p.DisplayOrder)
            .Select(p => new PermissionDto
            {
                Id = p.Id,
                Name = p.Name,
                SystemName = p.SystemName,
                Module = p.Module,
                Description = p.Description,
                DisplayOrder = p.DisplayOrder
            })
            .ToListAsync();

        _cache.Set(AllPermissionsCacheKey, permissions, CacheDuration);
        return permissions;
    }

    public async Task<List<PermissionGroupDto>> GetPermissionsGroupedByModuleAsync()
    {
        var allPermissions = await GetAllPermissionsAsync();

        return allPermissions
            .GroupBy(p => p.Module)
            .Select(g => new PermissionGroupDto
            {
                Module = g.Key,
                Permissions = g.OrderBy(p => p.DisplayOrder).ToList()
            })
            .OrderBy(g => g.Permissions.FirstOrDefault()?.DisplayOrder ?? 0)
            .ToList();
    }

    public async Task<List<string>> GetAllModulesAsync()
    {
        if (_cache.TryGetValue(AllModulesCacheKey, out List<string>? cachedModules) && cachedModules != null)
            return cachedModules;

        var modules = await _permissionRepository.GetQueryable()
            .Select(p => p.Module)
            .Distinct()
            .OrderBy(m => m)
            .ToListAsync();

        _cache.Set(AllModulesCacheKey, modules, CacheDuration);
        return modules;
    }

    public void InvalidateAgentCache(Guid agentId)
    {
        _cache.Remove(string.Format(AgentPermissionsCacheKey, agentId));
        _cache.Remove(string.Format(AgentRolesCacheKey, agentId));
        _cache.Remove(string.Format(AgentIsSuperAdminCacheKey, agentId));
    }

    public void InvalidateRoleCache(Guid roleId)
    {
        // When a role changes, we need to invalidate all agents who have this role
        // For simplicity, we'll just clear all agent caches by invalidating the entire cache
        // In production, you might want to track which agents have which roles
        InvalidateAllCache();
    }

    public void InvalidateAllCache()
    {
        // IMemoryCache doesn't have a Clear method, so we rely on cache expiration
        // For immediate invalidation, you would need to track all cache keys or use a different cache implementation
        // For now, we'll remove known static keys
        _cache.Remove(AllPermissionsCacheKey);
        _cache.Remove(AllModulesCacheKey);

        // Note: Agent-specific caches will expire naturally or need to be tracked separately
        // In a production system, consider using a distributed cache with pattern-based invalidation
    }
}
