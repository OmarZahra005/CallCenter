using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Workforce;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;

namespace CallCenter.Application.Services;

public interface IWorkforceService
{
    Task<PagedResponse<AgentShiftDto>> GetShiftsAsync(PagedRequest request, Guid? agentId = null);
    Task<AgentShiftDto?> GetShiftByIdAsync(Guid id);
    Task<AgentShiftDto> CreateShiftAsync(CreateAgentShiftRequest request);
    Task<AgentShiftDto?> UpdateShiftAsync(Guid id, UpdateAgentShiftRequest request);
    Task<bool> DeleteShiftAsync(Guid id);
    Task<List<AgentShiftDto>> GetAgentShiftsAsync(Guid agentId, DateOnly? from = null, DateOnly? to = null);

    Task<PagedResponse<TimeOffRequestDto>> GetTimeOffRequestsAsync(PagedRequest request, Guid? agentId = null);
    Task<TimeOffRequestDto?> GetTimeOffRequestByIdAsync(Guid id);
    Task<TimeOffRequestDto> CreateTimeOffRequestAsync(CreateTimeOffRequest request);
    Task<TimeOffRequestDto?> ApproveTimeOffRequestAsync(Guid id, ApproveTimeOffRequest request);
    Task<TimeOffRequestDto?> RejectTimeOffRequestAsync(Guid id, ApproveTimeOffRequest request);
    Task<List<TimeOffRequestDto>> GetPendingRequestsAsync();
}

public class WorkforceService : IWorkforceService
{
    private readonly IRepository<AgentShift> _shiftRepository;
    private readonly IRepository<TimeOffRequest> _timeOffRepository;

    public WorkforceService(
        IRepository<AgentShift> shiftRepository,
        IRepository<TimeOffRequest> timeOffRepository)
    {
        _shiftRepository = shiftRepository;
        _timeOffRepository = timeOffRepository;
    }

    public async Task<PagedResponse<AgentShiftDto>> GetShiftsAsync(PagedRequest request, Guid? agentId = null)
    {
        var shifts = await _shiftRepository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            null,
            request.SortBy,
            request.SortDescending);

        var items = shifts.Items.AsEnumerable();
        if (agentId.HasValue)
            items = items.Where(s => s.AgentId == agentId.Value);

        return new PagedResponse<AgentShiftDto>
        {
            Items = items.Select(MapShiftToDto).ToList(),
            PageNumber = shifts.CurrentPage,
            PageSize = shifts.PageSize,
            TotalCount = shifts.TotalCount,
            TotalPages = shifts.PageCount
        };
    }

    public async Task<AgentShiftDto?> GetShiftByIdAsync(Guid id)
    {
        var all = await _shiftRepository.GetAllAsync();
        var shift = all.FirstOrDefault(s => s.Id == id);
        return shift != null ? MapShiftToDto(shift) : null;
    }

    public async Task<AgentShiftDto> CreateShiftAsync(CreateAgentShiftRequest request)
    {
        var shift = new AgentShift
        {
            Id = Guid.NewGuid(),
            AgentId = request.AgentId,
            ShiftDate = request.ShiftDate,
            ShiftStart = request.ShiftStart,
            ShiftEnd = request.ShiftEnd,
            BreakMinutes = request.BreakMinutes,
            Status = ShiftStatus.Scheduled,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _shiftRepository.AddAsync(shift);
        await _shiftRepository.SaveChangesAsync();
        return MapShiftToDto(shift);
    }

    public async Task<AgentShiftDto?> UpdateShiftAsync(Guid id, UpdateAgentShiftRequest request)
    {
        var all = await _shiftRepository.GetAllAsync();
        var shift = all.FirstOrDefault(s => s.Id == id);
        if (shift == null) return null;

        shift.ShiftStart = request.ShiftStart;
        shift.ShiftEnd = request.ShiftEnd;
        shift.BreakMinutes = request.BreakMinutes;
        shift.Status = request.Status;
        shift.ActualStart = request.ActualStart;
        shift.ActualEnd = request.ActualEnd;
        shift.UpdatedAt = DateTime.UtcNow;

        _shiftRepository.Update(shift);
        await _shiftRepository.SaveChangesAsync();
        return MapShiftToDto(shift);
    }

    public async Task<bool> DeleteShiftAsync(Guid id)
    {
        var all = await _shiftRepository.GetAllAsync();
        var shift = all.FirstOrDefault(s => s.Id == id);
        if (shift == null) return false;

        _shiftRepository.DeleteAsync(shift);
        await _shiftRepository.SaveChangesAsync();
        return true;
    }

    public async Task<List<AgentShiftDto>> GetAgentShiftsAsync(Guid agentId, DateOnly? from = null, DateOnly? to = null)
    {
        var all = await _shiftRepository.GetAllAsync();
        var query = all.Where(s => s.AgentId == agentId);

        if (from.HasValue)
            query = query.Where(s => s.ShiftDate >= from.Value);
        if (to.HasValue)
            query = query.Where(s => s.ShiftDate <= to.Value);

        return query.OrderBy(s => s.ShiftDate).Select(MapShiftToDto).ToList();
    }

    public async Task<PagedResponse<TimeOffRequestDto>> GetTimeOffRequestsAsync(PagedRequest request, Guid? agentId = null)
    {
        var requests = await _timeOffRepository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            null,
            request.SortBy,
            request.SortDescending);

        var items = requests.Items.AsEnumerable();
        if (agentId.HasValue)
            items = items.Where(r => r.AgentId == agentId.Value);

        return new PagedResponse<TimeOffRequestDto>
        {
            Items = items.Select(MapTimeOffToDto).ToList(),
            PageNumber = requests.CurrentPage,
            PageSize = requests.PageSize,
            TotalCount = requests.TotalCount,
            TotalPages = requests.PageCount
        };
    }

    public async Task<TimeOffRequestDto?> GetTimeOffRequestByIdAsync(Guid id)
    {
        var all = await _timeOffRepository.GetAllAsync();
        var req = all.FirstOrDefault(r => r.Id == id);
        return req != null ? MapTimeOffToDto(req) : null;
    }

    public async Task<TimeOffRequestDto> CreateTimeOffRequestAsync(CreateTimeOffRequest request)
    {
        var req = new TimeOffRequest
        {
            Id = Guid.NewGuid(),
            AgentId = request.AgentId,
            RequestType = request.RequestType,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Reason = request.Reason,
            Status = TimeOffRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _timeOffRepository.AddAsync(req);
        await _timeOffRepository.SaveChangesAsync();
        return MapTimeOffToDto(req);
    }

    public async Task<TimeOffRequestDto?> ApproveTimeOffRequestAsync(Guid id, ApproveTimeOffRequest request)
    {
        var all = await _timeOffRepository.GetAllAsync();
        var req = all.FirstOrDefault(r => r.Id == id);
        if (req == null) return null;

        req.Status = TimeOffRequestStatus.Approved;
        req.ApprovedBy = request.ApprovedBy;
        req.UpdatedAt = DateTime.UtcNow;

        _timeOffRepository.Update(req);
        await _timeOffRepository.SaveChangesAsync();
        return MapTimeOffToDto(req);
    }

    public async Task<TimeOffRequestDto?> RejectTimeOffRequestAsync(Guid id, ApproveTimeOffRequest request)
    {
        var all = await _timeOffRepository.GetAllAsync();
        var req = all.FirstOrDefault(r => r.Id == id);
        if (req == null) return null;

        req.Status = TimeOffRequestStatus.Rejected;
        req.ApprovedBy = request.ApprovedBy;
        req.UpdatedAt = DateTime.UtcNow;

        _timeOffRepository.Update(req);
        await _timeOffRepository.SaveChangesAsync();
        return MapTimeOffToDto(req);
    }

    public async Task<List<TimeOffRequestDto>> GetPendingRequestsAsync()
    {
        var all = await _timeOffRepository.GetAllAsync();
        return all
            .Where(r => r.Status == TimeOffRequestStatus.Pending)
            .OrderBy(r => r.CreatedAt)
            .Select(MapTimeOffToDto)
            .ToList();
    }

    private static AgentShiftDto MapShiftToDto(AgentShift shift) => new()
    {
        Id = shift.Id,
        AgentId = shift.AgentId,
        AgentName = shift.Agent?.Name ?? string.Empty,
        ShiftDate = shift.ShiftDate,
        ShiftStart = shift.ShiftStart,
        ShiftEnd = shift.ShiftEnd,
        BreakMinutes = shift.BreakMinutes,
        Status = shift.Status,
        ActualStart = shift.ActualStart,
        ActualEnd = shift.ActualEnd
    };

    private static TimeOffRequestDto MapTimeOffToDto(TimeOffRequest req) => new()
    {
        Id = req.Id,
        AgentId = req.AgentId,
        AgentName = req.Agent?.Name ?? string.Empty,
        RequestType = req.RequestType,
        StartDate = req.StartDate,
        EndDate = req.EndDate,
        Status = req.Status,
        Reason = req.Reason,
        ApprovedBy = req.ApprovedBy,
        ApprovedByName = req.ApprovedByAgent?.Name,
        CreatedAt = req.CreatedAt
    };
}
