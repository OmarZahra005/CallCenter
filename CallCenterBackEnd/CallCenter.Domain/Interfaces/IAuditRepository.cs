using CallCenter.Domain.Common.Models;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Interfaces;

public interface IAuditRepository : IRepository<AuditLog>
{
    Task<PagedList<AuditLog>> GetPagedAsync(
        int pageNumber,
        int pageSize,
        AuditOperation? operation = null,
        AuditEntityType? entityType = null,
        string? userId = null,
        string? entityId = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? searchTerm = null,
        bool includeDetails = false,
        CancellationToken cancellationToken = default);

    Task<AuditLog?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AuditLog>> GetByEntityAsync(
        string entityId,
        AuditEntityType entityType,
        bool includeDetails = false,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AuditLog>> GetByUserAsync(
        string userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? limit = null,
        CancellationToken cancellationToken = default);

    Task<long> GetAuditCountAsync(
        AuditOperation? operation = null,
        AuditEntityType? entityType = null,
        string? userId = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AuditLog>> GetRecentActivityAsync(
        int count = 50,
        string? userId = null,
        CancellationToken cancellationToken = default);

    Task DeleteOldAuditLogsAsync(DateTime olderThan, CancellationToken cancellationToken = default);

    IQueryable<AuditLog> GetDataTableQueryable();
}