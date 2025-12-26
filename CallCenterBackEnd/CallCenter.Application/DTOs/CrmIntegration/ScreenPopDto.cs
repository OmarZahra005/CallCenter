namespace CallCenter.Application.DTOs.CrmIntegration;

/// <summary>
/// Screen pop data returned by CRM when an incoming call is received.
/// Contains customer context to display to the agent.
/// </summary>
public record ScreenPopDto
{
    /// <summary>
    /// CRM Account ID if caller is matched to a company
    /// </summary>
    public Guid? AccountId { get; init; }

    /// <summary>
    /// Company/Account name
    /// </summary>
    public string? AccountName { get; init; }

    /// <summary>
    /// CRM Contact ID if caller is matched to a contact
    /// </summary>
    public Guid? ContactId { get; init; }

    /// <summary>
    /// Contact full name
    /// </summary>
    public string? ContactName { get; init; }

    /// <summary>
    /// True if caller was not found in CRM (new caller)
    /// </summary>
    public bool IsNewCaller { get; init; }

    /// <summary>
    /// List of open tickets for this customer
    /// </summary>
    public IReadOnlyList<TicketSummaryDto> OpenTickets { get; init; } = [];

    /// <summary>
    /// Recent call history for this customer
    /// </summary>
    public IReadOnlyList<CallLogSummaryDto> RecentCalls { get; init; } = [];

    /// <summary>
    /// AI-generated summary of last interaction
    /// </summary>
    public string? LastInteractionSummary { get; init; }
}

/// <summary>
/// Summary of an open ticket
/// </summary>
public record TicketSummaryDto
{
    public Guid Id { get; init; }
    public string TicketNumber { get; init; } = null!;
    public string Subject { get; init; } = null!;
    public string Status { get; init; } = null!;
    public string Priority { get; init; } = null!;
    public DateTime CreatedAt { get; init; }
}

/// <summary>
/// Summary of a recent call
/// </summary>
public record CallLogSummaryDto
{
    public Guid Id { get; init; }
    public string Direction { get; init; } = null!;
    public DateTime StartTime { get; init; }
    public int? DurationSeconds { get; init; }
    public string? AiSummary { get; init; }
}
