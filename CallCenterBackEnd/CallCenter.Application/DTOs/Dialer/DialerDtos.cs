using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.Dialer;

#region Campaign DTOs

public class DialerCampaignDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DialingMode DialingMode { get; set; }
    public DialerCampaignStatus Status { get; set; }
    public DateTimeOffset? ScheduledStartUtc { get; set; }
    public DateTimeOffset? ScheduledEndUtc { get; set; }
    public DateTimeOffset? ActualStartUtc { get; set; }
    public DateTimeOffset? ActualEndUtc { get; set; }
    public TimeOnly CallWindowStart { get; set; }
    public TimeOnly CallWindowEnd { get; set; }
    public string TimeZone { get; set; } = "UTC";
    public string ActiveDays { get; set; } = "Mon,Tue,Wed,Thu,Fri";
    public int MaxLinesPerAgent { get; set; }
    public decimal TargetAbandonmentRate { get; set; }
    public int MaxAttempts { get; set; }
    public int RetryDelayMinutes { get; set; }
    public string? CallerId { get; set; }
    public Guid? TeamId { get; set; }
    public string? TeamName { get; set; }
    public Guid? QueueId { get; set; }
    public string? QueueName { get; set; }

    // Statistics
    public int TotalRecords { get; set; }
    public int PendingRecords { get; set; }
    public int CompletedRecords { get; set; }
    public int ConnectedCalls { get; set; }
    public int TotalAttempts { get; set; }
    public decimal ConnectRate => TotalAttempts > 0 ? (decimal)ConnectedCalls / TotalAttempts * 100 : 0;
    public decimal CompletionRate => TotalRecords > 0 ? (decimal)CompletedRecords / TotalRecords * 100 : 0;

    public DateTime CreatedAt { get; set; }
}

public class DialerCampaignDetailDto : DialerCampaignDto
{
    public int RingDurationSeconds { get; set; }
    public int AgentWrapUpSeconds { get; set; }
    public string? CallerIdName { get; set; }
    public List<DialerListDto> Lists { get; set; } = new();
    public List<DialerCampaignAgentDto> Agents { get; set; } = new();
}

public class CreateCampaignRequest
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public DialingMode DialingMode { get; set; } = DialingMode.Preview;
    public DateTimeOffset? ScheduledStartUtc { get; set; }
    public DateTimeOffset? ScheduledEndUtc { get; set; }
    public TimeOnly CallWindowStart { get; set; } = new TimeOnly(9, 0);
    public TimeOnly CallWindowEnd { get; set; } = new TimeOnly(21, 0);
    public string TimeZone { get; set; } = "UTC";
    public string ActiveDays { get; set; } = "Mon,Tue,Wed,Thu,Fri";
    public int MaxLinesPerAgent { get; set; } = 1;
    public decimal TargetAbandonmentRate { get; set; } = 3;
    public int MaxAttempts { get; set; } = 3;
    public int RetryDelayMinutes { get; set; } = 60;
    public int RingDurationSeconds { get; set; } = 30;
    public int AgentWrapUpSeconds { get; set; } = 60;
    public string? CallerId { get; set; }
    public string? CallerIdName { get; set; }
    public Guid? TeamId { get; set; }
    public Guid? QueueId { get; set; }
}

public class UpdateCampaignRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public DialingMode? DialingMode { get; set; }
    public DateTimeOffset? ScheduledStartUtc { get; set; }
    public DateTimeOffset? ScheduledEndUtc { get; set; }
    public TimeOnly? CallWindowStart { get; set; }
    public TimeOnly? CallWindowEnd { get; set; }
    public string? TimeZone { get; set; }
    public string? ActiveDays { get; set; }
    public int? MaxLinesPerAgent { get; set; }
    public decimal? TargetAbandonmentRate { get; set; }
    public int? MaxAttempts { get; set; }
    public int? RetryDelayMinutes { get; set; }
    public int? RingDurationSeconds { get; set; }
    public int? AgentWrapUpSeconds { get; set; }
    public string? CallerId { get; set; }
    public string? CallerIdName { get; set; }
    public Guid? TeamId { get; set; }
    public Guid? QueueId { get; set; }
}

#endregion

#region List DTOs

public class DialerListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DialerListStatus Status { get; set; }
    public Guid? CampaignId { get; set; }
    public string? CampaignName { get; set; }
    public string? SourceFileName { get; set; }
    public DateTimeOffset? ImportedAtUtc { get; set; }
    public string? ImportedByName { get; set; }
    public int TotalRecords { get; set; }
    public int ValidRecords { get; set; }
    public int InvalidRecords { get; set; }
    public int DuplicateRecords { get; set; }
    public int DncRecords { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateListRequest
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public Guid? CampaignId { get; set; }
}

public class ImportListRequest
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public Guid? CampaignId { get; set; }
    public required List<ImportRecordRequest> Records { get; set; }
}

public class ImportRecordRequest
{
    public required string PhoneNumber { get; set; }
    public string? PhoneNumber2 { get; set; }
    public string? PhoneNumber3 { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Company { get; set; }
    public Dictionary<string, string>? CustomFields { get; set; }
    public int Priority { get; set; } = 0;
    public string? TimeZone { get; set; }
}

public class ImportResultDto
{
    public Guid ListId { get; set; }
    public string ListName { get; set; } = string.Empty;
    public int TotalRecords { get; set; }
    public int ImportedRecords { get; set; }
    public int DuplicateRecords { get; set; }
    public int InvalidRecords { get; set; }
    public int DncRecords { get; set; }
    public List<string> Errors { get; set; } = new();
}

#endregion

#region Record DTOs

public class DialerRecordDto
{
    public Guid Id { get; set; }
    public Guid ListId { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? PhoneNumber2 { get; set; }
    public string? PhoneNumber3 { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string FullName => $"{FirstName} {LastName}".Trim();
    public string? Email { get; set; }
    public string? Company { get; set; }
    public DialerRecordStatus Status { get; set; }
    public int AttemptCount { get; set; }
    public DateTimeOffset? LastAttemptUtc { get; set; }
    public DateTimeOffset? NextAttemptUtc { get; set; }
    public string? LastDisposition { get; set; }
    public string? Notes { get; set; }
    public Guid? AssignedAgentId { get; set; }
    public string? AssignedAgentName { get; set; }
    public DateTimeOffset? CallbackScheduledUtc { get; set; }
    public int Priority { get; set; }
    public Guid? CustomerId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class DialerRecordDetailDto : DialerRecordDto
{
    public string? CustomFields { get; set; }
    public string? ContactTimeZone { get; set; }
    public List<DialerAttemptDto> Attempts { get; set; } = new();
}

public class UpdateRecordRequest
{
    public string? Notes { get; set; }
    public DialerRecordStatus? Status { get; set; }
    public DateTimeOffset? CallbackScheduledUtc { get; set; }
    public int? Priority { get; set; }
}

#endregion

#region Attempt DTOs

public class DialerAttemptDto
{
    public Guid Id { get; set; }
    public Guid RecordId { get; set; }
    public Guid CampaignId { get; set; }
    public string PhoneNumberDialed { get; set; } = string.Empty;
    public int AttemptNumber { get; set; }
    public DateTimeOffset StartedAtUtc { get; set; }
    public DateTimeOffset? ConnectedAtUtc { get; set; }
    public DateTimeOffset? EndedAtUtc { get; set; }
    public int? RingDurationSeconds { get; set; }
    public int? TalkDurationSeconds { get; set; }
    public int? WrapUpDurationSeconds { get; set; }
    public DialerRecordStatus Outcome { get; set; }
    public string? DispositionCode { get; set; }
    public string? DispositionNotes { get; set; }
    public Guid? AgentId { get; set; }
    public string? AgentName { get; set; }
    public string? ProviderCallId { get; set; }
    public string? RecordingUrl { get; set; }
    public bool? IsConversion { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CompleteAttemptRequest
{
    public DialerRecordStatus Outcome { get; set; }
    public string? DispositionCode { get; set; }
    public string? DispositionNotes { get; set; }
    public bool? IsConversion { get; set; }
    public DateTimeOffset? CallbackScheduledUtc { get; set; }
    public string? CallbackNotes { get; set; }
}

#endregion

#region Campaign Agent DTOs

public class DialerCampaignAgentDto
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public Guid AgentId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsOnCall { get; set; }
    public bool IsInWrapUp { get; set; }
    public DateTimeOffset? LoggedInAtUtc { get; set; }
    public Guid? CurrentRecordId { get; set; }
    public int TotalCallsHandled { get; set; }
    public int TotalConnectedCalls { get; set; }
    public int TotalTalkTimeSeconds { get; set; }
}

public class AssignAgentRequest
{
    public Guid AgentId { get; set; }
}

#endregion

#region DNC DTOs

public class DoNotCallEntryDto
{
    public Guid Id { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Source { get; set; }
    public string? Reason { get; set; }
    public DateTimeOffset AddedAtUtc { get; set; }
    public DateTimeOffset? ExpiresAtUtc { get; set; }
    public bool IsActive { get; set; }
    public string? AddedByName { get; set; }
    public string? CustomerName { get; set; }
}

public class AddDncRequest
{
    public required string PhoneNumber { get; set; }
    public string? Reason { get; set; }
    public DateTimeOffset? ExpiresAtUtc { get; set; }
}

public class ImportDncRequest
{
    public required List<string> PhoneNumbers { get; set; }
    public string Source { get; set; } = "Import";
    public string? Reason { get; set; }
}

public class DncCheckResult
{
    public string PhoneNumber { get; set; } = string.Empty;
    public bool IsOnDnc { get; set; }
    public string? Reason { get; set; }
    public DateTimeOffset? AddedAtUtc { get; set; }
}

#endregion

#region Dialer Session DTOs

public class DialerSessionDto
{
    public Guid CampaignId { get; set; }
    public string CampaignName { get; set; } = string.Empty;
    public DialingMode DialingMode { get; set; }
    public DialerCampaignStatus CampaignStatus { get; set; }
    public bool IsAgentActive { get; set; }
    public DialerRecordDto? CurrentRecord { get; set; }
    public DialerAttemptDto? CurrentAttempt { get; set; }
    public int PendingRecords { get; set; }
    public int AgentCallsToday { get; set; }
    public int AgentConnectsToday { get; set; }
}

public class NextRecordRequest
{
    public Guid CampaignId { get; set; }
}

public class DialRequest
{
    public Guid RecordId { get; set; }
    public string? PhoneNumberToUse { get; set; }  // If null, uses primary
}

public class DialResultDto
{
    public Guid AttemptId { get; set; }
    public Guid RecordId { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? ProviderCallId { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
}

public class SkipRecordRequest
{
    public Guid RecordId { get; set; }
    public string? Reason { get; set; }
}

#endregion

#region Statistics DTOs

public class CampaignStatsDto
{
    public Guid CampaignId { get; set; }
    public string CampaignName { get; set; } = string.Empty;
    public int TotalRecords { get; set; }
    public int PendingRecords { get; set; }
    public int CompletedRecords { get; set; }
    public int ConnectedCalls { get; set; }
    public int TotalAttempts { get; set; }
    public int NoAnswerCalls { get; set; }
    public int BusyCalls { get; set; }
    public int VoicemailCalls { get; set; }
    public int FailedCalls { get; set; }
    public int DncCalls { get; set; }
    public int Conversions { get; set; }
    public decimal ConnectRate { get; set; }
    public decimal ConversionRate { get; set; }
    public decimal AverageHandleTimeSeconds { get; set; }
    public int ActiveAgents { get; set; }
    public int TotalTalkTimeSeconds { get; set; }
}

public class AgentDialerStatsDto
{
    public Guid AgentId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public int TotalCalls { get; set; }
    public int ConnectedCalls { get; set; }
    public int Conversions { get; set; }
    public decimal ConnectRate { get; set; }
    public decimal ConversionRate { get; set; }
    public int TotalTalkTimeSeconds { get; set; }
    public int TotalWrapUpTimeSeconds { get; set; }
    public decimal AverageHandleTimeSeconds { get; set; }
}

#endregion
