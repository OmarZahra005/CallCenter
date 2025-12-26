namespace CallCenter.Domain.Enums;

/// <summary>
/// Status of an escalation from SmartBot
/// </summary>
public enum SmartBotEscalationStatus
{
    Pending = 0,
    Queued = 1,
    Assigned = 2,
    Active = 3,
    Resolved = 4,
    Closed = 5,
    Abandoned = 6,
    Transferred = 7
}

/// <summary>
/// Reason for escalation from SmartBot
/// </summary>
public enum SmartBotEscalationReason
{
    UserRequest = 0,
    FailedAttempts = 1,
    NoMatchFound = 2,
    LowConfidence = 3,
    RepeatedQuestion = 4,
    NegativeSentiment = 5,
    KeywordDetection = 6,
    TimeoutExceeded = 7
}

/// <summary>
/// Mode of handling the escalation
/// </summary>
public enum SmartBotEscalationMode
{
    LiveChat = 0,
    Callback = 1,
    EmailFollowUp = 2,
    ExternalChat = 3
}
