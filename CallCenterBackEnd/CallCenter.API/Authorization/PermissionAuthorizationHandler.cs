using System.Security.Claims;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Authorization;

namespace CallCenter.API.Authorization;

/// <summary>
/// Handles permission-based authorization requirements.
/// Super admin users bypass all permission checks.
/// </summary>
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PermissionAuthorizationHandler> _logger;

    public PermissionAuthorizationHandler(
        IServiceProvider serviceProvider,
        ILogger<PermissionAuthorizationHandler> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        // Get user ID from claims
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var agentId))
        {
            _logger.LogWarning("Authorization failed: No valid user ID in claims");
            return;
        }

        // Check for super admin claim first (fast path)
        var isSuperAdminClaim = context.User.FindFirst("IsSuperAdmin");
        if (isSuperAdminClaim != null &&
            bool.TryParse(isSuperAdminClaim.Value, out var isSuperAdmin) &&
            isSuperAdmin)
        {
            _logger.LogDebug("User {AgentId} is super admin, bypassing permission check", agentId);
            context.Succeed(requirement);
            return;
        }

        // Use service scope to get IPermissionService
        using var scope = _serviceProvider.CreateScope();
        var permissionService = scope.ServiceProvider.GetRequiredService<IPermissionService>();

        // Double-check super admin status from database (in case JWT is stale)
        if (await permissionService.IsSuperAdminAsync(agentId))
        {
            _logger.LogDebug("User {AgentId} is super admin (verified), bypassing permission check", agentId);
            context.Succeed(requirement);
            return;
        }

        // Check permissions based on requirement type
        bool hasPermission;
        if (requirement.RequireAll)
        {
            hasPermission = await permissionService.HasAllPermissionsAsync(agentId, requirement.Permissions);
            _logger.LogDebug(
                "User {AgentId} permission check (ALL of {Permissions}): {Result}",
                agentId, string.Join(", ", requirement.Permissions), hasPermission);
        }
        else
        {
            hasPermission = await permissionService.HasAnyPermissionAsync(agentId, requirement.Permissions);
            _logger.LogDebug(
                "User {AgentId} permission check (ANY of {Permissions}): {Result}",
                agentId, string.Join(", ", requirement.Permissions), hasPermission);
        }

        if (hasPermission)
        {
            context.Succeed(requirement);
        }
        else
        {
            _logger.LogWarning(
                "User {AgentId} denied access - missing permissions: {Permissions}",
                agentId, string.Join(", ", requirement.Permissions));
        }
    }
}
