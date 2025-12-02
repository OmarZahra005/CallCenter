using CallCenter.Domain.Common.Events;

namespace CallCenter.Domain.Common.Entities;

public interface IAuditableEntity
{
    DateTime CreatedAt { get; set; }
    Guid? CreatedBy { get; set; }
    DateTime? UpdatedAt { get; set; }
    Guid? UpdatedBy { get; set; }
}

public interface IDomainEventContainer
{
    IReadOnlyCollection<IDomainEvent> DomainEvents { get; }
    void ClearDomainEvents();
}

// Base class without Id - contains all common functionality
public abstract class BaseEntity : IAuditableEntity, IDomainEventContainer
{
    private readonly List<IDomainEvent> _domainEvents = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }

    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected void RaiseDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    public void MarkAsModified()
    {
        UpdatedAt = DateTime.UtcNow;
    }
}

// Generic entity with Id - inherits from BaseEntity
public abstract class Entity<TId> : BaseEntity
{
    public required virtual TId Id { get; set; }
}

// Convenience base class for Guid IDs
public abstract class Entity : Entity<Guid>
{
}

// Base class for entities with composite keys - inherits from BaseEntity
public abstract class CompositeEntity : BaseEntity
{
    // Abstract method for entities to define their composite key
    public abstract object[] GetKeys();

    // Override Equals to use composite key
    public override bool Equals(object? obj)
    {
        if (obj is not CompositeEntity other || GetType() != other.GetType())
            return false;

        var keys = GetKeys();
        var otherKeys = other.GetKeys();

        if (keys.Length != otherKeys.Length)
            return false;

        return keys.SequenceEqual(otherKeys);
    }

    // Override GetHashCode to use composite key
    public override int GetHashCode()
    {
        var keys = GetKeys();
        var hash = new HashCode();

        foreach (var key in keys)
        {
            hash.Add(key);
        }

        return hash.ToHashCode();
    }
}