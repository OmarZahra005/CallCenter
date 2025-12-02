using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.Workforce;

public class AgentShiftDto
{
    public Guid Id { get; set; }
    public Guid AgentId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public DateOnly ShiftDate { get; set; }
    public DateTime ShiftStart { get; set; }
    public DateTime ShiftEnd { get; set; }
    public int BreakMinutes { get; set; }
    public ShiftStatus Status { get; set; }
    public DateTime? ActualStart { get; set; }
    public DateTime? ActualEnd { get; set; }
}

public class CreateAgentShiftRequest
{
    public Guid AgentId { get; set; }
    public DateOnly ShiftDate { get; set; }
    public DateTime ShiftStart { get; set; }
    public DateTime ShiftEnd { get; set; }
    public int BreakMinutes { get; set; }
}

public class UpdateAgentShiftRequest
{
    public DateTime ShiftStart { get; set; }
    public DateTime ShiftEnd { get; set; }
    public int BreakMinutes { get; set; }
    public ShiftStatus Status { get; set; }
    public DateTime? ActualStart { get; set; }
    public DateTime? ActualEnd { get; set; }
}

public class TimeOffRequestDto
{
    public Guid Id { get; set; }
    public Guid AgentId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public TimeOffRequestType RequestType { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public TimeOffRequestStatus Status { get; set; }
    public string? Reason { get; set; }
    public Guid? ApprovedBy { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTimeOffRequest
{
    public Guid AgentId { get; set; }
    public TimeOffRequestType RequestType { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? Reason { get; set; }
}

public class ApproveTimeOffRequest
{
    public Guid ApprovedBy { get; set; }
}
