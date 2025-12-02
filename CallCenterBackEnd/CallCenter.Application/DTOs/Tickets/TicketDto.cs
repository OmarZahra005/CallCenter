using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.Tickets;

public class TicketDto
{
    public Guid Id { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public Guid? AgentId { get; set; }
    public string? AgentName { get; set; }
    public Guid? TeamId { get; set; }
    public string? TeamName { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public TicketStatus Status { get; set; }
    public TicketPriority Priority { get; set; }
    public TicketSource Source { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}

public class TicketDetailDto : TicketDto
{
    public string Description { get; set; } = string.Empty;
    public string? Subcategory { get; set; }
    public string? Resolution { get; set; }
    public List<TicketNoteDto> Notes { get; set; } = new();
    public List<TicketStatusHistoryDto> StatusHistory { get; set; } = new();
}

public class TicketNoteDto
{
    public Guid Id { get; set; }
    public Guid AgentId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsInternal { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class TicketStatusHistoryDto
{
    public Guid Id { get; set; }
    public TicketStatus? FromStatus { get; set; }
    public TicketStatus ToStatus { get; set; }
    public string? ChangedByName { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTicketRequest
{
    public Guid CustomerId { get; set; }
    public Guid? TeamId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Subcategory { get; set; }
    public TicketPriority Priority { get; set; } = TicketPriority.Normal;
    public TicketSource Source { get; set; } = TicketSource.Call;
}

public class UpdateTicketRequest
{
    public Guid? AgentId { get; set; }
    public Guid? TeamId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Subcategory { get; set; }
    public TicketStatus Status { get; set; }
    public TicketPriority Priority { get; set; }
}

public class AssignTicketRequest
{
    public Guid AgentId { get; set; }
}

public class AddTicketNoteRequest
{
    public Guid AgentId { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsInternal { get; set; }
}
