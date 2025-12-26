using System.Security.Claims;
using CallCenter.Application.Interfaces;
using CallCenter.Domain.DTOs;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly IRepository<Notification> _notificationRepository;
    private readonly IRepository<NotificationPreference> _preferenceRepository;

    public NotificationsController(
        INotificationService notificationService,
        IRepository<Notification> notificationRepository,
        IRepository<NotificationPreference> preferenceRepository)
    {
        _notificationService = notificationService;
        _notificationRepository = notificationRepository;
        _preferenceRepository = preferenceRepository;
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

    [HttpPost("mark-all-read")]
    public async Task<ActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();
        var notifications = await _notificationRepository.GetQueryable()
            .Where(n => n.RecipientId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in notifications)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.UtcNow;
            _notificationRepository.Update(n);
        }
        await _notificationRepository.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [HttpDelete]
    public async Task<ActionResult> ClearAll()
    {
        var userId = GetCurrentUserId();
        var notifications = await _notificationRepository.GetQueryable()
            .Where(n => n.RecipientId == userId)
            .ToListAsync();

        foreach (var n in notifications)
        {
            _notificationRepository.DeleteAsync(n);
        }
        await _notificationRepository.SaveChangesAsync();

        return Ok(new { success = true });
    }

    // User notifications for frontend (/users/me/notifications)
    [HttpGet("/api/users/me/notifications")]
    public async Task<ActionResult<List<NotificationHistoryDto>>> GetMyNotifications()
    {
        var userId = GetCurrentUserId();
        var notifications = await _notificationRepository.GetQueryable()
            .Where(n => n.RecipientId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();

        var dtos = notifications.Select(n => new NotificationHistoryDto
        {
            Id = n.Id.ToString(),
            Title = n.LocalizationKey,
            Message = n.LocalizationArgs ?? n.LocalizationKey,
            Category = n.NotificationType,
            Type = n.Priority.ToString().ToLower(),
            Read = n.IsRead,
            CreatedAt = n.CreatedAt.ToString("o"),
            ActionUrl = n.ActionUrl
        }).ToList();

        return Ok(dtos);
    }

    [HttpPatch("/api/users/me/notifications/{id}/read")]
    public async Task<ActionResult> MarkMyNotificationRead(Guid id)
    {
        var notification = await _notificationRepository.GetQueryable()
            .FirstOrDefaultAsync(n => n.Id == id);

        if (notification == null)
            return NotFound();

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        _notificationRepository.Update(notification);
        await _notificationRepository.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [HttpPost("/api/users/me/notifications/mark-all-read")]
    public async Task<ActionResult> MarkAllMyNotificationsRead()
    {
        return await MarkAllAsRead();
    }

    [HttpDelete("/api/users/me/notifications")]
    public async Task<ActionResult> ClearMyNotifications()
    {
        return await ClearAll();
    }

    // Notification Preferences
    [HttpGet("/api/users/me/notification-preferences")]
    public async Task<ActionResult<List<NotificationPreferenceDto>>> GetMyPreferences()
    {
        var userId = GetCurrentUserId();
        var prefs = await _preferenceRepository.GetQueryable()
            .Where(p => p.UserId == userId)
            .ToListAsync();

        var dtos = prefs.Select(p => new NotificationPreferenceDto
        {
            CategoryId = p.CategoryId,
            InApp = p.InApp,
            Email = p.Email,
            Push = p.Push,
            Sound = p.Sound
        }).ToList();

        return Ok(dtos);
    }

    [HttpPut("/api/users/me/notification-preferences")]
    public async Task<ActionResult> UpdateMyPreferences([FromBody] List<NotificationPreferenceDto> preferences)
    {
        var userId = GetCurrentUserId();

        // Delete existing preferences
        var existing = await _preferenceRepository.GetQueryable()
            .Where(p => p.UserId == userId)
            .ToListAsync();

        foreach (var p in existing)
        {
            _preferenceRepository.DeleteAsync(p);
        }
        await _preferenceRepository.SaveChangesAsync();

        // Add new preferences
        foreach (var pref in preferences)
        {
            var newPref = new NotificationPreference
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CategoryId = pref.CategoryId,
                InApp = pref.InApp,
                Email = pref.Email,
                Push = pref.Push,
                Sound = pref.Sound,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _preferenceRepository.AddAsync(newPref);
        }
        await _preferenceRepository.SaveChangesAsync();

        return Ok(new { success = true });
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
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

// DTOs
public class NotificationHistoryDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Type { get; set; } = "info";
    public bool Read { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
}

public class NotificationPreferenceDto
{
    public string CategoryId { get; set; } = string.Empty;
    public bool InApp { get; set; } = true;
    public bool Email { get; set; } = false;
    public bool Push { get; set; } = false;
    public bool Sound { get; set; } = false;
}
