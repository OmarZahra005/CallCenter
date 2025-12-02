using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

public class TimeOffRequest
{
    public Guid Id { get; set; }
    public Guid AgentId { get; set; }
    public TimeOffRequestType RequestType { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public TimeOffRequestStatus Status { get; set; } = TimeOffRequestStatus.Pending;
    public string? Reason { get; set; }
    public Guid? ApprovedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Agent Agent { get; set; } = null!;
    public virtual Agent? ApprovedByAgent { get; set; }
}
