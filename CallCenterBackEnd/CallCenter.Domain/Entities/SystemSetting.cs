using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class SystemSetting
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public SettingDataType DataType { get; set; }
    public SettingCategory Category { get; set; }
    public string? Description { get; set; }
    public bool IsSensitive { get; set; }
    public Guid? UpdatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Agent? UpdatedByAgent { get; set; }
}
