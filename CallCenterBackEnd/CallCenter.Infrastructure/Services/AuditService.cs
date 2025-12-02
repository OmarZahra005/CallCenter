using CallCenter.Domain.Common.Entities;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;
using CallCenter.Domain.Models;
using System.ComponentModel;
using System.Reflection;
using System.Text.Json;

namespace AssetManagement.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly IAuditRepository _auditRepository;

    private static readonly Dictionary<Type, AuditEntityType> EntityTypeMapping = new()
    {
        // CTI Integration
        { typeof(CtiEvent), AuditEntityType.CtiEvent },
        { typeof(AgentState), AuditEntityType.AgentState },

        // Organization & Teams
        { typeof(Team), AuditEntityType.Team },
        { typeof(Agent), AuditEntityType.Agent },
        { typeof(Queue), AuditEntityType.Queue },
        { typeof(AgentSkill), AuditEntityType.AgentSkill },

        // Customers
        { typeof(Customer), AuditEntityType.Customer },
        { typeof(CustomerInteraction), AuditEntityType.CustomerInteraction },
        { typeof(CustomerNote), AuditEntityType.CustomerNote },

        // Conversations
        { typeof(Conversation), AuditEntityType.Conversation },
        { typeof(ConversationMessage), AuditEntityType.ConversationMessage },

        // Ticketing
        { typeof(Ticket), AuditEntityType.Ticket },
        { typeof(TicketStatusHistory), AuditEntityType.TicketStatusHistory },
        { typeof(TicketNote), AuditEntityType.TicketNote },
        { typeof(TicketAttachment), AuditEntityType.TicketAttachment },
        { typeof(CallDisposition), AuditEntityType.CallDisposition },
        { typeof(ConversationDisposition), AuditEntityType.ConversationDisposition },

        // SLA
        { typeof(SlaRule), AuditEntityType.SlaRule },
        { typeof(TicketSlaTracking), AuditEntityType.TicketSlaTracking },

        // AI & Knowledge Base
        { typeof(CallTranscription), AuditEntityType.CallTranscription },
        { typeof(AiSuggestion), AuditEntityType.AiSuggestion },
        { typeof(KnowledgeBaseArticle), AuditEntityType.KnowledgeBaseArticle },
        { typeof(ArticleSearchLog), AuditEntityType.ArticleSearchLog },

        // Analytics
        { typeof(AgentKpi), AuditEntityType.AgentKpi },
        { typeof(QueueMetric), AuditEntityType.QueueMetric },
        { typeof(TeamKpi), AuditEntityType.TeamKpi },

        // Customer Satisfaction
        { typeof(CustomerSatisfactionSurvey), AuditEntityType.CustomerSatisfactionSurvey },

        // Workforce Management
        { typeof(AgentShift), AuditEntityType.AgentShift },
        { typeof(AgentAdherence), AuditEntityType.AgentAdherence },
        { typeof(TimeOffRequest), AuditEntityType.TimeOffRequest },

        // QA
        { typeof(QaEvaluationForm), AuditEntityType.QaEvaluationForm },
        { typeof(QaFormCriteria), AuditEntityType.QaFormCriteria },
        { typeof(QaScorecard), AuditEntityType.QaScorecard },
        { typeof(QaScorecardDetail), AuditEntityType.QaScorecardDetail },
        { typeof(CoachingSession), AuditEntityType.CoachingSession },
        { typeof(CallRecording), AuditEntityType.CallRecording },

        // Alerts
        { typeof(AlertRule), AuditEntityType.AlertRule },
        { typeof(AlertLog), AuditEntityType.AlertLog },

        // System
        { typeof(Notification), AuditEntityType.Notification },
        { typeof(DataExportLog), AuditEntityType.DataExportLog },
        { typeof(SystemSetting), AuditEntityType.SystemSetting }
    };

    public AuditService(IAuditRepository auditRepository)
    {
        _auditRepository = auditRepository;
    }

    public async Task LogAsync<T>(
        AuditOperation operation,
        T entity,
        UserAuditInfo user,
        string? additionalInfo = null,
        bool success = true,
        string? errorMessage = null,
        CancellationToken cancellationToken = default) where T : class
    {
        var entityType = GetEntityType<T>();
        var entityId = GetEntityId(entity);
        var entityName = GetEntityName(entity);

        var auditLog = AuditLog.Create(
            operation,
            entityType,
            entityId,
            entityName,
            user.UserId,
            user.FullName,
            user.Email,
            user.IpAddress,
            user.UserAgent,
            additionalInfo,
            success: success,
            errorMessage: errorMessage);

        await _auditRepository.AddAsync(auditLog, cancellationToken);
    }

    public async Task LogChangesAsync<T>(
        T originalEntity,
        T modifiedEntity,
        UserAuditInfo user,
        string? additionalInfo = null,
        CancellationToken cancellationToken = default) where T : class
    {
        var changes = CompareEntities(originalEntity, modifiedEntity);

        if (changes.Count == 0)
            return; // No changes to log

        var entityType = GetEntityType<T>();
        var entityId = GetEntityId(modifiedEntity);
        var entityName = GetEntityName(modifiedEntity);
        
        // Convert tuple dictionary to serializable format
        var serializableChanges = changes.ToDictionary(
            kvp => kvp.Key,
            kvp => new
            {
                OldValue = kvp.Value.oldValue,
                NewValue = kvp.Value.newValue,
                DisplayName = kvp.Value.displayName
            });
        
        var changesJson = JsonSerializer.Serialize(serializableChanges);

        var auditLog = AuditLog.Create(
            AuditOperation.Update,
            entityType,
            entityId,
            entityName,
            user.UserId,
            user.FullName,
            user.Email,
            user.IpAddress,
            user.UserAgent,
            additionalInfo,
            changes: changesJson);

        auditLog.AddDetails(changes);

        await _auditRepository.AddAsync(auditLog, cancellationToken);
    }

    public async Task LogDeleteAsync<T>(
        T entity,
        UserAuditInfo user,
        bool isSoftDelete = false,
        string? additionalInfo = null,
        CancellationToken cancellationToken = default) where T : class
    {
        var operation = isSoftDelete ? AuditOperation.SoftDelete : AuditOperation.Delete;

        await LogAsync(
            operation,
            entity,
            user,
            additionalInfo,
            cancellationToken: cancellationToken);
    }

    public async Task LogUserActionAsync(
        AuditOperation operation,
        UserAuditInfo user,
        string? additionalInfo = null,
        bool success = true,
        string? errorMessage = null,
        CancellationToken cancellationToken = default)
    {
        var auditLog = AuditLog.Create(
            operation,
            AuditEntityType.Authentication,
            user.UserId.ToString(),
            user.FullName,
            user.UserId,
            user.FullName,
            user.Email,
            user.IpAddress,
            user.UserAgent,
            additionalInfo,
            success: success,
            errorMessage: errorMessage);

        await _auditRepository.AddAsync(auditLog, cancellationToken);
    }

    public async Task LogSystemActionAsync(
        string action,
        string details,
        Guid userId,
        string userName,
        bool success = true,
        string? errorMessage = null,
        CancellationToken cancellationToken = default)
    {
        var auditLog = AuditLog.Create(
            AuditOperation.SystemConfiguration,
            AuditEntityType.System,
            "SYSTEM",
            action,
            userId,
            userName,
            additionalInfo: details,
            success: success,
            errorMessage: errorMessage);

        await _auditRepository.AddAsync(auditLog, cancellationToken);
    }

    public async Task<AuditLog> CreateAuditLogAsync(
        AuditOperation operation,
        AuditEntityType entityType,
        string entityId,
        string entityName,
        UserAuditInfo user,
        string? additionalInfo = null,
        string? changes = null,
        bool success = true,
        string? errorMessage = null,
        CancellationToken cancellationToken = default)
    {
        var auditLog = AuditLog.Create(
            operation,
            entityType,
            entityId,
            entityName,
            user.UserId,
            user.FullName,
            user.Email,
            user.IpAddress,
            user.UserAgent,
            additionalInfo,
            changes,
            success,
            errorMessage);

        await _auditRepository.AddAsync(auditLog, cancellationToken);
        return auditLog;
    }

    public Dictionary<string, (string? oldValue, string? newValue, string? displayName)> CompareEntities<T>(
        T original,
        T modified) where T : class
    {
        var changes = new Dictionary<string, (string? oldValue, string? newValue, string? displayName)>();
        var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.CanRead && IsAuditableProperty(p));

        foreach (var property in properties)
        {
            var originalValue = property.GetValue(original);
            var modifiedValue = property.GetValue(modified);

            // Convert values to string for comparison
            var originalStr = ConvertToString(originalValue);
            var modifiedStr = ConvertToString(modifiedValue);

            if (originalStr != modifiedStr)
            {
                var displayName = GetPropertyDisplayName(property);
                changes[property.Name] = (originalStr, modifiedStr, displayName);
            }
        }

        return changes;
    }

    public AuditEntityType GetEntityType<T>() where T : class
    {
        var type = typeof(T);
        return EntityTypeMapping.TryGetValue(type, out var entityType)
            ? entityType
            : AuditEntityType.System;
    }

    public string GetEntityId<T>(T entity) where T : class
    {
        // Try to get Id property
        var idProperty = typeof(T).GetProperty("Id");
        if (idProperty != null)
        {
            var idValue = idProperty.GetValue(entity);
            return idValue?.ToString() ?? "Unknown";
        }

        // For composite entities, try to get composite keys
        if (entity is CompositeEntity compositeEntity)
        {
            var keys = compositeEntity.GetKeys();
            return string.Join("-", keys.Select(k => k?.ToString() ?? "null"));
        }

        return "Unknown";
    }

    public string GetEntityName<T>(T entity) where T : class
    {
        // Try common name properties
        var nameProperties = new[] { "Name", "Title", "UserName", "Email", "DisplayName" };

        foreach (var propName in nameProperties)
        {
            var property = typeof(T).GetProperty(propName);
            if (property != null)
            {
                var value = property.GetValue(entity);
                if (!string.IsNullOrEmpty(value?.ToString()))
                {
                    return value.ToString()!;
                }
            }
        }

        // Fallback to type name and ID
        var id = GetEntityId(entity);
        return $"{typeof(T).Name} ({id})";
    }

    private static bool IsAuditableProperty(PropertyInfo property)
    {
        // Skip virtual navigation properties
        if (property.GetGetMethod()?.IsVirtual == true && property.PropertyType.IsClass && property.PropertyType != typeof(string))
            return false;

        // Skip collection navigation properties
        if (typeof(System.Collections.IEnumerable).IsAssignableFrom(property.PropertyType) && property.PropertyType != typeof(string))
            return false;

        // Skip navigation properties and complex objects
        if (property.PropertyType.IsClass && property.PropertyType != typeof(string))
            return false;

        // Skip common system properties that shouldn't be audited
        var skipProperties = new[] { "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "Version", "RowVersion" };
        if (skipProperties.Contains(property.Name))
            return false;

        return true;
    }

    private static string? ConvertToString(object? value)
    {
        return value switch
        {
            null => null,
            DateTime dt => dt.ToString("yyyy-MM-dd HH:mm:ss"),
            DateTimeOffset dto => dto.ToString("yyyy-MM-dd HH:mm:ss zzz"),
            bool b => b.ToString().ToLower(),
            string s => s,
            // Handle primitive types and value types
            var v when v.GetType().IsPrimitive || v.GetType().IsValueType => v.ToString(),
            // For complex objects, try to get a meaningful string representation
            var obj when obj.GetType().IsClass => GetObjectDisplayValue(obj),
            _ => value.ToString()
        };
    }

    private static string GetObjectDisplayValue(object obj)
    {
        var type = obj.GetType();
        
        // Try common name properties for display
        var nameProperties = new[] { "Name", "Title", "DisplayName", "UserName", "Email", "Value" };
        
        foreach (var propName in nameProperties)
        {
            var property = type.GetProperty(propName);
            if (property != null && property.CanRead)
            {
                var value = property.GetValue(obj);
                if (!string.IsNullOrEmpty(value?.ToString()))
                {
                    return value.ToString()!;
                }
            }
        }
        
        // If no meaningful property found, return type name with ID if available
        var idProperty = type.GetProperty("Id");
        if (idProperty != null && idProperty.CanRead)
        {
            var idValue = idProperty.GetValue(obj);
            return $"{type.Name} (ID: {idValue})";
        }
        
        // Fallback to type name
        return type.Name;
    }

    private static string GetPropertyDisplayName(PropertyInfo property)
    {
        var displayAttribute = property.GetCustomAttribute<DisplayNameAttribute>();
        return displayAttribute?.DisplayName ?? property.Name;
    }
}