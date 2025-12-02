# Multilingual Notification System - Design Document

## Overview
This document explains the recommended approach for implementing a translatable notification system that supports multiple languages (Arabic, English) without storing translated text in the database.

---

## Recommended Approach: **Localization Keys + Arguments**

### ✅ Why This Approach?

1. **Language Independence** - Database stores language-agnostic keys
2. **Easy Translation Management** - Translations managed in resource files
3. **Dynamic Content** - Arguments allow personalized notifications
4. **Scalability** - Easy to add new languages without database changes
5. **Performance** - No duplicate data storage
6. **Consistency** - Same translation across all notifications of same type

---

## Database Structure Changes

### Updated Table: notifications

```sql
CREATE TABLE notifications (
    id                      uuid PRIMARY KEY,
    recipient_id            uuid NOT NULL REFERENCES agents(id),
    notification_type       varchar(50) NOT NULL,
    
    -- LOCALIZATION FIELDS --
    localization_key        varchar(100) NOT NULL,  -- Translation key
    localization_args       jsonb NULL,             -- Dynamic arguments
    
    priority                varchar(20) NOT NULL DEFAULT 'normal',
    related_entity_type     varchar(50) NULL,
    related_entity_id       uuid NULL,
    
    is_read                 boolean NOT NULL DEFAULT false,
    read_at                 timestamptz NULL,
    action_url              varchar(500) NULL,
    
    created_at              timestamptz NOT NULL DEFAULT NOW(),
    expires_at              timestamptz NULL
);

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_notification_type ON notifications(notification_type);
CREATE INDEX idx_notifications_localization_key ON notifications(localization_key);
```

### Changes Explained:
- ❌ **Removed**: `title` and `message` columns (replaced with localization)
- ✅ **Added**: `localization_key` - the translation key
- ✅ **Added**: `localization_args` - JSON object with dynamic values

---

## Localization Keys Structure

### Naming Convention:
```
notification.{category}.{event}.{variant}
```

### Examples:

```
notification.ticket.assigned
notification.ticket.sla_breach
notification.ticket.status_changed
notification.shift.reminder
notification.shift.starting_soon
notification.qa.evaluation_completed
notification.qa.coaching_scheduled
notification.customer.satisfaction_received
notification.system.maintenance_scheduled
```

---

## Resource Files Structure

### File: `resources/notifications.ar.json`
```json
{
  "notification.ticket.assigned": "تم تعيين تذكرة جديدة لك #{ticketNumber}",
  "notification.ticket.sla_breach": "تحذير: التذكرة #{ticketNumber} تجاوزت وقت الاستجابة المحدد",
  "notification.ticket.status_changed": "تم تغيير حالة التذكرة #{ticketNumber} من {oldStatus} إلى {newStatus}",
  "notification.ticket.high_priority": "تذكرة عاجلة: #{ticketNumber} - {subject}",
  "notification.shift.reminder": "تذكير: وردية العمل تبدأ في {startTime}",
  "notification.shift.starting_soon": "وردية العمل تبدأ خلال {minutes} دقيقة",
  "notification.qa.evaluation_completed": "تم تقييم أدائك من قبل {evaluatorName} - النتيجة: {score}%",
  "notification.qa.coaching_scheduled": "تم جدولة جلسة تدريبية معك في {sessionDate} مع {coachName}",
  "notification.customer.satisfaction_received": "تقييم جديد من العميل {customerName}: {score}/5",
  "notification.system.maintenance_scheduled": "صيانة مجدولة للنظام في {maintenanceTime}"
}
```

### File: `resources/notifications.en.json`
```json
{
  "notification.ticket.assigned": "New ticket assigned to you #{ticketNumber}",
  "notification.ticket.sla_breach": "Warning: Ticket #{ticketNumber} has breached SLA",
  "notification.ticket.status_changed": "Ticket #{ticketNumber} status changed from {oldStatus} to {newStatus}",
  "notification.ticket.high_priority": "Urgent ticket: #{ticketNumber} - {subject}",
  "notification.shift.reminder": "Reminder: Your shift starts at {startTime}",
  "notification.shift.starting_soon": "Your shift starts in {minutes} minutes",
  "notification.qa.evaluation_completed": "Performance evaluation completed by {evaluatorName} - Score: {score}%",
  "notification.qa.coaching_scheduled": "Coaching session scheduled on {sessionDate} with {coachName}",
  "notification.customer.satisfaction_received": "New customer feedback from {customerName}: {score}/5",
  "notification.system.maintenance_scheduled": "System maintenance scheduled at {maintenanceTime}"
}
```

---

## Database Examples

### Example 1: Ticket Assigned Notification

```sql
INSERT INTO notifications (
    id,
    recipient_id,
    notification_type,
    localization_key,
    localization_args,
    priority,
    related_entity_type,
    related_entity_id,
    action_url,
    created_at
) VALUES (
    gen_random_uuid(),
    'agent-uuid-here',
    'ticket_assigned',
    'notification.ticket.assigned',
    '{
        "ticketNumber": "TKT-2025-0001",
        "customerName": "أحمد محمد"
    }'::jsonb,
    'high',
    'ticket',
    'ticket-uuid-here',
    '/tickets/ticket-uuid-here',
    NOW()
);
```

**Result:**
- Arabic: "تم تعيين تذكرة جديدة لك #TKT-2025-0001"
- English: "New ticket assigned to you #TKT-2025-0001"

---

### Example 2: SLA Breach Warning

```sql
INSERT INTO notifications (
    id,
    recipient_id,
    notification_type,
    localization_key,
    localization_args,
    priority,
    related_entity_type,
    related_entity_id,
    action_url,
    created_at
) VALUES (
    gen_random_uuid(),
    'agent-uuid-here',
    'sla_breach',
    'notification.ticket.sla_breach',
    '{
        "ticketNumber": "TKT-2025-0002",
        "breachMinutes": 15,
        "deadline": "2025-01-20T14:30:00Z"
    }'::jsonb,
    'urgent',
    'ticket',
    'ticket-uuid-here',
    '/tickets/ticket-uuid-here',
    NOW()
);
```

**Result:**
- Arabic: "تحذير: التذكرة #TKT-2025-0002 تجاوزت وقت الاستجابة المحدد"
- English: "Warning: Ticket #TKT-2025-0002 has breached SLA"

---

### Example 3: QA Evaluation Completed

```sql
INSERT INTO notifications (
    id,
    recipient_id,
    notification_type,
    localization_key,
    localization_args,
    priority,
    related_entity_type,
    related_entity_id,
    action_url,
    created_at
) VALUES (
    gen_random_uuid(),
    'agent-uuid-here',
    'qa_evaluation_completed',
    'notification.qa.evaluation_completed',
    '{
        "evaluatorName": "سارة أحمد",
        "score": 92,
        "totalScore": 100,
        "evaluationDate": "2025-01-20"
    }'::jsonb,
    'normal',
    'qa_scorecard',
    'scorecard-uuid-here',
    '/qa/scorecards/scorecard-uuid-here',
    NOW()
);
```

**Result:**
- Arabic: "تم تقييم أدائك من قبل سارة أحمد - النتيجة: 92%"
- English: "Performance evaluation completed by Sara Ahmed - Score: 92%"

---

## Backend Implementation (.NET)

### 1. Notification Service Interface

```csharp
public interface INotificationService
{
    Task<Notification> CreateNotificationAsync(
        Guid recipientId,
        string notificationType,
        string localizationKey,
        object localizationArgs,
        NotificationPriority priority = NotificationPriority.Normal,
        string relatedEntityType = null,
        Guid? relatedEntityId = null,
        string actionUrl = null
    );
    
    Task<LocalizedNotification> GetLocalizedNotificationAsync(
        Notification notification,
        string languageCode
    );
    
    Task<List<LocalizedNotification>> GetUserNotificationsAsync(
        Guid userId,
        string languageCode,
        bool unreadOnly = false,
        int pageSize = 20
    );
}
```

---

### 2. Localization Service

```csharp
public interface ILocalizationService
{
    string Translate(string key, string languageCode, Dictionary<string, object> args = null);
}

public class LocalizationService : ILocalizationService
{
    private readonly Dictionary<string, Dictionary<string, string>> _translations;
    
    public LocalizationService()
    {
        // Load translations from JSON files or database
        _translations = LoadTranslations();
    }
    
    public string Translate(string key, string languageCode, Dictionary<string, object> args = null)
    {
        if (!_translations.ContainsKey(languageCode))
            languageCode = "en"; // Fallback to English
            
        if (!_translations[languageCode].ContainsKey(key))
            return key; // Return key if translation not found
            
        var template = _translations[languageCode][key];
        
        // Replace placeholders with actual values
        if (args != null)
        {
            foreach (var arg in args)
            {
                template = template.Replace($"{{{arg.Key}}}", arg.Value?.ToString() ?? "");
            }
        }
        
        return template;
    }
    
    private Dictionary<string, Dictionary<string, string>> LoadTranslations()
    {
        var translations = new Dictionary<string, Dictionary<string, string>>();
        
        // Load from JSON files
        var arTranslations = LoadJsonFile("resources/notifications.ar.json");
        var enTranslations = LoadJsonFile("resources/notifications.en.json");
        
        translations.Add("ar", arTranslations);
        translations.Add("en", enTranslations);
        
        return translations;
    }
}
```

---

### 3. Notification Service Implementation

```csharp
public class NotificationService : INotificationService
{
    private readonly IDbContext _dbContext;
    private readonly ILocalizationService _localizationService;
    
    public async Task<Notification> CreateNotificationAsync(
        Guid recipientId,
        string notificationType,
        string localizationKey,
        object localizationArgs,
        NotificationPriority priority = NotificationPriority.Normal,
        string relatedEntityType = null,
        Guid? relatedEntityId = null,
        string actionUrl = null)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            RecipientId = recipientId,
            NotificationType = notificationType,
            LocalizationKey = localizationKey,
            LocalizationArgs = JsonSerializer.Serialize(localizationArgs),
            Priority = priority.ToString().ToLower(),
            RelatedEntityType = relatedEntityType,
            RelatedEntityId = relatedEntityId,
            ActionUrl = actionUrl,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        
        _dbContext.Notifications.Add(notification);
        await _dbContext.SaveChangesAsync();
        
        return notification;
    }
    
    public async Task<LocalizedNotification> GetLocalizedNotificationAsync(
        Notification notification,
        string languageCode)
    {
        var args = string.IsNullOrEmpty(notification.LocalizationArgs)
            ? null
            : JsonSerializer.Deserialize<Dictionary<string, object>>(notification.LocalizationArgs);
            
        var localizedMessage = _localizationService.Translate(
            notification.LocalizationKey,
            languageCode,
            args
        );
        
        return new LocalizedNotification
        {
            Id = notification.Id,
            RecipientId = notification.RecipientId,
            NotificationType = notification.NotificationType,
            Message = localizedMessage,
            Priority = notification.Priority,
            RelatedEntityType = notification.RelatedEntityType,
            RelatedEntityId = notification.RelatedEntityId,
            IsRead = notification.IsRead,
            ReadAt = notification.ReadAt,
            ActionUrl = notification.ActionUrl,
            CreatedAt = notification.CreatedAt
        };
    }
    
    public async Task<List<LocalizedNotification>> GetUserNotificationsAsync(
        Guid userId,
        string languageCode,
        bool unreadOnly = false,
        int pageSize = 20)
    {
        var query = _dbContext.Notifications
            .Where(n => n.RecipientId == userId);
            
        if (unreadOnly)
            query = query.Where(n => !n.IsRead);
            
        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(pageSize)
            .ToListAsync();
            
        var localizedNotifications = notifications
            .Select(n => GetLocalizedNotificationAsync(n, languageCode).Result)
            .ToList();
            
        return localizedNotifications;
    }
}
```

---

### 4. Usage Examples

```csharp
// Example 1: Send ticket assigned notification
await _notificationService.CreateNotificationAsync(
    recipientId: agentId,
    notificationType: "ticket_assigned",
    localizationKey: "notification.ticket.assigned",
    localizationArgs: new {
        ticketNumber = "TKT-2025-0001",
        customerName = "أحمد محمد"
    },
    priority: NotificationPriority.High,
    relatedEntityType: "ticket",
    relatedEntityId: ticketId,
    actionUrl: $"/tickets/{ticketId}"
);

// Example 2: Send SLA breach warning
await _notificationService.CreateNotificationAsync(
    recipientId: agentId,
    notificationType: "sla_breach",
    localizationKey: "notification.ticket.sla_breach",
    localizationArgs: new {
        ticketNumber = ticket.TicketNumber,
        breachMinutes = 15
    },
    priority: NotificationPriority.Urgent,
    relatedEntityType: "ticket",
    relatedEntityId: ticketId,
    actionUrl: $"/tickets/{ticketId}"
);

// Example 3: Send shift reminder
await _notificationService.CreateNotificationAsync(
    recipientId: agentId,
    notificationType: "shift_reminder",
    localizationKey: "notification.shift.starting_soon",
    localizationArgs: new {
        minutes = 30,
        startTime = shift.ShiftStart.ToString("HH:mm")
    },
    priority: NotificationPriority.Normal,
    relatedEntityType: "shift",
    relatedEntityId: shiftId,
    actionUrl: $"/schedule"
);
```

---

### 5. API Controller Example

```csharp
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    
    [HttpGet]
    public async Task<ActionResult<List<LocalizedNotification>>> GetNotifications(
        [FromQuery] bool unreadOnly = false,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();
        var userLanguage = GetCurrentUserLanguage(); // Get from user preferences or Accept-Language header
        
        var notifications = await _notificationService.GetUserNotificationsAsync(
            userId,
            userLanguage,
            unreadOnly,
            pageSize
        );
        
        return Ok(notifications);
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<LocalizedNotification>> GetNotification(Guid id)
    {
        var notification = await _dbContext.Notifications.FindAsync(id);
        if (notification == null)
            return NotFound();
            
        var userLanguage = GetCurrentUserLanguage();
        var localizedNotification = await _notificationService
            .GetLocalizedNotificationAsync(notification, userLanguage);
            
        return Ok(localizedNotification);
    }
    
    [HttpPut("{id}/read")]
    public async Task<ActionResult> MarkAsRead(Guid id)
    {
        var notification = await _dbContext.Notifications.FindAsync(id);
        if (notification == null)
            return NotFound();
            
        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        
        await _dbContext.SaveChangesAsync();
        
        return NoContent();
    }
}
```

---

## Frontend Implementation (React)

### Example Component:

```typescript
interface LocalizedNotification {
    id: string;
    message: string;  // Already translated by backend
    priority: 'low' | 'normal' | 'high' | 'urgent';
    isRead: boolean;
    createdAt: string;
    actionUrl?: string;
}

const NotificationList: React.FC = () => {
    const [notifications, setNotifications] = useState<LocalizedNotification[]>([]);
    const { language } = useLanguage(); // ar or en
    
    useEffect(() => {
        fetchNotifications();
    }, [language]); // Re-fetch when language changes
    
    const fetchNotifications = async () => {
        // API automatically returns notifications in user's language
        const response = await api.get('/api/notifications');
        setNotifications(response.data);
    };
    
    return (
        <div className="notifications">
            {notifications.map(notification => (
                <NotificationItem 
                    key={notification.id}
                    notification={notification}
                />
            ))}
        </div>
    );
};
```

---

## Advanced Features

### 1. Rich Notifications with HTML

For more complex notifications, you can use HTML templates:

```json
{
  "notification.ticket.detailed": "<strong>{customerName}</strong> submitted ticket <a href='/tickets/{ticketId}'>#{ticketNumber}</a> - Priority: <span class='priority-{priority}'>{priority}</span>"
}
```

### 2. Pluralization Support

```json
{
  "notification.tickets.multiple.ar": "{count, plural, one{تذكرة واحدة} other{# تذاكر}} في انتظار المراجعة",
  "notification.tickets.multiple.en": "{count, plural, one{1 ticket} other{# tickets}} pending review"
}
```

### 3. Date/Time Formatting

```csharp
localizationArgs: new {
    startTime = shift.ShiftStart.ToString("dd/MM/yyyy HH:mm", new CultureInfo(languageCode))
}
```

### 4. Fallback Strategy

```csharp
public string Translate(string key, string languageCode, Dictionary<string, object> args = null)
{
    // Try requested language
    if (_translations.ContainsKey(languageCode) && 
        _translations[languageCode].ContainsKey(key))
    {
        return FormatTemplate(_translations[languageCode][key], args);
    }
    
    // Fallback to English
    if (_translations.ContainsKey("en") && 
        _translations["en"].ContainsKey(key))
    {
        return FormatTemplate(_translations["en"][key], args);
    }
    
    // Last resort: return key
    return key;
}
```

---

## Benefits Summary

| Aspect | Benefit |
|--------|---------|
| **Storage** | Only one record per notification (vs. one per language) |
| **Maintenance** | Update translations without touching database |
| **Performance** | Translations loaded once and cached |
| **Scalability** | Add new languages by adding JSON files |
| **Consistency** | Same translation used everywhere |
| **Testing** | Easy to test with mock translation data |
| **Versioning** | Translation files can be version controlled |

---

## Migration Strategy

If you already have notifications with hardcoded text:

```sql
-- Add new columns
ALTER TABLE notifications ADD COLUMN localization_key varchar(100);
ALTER TABLE notifications ADD COLUMN localization_args jsonb;

-- Update existing records (example for ticket assigned notifications)
UPDATE notifications 
SET 
    localization_key = 'notification.ticket.assigned',
    localization_args = jsonb_build_object(
        'ticketNumber', substring(message from 'TKT-[0-9]+-[0-9]+')
    )
WHERE notification_type = 'ticket_assigned';

-- After migration, drop old columns
ALTER TABLE notifications DROP COLUMN title;
ALTER TABLE notifications DROP COLUMN message;
```

---

## Recommended Translation Management Tools

1. **Manual**: JSON files in source control
2. **Automated**: 
   - **i18next** (for complex scenarios)
   - **ResX files** (.NET native)
   - **PO files** (gettext format)
   - **Translation Management Systems**: Lokalise, Crowdin, POEditor

---

## Conclusion

**✅ Recommended Approach**: Store `localization_key` + `localization_args` in database, translate on-the-fly.

This approach provides:
- Clean separation of data and presentation
- Easy translation management
- Excellent performance with caching
- Scalability for adding new languages
- Consistent user experience

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-20  
**For:** Call Center Platform - Multilingual Notifications
