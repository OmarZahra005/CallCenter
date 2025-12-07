namespace CallCenter.Application.DTOs.CallLog;

public class CallSummaryDto
{
    public Guid Id { get; set; }
    public string ProviderCallId { get; set; } = string.Empty;
    public string FromNumber { get; set; } = string.Empty;
    public string ToNumber { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset StartedAtUtc { get; set; }
    public DateTimeOffset? EndedAtUtc { get; set; }
    public string? RecordingUrl { get; set; }
}
