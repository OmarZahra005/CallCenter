namespace CallCenter.Domain.Common.Events;

/// <summary>
/// Base record class for domain events that should be processed asynchronously in the background.
/// Provides default implementations for background processing configuration.
/// </summary>
public abstract record BackgroundDomainEvent : DomainEvent, IBackgroundDomainEvent
{
    /// <summary>
    /// Default priority for background events. Override to customize priority.
    /// </summary>
    public virtual BackgroundEventPriority Priority => BackgroundEventPriority.Normal;
    
    /// <summary>
    /// Default maximum retry attempts. Override to customize retry behavior.
    /// </summary>
    public virtual int MaxRetryAttempts => 3;
    
    /// <summary>
    /// Default retry delay. Override to customize retry timing.
    /// </summary>
    public virtual TimeSpan RetryDelay => TimeSpan.FromSeconds(5);
    
    /// <summary>
    /// Default processing timeout. Override to customize timeout behavior.
    /// Returns null by default (no timeout).
    /// </summary>
    public virtual TimeSpan? ProcessingTimeout => null;
}