using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class DataExport
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DataExportType Type { get; set; } = DataExportType.Manual;
    public string DataSource { get; set; } = string.Empty;
    public ExportFormat Format { get; set; } = ExportFormat.Xlsx;
    public string? Filters { get; set; } // JSON
    public DataExportStatus Status { get; set; } = DataExportStatus.Pending;
    public int? Progress { get; set; }
    public long? FileSize { get; set; }
    public string? FileUrl { get; set; }
    public int? RecordCount { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public Guid CreatedById { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
}

public class ScheduledExport
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DataSource { get; set; } = string.Empty;
    public ExportFormat Format { get; set; } = ExportFormat.Xlsx;
    public ExportSchedule Schedule { get; set; } = ExportSchedule.Daily;
    public string ScheduleTime { get; set; } = "06:00";
    public int? ScheduleDayOfWeek { get; set; }
    public int? ScheduleDayOfMonth { get; set; }
    public string? Filters { get; set; } // JSON
    public string Recipients { get; set; } = string.Empty; // Comma-separated emails
    public bool IsActive { get; set; } = true;
    public DateTime? LastRunAt { get; set; }
    public DateTime? NextRunAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid CreatedById { get; set; }
}
