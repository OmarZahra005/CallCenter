using System.Text.Json;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CallCenter.Application.Services;

public interface ITranscriptionService
{
    Task<TranscriptionDto?> GetByIdAsync(Guid id);
    Task<TranscriptionDto?> GetByRecordingIdAsync(Guid recordingId);
    Task<TranscriptionDto?> GetByCallSidAsync(string callSid);
    Task<TranscriptionDto?> GetOrCreateByCallSidAsync(string callSid);
    Task<TranscriptionDto> CreateTranscriptionAsync(CreateTranscriptionRequest request);
    Task<TranscriptionDto?> UpdateTranscriptionAsync(Guid id, UpdateTranscriptionRequest request);
    Task<bool> DeleteTranscriptionAsync(Guid id);
    Task<TranscriptionDto> RequestTranscriptionAsync(Guid recordingId);
    Task<TranscriptionDto?> ProcessTranscriptionAsync(Guid recordingId, string filePath);
}

public class TranscriptionService : ITranscriptionService
{
    private readonly IRepository<Transcription> _repository;
    private readonly IRepository<CallRecording> _recordingRepository;
    private readonly IExternalTranscriptionService _externalTranscriptionService;
    private readonly ILogger<TranscriptionService> _logger;
    private readonly string _storageBasePath;

    public TranscriptionService(
        IRepository<Transcription> repository,
        IRepository<CallRecording> recordingRepository,
        IExternalTranscriptionService externalTranscriptionService,
        ILogger<TranscriptionService> logger,
        IConfiguration configuration)
    {
        _repository = repository;
        _recordingRepository = recordingRepository;
        _externalTranscriptionService = externalTranscriptionService;
        _logger = logger;
        _storageBasePath = configuration["RecordingStorage:Path"]
            ?? Path.Combine(Directory.GetCurrentDirectory(), "Recordings");
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

    public async Task<TranscriptionDto?> GetByCallSidAsync(string callSid)
    {
        // First find the CallRecording by CallSid
        var recordings = await _recordingRepository.GetAllAsync();
        var recording = recordings.FirstOrDefault(r => r.CallId == callSid);
        if (recording == null) return null;

        // Then find the transcription for that recording
        var transcriptions = await _repository.GetAllAsync();
        var transcription = transcriptions.FirstOrDefault(t => t.CallRecordingId == recording.Id);
        return transcription != null ? MapToDto(transcription) : null;
    }

    public async Task<TranscriptionDto?> GetOrCreateByCallSidAsync(string callSid)
    {
        _logger.LogInformation("GetOrCreateByCallSidAsync called for CallSid: {CallSid}", callSid);

        // First find the CallRecording by CallSid
        var recordings = await _recordingRepository.GetAllAsync();
        var recording = recordings.FirstOrDefault(r => r.CallId == callSid);
        if (recording == null)
        {
            _logger.LogWarning("No CallRecording found for CallSid: {CallSid}", callSid);
            return null;
        }

        // Check if transcription already exists
        var transcriptions = await _repository.GetAllAsync();
        var existingTranscription = transcriptions.FirstOrDefault(t => t.CallRecordingId == recording.Id);

        if (existingTranscription != null)
        {
            _logger.LogInformation("Existing transcription found for CallSid: {CallSid}, Status: {Status}",
                callSid, existingTranscription.Status);
            return MapToDto(existingTranscription);
        }

        // No transcription exists - build file path and process
        _logger.LogInformation("No transcription found for CallSid: {CallSid}, initiating processing", callSid);

        // Build the full path from recording's relative URL
        var filePath = Path.Combine(_storageBasePath, recording.Url);
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("No recording file found at path: {FilePath} for RecordingId: {RecordingId}", filePath, recording.Id);
            return null;
        }

        // Process the transcription
        var result = await ProcessTranscriptionAsync(recording.Id, filePath);
        return result;
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

    /// <summary>
    /// Process transcription by calling external API and storing results
    /// </summary>
    public async Task<TranscriptionDto?> ProcessTranscriptionAsync(Guid recordingId, string filePath)
    {
        try
        {
            _logger.LogInformation("Starting transcription processing for recording: {RecordingId}", recordingId);

            // Check if transcription already exists and is completed
            var all = await _repository.GetAllAsync();
            var existingTranscription = all.FirstOrDefault(t => t.CallRecordingId == recordingId);

            Transcription transcription;

            if (existingTranscription != null)
            {
                if (existingTranscription.Status == TranscriptionStatus.Completed)
                {
                    _logger.LogInformation("Transcription already completed for recording: {RecordingId}", recordingId);
                    return MapToDto(existingTranscription);
                }
                transcription = existingTranscription;
            }
            else
            {
                // Create new transcription entity with Processing status
                transcription = new Transcription
                {
                    Id = Guid.NewGuid(),
                    CallRecordingId = recordingId,
                    Status = TranscriptionStatus.Processing,
                    Language = "ar", // Default to Arabic for this call center
                    CreatedAt = DateTime.UtcNow
                };
                await _repository.AddAsync(transcription);
                await _repository.SaveChangesAsync();
            }

            // Update status to Processing
            transcription.Status = TranscriptionStatus.Processing;
            _repository.Update(transcription);
            await _repository.SaveChangesAsync();

            // Call external transcription API
            var result = await _externalTranscriptionService.AnalyzeRecordingAsync(filePath);

            if (result == null)
            {
                _logger.LogError("External transcription API returned null for recording: {RecordingId}", recordingId);
                transcription.Status = TranscriptionStatus.Failed;
                _repository.Update(transcription);
                await _repository.SaveChangesAsync();
                return MapToDto(transcription);
            }

            // Update transcription with results
            transcription.Content = result.Transcript;
            transcription.Summary = result.Summary;
            transcription.Sentiment = result.Sentiment;
            transcription.DetectedIssues = result.DetectedIssues?.Count > 0
                ? JsonSerializer.Serialize(result.DetectedIssues)
                : null;
            transcription.ActionItems = result.ActionItems?.Count > 0
                ? JsonSerializer.Serialize(result.ActionItems)
                : null;
            transcription.WordCount = result.Transcript?.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length ?? 0;
            transcription.Status = TranscriptionStatus.Completed;
            transcription.CompletedAt = DateTime.UtcNow;
            transcription.Confidence = 0.95f; // Default confidence from external API

            _repository.Update(transcription);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("Transcription completed for recording: {RecordingId}, Sentiment: {Sentiment}",
                recordingId, result.Sentiment);

            return MapToDto(transcription);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing transcription for recording: {RecordingId}", recordingId);

            // Try to update status to Failed
            try
            {
                var all = await _repository.GetAllAsync();
                var transcription = all.FirstOrDefault(t => t.CallRecordingId == recordingId);
                if (transcription != null)
                {
                    transcription.Status = TranscriptionStatus.Failed;
                    _repository.Update(transcription);
                    await _repository.SaveChangesAsync();
                }
            }
            catch { /* Ignore cleanup errors */ }

            return null;
        }
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
        // AI Analysis fields
        Summary = t.Summary,
        Sentiment = t.Sentiment,
        DetectedIssues = t.DetectedIssues,
        ActionItems = t.ActionItems,
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
    // AI Analysis fields
    public string? Summary { get; init; }
    public string? Sentiment { get; init; }
    public string? DetectedIssues { get; init; }
    public string? ActionItems { get; init; }
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
