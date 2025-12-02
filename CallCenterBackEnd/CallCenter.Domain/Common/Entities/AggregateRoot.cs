namespace CallCenter.Domain.Common.Entities;

public abstract class AggregateRoot<TId> : Entity<TId>
{
    // Aggregate roots are the only entities that can raise domain events
    // This ensures consistency and proper event ordering
}

// Convenience base class for Guid IDs
public abstract class AggregateRoot : AggregateRoot<Guid>
{
}