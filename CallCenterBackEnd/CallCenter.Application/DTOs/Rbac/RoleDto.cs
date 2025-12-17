namespace CallCenter.Application.DTOs.Rbac;

public class RoleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SystemName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystemRole { get; set; }
    public bool IsSuperAdmin { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public int AgentCount { get; set; }
    public int PermissionCount { get; set; }
}

public class RoleDetailDto : RoleDto
{
    public DateTime UpdatedAt { get; set; }
    public List<PermissionDto> Permissions { get; set; } = new();
    public List<RoleAgentDto> Agents { get; set; } = new();
}

public class RoleAgentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
}

public class CreateRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string SystemName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public List<Guid>? PermissionIds { get; set; }
}

public class UpdateRoleRequest
{
    public string? Name { get; set; }
    public string? SystemName { get; set; }
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
}

public class AssignPermissionsRequest
{
    public List<Guid> PermissionIds { get; set; } = new();
    /// <summary>
    /// If true, removes permissions not in the list. If false, only adds new permissions.
    /// </summary>
    public bool ReplaceExisting { get; set; } = false;
}

public class AssignRolesRequest
{
    public List<Guid> RoleIds { get; set; } = new();
    /// <summary>
    /// If true, removes roles not in the list. If false, only adds new roles.
    /// </summary>
    public bool ReplaceExisting { get; set; } = false;
}
