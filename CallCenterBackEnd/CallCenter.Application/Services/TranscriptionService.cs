using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;

namespace CallCenter.Application.Services;

public interface ITranscriptionService
{
    Task<TranscriptionDto?> GetByIdAsync(Guid id);
    Task<TranscriptionDto?> GetByRecordingIdAsync(Guid recordingId);
    Task<TranscriptionDto> CreateTranscriptionAsync(CreateTranscriptionRequest request);
    Task<TranscriptionDto?> UpdateTranscriptionAsync(Guid id, UpdateTranscriptionRequest request);
    Task<bool> DeleteTranscriptionAsync(Guid id);
    Task<TranscriptionDto> RequestTranscriptionAsync(Guid recordingId);
}

public class TranscriptionService : ITranscriptionService
{
    private readonly IRepository<Transcription> _repository;
    private readonly IRepository<CallRecording> _recordingRepository;

    public TranscriptionService(
        IRepository<Transcription> repository,
        IRepository<CallRecording> recordingRepository)
    {
        _repository = repository;
        _recordingRepository = recordingRepository;
    }

    public async Task<TranscriptionDto?> GetByIdAsync(Guid id)
    {
        var all = await _repository.GetAllAsync();
        var transcription = all.FirstOrDefault(t => t.Id == id);
        return transcription != null ? MapToDto(transcription) : null;
    }

    public async Task<TranscriptionDto?> GetByRecordingIdAsync(Guid recordingId)
    {
        var all = await _repository.GetAllAsync();
        var transcription = all.FirstOrDefault(t => t.CallRecordingId == recordingId);
        return transcription != null ? MapToDto(transcription) : null;
    }

    public async Task<TranscriptionDto> CreateTranscriptionAsync(CreateTranscriptionRequest request)
    {
        var transcription = new Transcription
        {
            Id = Guid.NewGuid(),
            CallRecordingId = request.RecordingId,
            Content = request.Content,
            Language = request.Language,
            Confidence = request.Confidence,
            Status = TranscriptionStatus.Completed,
            WordCount = request.Content?.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length ?? 0,
            CreatedAt = DateTime.UtcNow,
            CompletedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(transcription);
        await _repository.SaveChangesAsync();
        return MapToDto(transcription);
    }

    public async Task<TranscriptionDto?> UpdateTranscriptionAsync(Guid id, UpdateTranscriptionRequest request)
    {
        var all = await _repository.GetAllAsync();
        var transcription = all.FirstOrDefault(t => t.Id == id);
        if (transcription == null) return null;

        transcription.Content = request.Content ?? transcription.Content;
        transcription.Confidence = request.Confidence ?? transcription.Confidence;
        transcription.Status = request.Status ?? transcription.Status;
        transcription.WordCount = transcription.Content?.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length ?? 0;

        if (request.Status == TranscriptionStatus.Completed && !transcription.CompletedAt.HasValue)
        {
            transcription.CompletedAt = DateTime.UtcNow;
        }

        _repository.Update(transcription);
        await _repository.SaveChangesAsync();
        return MapToDto(transcription);
    }

    public async Task<bool> DeleteTranscriptionAsync(Guid id)
    {
        var all = await _repository.GetAllAsync();
        var transcription = all.FirstOrDefault(t => t.Id == id);
        if (transcription == null) return false;

        _repository.DeleteAsync(transcription);
        await _repository.SaveChangesAsync();
        return true;
    }

    public async Task<TranscriptionDto> RequestTranscriptionAsync(Guid recordingId)
    {
        // Check if transcription already exists
        var existing = await GetByRecordingIdAsync(recordingId);
        if (existing != null) return existing;

        // Create pending transcription (in real app, this would queue for processing)
        var transcription = new Transcription
        {
            Id = Guid.NewGuid(),
            CallRecordingId = recordingId,
            Status = TranscriptionStatus.Pending,
            Language = "en",
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(transcription);
        await _repository.SaveChangesAsync();
        return MapToDto(transcription);
    }

    private static TranscriptionDto MapToDto(Transcription t) => new()
    {
        Id = t.Id,
        RecordingId = t.CallRecordingId,
        Content = t.Content,
        Language = t.Language,
        Confidence = t.Confidence,
        Status = t.Status,
        WordCount = t.WordCount,
        CreatedAt = t.CreatedAt,
        CompletedAt = t.CompletedAt,
        Segments = t.Segments?.Select(s => new TranscriptionSegmentDto
        {
            Speaker = s.Speaker,
            StartTime = s.StartTime,
            EndTime = s.EndTime,
            Text = s.Text,
            Confidence = s.Confidence
        }).ToList() ?? new List<TranscriptionSegmentDto>()
    };
}

// DTOs
public record TranscriptionDto
{
    public Guid Id { get; init; }
    public Guid RecordingId { get; init; }
    public string? Content { get; init; }
    public string? Language { get; init; }
    public float? Confidence { get; init; }
    public TranscriptionStatus Status { get; init; }
    public int WordCount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public List<TranscriptionSegmentDto> Segments { get; init; } = new();
}

public record TranscriptionSegmentDto
{
    public string? Speaker { get; init; }
    public TimeSpan StartTime { get; init; }
    public TimeSpan EndTime { get; init; }
    public string Text { get; init; } = string.Empty;
    public float? Confidence { get; init; }
}

public record CreateTranscriptionRequest
{
    public Guid RecordingId { get; init; }
    public string? Content { get; init; }
    public string Language { get; init; } = "en";
    public float? Confidence { get; init; }
}

public record UpdateTranscriptionRequest
{
    public string? Content { get; init; }
    public float? Confidence { get; init; }
    public TranscriptionStatus? Status { get; init; }
}
