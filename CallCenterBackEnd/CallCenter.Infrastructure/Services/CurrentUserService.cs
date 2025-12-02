using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces;
using CallCenter.Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace AssetManagement.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly UserManager<ApplicationUser> _userManager;
    private ApplicationUser? _cachedUser;
    private UserAuditInfo? _cachedAuditInfo;

    public CurrentUserService(
        IHttpContextAccessor httpContextAccessor,
        UserManager<ApplicationUser> userManager)
    {
        _httpContextAccessor = httpContextAccessor;
        _userManager = userManager;
    }

    public async Task<UserAuditInfo> GetCurrentUserAuditInfoAsync()
    {
        if (_cachedAuditInfo != null)
            return _cachedAuditInfo;

        var user = await GetCurrentUserAsync();
        
        _cachedAuditInfo = new UserAuditInfo
        {
            UserId = user?.Id ?? Guid.Empty,
            FullName = user?.Name ?? string.Empty,
            Email = user?.Email ?? string.Empty,
            UserAgent = GetUserAgent(),
            IpAddress = GetIpAddress(),
            Timestamp = DateTime.UtcNow
        };

        return _cachedAuditInfo;
    }

    public async Task<Guid?> GetCurrentUserIdAsync()
    {
        var user = await GetCurrentUserAsync();
        return user?.Id;
    }

    public async Task<string?> GetCurrentUserFullNameAsync()
    {
        var user = await GetCurrentUserAsync();
        return user?.Name;
    }

    public async Task<string?> GetCurrentUserEmailAsync()
    {
        var user = await GetCurrentUserAsync();
        return user?.Email;
    }

    public string GetUserAgent()
    {
        return _httpContextAccessor.HttpContext?.Request.Headers["User-Agent"].ToString() ?? string.Empty;
    }

    public string GetIpAddress()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
            return string.Empty;

        // Check for X-Forwarded-For header first (proxy scenarios)
        var forwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            // Take the first IP address from the list
            var firstIp = forwardedFor.Split(',').FirstOrDefault()?.Trim();
            if (!string.IsNullOrEmpty(firstIp))
                return firstIp;
        }

        // Check for X-Real-IP header
        var realIp = httpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
            return realIp;

        // Fall back to remote IP address
        return httpContext.Connection.RemoteIpAddress?.ToString() ?? string.Empty;
    }

    public bool IsAuthenticated()
    {
        return _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated == true;
    }

    private async Task<ApplicationUser?> GetCurrentUserAsync()
    {
        if (_cachedUser != null)
            return _cachedUser;

        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.User?.Identity?.IsAuthenticated != true)
            return null;

        var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return null;

        _cachedUser = await _userManager.FindByIdAsync(userId);
        return _cachedUser;
    }
}