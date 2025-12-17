using Microsoft.AspNetCore.Authorization;

namespace CallCenter.API.Authorization;

/// <summary>
/// Authorization requirement for permission-based access control.
/// </summary>
public class PermissionRequirement : IAuthorizationRequirement
{
    public string[] Permissions { get; }
    public bool RequireAll { get; }

    /// <summary>
    /// Creates a permission requirement.
    /// </summary>
    /// <param name="permissions">The permissions to check</param>
    /// <param name="requireAll">If true, user must have ALL permissions. If false, user needs ANY one permission.</param>
    public PermissionRequirement(string[] permissions, bool requireAll = false)
    {
        Permissions = permissions;
        RequireAll = requireAll;
    }
}
