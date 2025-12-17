using Microsoft.AspNetCore.Authorization;

namespace CallCenter.API.Authorization;

/// <summary>
/// Requires the user to have one of the specified permissions (OR logic).
/// Super admin users bypass this check.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RequirePermissionAttribute : AuthorizeAttribute
{
    public const string PolicyPrefix = "Permission_";

    public RequirePermissionAttribute(params string[] permissions)
    {
        // Join permissions with comma for OR logic
        // The policy provider will parse this
        Permissions = permissions;
        Policy = $"{PolicyPrefix}{string.Join(",", permissions)}";
    }

    public string[] Permissions { get; }
}

/// <summary>
/// Requires the user to have ALL of the specified permissions (AND logic).
/// Super admin users bypass this check.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RequireAllPermissionsAttribute : AuthorizeAttribute
{
    public const string PolicyPrefix = "AllPermissions_";

    public RequireAllPermissionsAttribute(params string[] permissions)
    {
        Permissions = permissions;
        Policy = $"{PolicyPrefix}{string.Join(",", permissions)}";
    }

    public string[] Permissions { get; }
}
