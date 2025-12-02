using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.Notifications;

public class NotificationDto
{
    public Guid Id { get; set; }
    public Guid RecipientId { get; set; }
    public string NotificationType { get; set; } = string.Empty;
    public string LocalizationKey { get; set; } = string.Empty;
    public string? LocalizationArgs { get; set; }
    public NotificationPriority Priority { get; set; }
    public string? RelatedEntityType { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public string? ActionUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class CreateNotificationRequest
{
    public Guid RecipientId { get; set; }
    public string NotificationType { get; set; } = string.Empty;
    public string LocalizationKey { get; set; } = string.Empty;
    public string? LocalizationArgs { get; set; }
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    public string? RelatedEntityType { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public string? ActionUrl { get; set; }
    public DateTime? ExpiresAt { get; set; }
}
