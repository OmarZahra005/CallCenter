using CallCenter.Domain.Models;

namespace CallCenter.Domain.Interfaces;

public interface ICurrentUserService
{
    Task<UserAuditInfo> GetCurrentUserAuditInfoAsync();

    Task<Guid?> GetCurrentUserIdAsync();

    Task<string?> GetCurrentUserFullNameAsync();
    
    Task<string?> GetCurrentUserEmailAsync();
    
    string GetUserAgent();
    
    string GetIpAddress();
    
    bool IsAuthenticated();
}