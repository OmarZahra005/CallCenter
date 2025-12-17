using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace CallCenter.API.Authorization;

/// <summary>
/// Dynamically creates authorization policies for permission-based access control.
/// Parses policy names with prefixes "Permission_" (OR logic) and "AllPermissions_" (AND logic).
/// </summary>
public class PermissionPolicyProvider : IAuthorizationPolicyProvider
{
    private readonly DefaultAuthorizationPolicyProvider _fallbackPolicyProvider;

    public PermissionPolicyProvider(IOptions<AuthorizationOptions> options)
    {
        _fallbackPolicyProvider = new DefaultAuthorizationPolicyProvider(options);
    }

    public Task<AuthorizationPolicy> GetDefaultPolicyAsync()
    {
        return _fallbackPolicyProvider.GetDefaultPolicyAsync();
    }

    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync()
    {
        return _fallbackPolicyProvider.GetFallbackPolicyAsync();
    }

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        // Handle OR logic: Permission_perm1,perm2,perm3
        if (policyName.StartsWith(RequirePermissionAttribute.PolicyPrefix, StringComparison.OrdinalIgnoreCase))
        {
            var permissionsString = policyName[RequirePermissionAttribute.PolicyPrefix.Length..];
            var permissions = permissionsString.Split(',', StringSplitOptions.RemoveEmptyEntries);

            var policy = new AuthorizationPolicyBuilder()
                .AddRequirements(new PermissionRequirement(permissions, requireAll: false))
                .Build();

            return Task.FromResult<AuthorizationPolicy?>(policy);
        }

        // Handle AND logic: AllPermissions_perm1,perm2,perm3
        if (policyName.StartsWith(RequireAllPermissionsAttribute.PolicyPrefix, StringComparison.OrdinalIgnoreCase))
        {
            var permissionsString = policyName[RequireAllPermissionsAttribute.PolicyPrefix.Length..];
            var permissions = permissionsString.Split(',', StringSplitOptions.RemoveEmptyEntries);

            var policy = new AuthorizationPolicyBuilder()
                .AddRequirements(new PermissionRequirement(permissions, requireAll: true))
                .Build();

            return Task.FromResult<AuthorizationPolicy?>(policy);
        }

        // Fall back to default policy provider for other policies
        return _fallbackPolicyProvider.GetPolicyAsync(policyName);
    }
}
