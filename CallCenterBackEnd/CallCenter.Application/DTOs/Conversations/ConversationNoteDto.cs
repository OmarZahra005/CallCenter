namespace CallCenter.Application.DTOs.Conversations;

public class ConversationNoteDto
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid AgentId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AddNoteRequest
{
    public string Content { get; set; } = string.Empty;
}
