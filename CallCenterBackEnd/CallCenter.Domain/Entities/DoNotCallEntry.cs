using CallCenter.Domain.Common.Entities;

namespace CallCenter.Domain.Entities;

/// <summary>
/// Do Not Call (DNC) list entry for compliance
/// </summary>
public class DoNotCallEntry : Entity
{
    public required string PhoneNumber { get; set; }

    // Normalized phone number for matching
    public required string NormalizedPhoneNumber { get; set; }

    // DNC type
    public DncType Type { get; set; } = DncType.CustomerRequest;

    // Source of DNC entry
    public string? Source { get; set; }               // "Customer Request", "Regulatory", "Import", etc.
    public string? Reason { get; set; }

    // Validity
    public DateTimeOffset AddedAtUtc { get; set; }
    public DateTimeOffset? ExpiresAtUtc { get; set; }  // Null = never expires
    public bool IsActive { get; set; } = true;

    // Who added this entry
    public Guid? AddedByAgentId { get; set; }

    // Customer reference (if known)
    public Guid? CustomerId { get; set; }

    // Navigation properties
    public virtual Agent? AddedByAgent { get; set; }
    public virtual Customer? Customer { get; set; }
}

public enum DncType
{
    CustomerRequest,     // Customer asked not to be called
    Regulatory,          // Required by regulation (e.g., national DNC list)
    Internal,            // Internal company policy
    Temporary,           // Temporary block (e.g., recent complaint)
    LegalAction          // Legal proceedings - do not contact
}
