using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class Transcription
{
    public Guid Id { get; set; }
    public Guid CallRecordingId { get; set; }
    public string? Content { get; set; }
    public string? Language { get; set; }
    public float? Confidence { get; set; }
    public TranscriptionStatus Status { get; set; } = TranscriptionStatus.Pending;
    public int WordCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public virtual CallRecording CallRecording { get; set; } = null!;
    public virtual ICollection<TranscriptionSegment> Segments { get; set; } = new List<TranscriptionSegment>();
}

public class TranscriptionSegment
{
    public Guid Id { get; set; }
    public Guid TranscriptionId { get; set; }
    public string? Speaker { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string Text { get; set; } = string.Empty;
    public float? Confidence { get; set; }

    // Navigation
    public virtual Transcription Transcription { get; set; } = null!;
}
