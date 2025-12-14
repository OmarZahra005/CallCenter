using CallCenter.Domain.Common.Entities;

namespace CallCenter.Domain.Entities;

/// <summary>
/// Represents a menu option (DTMF key press) within an IVR menu node
/// </summary>
public class IvrMenuOption : Entity
{
    public Guid NodeId { get; set; }

    /// <summary>
    /// The DTMF digit(s) for this option (e.g., "1", "2", "*", "#", "0")
    /// </summary>
    public string Digit { get; set; } = string.Empty;

    /// <summary>
    /// Display label for this option (used in flow builder)
    /// </summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>
    /// Optional description announced before this option
    /// (e.g., "For sales, press 1")
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// The node to navigate to when this option is selected
    /// </summary>
    public Guid TargetNodeId { get; set; }

    /// <summary>
    /// Display order for this option
    /// </summary>
    public int DisplayOrder { get; set; }

    // Navigation properties
    public virtual IvrNode Node { get; set; } = null!;
    public virtual IvrNode? TargetNode { get; set; }
}
