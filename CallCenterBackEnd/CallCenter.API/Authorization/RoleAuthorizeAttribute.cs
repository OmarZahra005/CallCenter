using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using CallCenter.Domain.Enums;

namespace CallCenter.API.Authorization;

/// <summary>
/// Custom authorization attribute for role-based access control
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RoleAuthorizeAttribute : Attribute, IAuthorizationFilter
{
    private readonly AgentRole[] _allowedRoles;

    public RoleAuthorizeAttribute(params AgentRole[] allowedRoles)
    {
        _allowedRoles = allowedRoles;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // Check if user is authenticated
        if (context.HttpContext.User?.Identity?.IsAuthenticated != true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // Get role claim from user
        var roleClaim = context.HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(roleClaim))
        {
            context.Result = new ForbidResult();
            return;
        }

        // Try to parse role
        if (!Enum.TryParse<AgentRole>(roleClaim, out var userRole))
        {
            context.Result = new ForbidResult();
            return;
        }

        // Check if user's role is in allowed roles
        if (!_allowedRoles.Contains(userRole))
        {
            context.Result = new ForbidResult();
        }
    }
}
