using CallCenter.Application.Interfaces;
using CallCenter.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<List<LocalizedNotification>>> GetNotifications(
        [FromQuery] bool unreadOnly = false,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();
        var userLanguage = GetCurrentUserLanguage();

        var notifications = await _notificationService.GetUserNotificationsAsync(
            userId,
            userLanguage,
            unreadOnly,
            pageSize);

        return Ok(notifications);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<LocalizedNotification>> GetNotification(Guid id)
    {
        var notification = await _notificationService.GetNotificationByIdAsync(id);
        if (notification == null)
            return NotFound();

        var userLanguage = GetCurrentUserLanguage();
        var localizedNotification = await _notificationService
            .GetLocalizedNotificationAsync(notification, userLanguage);

        return Ok(localizedNotification);
    }

    [HttpPut("{id:guid}/read")]
    public async Task<ActionResult> MarkAsRead(Guid id)
    {
        var notification = await _notificationService.GetNotificationByIdAsync(id);
        if (notification == null)
            return NotFound();

        await _notificationService.MarkAsReadAsync(id);

        return NoContent();
    }

    // TODO: Replace with actual user context from authentication
    private Guid GetCurrentUserId()
    {
        // Placeholder - should get from authenticated user claims
        return Guid.Empty;
    }

    private string GetCurrentUserLanguage()
    {
        // Get from Accept-Language header or user preferences
        var acceptLanguage = Request.Headers.AcceptLanguage.FirstOrDefault();
        if (!string.IsNullOrEmpty(acceptLanguage) && acceptLanguage.StartsWith("ar"))
            return "ar";

        return "en";
    }
}
