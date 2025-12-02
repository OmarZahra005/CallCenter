using CallCenter.Application.DTOs.AuditLogs;
using CallCenter.Application.DTOs.Common;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;

namespace CallCenter.Application.Services;

public interface IAuditLogService
{
    Task<PagedResponse<AuditLogDto>> GetLogsAsync(PagedRequest request, AuditEntityType? entityType = null);
    Task<AuditLogDto?> GetLogByIdAsync(Guid id);
    Task<AuditLogDto> CreateLogAsync(CreateAuditLogRequest request);
    Task<List<AuditLogDto>> GetByEntityAsync(AuditEntityType entityType, string entityId);
    Task<List<AuditLogDto>> GetByUserAsync(Guid userId, DateOnly? from = null, DateOnly? to = null);
}

public class AuditLogService : IAuditLogService
{
    private readonly IRepository<AuditLog> _repository;

    public AuditLogService(IRepository<AuditLog> repository)
    {
        _repository = repository;
    }

    public async Task<PagedResponse<AuditLogDto>> GetLogsAsync(PagedRequest request, AuditEntityType? entityType = null)
    {
        var logs = await _repository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            null,
            request.SortBy,
            request.SortDescending);

        var items = logs.Items.AsEnumerable();
        if (entityType.HasValue)
            items = items.Where(l => l.EntityType == entityType.Value);

        return new PagedResponse<AuditLogDto>
        {
            Items = items.Select(MapToDto).ToList(),
            PageNumber = logs.CurrentPage,
            PageSize = logs.PageSize,
            TotalCount = logs.TotalCount,
            TotalPages = logs.PageCount
        };
    }

    public async Task<AuditLogDto?> GetLogByIdAsync(Guid id)
    {
        var all = await _repository.GetAllAsync();
        var log = all.FirstOrDefault(l => l.Id == id);
        return log != null ? MapToDto(log) : null;
    }

    public async Task<AuditLogDto> CreateLogAsync(CreateAuditLogRequest request)
    {
        var log = AuditLog.Create(
            request.Operation,
            request.EntityType,
            request.EntityId,
            request.EntityName,
            request.UserId,
            request.UserName,
            request.UserEmail,
            request.IpAddress,
            request.UserAgent,
            request.AdditionalInfo,
            request.Changes,
            request.Success,
            request.ErrorMessage);

        await _repository.AddAsync(log);
        await _repository.SaveChangesAsync();
        return MapToDto(log);
    }

    public async Task<List<AuditLogDto>> GetByEntityAsync(AuditEntityType entityType, string entityId)
    {
        var all = await _repository.GetAllAsync();
        return all
            .Where(l => l.EntityType == entityType && l.EntityId == entityId)
            .OrderByDescending(l => l.Timestamp)
            .Select(MapToDto)
            .ToList();
    }

    public async Task<List<AuditLogDto>> GetByUserAsync(Guid userId, DateOnly? from = null, DateOnly? to = null)
    {
        var all = await _repository.GetAllAsync();
        var query = all.Where(l => l.UserId == userId);

        if (from.HasValue)
            query = query.Where(l => DateOnly.FromDateTime(l.Timestamp) >= from.Value);
        if (to.HasValue)
            query = query.Where(l => DateOnly.FromDateTime(l.Timestamp) <= to.Value);

        return query.OrderByDescending(l => l.Timestamp).Select(MapToDto).ToList();
    }

    private static AuditLogDto MapToDto(AuditLog log) => new()
    {
        Id = log.Id,
        Operation = log.Operation,
        EntityType = log.EntityType,
        EntityId = log.EntityId,
        EntityName = log.EntityName,
        UserId = log.UserId,
        UserName = log.UserName,
        UserEmail = log.UserEmail,
        IpAddress = log.IpAddress,
        Timestamp = log.Timestamp,
        AdditionalInfo = log.AdditionalInfo,
        Changes = log.Changes,
        Success = log.Success,
        ErrorMessage = log.ErrorMessage
    };
}
