using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Cti;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;

namespace CallCenter.Application.Services;

public interface ICtiService
{
    Task<PagedResponse<CtiEventDto>> GetEventsAsync(PagedRequest request, Guid? agentId = null);
    Task<CtiEventDto?> GetEventByIdAsync(Guid id);
    Task<CtiEventDto> CreateEventAsync(CreateCtiEventRequest request);
    Task<List<CtiEventDto>> GetByCallIdAsync(string callId);
}

public class CtiService : ICtiService
{
    private readonly IRepository<CtiEvent> _repository;

    public CtiService(IRepository<CtiEvent> repository)
    {
        _repository = repository;
    }

    public async Task<PagedResponse<CtiEventDto>> GetEventsAsync(PagedRequest request, Guid? agentId = null)
    {
        var events = await _repository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            null,
            request.SortBy,
            request.SortDescending);

        var items = events.Items.AsEnumerable();
        if (agentId.HasValue)
            items = items.Where(e => e.AgentId == agentId.Value);

        return new PagedResponse<CtiEventDto>
        {
            Items = items.Select(MapToDto).ToList(),
            PageNumber = events.CurrentPage,
            PageSize = events.PageSize,
            TotalCount = events.TotalCount,
            TotalPages = events.PageCount
        };
    }

    public async Task<CtiEventDto?> GetEventByIdAsync(Guid id)
    {
        var all = await _repository.GetAllAsync();
        var evt = all.FirstOrDefault(e => e.Id == id);
        return evt != null ? MapToDto(evt) : null;
    }

    public async Task<CtiEventDto> CreateEventAsync(CreateCtiEventRequest request)
    {
        var evt = new CtiEvent
        {
            Id = Guid.NewGuid(),
            CallId = request.CallId,
            AgentId = request.AgentId,
            EventType = request.EventType,
            Direction = request.Direction,
            Timestamp = DateTime.UtcNow,
            Metadata = request.Metadata,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(evt);
        await _repository.SaveChangesAsync();
        return MapToDto(evt);
    }

    public async Task<List<CtiEventDto>> GetByCallIdAsync(string callId)
    {
        var all = await _repository.GetAllAsync();
        return all.Where(e => e.CallId == callId).Select(MapToDto).ToList();
    }

    private static CtiEventDto MapToDto(CtiEvent evt)
    {
        return new CtiEventDto
        {
            Id = evt.Id,
            CallId = evt.CallId,
            AgentId = evt.AgentId,
            AgentName = evt.Agent?.Name,
            EventType = evt.EventType,
            Direction = evt.Direction,
            Timestamp = evt.Timestamp,
            Metadata = evt.Metadata
        };
    }
}
