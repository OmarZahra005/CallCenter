using CallCenter.Domain.Common.Entities;
using CallCenter.Domain.Enums;

namespace CallCenter.Domain.Entities;

/// <summary>
/// Represents a node in an IVR flow (menu, action, message, etc.)
/// </summary>
public class IvrNode : Entity
{
    public Guid FlowId { get; set; }

    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Type of node: Menu, PlayMessage, TransferToQueue, TransferToAgent,
    /// TransferToNumber, Voicemail, Hangup, CollectDigits, HttpRequest, Condition
    /// </summary>
    public IvrNodeType NodeType { get; set; }

    /// <summary>
    /// Position X coordinate for visual flow builder
    /// </summary>
    public int PositionX { get; set; }

    /// <summary>
    /// Position Y coordinate for visual flow builder
    /// </summary>
    public int PositionY { get; set; }

    // ==================== Message/Prompt Configuration ====================

    /// <summary>
    /// The message to play (TTS text)
    /// </summary>
    public string? MessageText { get; set; }

    /// <summary>
    /// URL of audio file to play instead of TTS
    /// </summary>
    public string? AudioUrl { get; set; }

    /// <summary>
    /// Language override for this node (e.g., "ar-SA")
    /// </summary>
    public string? Language { get; set; }

    /// <summary>
    /// Voice override for this node (e.g., "Polly.Zeina")
    /// </summary>
    public string? Voice { get; set; }

    // ==================== Menu Configuration ====================

    /// <summary>
    /// Number of times to repeat menu prompt
    /// </summary>
    public int RepeatCount { get; set; } = 1;

    /// <summary>
    /// Invalid input message
    /// </summary>
    public string? InvalidInputMessage { get; set; }

    /// <summary>
    /// Timeout message (when no input received)
    /// </summary>
    public string? TimeoutMessage { get; set; }

    /// <summary>
    /// Node to go to on max invalid attempts
    /// </summary>
    public Guid? FallbackNodeId { get; set; }

    // ==================== Transfer Configuration ====================

    /// <summary>
    /// Queue ID to transfer to (for TransferToQueue)
    /// </summary>
    public Guid? TransferQueueId { get; set; }

    /// <summary>
    /// Agent ID to transfer to (for TransferToAgent)
    /// </summary>
    public Guid? TransferAgentId { get; set; }

    /// <summary>
    /// External phone number to transfer to (for TransferToNumber)
    /// </summary>
    public string? TransferPhoneNumber { get; set; }

    /// <summary>
    /// Ring timeout in seconds for transfers
    /// </summary>
    public int TransferTimeout { get; set; } = 30;

    /// <summary>
    /// Whether to enable call recording for this transfer
    /// </summary>
    public bool EnableRecording { get; set; } = true;

    // ==================== Collect Digits Configuration ====================

    /// <summary>
    /// Number of digits to collect
    /// </summary>
    public int? NumDigits { get; set; }

    /// <summary>
    /// Finish key (e.g., "#")
    /// </summary>
    public string? FinishOnKey { get; set; }

    /// <summary>
    /// Variable name to store collected digits
    /// </summary>
    public string? DigitsVariableName { get; set; }

    // ==================== Condition Configuration ====================

    /// <summary>
    /// Variable to check for condition nodes
    /// </summary>
    public string? ConditionVariable { get; set; }

    /// <summary>
    /// Operator for condition (equals, contains, startsWith, greaterThan, lessThan)
    /// </summary>
    public string? ConditionOperator { get; set; }

    /// <summary>
    /// Value to compare against for condition
    /// </summary>
    public string? ConditionValue { get; set; }

    /// <summary>
    /// Node to go to if condition is true
    /// </summary>
    public Guid? ConditionTrueNodeId { get; set; }

    /// <summary>
    /// Node to go to if condition is false
    /// </summary>
    public Guid? ConditionFalseNodeId { get; set; }

    // ==================== HTTP Request Configuration ====================

    /// <summary>
    /// URL for HTTP request node
    /// </summary>
    public string? HttpUrl { get; set; }

    /// <summary>
    /// HTTP method (GET, POST)
    /// </summary>
    public string? HttpMethod { get; set; }

    /// <summary>
    /// Next node after HTTP request completes
    /// </summary>
    public Guid? NextNodeId { get; set; }

    // ==================== Voicemail Configuration ====================

    /// <summary>
    /// Maximum recording length in seconds for voicemail
    /// </summary>
    public int MaxRecordingLength { get; set; } = 120;

    /// <summary>
    /// Transcribe voicemail flag
    /// </summary>
    public bool TranscribeVoicemail { get; set; } = true;

    /// <summary>
    /// Email address to send voicemail notification
    /// </summary>
    public string? VoicemailEmail { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAtUtc { get; set; }

    // Navigation properties
    public virtual IvrFlow Flow { get; set; } = null!;
    public virtual ICollection<IvrMenuOption> MenuOptions { get; set; } = new List<IvrMenuOption>();
}
