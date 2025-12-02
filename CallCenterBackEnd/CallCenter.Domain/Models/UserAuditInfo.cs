namespace CallCenter.Domain.Models;

public class UserAuditInfo
{
    public Guid UserId { get; set; } = Guid.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public bool IsAuthenticated => UserId != Guid.Empty;
}