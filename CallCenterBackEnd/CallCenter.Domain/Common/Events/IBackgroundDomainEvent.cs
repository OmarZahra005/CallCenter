namespace CallCenter.Domain.Common.Events;

/// <summary>
/// Marker interface for domain events that should be processed asynchronously in the background.
/// Events implementing this interface will be queued and processed by background services,
/// allowing for non-blocking user responses and improved system performance.
/// </summary>
public interface IBackgroundDomainEvent : IDomainEvent
{
    /// <summary>
    /// The priority level for background processing.
    /// Higher priority events are processed before lower priority ones.
    /// </summary>
    BackgroundEventPriority Priority { get; }
    
    /// <summary>
    /// Maximum number of retry attempts if event processing fails.
    /// After exhausting retries, events are moved to a dead letter queue.
    /// </summary>
    int MaxRetryAttempts { get; }
    
    /// <summary>
    /// Delay between retry attempts when event processing fails.
    /// Can be used to implement exponential backoff strategies.
    /// </summary>
    TimeSpan RetryDelay { get; }
    
    /// <summary>
    /// Optional timeout for event processing.
    /// If processing takes longer than this duration, it will be cancelled.
    /// </summary>
    TimeSpan? ProcessingTimeout { get; }
}