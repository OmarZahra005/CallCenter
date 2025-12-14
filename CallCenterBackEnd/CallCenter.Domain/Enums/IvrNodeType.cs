namespace CallCenter.Domain.Enums;

/// <summary>
/// Types of nodes available in IVR flows
/// </summary>
public enum IvrNodeType
{
    /// <summary>
    /// Menu with DTMF options
    /// </summary>
    Menu = 0,

    /// <summary>
    /// Play a message (TTS or audio file)
    /// </summary>
    PlayMessage = 1,

    /// <summary>
    /// Transfer call to a queue
    /// </summary>
    TransferToQueue = 2,

    /// <summary>
    /// Transfer call to a specific agent
    /// </summary>
    TransferToAgent = 3,

    /// <summary>
    /// Transfer call to an external phone number
    /// </summary>
    TransferToNumber = 4,

    /// <summary>
    /// Send to voicemail
    /// </summary>
    Voicemail = 5,

    /// <summary>
    /// Hang up the call
    /// </summary>
    Hangup = 6,

    /// <summary>
    /// Collect digits from caller
    /// </summary>
    CollectDigits = 7,

    /// <summary>
    /// Make an HTTP request (for integrations)
    /// </summary>
    HttpRequest = 8,

    /// <summary>
    /// Conditional branching based on variables
    /// </summary>
    Condition = 9,

    /// <summary>
    /// Request callback instead of waiting
    /// </summary>
    RequestCallback = 10,

    /// <summary>
    /// Set a variable value
    /// </summary>
    SetVariable = 11,

    /// <summary>
    /// Go to another flow
    /// </summary>
    SubFlow = 12
}
