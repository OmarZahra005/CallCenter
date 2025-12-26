using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Recordings;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces;
using CallCenter.Domain.Interfaces.Repositories;

namespace CallCenter.Application.Services;

public interface ICallRecordingService
{
    Task<PagedResponse<CallRecordingDto>> GetRecordingsAsync(PagedRequest request);
    Task<CallRecordingDto?> GetRecordingByIdAsync(Guid id);
    Task<CallRecordingDto> CreateRecordingAsync(CreateRecordingRequest request);
    Task<List<CallRecordingDto>> GetByCallIdAsync(string callId);
    Task<List<CallRecordingDto>> GetByConversationIdAsync(Guid conversationId);
    Task<bool> DeleteRecordingAsync(Guid id);
}

public class CallRecordingService : ICallRecordingService
{
    private readonly ICallRecordingRepository _repository;

    public CallRecordingService(ICallRecordingRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResponse<CallRecordingDto>> GetRecordingsAsync(PagedRequest request)
    {
        var (items, totalCount) = await _repository.GetPagedWithDetailsAsync(
            request.PageNumber,
            request.PageSize);

        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        return new PagedResponse<CallRecordingDto>
        {
            Items = items.Select(MapToDto).ToList(),
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<CallRecordingDto?> GetRecordingByIdAsync(Guid id)
    {
        var recording = await _repository.GetByIdWithDetailsAsync(id);
        return recording != null ? MapToDto(recording) : null;
    }

    public async Task<CallRecordingDto> CreateRecordingAsync(CreateRecordingRequest request)
    {
        var recording = new CallRecording
        {
            Id = Guid.NewGuid(),
            CallId = request.CallId,
            ConversationId = request.ConversationId,
            Url = request.Url,
            DurationSeconds = request.DurationSeconds,
            SizeBytes = request.SizeBytes,
            Format = request.Format,
            IsEncrypted = request.IsEncrypted,
            RetentionUntil = request.RetentionUntil,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(recording);
        await _repository.SaveChangesAsync();
        return MapToDto(recording);
    }

    public async Task<List<CallRecordingDto>> GetByCallIdAsync(string callId)
    {
        var all = await _repository.GetAllAsync();
        return all.Where(r => r.CallId == callId).Select(MapToDto).ToList();
    }

    public async Task<List<CallRecordingDto>> GetByConversationIdAsync(Guid conversationId)
    {
        var all = await _repository.GetAllAsync();
        return all.Where(r => r.ConversationId == conversationId).Select(MapToDto).ToList();
    }

    public async Task<bool> DeleteRecordingAsync(Guid id)
    {
        var all = await _repository.GetAllAsync();
        var recording = all.FirstOrDefault(r => r.Id == id);
        if (recording == null) return false;

        _repository.DeleteAsync(recording);
        await _repository.SaveChangesAsync();
        return true;
    }

    private static CallRecordingDto MapToDto(CallRecording recording) => new()
    {
        Id = recording.Id,
        CallId = recording.CallId,
        ConversationId = recording.ConversationId,
        Url = recording.Url,
        DurationSeconds = recording.DurationSeconds,
        SizeBytes = recording.SizeBytes,
        Format = recording.Format,
        IsEncrypted = recording.IsEncrypted,
        RetentionUntil = recording.RetentionUntil,
        CreatedAt = recording.CreatedAt,
        // Agent information from Conversation
        AgentId = recording.Conversation?.AgentId,
        AgentName = recording.Conversation?.Agent?.Name,
        // Customer information from Conversation
        CustomerId = recording.Conversation?.CustomerId,
        CustomerName = recording.Conversation?.Customer?.Name,
        CustomerPhone = recording.Conversation?.Customer?.Phone
    };
}
