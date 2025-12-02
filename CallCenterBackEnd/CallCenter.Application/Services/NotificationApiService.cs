using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Notifications;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces;

namespace CallCenter.Application.Services;

public interface INotificationApiService
{
    Task<PagedResponse<NotificationDto>> GetNotificationsAsync(PagedRequest request, Guid? recipientId = null);
    Task<NotificationDto?> GetNotificationByIdAsync(Guid id);
    Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request);
    Task<List<NotificationDto>> GetUserNotificationsAsync(Guid recipientId, bool unreadOnly = false);
    Task<bool> MarkAsReadAsync(Guid id);
    Task<bool> MarkAllAsReadAsync(Guid recipientId);
    Task<int> GetUnreadCountAsync(Guid recipientId);
    Task<bool> DeleteNotificationAsync(Guid id);
}

public class NotificationApiService : INotificationApiService
{
    private readonly IRepository<Notification> _repository;

    public NotificationApiService(IRepository<Notification> repository)
    {
        _repository = repository;
    }

    public async Task<PagedResponse<NotificationDto>> GetNotificationsAsync(PagedRequest request, Guid? recipientId = null)
    {
        var notifications = await _repository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            null,
            request.SortBy,
            request.SortDescending);

        var items = notifications.Items.AsEnumerable();
        if (recipientId.HasValue)
            items = items.Where(n => n.RecipientId == recipientId.Value);

        return new PagedResponse<NotificationDto>
        {
            Items = items.Select(MapToDto).ToList(),
            PageNumber = notifications.CurrentPage,
            PageSize = notifications.PageSize,
            TotalCount = notifications.TotalCount,
            TotalPages = notifications.PageCount
        };
    }

    public async Task<NotificationDto?> GetNotificationByIdAsync(Guid id)
    {
        var all = await _repository.GetAllAsync();
        var notification = all.FirstOrDefault(n => n.Id == id);
        return notification != null ? MapToDto(notification) : null;
    }

    public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            RecipientId = request.RecipientId,
            NotificationType = request.NotificationType,
            LocalizationKey = request.LocalizationKey,
            LocalizationArgs = request.LocalizationArgs,
            Priority = request.Priority,
            RelatedEntityType = request.RelatedEntityType,
            RelatedEntityId = request.RelatedEntityId,
            ActionUrl = request.ActionUrl,
            ExpiresAt = request.ExpiresAt,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(notification);
        await _repository.SaveChangesAsync();
        return MapToDto(notification);
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(Guid recipientId, bool unreadOnly = false)
    {
        var all = await _repository.GetAllAsync();
        var query = all.Where(n => n.RecipientId == recipientId);

        if (unreadOnly)
            query = query.Where(n => !n.IsRead);

        return query
            .OrderByDescending(n => n.CreatedAt)
            .Select(MapToDto)
            .ToList();
    }

    public async Task<bool> MarkAsReadAsync(Guid id)
    {
        var all = await _repository.GetAllAsync();
        var notification = all.FirstOrDefault(n => n.Id == id);
        if (notification == null) return false;

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;

        _repository.Update(notification);
        await _repository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(Guid recipientId)
    {
        var all = await _repository.GetAllAsync();
        var unread = all.Where(n => n.RecipientId == recipientId && !n.IsRead).ToList();

        foreach (var notification in unread)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            _repository.Update(notification);
        }

        await _repository.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetUnreadCountAsync(Guid recipientId)
    {
        var all = await _repository.GetAllAsync();
        return all.Count(n => n.RecipientId == recipientId && !n.IsRead);
    }

    public async Task<bool> DeleteNotificationAsync(Guid id)
    {
        var all = await _repository.GetAllAsync();
        var notification = all.FirstOrDefault(n => n.Id == id);
        if (notification == null) return false;

        _repository.DeleteAsync(notification);
        await _repository.SaveChangesAsync();
        return true;
    }

    private static NotificationDto MapToDto(Notification notification) => new()
    {
        Id = notification.Id,
        RecipientId = notification.RecipientId,
        NotificationType = notification.NotificationType,
        LocalizationKey = notification.LocalizationKey,
        LocalizationArgs = notification.LocalizationArgs,
        Priority = notification.Priority,
        RelatedEntityType = notification.RelatedEntityType,
        RelatedEntityId = notification.RelatedEntityId,
        IsRead = notification.IsRead,
        ReadAt = notification.ReadAt,
        ActionUrl = notification.ActionUrl,
        CreatedAt = notification.CreatedAt,
        ExpiresAt = notification.ExpiresAt
    };
}
