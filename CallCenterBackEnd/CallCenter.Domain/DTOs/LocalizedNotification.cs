using CallCenter.Domain.Enums;

namespace CallCenter.Domain.DTOs;

public class LocalizedNotification
{
    public Guid Id { get; set; }
    public Guid RecipientId { get; set; }
    public string NotificationType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationPriority Priority { get; set; }
    public string? RelatedEntityType { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public string? ActionUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
