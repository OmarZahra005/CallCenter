using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.Sla;

public class SlaRuleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; }
    public int FirstResponseTimeMinutes { get; set; }
    public int ResolveTimeMinutes { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSlaRuleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; }
    public int FirstResponseTimeMinutes { get; set; }
    public int ResolveTimeMinutes { get; set; }
}

public class UpdateSlaRuleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; }
    public int FirstResponseTimeMinutes { get; set; }
    public int ResolveTimeMinutes { get; set; }
    public bool IsActive { get; set; }
}

public class TicketSlaTrackingDto
{
    public Guid Id { get; set; }
    public Guid TicketId { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public Guid SlaRuleId { get; set; }
    public string SlaRuleName { get; set; } = string.Empty;
    public SlaTrackingStatus Status { get; set; }
    public DateTime? FirstResponseAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public bool FirstResponseBreached { get; set; }
    public bool ResolutionBreached { get; set; }
}
