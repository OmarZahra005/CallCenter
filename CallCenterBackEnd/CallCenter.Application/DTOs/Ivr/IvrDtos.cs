using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.Ivr;

// ==================== Flow DTOs ====================

public record IvrFlowDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsActive { get; init; }
    public bool IsDefault { get; init; }
    public string? PhoneNumbers { get; init; }
    public Guid? EntryNodeId { get; init; }
    public string DefaultLanguage { get; init; } = "en-US";
    public string DefaultVoice { get; init; } = "Polly.Joanna";
    public int MaxInvalidAttempts { get; init; }
    public int InputTimeout { get; init; }
    public string? BusinessHoursStart { get; init; }
    public string? BusinessHoursEnd { get; init; }
    public string? BusinessDays { get; init; }
    public Guid? AfterHoursNodeId { get; init; }
    public DateTimeOffset CreatedAtUtc { get; init; }
    public DateTimeOffset? UpdatedAtUtc { get; init; }
    public int NodeCount { get; init; }
}

public record IvrFlowDetailDto : IvrFlowDto
{
    public List<IvrNodeDto> Nodes { get; init; } = new();
}

public record CreateIvrFlowRequest
{
    public required string Name { get; init; }
    public string? Description { get; init; }
    public bool IsActive { get; init; } = true;
    public bool IsDefault { get; init; }
    public string? PhoneNumbers { get; init; }
    public string DefaultLanguage { get; init; } = "en-US";
    public string DefaultVoice { get; init; } = "Polly.Joanna";
    public int MaxInvalidAttempts { get; init; } = 3;
    public int InputTimeout { get; init; } = 5;
    public string? BusinessHoursStart { get; init; }
    public string? BusinessHoursEnd { get; init; }
    public string? BusinessDays { get; init; }
}

public record UpdateIvrFlowRequest
{
    public required string Name { get; init; }
    public string? Description { get; init; }
    public bool IsActive { get; init; }
    public bool IsDefault { get; init; }
    public string? PhoneNumbers { get; init; }
    public Guid? EntryNodeId { get; init; }
    public string DefaultLanguage { get; init; } = "en-US";
    public string DefaultVoice { get; init; } = "Polly.Joanna";
    public int MaxInvalidAttempts { get; init; } = 3;
    public int InputTimeout { get; init; } = 5;
    public string? BusinessHoursStart { get; init; }
    public string? BusinessHoursEnd { get; init; }
    public string? BusinessDays { get; init; }
    public Guid? AfterHoursNodeId { get; init; }
}

// ==================== Node DTOs ====================

public record IvrNodeDto
{
    public Guid Id { get; init; }
    public Guid FlowId { get; init; }
    public string Name { get; init; } = string.Empty;
    public IvrNodeType NodeType { get; init; }
    public int PositionX { get; init; }
    public int PositionY { get; init; }

    // Message configuration
    public string? MessageText { get; init; }
    public string? AudioUrl { get; init; }
    public string? Language { get; init; }
    public string? Voice { get; init; }

    // Menu configuration
    public int RepeatCount { get; init; }
    public string? InvalidInputMessage { get; init; }
    public string? TimeoutMessage { get; init; }
    public Guid? FallbackNodeId { get; init; }

    // Transfer configuration
    public Guid? TransferQueueId { get; init; }
    public Guid? TransferAgentId { get; init; }
    public string? TransferPhoneNumber { get; init; }
    public int TransferTimeout { get; init; }
    public bool EnableRecording { get; init; }

    // Collect digits configuration
    public int? NumDigits { get; init; }
    public string? FinishOnKey { get; init; }
    public string? DigitsVariableName { get; init; }

    // Condition configuration
    public string? ConditionVariable { get; init; }
    public string? ConditionOperator { get; init; }
    public string? ConditionValue { get; init; }
    public Guid? ConditionTrueNodeId { get; init; }
    public Guid? ConditionFalseNodeId { get; init; }

    // HTTP request configuration
    public string? HttpUrl { get; init; }
    public string? HttpMethod { get; init; }
    public Guid? NextNodeId { get; init; }

    // SetVariable configuration
    public string? VariableName { get; init; }
    public string? VariableValue { get; init; }

    // SubFlow configuration
    public Guid? SubFlowId { get; init; }

    // Voicemail configuration
    public int MaxRecordingLength { get; init; }
    public bool TranscribeVoicemail { get; init; }
    public string? VoicemailEmail { get; init; }

    // Menu options
    public List<IvrMenuOptionDto> MenuOptions { get; init; } = new();
}

public record CreateIvrNodeRequest
{
    public Guid FlowId { get; init; }
    public required string Name { get; init; }
    public IvrNodeType NodeType { get; init; }
    public int PositionX { get; init; }
    public int PositionY { get; init; }

    // Message configuration
    public string? MessageText { get; init; }
    public string? AudioUrl { get; init; }
    public string? Language { get; init; }
    public string? Voice { get; init; }

    // Menu configuration
    public int RepeatCount { get; init; } = 1;
    public string? InvalidInputMessage { get; init; }
    public string? TimeoutMessage { get; init; }
    public Guid? FallbackNodeId { get; init; }

    // Transfer configuration
    public Guid? TransferQueueId { get; init; }
    public Guid? TransferAgentId { get; init; }
    public string? TransferPhoneNumber { get; init; }
    public int TransferTimeout { get; init; } = 30;
    public bool EnableRecording { get; init; } = true;

    // Collect digits configuration
    public int? NumDigits { get; init; }
    public string? FinishOnKey { get; init; }
    public string? DigitsVariableName { get; init; }

    // Condition configuration
    public string? ConditionVariable { get; init; }
    public string? ConditionOperator { get; init; }
    public string? ConditionValue { get; init; }
    public Guid? ConditionTrueNodeId { get; init; }
    public Guid? ConditionFalseNodeId { get; init; }

    // HTTP request configuration
    public string? HttpUrl { get; init; }
    public string? HttpMethod { get; init; }
    public Guid? NextNodeId { get; init; }

    // SetVariable configuration
    public string? VariableName { get; init; }
    public string? VariableValue { get; init; }

    // SubFlow configuration
    public Guid? SubFlowId { get; init; }

    // Voicemail configuration
    public int MaxRecordingLength { get; init; } = 120;
    public bool TranscribeVoicemail { get; init; } = true;
    public string? VoicemailEmail { get; init; }
}

public record UpdateIvrNodeRequest : CreateIvrNodeRequest
{
}

// ==================== Menu Option DTOs ====================

public record IvrMenuOptionDto
{
    public Guid Id { get; init; }
    public Guid NodeId { get; init; }
    public string Digit { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid TargetNodeId { get; init; }
    public int DisplayOrder { get; init; }
}

public record CreateMenuOptionRequest
{
    public Guid NodeId { get; init; }
    public required string Digit { get; init; }
    public required string Label { get; init; }
    public string? Description { get; init; }
    public Guid TargetNodeId { get; init; }
    public int DisplayOrder { get; init; }
}

public record UpdateMenuOptionRequest
{
    public required string Digit { get; init; }
    public required string Label { get; init; }
    public string? Description { get; init; }
    public Guid TargetNodeId { get; init; }
    public int DisplayOrder { get; init; }
}

// ==================== Session DTOs ====================

public record IvrCallSessionDto
{
    public Guid Id { get; init; }
    public string CallSid { get; init; } = string.Empty;
    public Guid FlowId { get; init; }
    public string FlowName { get; init; } = string.Empty;
    public Guid CurrentNodeId { get; init; }
    public string CurrentNodeName { get; init; } = string.Empty;
    public string CallerNumber { get; init; } = string.Empty;
    public string CalledNumber { get; init; } = string.Empty;
    public Dictionary<string, string>? Variables { get; init; }
    public List<Guid>? NodePath { get; init; }
    public int InvalidAttempts { get; init; }
    public string? LastDigits { get; init; }
    public bool IsActive { get; init; }
    public string? Outcome { get; init; }
    public DateTimeOffset StartedAtUtc { get; init; }
    public DateTimeOffset? EndedAtUtc { get; init; }
}

// ==================== TwiML Generation DTOs ====================

public record IvrTwimlRequest
{
    public string CallSid { get; init; } = string.Empty;
    public string From { get; init; } = string.Empty;
    public string To { get; init; } = string.Empty;
    public string? Digits { get; init; }
    public Guid? FlowId { get; init; }
    public Guid? NodeId { get; init; }
}

public record IvrTwimlResponse
{
    public string Twiml { get; init; } = string.Empty;
    public Guid? SessionId { get; init; }
    public Guid? CurrentNodeId { get; init; }
    public string? Outcome { get; init; }
}

// ==================== Import/Export DTOs ====================

public record IvrFlowExportDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string DefaultLanguage { get; init; } = "en-US";
    public string DefaultVoice { get; init; } = "Polly.Joanna";
    public int MaxInvalidAttempts { get; init; }
    public int InputTimeout { get; init; }
    public string? BusinessHoursStart { get; init; }
    public string? BusinessHoursEnd { get; init; }
    public string? BusinessDays { get; init; }
    public List<IvrNodeExportDto> Nodes { get; init; } = new();
    public string? EntryNodeName { get; init; }
    public string? AfterHoursNodeName { get; init; }
}

public record IvrNodeExportDto
{
    public string Name { get; init; } = string.Empty;
    public IvrNodeType NodeType { get; init; }
    public int PositionX { get; init; }
    public int PositionY { get; init; }
    public string? MessageText { get; init; }
    public string? AudioUrl { get; init; }
    public string? Language { get; init; }
    public string? Voice { get; init; }
    public int RepeatCount { get; init; }
    public string? InvalidInputMessage { get; init; }
    public string? TimeoutMessage { get; init; }
    public string? FallbackNodeName { get; init; }
    public string? TransferPhoneNumber { get; init; }
    public int TransferTimeout { get; init; }
    public bool EnableRecording { get; init; }
    public int? NumDigits { get; init; }
    public string? FinishOnKey { get; init; }
    public string? DigitsVariableName { get; init; }
    public string? ConditionVariable { get; init; }
    public string? ConditionOperator { get; init; }
    public string? ConditionValue { get; init; }
    public string? ConditionTrueNodeName { get; init; }
    public string? ConditionFalseNodeName { get; init; }
    public string? HttpUrl { get; init; }
    public string? HttpMethod { get; init; }
    public string? NextNodeName { get; init; }
    public string? VariableName { get; init; }
    public string? VariableValue { get; init; }
    public string? SubFlowName { get; init; }
    public int MaxRecordingLength { get; init; }
    public bool TranscribeVoicemail { get; init; }
    public string? VoicemailEmail { get; init; }
    public List<IvrMenuOptionExportDto> MenuOptions { get; init; } = new();
}

public record IvrMenuOptionExportDto
{
    public string Digit { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string TargetNodeName { get; init; } = string.Empty;
    public int DisplayOrder { get; init; }
}
