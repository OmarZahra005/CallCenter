using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.DataExports;

public class DataExportDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "manual";
    public string DataSource { get; set; } = string.Empty;
    public string Format { get; set; } = "xlsx";
    public string? Filters { get; set; }
    public string Status { get; set; } = "pending";
    public int? Progress { get; set; }
    public long? FileSize { get; set; }
    public string? FileUrl { get; set; }
    public int? RecordCount { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}

public class ScheduledExportDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DataSource { get; set; } = string.Empty;
    public string Format { get; set; } = "xlsx";
    public string Schedule { get; set; } = "daily";
    public string ScheduleTime { get; set; } = "06:00";
    public int? ScheduleDayOfWeek { get; set; }
    public int? ScheduleDayOfMonth { get; set; }
    public string? Filters { get; set; }
    public List<string> Recipients { get; set; } = new();
    public bool IsActive { get; set; }
    public DateTime? LastRunAt { get; set; }
    public DateTime? NextRunAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateDataExportRequest
{
    public string Name { get; set; } = string.Empty;
    public string DataSource { get; set; } = string.Empty;
    public string Format { get; set; } = "xlsx";
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
}

public class CreateScheduledExportRequest
{
    public string Name { get; set; } = string.Empty;
    public string DataSource { get; set; } = string.Empty;
    public string Format { get; set; } = "xlsx";
    public string Schedule { get; set; } = "daily";
    public string ScheduleTime { get; set; } = "06:00";
    public int? ScheduleDayOfWeek { get; set; }
    public int? ScheduleDayOfMonth { get; set; }
    public List<string> Recipients { get; set; } = new();
    public bool IsActive { get; set; } = true;
}

public class UpdateScheduledExportRequest
{
    public string Name { get; set; } = string.Empty;
    public string DataSource { get; set; } = string.Empty;
    public string Format { get; set; } = "xlsx";
    public string Schedule { get; set; } = "daily";
    public string ScheduleTime { get; set; } = "06:00";
    public int? ScheduleDayOfWeek { get; set; }
    public int? ScheduleDayOfMonth { get; set; }
    public List<string> Recipients { get; set; } = new();
    public bool IsActive { get; set; } = true;
}
