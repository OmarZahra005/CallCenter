using CallCenter.Domain.Common.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class DialerList : Entity
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public DialerListStatus Status { get; set; } = DialerListStatus.Active;

    // Campaign association
    public Guid? CampaignId { get; set; }

    // Import tracking
    public string? SourceFileName { get; set; }
    public DateTimeOffset? ImportedAtUtc { get; set; }
    public Guid? ImportedBy { get; set; }

    // Statistics
    public int TotalRecords { get; set; }
    public int ValidRecords { get; set; }
    public int InvalidRecords { get; set; }
    public int DuplicateRecords { get; set; }
    public int DncRecords { get; set; }

    // Navigation properties
    public virtual DialerCampaign? Campaign { get; set; }
    public virtual Agent? ImportedByAgent { get; set; }
    public virtual ICollection<DialerRecord> Records { get; set; } = new List<DialerRecord>();
}
