using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.Settings;

/// <summary>
/// DTO for system setting response.
/// </summary>
public class SystemSettingDto
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public SettingDataType DataType { get; set; }
    public SettingCategory Category { get; set; }
    public string? Description { get; set; }
    public bool IsSensitive { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// Request to create a new setting.
/// </summary>
public class CreateSettingRequest
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public SettingDataType DataType { get; set; }
    public SettingCategory Category { get; set; }
    public string? Description { get; set; }
    public bool IsSensitive { get; set; }
}

/// <summary>
/// Request to update a setting.
/// </summary>
public class UpdateSettingRequest
{
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
}

/// <summary>
/// Request for bulk updating multiple settings.
/// </summary>
public class BulkUpdateSettingsRequest
{
    public List<SettingUpdateItem> Settings { get; set; } = new();
}

/// <summary>
/// Individual setting update item for bulk operations.
/// </summary>
public class SettingUpdateItem
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

/// <summary>
/// DTO for settings grouped by category.
/// </summary>
public class CategorySettingsDto
{
    public SettingCategory Category { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public List<SystemSettingDto> Settings { get; set; } = new();
}
