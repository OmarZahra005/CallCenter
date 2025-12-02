namespace CallCenter.Domain.Common.Events;

/// <summary>
/// Defines the priority levels for background domain event processing.
/// Higher priority events are processed first.
/// </summary>
public enum BackgroundEventPriority
{
    /// <summary>
    /// Low priority events (e.g., analytics, non-critical logging)
    /// </summary>
    Low = 1,
    
    /// <summary>
    /// Normal priority events (e.g., standard audit logging, notifications)
    /// </summary>
    Normal = 2,
    
    /// <summary>
    /// High priority events (e.g., security alerts, critical notifications)
    /// </summary>
    High = 3
}