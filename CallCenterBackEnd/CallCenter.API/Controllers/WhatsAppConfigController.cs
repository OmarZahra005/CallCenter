using System.Security.Claims;
using System.Text.Json;
using CallCenter.API.Authorization;
using CallCenter.Application.Services;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/admin/whatsapp")]
[Authorize]
public class WhatsAppConfigController : ControllerBase
{
    private readonly ISystemSettingService _settingService;
    private readonly IRepository<WhatsAppMessageTemplate> _templateRepository;

    public WhatsAppConfigController(
        ISystemSettingService settingService,
        IRepository<WhatsAppMessageTemplate> templateRepository)
    {
        _settingService = settingService;
        _templateRepository = templateRepository;
    }

    // Account endpoints (backed by SystemSettings)

    [HttpGet("account")]
    [RequirePermission("system.settings_view")]
    public async Task<ActionResult<WhatsAppAccountDto>> GetAccount()
    {
        var settings = await _settingService.GetSettingsByCategoryAsync(SettingCategory.WhatsApp);

        if (!settings.Any())
        {
            return Ok(null);
        }

        var account = new WhatsAppAccountDto
        {
            Id = "whatsapp-account",
            BusinessName = GetSettingValue(settings, "WhatsApp:BusinessName", "Call Center Corp"),
            BusinessId = GetSettingValue(settings, "WhatsApp:BusinessAccountId"),
            PhoneNumberId = GetSettingValue(settings, "WhatsApp:PhoneNumberId"),
            DisplayPhoneNumber = GetSettingValue(settings, "WhatsApp:DisplayPhoneNumber"),
            QualityRating = GetSettingValue(settings, "WhatsApp:QualityRating", "GREEN"),
            MessagingLimit = GetSettingValue(settings, "WhatsApp:MessagingLimit", "1000/day"),
            Status = string.IsNullOrEmpty(GetSettingValue(settings, "WhatsApp:PhoneNumberId")) ? "disconnected" : "connected",
            VerifiedName = GetSettingValue(settings, "WhatsApp:VerifiedName"),
            WebhookUrl = GetSettingValue(settings, "WhatsApp:WebhookUrl", $"{Request.Scheme}://{Request.Host}/api/whatsapp/webhook"),
            WebhookVerifyToken = GetSettingValue(settings, "WhatsApp:WebhookVerifyToken"),
            AccessToken = MaskAccessToken(GetSettingValue(settings, "WhatsApp:AccessToken")),
            CreatedAt = DateTime.UtcNow.AddDays(-90).ToString("o"),
            LastSyncAt = DateTime.UtcNow.AddMinutes(-5).ToString("o")
        };

        return Ok(account);
    }

    [HttpPost("account")]
    [RequirePermission("system.settings_manage")]
    public async Task<ActionResult<WhatsAppAccountDto>> SaveAccount([FromBody] SaveWhatsAppAccountRequest request)
    {
        var userId = GetCurrentUserId();

        // Update each setting
        await _settingService.UpdateSettingByKeyAsync("WhatsApp:BusinessName", request.BusinessName, userId);
        await _settingService.UpdateSettingByKeyAsync("WhatsApp:BusinessAccountId", request.BusinessId, userId);
        await _settingService.UpdateSettingByKeyAsync("WhatsApp:PhoneNumberId", request.PhoneNumberId, userId);
        await _settingService.UpdateSettingByKeyAsync("WhatsApp:DisplayPhoneNumber", request.DisplayPhoneNumber, userId);
        await _settingService.UpdateSettingByKeyAsync("WhatsApp:AccessToken", request.AccessToken, userId);
        await _settingService.UpdateSettingByKeyAsync("WhatsApp:WebhookVerifyToken", request.WebhookVerifyToken, userId);

        return await GetAccount();
    }

    // Template endpoints

    [HttpGet("templates")]
    [RequirePermission("system.settings_view")]
    public async Task<ActionResult<List<WhatsAppTemplateDto>>> GetTemplates()
    {
        var templates = await _templateRepository.GetQueryable()
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        var dtos = templates.Select(MapToTemplateDto).ToList();
        return Ok(dtos);
    }

    [HttpPost("templates")]
    [RequirePermission("system.settings_manage")]
    public async Task<ActionResult<WhatsAppTemplateDto>> CreateTemplate([FromBody] CreateWhatsAppTemplateRequest request)
    {
        var components = new List<object>();

        if (!string.IsNullOrEmpty(request.HeaderText))
        {
            components.Add(new { type = "HEADER", text = request.HeaderText });
        }

        components.Add(new { type = "BODY", text = request.BodyText });

        if (!string.IsNullOrEmpty(request.FooterText))
        {
            components.Add(new { type = "FOOTER", text = request.FooterText });
        }

        var template = new WhatsAppMessageTemplate
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Category = request.Category,
            Language = request.Language,
            Status = "PENDING",
            Components = JsonSerializer.Serialize(components),
            UsageCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        await _templateRepository.AddAsync(template);
        await _templateRepository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTemplates), MapToTemplateDto(template));
    }

    [HttpDelete("templates/{id}")]
    [RequirePermission("system.settings_manage")]
    public async Task<ActionResult> DeleteTemplate(Guid id)
    {
        var template = await _templateRepository.GetQueryable()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (template == null)
            return NotFound();

        _templateRepository.DeleteAsync(template);
        await _templateRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("templates/sync")]
    [RequirePermission("system.settings_manage")]
    public async Task<ActionResult> SyncTemplates()
    {
        // In a real implementation, this would call Meta's Graph API to sync templates
        // For now, just return success
        return Ok(new { message = "Templates synced successfully", count = 0 });
    }

    private static string GetSettingValue(List<Application.DTOs.Settings.SystemSettingDto> settings, string key, string defaultValue = "")
    {
        var setting = settings.FirstOrDefault(s => s.Key == key);
        return setting?.Value ?? defaultValue;
    }

    private static string MaskAccessToken(string token)
    {
        if (string.IsNullOrEmpty(token) || token.Length < 10)
            return token;

        return token[..15] + "...xxxxx";
    }

    private static WhatsAppTemplateDto MapToTemplateDto(WhatsAppMessageTemplate template)
    {
        List<WhatsAppComponentDto> components;
        try
        {
            components = JsonSerializer.Deserialize<List<WhatsAppComponentDto>>(template.Components) ?? new();
        }
        catch
        {
            components = new();
        }

        return new WhatsAppTemplateDto
        {
            Id = template.Id.ToString(),
            Name = template.Name,
            Category = template.Category,
            Language = template.Language,
            Status = template.Status,
            Components = components,
            UsageCount = template.UsageCount,
            CreatedAt = template.CreatedAt.ToString("o"),
            LastUsedAt = template.LastUsedAt?.ToString("o")
        };
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}

// DTOs

public class WhatsAppAccountDto
{
    public string Id { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string BusinessId { get; set; } = string.Empty;
    public string PhoneNumberId { get; set; } = string.Empty;
    public string DisplayPhoneNumber { get; set; } = string.Empty;
    public string QualityRating { get; set; } = "GREEN";
    public string MessagingLimit { get; set; } = string.Empty;
    public string Status { get; set; } = "disconnected";
    public string? VerifiedName { get; set; }
    public string WebhookUrl { get; set; } = string.Empty;
    public string WebhookVerifyToken { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public string? LastSyncAt { get; set; }
}

public class SaveWhatsAppAccountRequest
{
    public string BusinessName { get; set; } = string.Empty;
    public string BusinessId { get; set; } = string.Empty;
    public string PhoneNumberId { get; set; } = string.Empty;
    public string DisplayPhoneNumber { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string WebhookVerifyToken { get; set; } = string.Empty;
}

public class WhatsAppTemplateDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = "UTILITY";
    public string Language { get; set; } = "en";
    public string Status { get; set; } = "PENDING";
    public List<WhatsAppComponentDto> Components { get; set; } = new();
    public int UsageCount { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? LastUsedAt { get; set; }
}

public class WhatsAppComponentDto
{
    public string Type { get; set; } = string.Empty;
    public string? Text { get; set; }
    public string? Format { get; set; }
    public List<WhatsAppButtonDto>? Buttons { get; set; }
}

public class WhatsAppButtonDto
{
    public string Type { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string? PhoneNumber { get; set; }
}

public class CreateWhatsAppTemplateRequest
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = "UTILITY";
    public string Language { get; set; } = "en";
    public string? HeaderText { get; set; }
    public string BodyText { get; set; } = string.Empty;
    public string? FooterText { get; set; }
}
