using CallCenter.Domain.Constants;
using System.Security.Claims;

namespace CallCenter.Domain.Extensions;
public static class ClaimsPrincipalExtensions
{
    public static bool IsAdmin(this ClaimsPrincipal principal)
    {
        return principal.IsInRole(SystemRoles.Administrator);
    }
}
