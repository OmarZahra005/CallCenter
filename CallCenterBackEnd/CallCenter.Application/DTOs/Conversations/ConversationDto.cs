using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.Conversations;

public class ConversationDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public Guid? AgentId { get; set; }
    public string? AgentName { get; set; }
    public Guid? QueueId { get; set; }
    public string? QueueName { get; set; }
    public Channel Channel { get; set; }
    public ConversationState State { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int MessageCount { get; set; }
}

public class ConversationDetailDto : ConversationDto
{
    public List<ConversationMessageDto> Messages { get; set; } = new();
}

public class ConversationMessageDto
{
    public Guid Id { get; set; }
    public SenderType SenderType { get; set; }
    public Guid? SenderId { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}

public class CreateConversationRequest
{
    public Guid CustomerId { get; set; }
    public Guid? QueueId { get; set; }
    public Channel Channel { get; set; }
    public string? InitialMessage { get; set; }
}

public class SendMessageRequest
{
    public SenderType SenderType { get; set; }
    public Guid? SenderId { get; set; }
    public string Content { get; set; } = string.Empty;
}

public class TransferConversationRequest
{
    public Guid NewAgentId { get; set; }
    public string? Reason { get; set; }
}
