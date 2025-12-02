using CallCenter.Domain.Common.Entities;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Models;

namespace CallCenter.Domain.Interfaces;

public interface IAuditService
{
    Task LogAsync<T>(
        AuditOperation operation,
        T entity,
        UserAuditInfo user,
        string? additionalInfo = null,
        bool success = true,
        string? errorMessage = null,
        CancellationToken cancellationToken = default) where T : class;

    Task LogChangesAsync<T>(
        T originalEntity,
        T modifiedEntity,
        UserAuditInfo user,
        string? additionalInfo = null,
        CancellationToken cancellationToken = default) where T : class;

    Task LogDeleteAsync<T>(
        T entity,
        UserAuditInfo user,
        bool isSoftDelete = false,
        string? additionalInfo = null,
        CancellationToken cancellationToken = default) where T : class;

    Task LogUserActionAsync(
        AuditOperation operation,
        UserAuditInfo user,
        string? additionalInfo = null,
        bool success = true,
        string? errorMessage = null,
        CancellationToken cancellationToken = default);

    Task LogSystemActionAsync(
        string action,
        string details,
        Guid userId,
        string userName,
        bool success = true,
        string? errorMessage = null,
        CancellationToken cancellationToken = default);

    Task<AuditLog> CreateAuditLogAsync(
        AuditOperation operation,
        AuditEntityType entityType,
        string entityId,
        string entityName,
        UserAuditInfo user,
        string? additionalInfo = null,
        string? changes = null,
        bool success = true,
        string? errorMessage = null,
        CancellationToken cancellationToken = default);

    Dictionary<string, (string? oldValue, string? newValue, string? displayName)> CompareEntities<T>(
        T original,
        T modified) where T : class;

    AuditEntityType GetEntityType<T>() where T : class;

    string GetEntityId<T>(T entity) where T : class;

    string GetEntityName<T>(T entity) where T : class;
}