namespace CallCenter.Domain.Enums;

/// <summary>
/// Status of live agent handoff for a conversation (from SmartBot)
/// </summary>
public enum HandoffStatus
{
    /// <summary>
    /// Not a handoff conversation (normal conversation)
    /// </summary>
    None = 0,

    /// <summary>
    /// Customer requested agent, waiting for agent to accept
    /// </summary>
    WaitingForAgent = 1,

    /// <summary>
    /// Agent accepted, live chat is active
    /// </summary>
    Connected = 2,

    /// <summary>
    /// Handoff has ended (by agent, customer, or timeout)
    /// </summary>
    Ended = 3
}
