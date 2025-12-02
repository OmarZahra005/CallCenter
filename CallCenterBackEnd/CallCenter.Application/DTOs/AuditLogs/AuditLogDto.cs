using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.AuditLogs;

public class AuditLogDto
{
    public Guid Id { get; set; }
    public AuditOperation Operation { get; set; }
    public AuditEntityType EntityType { get; set; }
    public string EntityId { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserEmail { get; set; }
    public string? IpAddress { get; set; }
    public DateTime Timestamp { get; set; }
    public string? AdditionalInfo { get; set; }
    public string? Changes { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
}

public class CreateAuditLogRequest
{
    public AuditOperation Operation { get; set; }
    public AuditEntityType EntityType { get; set; }
    public string EntityId { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserEmail { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? AdditionalInfo { get; set; }
    public string? Changes { get; set; }
    public bool Success { get; set; } = true;
    public string? ErrorMessage { get; set; }
}
