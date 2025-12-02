using CallCenter.Domain.Common.Entities;

namespace CallCenter.Domain.Entities;

public class AuditDetail : Entity
{
    public required Guid AuditLogId { get; set; }
    
    public required string PropertyName { get; set; }
    
    public string? DisplayName { get; set; }
    
    public string? OldValue { get; set; }
    
    public string? NewValue { get; set; }
    
    public virtual AuditLog AuditLog { get; set; } = null!;

    public static AuditDetail Create(
        Guid auditLogId,
        string propertyName,
        string? oldValue,
        string? newValue,
        string? displayName = null)
    {
        return new AuditDetail
        {
            Id = Guid.NewGuid(),
            AuditLogId = auditLogId,
            PropertyName = propertyName,
            DisplayName = displayName ?? propertyName,
            OldValue = oldValue,
            NewValue = newValue,
            CreatedAt = DateTime.UtcNow
        };
    }

    public bool HasChanged => OldValue != NewValue;

    public string GetChangeDescription()
    {
        if (!HasChanged)
            return "No change";

        var oldDisplay = string.IsNullOrEmpty(OldValue) ? "[Empty]" : OldValue;
        var newDisplay = string.IsNullOrEmpty(NewValue) ? "[Empty]" : NewValue;

        return $"Changed from '{oldDisplay}' to '{newDisplay}'";
    }
}