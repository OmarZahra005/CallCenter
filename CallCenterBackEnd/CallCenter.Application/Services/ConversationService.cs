using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Conversations;
using CallCenter.Application.Interfaces;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;

namespace CallCenter.Application.Services;

public interface IConversationService
{
    Task<PagedResponse<ConversationDto>> GetConversationsAsync(PagedRequest request, Guid? agentId = null, ConversationState? state = null);
    Task<ConversationDetailDto?> GetConversationByIdAsync(Guid id);
    Task<ConversationDto> CreateConversationAsync(CreateConversationRequest request);
    Task<ConversationDto?> CloseConversationAsync(Guid id);
    Task<ConversationDto?> TransferConversationAsync(Guid id, TransferConversationRequest request);
    Task<List<ConversationDto>> GetActiveConversationsAsync(Guid agentId);
    Task<List<ConversationDto>> GetByCustomerIdAsync(Guid customerId);
    Task<ConversationMessageDto?> SendMessageAsync(Guid conversationId, SendMessageRequest request);
    Task<bool> MarkAsReadAsync(Guid conversationId);
}

public class ConversationService : IConversationService
{
    private readonly IConversationRepository _conversationRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IWhatsAppService? _whatsAppService;

    public ConversationService(
        IConversationRepository conversationRepository,
        ICustomerRepository customerRepository,
        IWhatsAppService? whatsAppService = null)
    {
        _conversationRepository = conversationRepository;
        _customerRepository = customerRepository;
        _whatsAppService = whatsAppService;
    }

    public async Task<PagedResponse<ConversationDto>> GetConversationsAsync(PagedRequest request, Guid? agentId = null, ConversationState? state = null)
    {
        var conversations = await _conversationRepository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            null,
            request.SortBy,
            request.SortDescending);

        var items = conversations.Items.AsEnumerable();

        if (agentId.HasValue)
            items = items.Where(c => c.AgentId == agentId.Value);

        if (state.HasValue)
            items = items.Where(c => c.State == state.Value);

        return new PagedResponse<ConversationDto>
        {
            Items = items.Select(MapToDto).ToList(),
            PageNumber = conversations.CurrentPage,
            PageSize = conversations.PageSize,
            TotalCount = conversations.TotalCount,
            TotalPages = conversations.PageCount
        };
    }

    public async Task<ConversationDetailDto?> GetConversationByIdAsync(Guid id)
    {
        var conversation = await _conversationRepository.GetByIdAsync(id);
        if (conversation == null) return null;

        return new ConversationDetailDto
        {
            Id = conversation.Id,
            CustomerId = conversation.CustomerId,
            CustomerName = conversation.Customer?.Name ?? string.Empty,
            AgentId = conversation.AgentId,
            AgentName = conversation.Agent?.Name,
            QueueId = conversation.QueueId,
            QueueName = conversation.Queue?.Name,
            Channel = conversation.Channel,
            State = conversation.State,
            StartTime = conversation.StartTime,
            EndTime = conversation.EndTime,
            MessageCount = conversation.Messages?.Count ?? 0,
            Messages = conversation.Messages?.OrderBy(m => m.CreatedAt).Select(m => new ConversationMessageDto
            {
                Id = m.Id,
                SenderType = m.SenderType,
                SenderId = m.SenderId,
                Message = m.Message,
                CreatedAt = m.CreatedAt,
                IsRead = m.IsRead
            }).ToList() ?? new List<ConversationMessageDto>()
        };
    }

    public async Task<ConversationDto> CreateConversationAsync(CreateConversationRequest request)
    {
        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            CustomerId = request.CustomerId,
            QueueId = request.QueueId,
            Channel = request.Channel,
            State = ConversationState.Waiting,
            StartTime = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            Messages = new List<ConversationMessage>()
        };

        if (!string.IsNullOrEmpty(request.InitialMessage))
        {
            conversation.Messages.Add(new ConversationMessage
            {
                Id = Guid.NewGuid(),
                ConversationId = conversation.Id,
                SenderType = SenderType.Customer,
                SenderId = request.CustomerId,
                Message = request.InitialMessage,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _conversationRepository.AddAsync(conversation);
        await _conversationRepository.SaveChangesAsync();
        return MapToDto(conversation);
    }

    public async Task<ConversationDto?> CloseConversationAsync(Guid id)
    {
        var conversation = await _conversationRepository.GetByIdAsync(id);
        if (conversation == null) return null;

        conversation.State = ConversationState.Closed;
        conversation.EndTime = DateTime.UtcNow;

        _conversationRepository.Update(conversation);
        await _conversationRepository.SaveChangesAsync();
        return MapToDto(conversation);
    }

    public async Task<ConversationDto?> TransferConversationAsync(Guid id, TransferConversationRequest request)
    {
        var conversation = await _conversationRepository.GetByIdAsync(id);
        if (conversation == null) return null;

        conversation.AgentId = request.NewAgentId;
        conversation.State = ConversationState.Active;

        _conversationRepository.Update(conversation);
        await _conversationRepository.SaveChangesAsync();
        return MapToDto(conversation);
    }

    public async Task<List<ConversationDto>> GetActiveConversationsAsync(Guid agentId)
    {
        var conversations = await _conversationRepository.GetActiveByAgentIdAsync(agentId);
        return conversations.Select(MapToDto).ToList();
    }

    public async Task<List<ConversationDto>> GetByCustomerIdAsync(Guid customerId)
    {
        var conversations = await _conversationRepository.GetByCustomerIdAsync(customerId);
        return conversations.Select(MapToDto).ToList();
    }

    public async Task<ConversationMessageDto?> SendMessageAsync(Guid conversationId, SendMessageRequest request)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation == null) return null;

        var message = new ConversationMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            SenderType = request.SenderType,
            SenderId = request.SenderId,
            Message = request.Content,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        conversation.Messages ??= new List<ConversationMessage>();
        conversation.Messages.Add(message);

        // Update conversation state to active if it was waiting
        if (conversation.State == ConversationState.Waiting)
        {
            conversation.State = ConversationState.Active;
        }

        _conversationRepository.Update(conversation);
        await _conversationRepository.SaveChangesAsync();

        // Dispatch to WhatsApp if this is a WhatsApp conversation and sender is agent
        if (conversation.Channel == Channel.Whatsapp &&
            request.SenderType == SenderType.Agent &&
            _whatsAppService != null)
        {
            var customer = await _customerRepository.GetByIdAsync(conversation.CustomerId);
            if (customer?.Phone != null)
            {
                await _whatsAppService.SendTextMessageAsync(customer.Phone, request.Content);
            }
        }

        return new ConversationMessageDto
        {
            Id = message.Id,
            SenderType = message.SenderType,
            SenderId = message.SenderId,
            Message = message.Message,
            CreatedAt = message.CreatedAt,
            IsRead = message.IsRead
        };
    }

    public async Task<bool> MarkAsReadAsync(Guid conversationId)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation == null) return false;

        if (conversation.Messages != null)
        {
            foreach (var message in conversation.Messages.Where(m => !m.IsRead))
            {
                message.IsRead = true;
            }
        }

        _conversationRepository.Update(conversation);
        await _conversationRepository.SaveChangesAsync();
        return true;
    }

    private static ConversationDto MapToDto(Conversation conversation)
    {
        return new ConversationDto
        {
            Id = conversation.Id,
            CustomerId = conversation.CustomerId,
            CustomerName = conversation.Customer?.Name ?? string.Empty,
            AgentId = conversation.AgentId,
            AgentName = conversation.Agent?.Name,
            QueueId = conversation.QueueId,
            QueueName = conversation.Queue?.Name,
            Channel = conversation.Channel,
            State = conversation.State,
            StartTime = conversation.StartTime,
            EndTime = conversation.EndTime,
            MessageCount = conversation.Messages?.Count ?? 0
        };
    }
}
