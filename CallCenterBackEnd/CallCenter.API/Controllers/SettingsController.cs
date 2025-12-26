using System.Security.Claims;
using CallCenter.API.Authorization;
using CallCenter.Application.DTOs.Settings;
using CallCenter.Application.Services;
using CallCenter.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly ISystemSettingService _settingService;
    private readonly IDatabaseOptionsProvider _optionsProvider;
    private readonly ILogger<SettingsController> _logger;

    public SettingsController(
        ISystemSettingService settingService,
        IDatabaseOptionsProvider optionsProvider,
        ILogger<SettingsController> logger)
    {
        _settingService = settingService;
        _optionsProvider = optionsProvider;
        _logger = logger;
    }

    /// <summary>
    /// Get all settings
    /// </summary>
    [HttpGet]
    [RequirePermission("system.settings_manage")]
    public async Task<ActionResult<List<SystemSettingDto>>> GetAll()
    {
        var settings = await _settingService.GetAllSettingsAsync();
        return Ok(settings);
    }

    /// <summary>
    /// Get settings grouped by category
    /// </summary>
    [HttpGet("grouped")]
    [RequirePermission("system.settings_manage")]
    public async Task<ActionResult<List<CategorySettingsDto>>> GetGrouped()
    {
        var settings = await _settingService.GetSettingsGroupedByCategoryAsync();
        return Ok(settings);
    }

    /// <summary>
    /// Get settings by category
    /// </summary>
    [HttpGet("category/{category}")]
    [RequirePermission("system.settings_manage")]
    public async Task<ActionResult<List<SystemSettingDto>>> GetByCategory(SettingCategory category)
    {
        var settings = await _settingService.GetSettingsByCategoryAsync(category);
        return Ok(settings);
    }

    /// <summary>
    /// Get setting by key
    /// </summary>
    [HttpGet("key/{key}")]
    [RequirePermission("system.settings_manage")]
    public async Task<ActionResult<SystemSettingDto>> GetByKey(string key)
    {
        // URL decode the key since it may contain special characters like ':'
        var decodedKey = Uri.UnescapeDataString(key);
        var setting = await _settingService.GetSettingByKeyAsync(decodedKey);
        if (setting == null)
            return NotFound(new { message = "Setting not found" });

        return Ok(setting);
    }

    /// <summary>
    /// Get setting by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("system.settings_manage")]
    public async Task<ActionResult<SystemSettingDto>> GetById(Guid id)
    {
        var setting = await _settingService.GetSettingByIdAsync(id);
        if (setting == null)
            return NotFound(new { message = "Setting not found" });

        return Ok(setting);
    }

    /// <summary>
    /// Create a new setting
    /// </summary>
    [HttpPost]
    [RequirePermission("system.settings_manage")]
    public async Task<ActionResult<SystemSettingDto>> Create([FromBody] CreateSettingRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Key))
            return BadRequest(new { message = "Key is required" });

        // Check if key already exists
        var existing = await _settingService.GetSettingByKeyAsync(request.Key);
        if (existing != null)
            return Conflict(new { message = "A setting with this key already exists" });

        var userId = GetCurrentUserId();
        var setting = await _settingService.CreateSettingAsync(request, userId);

        _logger.LogInformation("Setting {Key} created by user {UserId}", setting.Key, userId);
        _optionsProvider.InvalidateCache();

        return CreatedAtAction(nameof(GetById), new { id = setting.Id }, setting);
    }

    /// <summary>
    /// Update a setting by ID
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("system.settings_manage")]
    public async Task<ActionResult<SystemSettingDto>> Update(Guid id, [FromBody] UpdateSettingRequest request)
    {
        var userId = GetCurrentUserId();
        var setting = await _settingService.UpdateSettingAsync(id, request, userId);

        if (setting == null)
            return NotFound(new { message = "Setting not found" });

        _logger.LogInformation("Setting {Id} updated by user {UserId}", id, userId);
        _optionsProvider.InvalidateCache();

        return Ok(setting);
    }

    /// <summary>
    /// Bulk update settings
    /// </summary>
    [HttpPut("bulk")]
    [RequirePermission("system.settings_manage")]
    public async Task<ActionResult> BulkUpdate([FromBody] BulkUpdateSettingsRequest request)
    {
        if (request.Settings == null || request.Settings.Count == 0)
            return BadRequest(new { message = "Settings list cannot be empty" });

        var userId = GetCurrentUserId();
        await _settingService.BulkUpdateSettingsAsync(request, userId);

        _logger.LogInformation("Bulk settings update by user {UserId}: {Count} settings",
            userId, request.Settings.Count);
        _optionsProvider.InvalidateCache();

        return Ok(new { message = "Settings updated successfully" });
    }

    /// <summary>
    /// Delete a setting
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("system.settings_manage")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await _settingService.DeleteSettingAsync(id);
        if (!result)
            return NotFound(new { message = "Setting not found" });

        _logger.LogInformation("Setting {Id} deleted by user {UserId}", id, GetCurrentUserId());
        _optionsProvider.InvalidateCache();

        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}
