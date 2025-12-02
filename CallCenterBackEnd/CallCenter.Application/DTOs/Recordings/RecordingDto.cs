namespace CallCenter.Application.DTOs.Recordings;

public class CallRecordingDto
{
    public Guid Id { get; set; }
    public string CallId { get; set; } = string.Empty;
    public Guid? ConversationId { get; set; }
    public string Url { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public long SizeBytes { get; set; }
    public string Format { get; set; } = string.Empty;
    public bool IsEncrypted { get; set; }
    public DateTime? RetentionUntil { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateRecordingRequest
{
    public string CallId { get; set; } = string.Empty;
    public Guid? ConversationId { get; set; }
    public string Url { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public long SizeBytes { get; set; }
    public string Format { get; set; } = "wav";
    public bool IsEncrypted { get; set; } = true;
    public DateTime? RetentionUntil { get; set; }
}
