using CallCenter.Domain.DTOs;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Application.Interfaces;

public interface INotificationService
{
    Task<Notification> CreateNotificationAsync(
        Guid recipientId,
        string notificationType,
        string localizationKey,
        object? localizationArgs,
        NotificationPriority priority = NotificationPriority.Normal,
        string? relatedEntityType = null,
        Guid? relatedEntityId = null,
        string? actionUrl = null);

    Task<LocalizedNotification> GetLocalizedNotificationAsync(
        Notification notification,
        string languageCode);

    Task<List<LocalizedNotification>> GetUserNotificationsAsync(
        Guid userId,
        string languageCode,
        bool unreadOnly = false,
        int pageSize = 20);

    Task<Notification?> GetNotificationByIdAsync(Guid id);

    Task MarkAsReadAsync(Guid id);
}
