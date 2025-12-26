namespace CallCenter.Domain.Enums;

/// <summary>
/// Status of a post-call customer survey
/// </summary>
public enum CallSurveyStatus
{
    /// <summary>
    /// Survey created but message not yet sent
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Message sent to customer, awaiting response
    /// </summary>
    Sent = 1,

    /// <summary>
    /// Customer submitted a rating
    /// </summary>
    Completed = 2,

    /// <summary>
    /// Survey link expired without response
    /// </summary>
    Expired = 3,

    /// <summary>
    /// Failed to send message to customer
    /// </summary>
    Failed = 4,

    /// <summary>
    /// Customer contact not available (no phone/email)
    /// </summary>
    NotEligible = 5
}
