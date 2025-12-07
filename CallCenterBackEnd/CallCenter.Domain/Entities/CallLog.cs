using CallCenter.Domain.Common.Entities;

namespace CallCenter.Domain.Entities;

public class CallLog : Entity
{
    public required string ProviderCallId { get; set; }
    public required string FromNumber { get; set; }
    public required string ToNumber { get; set; }
    public required string Direction { get; set; } // "inbound" or "outbound"
    public required string Status { get; set; } // e.g., "ringing", "in-progress", "completed", "failed"
    public required DateTimeOffset StartedAtUtc { get; set; }
    public DateTimeOffset? EndedAtUtc { get; set; }
    public string? RecordingUrl { get; set; }
    public string? Notes { get; set; }
}
