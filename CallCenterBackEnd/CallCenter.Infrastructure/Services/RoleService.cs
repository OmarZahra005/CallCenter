using CallCenter.Application.DTOs.AuditLogs;
using CallCenter.Application.DTOs.Rbac;
using CallCenter.Application.Services;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CallCenter.Infrastructure.Services;

public class RoleService : IRoleService
{
    private readonly IRepository<Role> _roleRepository;
    private readonly IRepository<Permission> _permissionRepository;
    private readonly IRepository<RolePermission> _rolePermissionRepository;
    private readonly IRepository<AgentRoleAssignment> _agentRoleRepository;
    private readonly IRepository<Agent> _agentRepository;
    private readonly IPermissionService _permissionService;
    private readonly IAuditLogService _auditLogService;

    public RoleService(
        IRepository<Role> roleRepository,
        IRepository<Permission> permissionRepository,
        IRepository<RolePermission> rolePermissionRepository,
        IRepository<AgentRoleAssignment> agentRoleRepository,
        IRepository<Agent> agentRepository,
        IPermissionService permissionService,
        IAuditLogService auditLogService)
    {
        _roleRepository = roleRepository;
        _permissionRepository = permissionRepository;
        _rolePermissionRepository = rolePermissionRepository;
        _agentRoleRepository = agentRoleRepository;
        _agentRepository = agentRepository;
        _permissionService = permissionService;
        _auditLogService = auditLogService;
    }

    #region Role CRUD

    public async Task<List<RoleDto>> GetAllRolesAsync()
    {
        var roles = await _roleRepository.GetQueryable()
            .OrderBy(r => r.IsSystemRole ? 0 : 1)
            .ThenBy(r => r.Name)
            .Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                SystemName = r.SystemName,
                Description = r.Description,
                IsSystemRole = r.IsSystemRole,
                IsSuperAdmin = r.IsSuperAdmin,
                IsActive = r.IsActive,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return roles;
    }

    public async Task<RoleDetailDto?> GetRoleByIdAsync(Guid roleId)
    {
        var role = await _roleRepository.GetQueryable()
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Id == roleId);

        if (role == null)
            return null;

        return MapToRoleDetailDto(role);
    }

    public async Task<RoleDetailDto?> GetRoleBySystemNameAsync(string systemName)
    {
        var role = await _roleRepository.GetQueryable()
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.SystemName == systemName);

        if (role == null)
            return null;

        return MapToRoleDetailDto(role);
    }

    public async Task<RoleDto> CreateRoleAsync(CreateRoleRequest request, Guid createdById)
    {
        var creator = await GetAgentInfoAsync(createdById);

        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            SystemName = request.SystemName.ToLowerInvariant().Replace(" ", "_"),
            Description = request.Description,
            IsSystemRole = false, // User-created roles are never system roles
            IsSuperAdmin = false, // User-created roles are never super admin
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedById = createdById
        };

        await _roleRepository.AddAsync(role);
        await _roleRepository.SaveChangesAsync();

        // Assign initial permissions if provided
        if (request.PermissionIds?.Any() == true)
        {
            await AssignPermissionsToRoleAsync(role.Id, new AssignPermissionsRequest
            {
                PermissionIds = request.PermissionIds
            }, createdById);
        }

        // Audit log
        await _auditLogService.CreateLogAsync(new CreateAuditLogRequest
        {
            Operation = AuditOperation.Create,
            EntityType = AuditEntityType.Role,
            EntityId = role.Id.ToString(),
            EntityName = role.Name,
            UserId = createdById,
            UserName = creator?.Name ?? "Unknown",
            UserEmail = creator?.Email,
            AdditionalInfo = JsonSerializer.Serialize(new { role.SystemName, role.Description, PermissionCount = request.PermissionIds?.Count ?? 0 })
        });

        return new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            SystemName = role.SystemName,
            Description = role.Description,
            IsSystemRole = role.IsSystemRole,
            IsSuperAdmin = role.IsSuperAdmin,
            IsActive = role.IsActive,
            CreatedAt = role.CreatedAt
        };
    }

    public async Task<RoleDto?> UpdateRoleAsync(Guid roleId, UpdateRoleRequest request)
    {
        var role = await _roleRepository.GetQueryable()
            .FirstOrDefaultAsync(r => r.Id == roleId);

        if (role == null)
            return null;

        // System roles have limited editability
        if (!role.IsSystemRole)
        {
            if (!string.IsNullOrWhiteSpace(request.Name))
                role.Name = request.Name;

            if (!string.IsNullOrWhiteSpace(request.SystemName))
                role.SystemName = request.SystemName.ToLowerInvariant().Replace(" ", "_");
        }

        // Description can always be updated
        if (request.Description != null)
            role.Description = request.Description;

        // IsActive can be changed for non-super-admin roles
        if (request.IsActive.HasValue && !role.IsSuperAdmin)
            role.IsActive = request.IsActive.Value;

        role.UpdatedAt = DateTime.UtcNow;

        _roleRepository.Update(role);
        await _roleRepository.SaveChangesAsync();

        // Invalidate cache for all agents with this role
        _permissionService.InvalidateRoleCache(roleId);

        return new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            SystemName = role.SystemName,
            Description = role.Description,
            IsSystemRole = role.IsSystemRole,
            IsSuperAdmin = role.IsSuperAdmin,
            IsActive = role.IsActive,
            CreatedAt = role.CreatedAt
        };
    }

    public async Task<bool> DeleteRoleAsync(Guid roleId)
    {
        var role = await _roleRepository.GetQueryable()
            .FirstOrDefaultAsync(r => r.Id == roleId);

        if (role == null)
            return false;

        // Cannot delete system roles
        if (role.IsSystemRole)
            return false;

        // Remove all role-permission assignments
        var rolePermissions = await _rolePermissionRepository.GetQueryable()
            .Where(rp => rp.RoleId == roleId)
            .ToListAsync();

        foreach (var rp in rolePermissions)
        {
            _rolePermissionRepository.DeleteAsync(rp);
        }

        // Remove all agent-role assignments
        var agentRoles = await _agentRoleRepository.GetQueryable()
            .Where(ar => ar.RoleId == roleId)
            .ToListAsync();

        foreach (var ar in agentRoles)
        {
            _agentRoleRepository.DeleteAsync(ar);
        }

        _roleRepository.DeleteAsync(role);
        await _roleRepository.SaveChangesAsync();

        // Invalidate all caches
        _permissionService.InvalidateAllCache();

        return true;
    }

    #endregion

    #region Role-Permission Management

    public async Task<bool> AssignPermissionsToRoleAsync(Guid roleId, AssignPermissionsRequest request, Guid assignedById)
    {
        var role = await _roleRepository.GetQueryable()
            .FirstOrDefaultAsync(r => r.Id == roleId);

        if (role == null)
            return false;

        var assigner = await GetAgentInfoAsync(assignedById);

        // Get existing permission assignments
        var existingPermissions = await _rolePermissionRepository.GetQueryable()
            .Where(rp => rp.RoleId == roleId)
            .Select(rp => rp.PermissionId)
            .ToListAsync();

        var addedPermissions = new List<Guid>();
        var removedPermissions = new List<Guid>();

        // Add new permissions
        foreach (var permissionId in request.PermissionIds)
        {
            if (!existingPermissions.Contains(permissionId))
            {
                // Verify permission exists
                var permissionExists = await _permissionRepository.GetQueryable()
                    .AnyAsync(p => p.Id == permissionId);

                if (permissionExists)
                {
                    var rolePermission = new RolePermission
                    {
                        RoleId = roleId,
                        PermissionId = permissionId,
                        AssignedAt = DateTime.UtcNow,
                        AssignedById = assignedById
                    };
                    await _rolePermissionRepository.AddAsync(rolePermission);
                    addedPermissions.Add(permissionId);
                }
            }
        }

        // If ReplaceExisting is true, remove permissions not in the new list
        if (request.ReplaceExisting)
        {
            var permissionsToRemove = existingPermissions
                .Where(p => !request.PermissionIds.Contains(p))
                .ToList();

            foreach (var permissionId in permissionsToRemove)
            {
                var rp = await _rolePermissionRepository.GetQueryable()
                    .FirstOrDefaultAsync(x => x.RoleId == roleId && x.PermissionId == permissionId);

                if (rp != null)
                {
                    _rolePermissionRepository.DeleteAsync(rp);
                    removedPermissions.Add(permissionId);
                }
            }
        }

        await _rolePermissionRepository.SaveChangesAsync();

        // Invalidate cache
        _permissionService.InvalidateRoleCache(roleId);

        // Audit log
        if (addedPermissions.Any() || removedPermissions.Any())
        {
            await _auditLogService.CreateLogAsync(new CreateAuditLogRequest
            {
                Operation = AuditOperation.PermissionChange,
                EntityType = AuditEntityType.RolePermission,
                EntityId = roleId.ToString(),
                EntityName = role.Name,
                UserId = assignedById,
                UserName = assigner?.Name ?? "Unknown",
                UserEmail = assigner?.Email,
                Changes = JsonSerializer.Serialize(new { Added = addedPermissions, Removed = removedPermissions }),
                AdditionalInfo = JsonSerializer.Serialize(new { ReplaceExisting = request.ReplaceExisting })
            });
        }

        return true;
    }

    public async Task<bool> RemovePermissionFromRoleAsync(Guid roleId, Guid permissionId)
    {
        var rolePermission = await _rolePermissionRepository.GetQueryable()
            .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

        if (rolePermission == null)
            return false;

        _rolePermissionRepository.DeleteAsync(rolePermission);
        await _rolePermissionRepository.SaveChangesAsync();

        // Invalidate cache
        _permissionService.InvalidateRoleCache(roleId);

        return true;
    }

    public async Task<List<PermissionDto>> GetRolePermissionsAsync(Guid roleId)
    {
        var permissions = await _rolePermissionRepository.GetQueryable()
            .Include(rp => rp.Permission)
            .Where(rp => rp.RoleId == roleId)
            .Select(rp => new PermissionDto
            {
                Id = rp.Permission.Id,
                Name = rp.Permission.Name,
                SystemName = rp.Permission.SystemName,
                Module = rp.Permission.Module,
                Description = rp.Permission.Description,
                DisplayOrder = rp.Permission.DisplayOrder
            })
            .OrderBy(p => p.Module)
            .ThenBy(p => p.DisplayOrder)
            .ToListAsync();

        return permissions;
    }

    #endregion

    #region Agent-Role Management

    public async Task<List<RoleDto>> GetAgentRolesAsync(Guid agentId)
    {
        var roles = await _agentRoleRepository.GetQueryable()
            .Include(ar => ar.Role)
            .Where(ar => ar.AgentId == agentId)
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

        return roles;
    }

    public async Task<bool> AssignRolesToAgentAsync(Guid agentId, AssignRolesRequest request, Guid assignedById)
    {
        var targetAgent = await GetAgentInfoAsync(agentId);
        var assigner = await GetAgentInfoAsync(assignedById);

        // Get existing role assignments
        var existingRoles = await _agentRoleRepository.GetQueryable()
            .Where(ar => ar.AgentId == agentId)
            .Select(ar => ar.RoleId)
            .ToListAsync();

        var addedRoles = new List<Guid>();
        var removedRoles = new List<Guid>();

        // Add new roles
        foreach (var roleId in request.RoleIds)
        {
            if (!existingRoles.Contains(roleId))
            {
                // Verify role exists and is active
                var roleExists = await _roleRepository.GetQueryable()
                    .AnyAsync(r => r.Id == roleId && r.IsActive);

                if (roleExists)
                {
                    var agentRole = new AgentRoleAssignment
                    {
                        AgentId = agentId,
                        RoleId = roleId,
                        AssignedAt = DateTime.UtcNow,
                        AssignedById = assignedById
                    };
                    await _agentRoleRepository.AddAsync(agentRole);
                    addedRoles.Add(roleId);
                }
            }
        }

        // If ReplaceExisting is true, remove roles not in the new list
        if (request.ReplaceExisting)
        {
            var rolesToRemove = existingRoles
                .Where(r => !request.RoleIds.Contains(r))
                .ToList();

            foreach (var roleId in rolesToRemove)
            {
                var ar = await _agentRoleRepository.GetQueryable()
                    .FirstOrDefaultAsync(x => x.AgentId == agentId && x.RoleId == roleId);

                if (ar != null)
                {
                    _agentRoleRepository.DeleteAsync(ar);
                    removedRoles.Add(roleId);
                }
            }
        }

        await _agentRoleRepository.SaveChangesAsync();

        // Invalidate agent's cache
        _permissionService.InvalidateAgentCache(agentId);

        // Audit log
        if (addedRoles.Any() || removedRoles.Any())
        {
            await _auditLogService.CreateLogAsync(new CreateAuditLogRequest
            {
                Operation = AuditOperation.RoleAssignment,
                EntityType = AuditEntityType.AgentRoleAssignment,
                EntityId = agentId.ToString(),
                EntityName = targetAgent?.Name ?? "Unknown Agent",
                UserId = assignedById,
                UserName = assigner?.Name ?? "Unknown",
                UserEmail = assigner?.Email,
                Changes = JsonSerializer.Serialize(new { AddedRoles = addedRoles, RemovedRoles = removedRoles }),
                AdditionalInfo = JsonSerializer.Serialize(new { TargetAgentEmail = targetAgent?.Email, ReplaceExisting = request.ReplaceExisting })
            });
        }

        return true;
    }

    public async Task<bool> RemoveRoleFromAgentAsync(Guid agentId, Guid roleId)
    {
        var agentRole = await _agentRoleRepository.GetQueryable()
            .FirstOrDefaultAsync(ar => ar.AgentId == agentId && ar.RoleId == roleId);

        if (agentRole == null)
            return false;

        _agentRoleRepository.DeleteAsync(agentRole);
        await _agentRoleRepository.SaveChangesAsync();

        // Invalidate agent's cache
        _permissionService.InvalidateAgentCache(agentId);

        return true;
    }

    #endregion

    #region Validation Helpers

    public async Task<bool> RoleExistsAsync(Guid roleId)
    {
        return await _roleRepository.GetQueryable()
            .AnyAsync(r => r.Id == roleId);
    }

    public async Task<bool> RoleSystemNameExistsAsync(string systemName, Guid? excludeRoleId = null)
    {
        var query = _roleRepository.GetQueryable()
            .Where(r => r.SystemName == systemName.ToLowerInvariant());

        if (excludeRoleId.HasValue)
        {
            query = query.Where(r => r.Id != excludeRoleId.Value);
        }

        return await query.AnyAsync();
    }

    #endregion

    #region Private Methods

    private static RoleDetailDto MapToRoleDetailDto(Role role)
    {
        return new RoleDetailDto
        {
            Id = role.Id,
            Name = role.Name,
            SystemName = role.SystemName,
            Description = role.Description,
            IsSystemRole = role.IsSystemRole,
            IsSuperAdmin = role.IsSuperAdmin,
            IsActive = role.IsActive,
            CreatedAt = role.CreatedAt,
            UpdatedAt = role.UpdatedAt,
            Permissions = role.RolePermissions
                .Select(rp => new PermissionDto
                {
                    Id = rp.Permission.Id,
                    Name = rp.Permission.Name,
                    SystemName = rp.Permission.SystemName,
                    Module = rp.Permission.Module,
                    Description = rp.Permission.Description,
                    DisplayOrder = rp.Permission.DisplayOrder
                })
                .OrderBy(p => p.Module)
                .ThenBy(p => p.DisplayOrder)
                .ToList()
        };
    }

    private async Task<Agent?> GetAgentInfoAsync(Guid agentId)
    {
        var agents = await _agentRepository.GetAllAsync();
        return agents.FirstOrDefault(a => a.Id == agentId);
    }

    #endregion
}
