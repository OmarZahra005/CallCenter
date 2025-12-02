using CallCenter.Domain.Common.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class AuditLog : AggregateRoot
{
    public required AuditOperation Operation { get; set; }
    
    public required AuditEntityType EntityType { get; set; }
    
    public required string EntityId { get; set; }
    
    public required string EntityName { get; set; }
    
    public required Guid UserId { get; set; }
    
    public required string UserName { get; set; }
    
    public string? UserEmail { get; set; }
    
    public string? IpAddress { get; set; }
    
    public string? UserAgent { get; set; }
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public string? AdditionalInfo { get; set; }
    
    public string? Changes { get; set; }
    
    public bool Success { get; set; } = true;
    
    public string? ErrorMessage { get; set; }
    
    public virtual ICollection<AuditDetail> Details { get; set; } = new List<AuditDetail>();

    public static AuditLog Create(
        AuditOperation operation,
        AuditEntityType entityType,
        string entityId,
        string entityName,
        Guid userId,
        string userName,
        string? userEmail = null,
        string? ipAddress = null,
        string? userAgent = null,
        string? additionalInfo = null,
        string? changes = null,
        bool success = true,
        string? errorMessage = null)
    {
        return new AuditLog
        {
            Id = Guid.NewGuid(),
            Operation = operation,
            EntityType = entityType,
            EntityId = entityId,
            EntityName = entityName,
            UserId = userId,
            UserName = userName,
            UserEmail = userEmail,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Timestamp = DateTime.UtcNow,
            AdditionalInfo = additionalInfo,
            Changes = changes,
            Success = success,
            ErrorMessage = errorMessage,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };
    }

    public void AddDetail(string propertyName, string? oldValue, string? newValue, string? displayName = null)
    {
        Details.Add(AuditDetail.Create(Id, propertyName, oldValue, newValue, displayName));
    }

    public void AddDetails(Dictionary<string, (string? oldValue, string? newValue, string? displayName)> changes)
    {
        foreach (var change in changes)
        {
            AddDetail(change.Key, change.Value.oldValue, change.Value.newValue, change.Value.displayName);
        }
    }
}