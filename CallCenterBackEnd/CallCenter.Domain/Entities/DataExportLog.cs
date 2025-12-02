using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class DataExportLog
{
    public Guid Id { get; set; }
    public Guid ExportedBy { get; set; }
    public DataExportType ExportType { get; set; }
    public string? Filters { get; set; }
    public int RecordCount { get; set; }
    public string? FileUrl { get; set; }
    public DataExportStatus Status { get; set; } = DataExportStatus.Processing;
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public virtual Agent ExportedByAgent { get; set; } = null!;
}
