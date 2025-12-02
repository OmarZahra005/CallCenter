using System.Text.Json;
using CallCenter.Application.Interfaces;
using CallCenter.Domain.DTOs;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly ILocalizationService _localizationService;

    public NotificationService(
        INotificationRepository notificationRepository,
        ILocalizationService localizationService)
    {
        _notificationRepository = notificationRepository;
        _localizationService = localizationService;
    }

    public async Task<Notification> CreateNotificationAsync(
        Guid recipientId,
        string notificationType,
        string localizationKey,
        object? localizationArgs,
        NotificationPriority priority = NotificationPriority.Normal,
        string? relatedEntityType = null,
        Guid? relatedEntityId = null,
        string? actionUrl = null)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            RecipientId = recipientId,
            NotificationType = notificationType,
            LocalizationKey = localizationKey,
            LocalizationArgs = localizationArgs != null
                ? JsonSerializer.Serialize(localizationArgs)
                : null,
            Priority = priority,
            RelatedEntityType = relatedEntityType,
            RelatedEntityId = relatedEntityId,
            ActionUrl = actionUrl,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        return await _notificationRepository.AddAsync(notification);
    }

    public Task<LocalizedNotification> GetLocalizedNotificationAsync(
        Notification notification,
        string languageCode)
    {
        var args = string.IsNullOrEmpty(notification.LocalizationArgs)
            ? null
            : JsonSerializer.Deserialize<Dictionary<string, object>>(notification.LocalizationArgs);

        var localizedMessage = _localizationService.Translate(
            notification.LocalizationKey,
            languageCode,
            args);

        var result = new LocalizedNotification
        {
            Id = notification.Id,
            RecipientId = notification.RecipientId,
            NotificationType = notification.NotificationType,
            Message = localizedMessage,
            Priority = notification.Priority,
            RelatedEntityType = notification.RelatedEntityType,
            RelatedEntityId = notification.RelatedEntityId,
            IsRead = notification.IsRead,
            ReadAt = notification.ReadAt,
            ActionUrl = notification.ActionUrl,
            CreatedAt = notification.CreatedAt
        };

        return Task.FromResult(result);
    }

    public async Task<List<LocalizedNotification>> GetUserNotificationsAsync(
        Guid userId,
        string languageCode,
        bool unreadOnly = false,
        int pageSize = 20)
    {
        var notifications = await _notificationRepository.GetByUserIdAsync(userId, unreadOnly, pageSize);

        var localizedNotifications = new List<LocalizedNotification>();
        foreach (var notification in notifications)
        {
            var localized = await GetLocalizedNotificationAsync(notification, languageCode);
            localizedNotifications.Add(localized);
        }

        return localizedNotifications;
    }

    public async Task<Notification?> GetNotificationByIdAsync(Guid id)
    {
        return await _notificationRepository.GetByIdAsync(id);
    }

    public async Task MarkAsReadAsync(Guid id)
    {
        var notification = await _notificationRepository.GetByIdAsync(id);
        if (notification != null)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _notificationRepository.UpdateAsync(notification);
        }
    }
}
