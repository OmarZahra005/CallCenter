using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Conversations;
using CallCenter.Application.Interfaces;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;
using CallCenter.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

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

    // Voice call conversation methods
    Task<Conversation> CreateVoiceConversationAsync(string phoneNumber, Guid? agentId = null);
    Task<ConversationDto?> GetConversationDtoByIdAsync(Guid id);
    Task<ConversationDto?> AssignAgentToConversationAsync(Guid conversationId, Guid agentId);
    Task<ConversationDto?> CloseVoiceConversationAsync(Guid conversationId, int? durationSeconds = null);
    Task<ConversationDto?> AbandonConversationAsync(Guid conversationId);

    // ACW (After Call Work) methods
    Task<ConversationDto?> SaveAcwDataAsync(Guid conversationId, SaveAcwRequest request);

    // Notes methods
    Task<List<ConversationNoteDto>> GetNotesAsync(Guid conversationId);
    Task<ConversationNoteDto?> AddNoteAsync(Guid conversationId, Guid agentId, string content);
}

public class ConversationService : IConversationService
{
    private readonly IConversationRepository _conversationRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IConversationNoteRepository _conversationNoteRepository;
    private readonly IAgentRepository _agentRepository;
    private readonly IWhatsAppService? _whatsAppService;
    private readonly ISmartBotWebhookService _smartBotWebhookService;
    private readonly IRepository<SmartBotEscalation> _smartBotEscalationRepository;
    private readonly ILogger<ConversationService> _logger;

    public ConversationService(
        IConversationRepository conversationRepository,
        ICustomerRepository customerRepository,
        IConversationNoteRepository conversationNoteRepository,
        IAgentRepository agentRepository,
        ILogger<ConversationService> logger,
        ISmartBotWebhookService smartBotWebhookService,
        IRepository<SmartBotEscalation> smartBotEscalationRepository,
        IWhatsAppService? whatsAppService = null)
    {
        _conversationRepository = conversationRepository;
        _customerRepository = customerRepository;
        _conversationNoteRepository = conversationNoteRepository;
        _agentRepository = agentRepository;
        _logger = logger;
        _smartBotWebhookService = smartBotWebhookService;
        _smartBotEscalationRepository = smartBotEscalationRepository;
        _whatsAppService = whatsAppService;
    }

    public async Task<PagedResponse<ConversationDto>> GetConversationsAsync(PagedRequest request, Guid? agentId = null, ConversationState? state = null)
    {
        // If filtering by agentId, use repository method to get all agent conversations
        // then apply state filter and manual pagination
        if (agentId.HasValue)
        {
            var agentConversations = await _conversationRepository.GetByAgentIdAsync(agentId.Value);
            var filteredItems = agentConversations.AsEnumerable();

            if (state.HasValue)
                filteredItems = filteredItems.Where(c => c.State == state.Value);

            // Sort by StartTime descending (most recent first)
            filteredItems = request.SortDescending
                ? filteredItems.OrderByDescending(c => c.StartTime)
                : filteredItems.OrderBy(c => c.StartTime);

            var totalCount = filteredItems.Count();
            var pagedItems = filteredItems
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            return new PagedResponse<ConversationDto>
            {
                Items = pagedItems.Select(MapToDto).ToList(),
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
            };
        }

        // No agentId filter - use standard pagination
        var conversations = await _conversationRepository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            null,
            request.SortBy,
            request.SortDescending);

        var items = conversations.Items.AsEnumerable();

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
            PhoneNumber = conversation.Customer?.Phone,
            AgentId = conversation.AgentId,
            AgentName = conversation.Agent?.Name,
            QueueId = conversation.QueueId,
            QueueName = conversation.Queue?.Name,
            Channel = conversation.Channel,
            State = conversation.State,
            StartTime = conversation.StartTime,
            EndTime = conversation.EndTime,
            DurationSeconds = conversation.DurationSeconds,
            MessageCount = conversation.Messages?.Count ?? 0,
            // SmartBot Handoff fields
            HandoffStatus = conversation.HandoffStatus,
            SmartBotSessionId = conversation.SmartBotSessionId,
            HandoffRequestedAt = conversation.HandoffRequestedAt,
            HandoffAcceptedAt = conversation.HandoffAcceptedAt,
            HandoffEndedAt = conversation.HandoffEndedAt,
            HandoffEndedBy = conversation.HandoffEndedBy,
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

        // Handle SmartBot handoff closure
        if (conversation.HandoffStatus == HandoffStatus.Connected ||
            conversation.HandoffStatus == HandoffStatus.WaitingForAgent)
        {
            conversation.HandoffStatus = HandoffStatus.Ended;
            conversation.HandoffEndedAt = DateTime.UtcNow;
            conversation.HandoffEndedBy = "Agent";

            // Find the escalation and notify SmartBot
            if (!string.IsNullOrEmpty(conversation.SmartBotSessionId))
            {
                try
                {
                    var escalations = await _smartBotEscalationRepository.GetAllAsync();
                    var escalation = escalations.FirstOrDefault(e => e.ConversationId == id);

                    if (escalation != null)
                    {
                        // Update escalation status
                        escalation.Status = SmartBotEscalationStatus.Closed;
                        escalation.ResolvedAt = DateTime.UtcNow;
                        escalation.Resolution = "Closed by agent";
                        _smartBotEscalationRepository.Update(escalation);

                        // Notify SmartBot via webhook
                        _ = _smartBotWebhookService.NotifyResolvedAsync(
                            escalation.SmartBotConversationId,
                            escalation.Id.ToString(),
                            "Closed by agent",
                            null,
                            conversation.AgentId?.ToString(),
                            conversation.Agent?.Name);

                        _logger.LogInformation(
                            "SmartBot handoff closed for conversation {ConversationId}, escalation {EscalationId}",
                            id, escalation.Id);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Failed to notify SmartBot about conversation closure for {ConversationId}",
                        id);
                }
            }
        }

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
        // Check if conversation exists without tracking to avoid concurrency issues
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

        // Add message directly to repository instead of through navigation property
        await _conversationRepository.AddMessageAsync(conversationId, message);

        // Update conversation state if needed (separate operation)
        if (conversation.State == ConversationState.Waiting)
        {
            await _conversationRepository.UpdateStateAsync(conversationId, ConversationState.Active);
        }

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

        // Debug logging for SmartBot webhook dispatch
        _logger.LogInformation(
            "SmartBot webhook check: Channel={Channel}, SenderType={SenderType}",
            conversation.Channel, request.SenderType);

        // Dispatch to SmartBot if this is a SmartBot conversation and sender is agent
        if (conversation.Channel == Channel.SmartBot &&
            request.SenderType == SenderType.Agent)
        {
            try
            {
                // Find the escalation record for this conversation
                var escalations = await _smartBotEscalationRepository.GetAllAsync();
                var escalation = escalations.FirstOrDefault(e => e.ConversationId == conversationId);

                if (escalation != null)
                {
                    // Get agent info
                    var agent = request.SenderId.HasValue
                        ? await _agentRepository.GetByIdAsync(request.SenderId.Value)
                        : null;

                    // If agent not yet assigned to escalation, assign now (first message)
                    if (escalation.AssignedAgentId == null && request.SenderId.HasValue)
                    {
                        _logger.LogInformation(
                            "Assigning agent {AgentId} to SmartBot escalation {EscalationId}",
                            request.SenderId, escalation.Id);

                        // Update escalation with agent assignment
                        escalation.AssignedAgentId = request.SenderId.Value;
                        escalation.AssignedAgentName = agent?.Name ?? "Agent";
                        escalation.AgentAssignedAt = DateTime.UtcNow;
                        escalation.Status = SmartBotEscalationStatus.Assigned;

                        // Also update the conversation with agent assignment
                        conversation.AgentId = request.SenderId.Value;
                        await _conversationRepository.SaveChangesAsync();

                        // Send agent-assigned webhook to SmartBot
                        await _smartBotWebhookService.NotifyAgentAssignedAsync(
                            escalation.SmartBotConversationId,
                            escalation.Id.ToString(),
                            escalation.TicketId.ToString(),
                            request.SenderId.Value.ToString(),
                            agent?.Name ?? "Agent",
                            agent?.Email);

                        _logger.LogInformation(
                            "Agent {AgentName} assigned to SmartBot escalation {EscalationId}",
                            agent?.Name ?? "Agent", escalation.Id);
                    }

                    // Send message to SmartBot webhook
                    var webhookResult = await _smartBotWebhookService.SendAgentMessageAsync(
                        escalation.SmartBotConversationId,
                        escalation.Id.ToString(),
                        request.Content,
                        request.SenderId?.ToString() ?? string.Empty,
                        agent?.Name ?? "Agent");

                    _logger.LogInformation(
                        "Sent agent message to SmartBot webhook for conversation {ConversationId}. Success: {Success}",
                        conversationId, webhookResult);
                }
                else
                {
                    _logger.LogWarning(
                        "No escalation found for SmartBot conversation {ConversationId}",
                        conversationId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to send message to SmartBot webhook for conversation {ConversationId}",
                    conversationId);
                // Don't fail the entire operation if webhook fails
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

    /// <summary>
    /// Creates a voice conversation for an incoming call.
    /// Auto-creates customer if not found by phone number.
    /// </summary>
    public async Task<Conversation> CreateVoiceConversationAsync(string phoneNumber, Guid? agentId = null)
    {
        // Normalize phone number (Saudi Arabia format: +966 → 0)
        var normalizedPhone = NormalizePhoneNumber(phoneNumber);

        // Find or create customer by phone number
        var customer = await _customerRepository.GetByPhoneAsync(normalizedPhone);

        if (customer == null)
        {
            // Auto-create customer with phone number as name
            customer = new Customer
            {
                Id = Guid.NewGuid(),
                Name = phoneNumber, // Use original phone as display name
                Phone = normalizedPhone,
                Status = CustomerStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _customerRepository.AddAsync(customer);
            await _customerRepository.SaveChangesAsync();
        }

        // Create conversation for voice channel
        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            CustomerId = customer.Id,
            AgentId = agentId,
            Channel = Channel.Voice,
            State = agentId.HasValue ? ConversationState.Active : ConversationState.Waiting,
            StartTime = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            Messages = new List<ConversationMessage>()
        };

        // Set navigation property for DTO mapping
        conversation.Customer = customer;

        await _conversationRepository.AddAsync(conversation);
        await _conversationRepository.SaveChangesAsync();

        return conversation;
    }

    /// <summary>
    /// Gets a conversation DTO by ID with navigation properties loaded.
    /// </summary>
    public async Task<ConversationDto?> GetConversationDtoByIdAsync(Guid id)
    {
        var conversation = await _conversationRepository.GetByIdAsync(id);
        if (conversation == null) return null;
        return MapToDto(conversation);
    }

    /// <summary>
    /// Assigns an agent to a conversation and sets state to Active.
    /// </summary>
    public async Task<ConversationDto?> AssignAgentToConversationAsync(Guid conversationId, Guid agentId)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation == null) return null;

        conversation.AgentId = agentId;
        conversation.State = ConversationState.Active;

        _conversationRepository.Update(conversation);
        await _conversationRepository.SaveChangesAsync();

        return MapToDto(conversation);
    }

    /// <summary>
    /// Closes a voice conversation when call ends normally.
    /// </summary>
    public async Task<ConversationDto?> CloseVoiceConversationAsync(Guid conversationId, int? durationSeconds = null)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation == null) return null;

        conversation.State = ConversationState.Closed;
        conversation.EndTime = DateTime.UtcNow;
        if (durationSeconds.HasValue)
        {
            conversation.DurationSeconds = durationSeconds;
        }

        _conversationRepository.Update(conversation);
        await _conversationRepository.SaveChangesAsync();

        return MapToDto(conversation);
    }

    /// <summary>
    /// Marks a conversation as abandoned (call failed, no answer, etc.).
    /// </summary>
    public async Task<ConversationDto?> AbandonConversationAsync(Guid conversationId)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation == null) return null;

        conversation.State = ConversationState.Abandoned;
        conversation.EndTime = DateTime.UtcNow;

        _conversationRepository.Update(conversation);
        await _conversationRepository.SaveChangesAsync();

        return MapToDto(conversation);
    }

    /// <summary>
    /// Normalizes phone number to local Saudi Arabia format.
    /// </summary>
    private static string NormalizePhoneNumber(string phone)
    {
        if (string.IsNullOrEmpty(phone)) return phone;

        // Remove spaces, dashes, parentheses
        var normalized = phone.Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "");

        // Convert +966XXXXXXXXX to 0XXXXXXXXX
        if (normalized.StartsWith("+966"))
        {
            normalized = "0" + normalized.Substring(4);
        }
        // Convert 966XXXXXXXXX to 0XXXXXXXXX
        else if (normalized.StartsWith("966") && normalized.Length >= 12)
        {
            normalized = "0" + normalized.Substring(3);
        }

        return normalized;
    }

    /// <summary>
    /// Saves ACW (After Call Work) data to a conversation.
    /// </summary>
    public async Task<ConversationDto?> SaveAcwDataAsync(Guid conversationId, SaveAcwRequest request)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation == null) return null;

        conversation.Disposition = request.Disposition;
        conversation.AcwNotes = request.Notes;
        conversation.FollowUpRequired = request.FollowUpRequired;
        conversation.FollowUpDate = request.FollowUpDate;

        _conversationRepository.Update(conversation);
        await _conversationRepository.SaveChangesAsync();

        return MapToDto(conversation);
    }

    /// <summary>
    /// Gets all notes for a conversation.
    /// </summary>
    public async Task<List<ConversationNoteDto>> GetNotesAsync(Guid conversationId)
    {
        var notes = await _conversationNoteRepository.GetByConversationIdAsync(conversationId);
        return notes.Select(n => new ConversationNoteDto
        {
            Id = n.Id,
            ConversationId = n.ConversationId,
            AgentId = n.AgentId,
            AgentName = n.Agent?.Name ?? string.Empty,
            Content = n.Content,
            CreatedAt = n.CreatedAt
        }).ToList();
    }

    /// <summary>
    /// Adds a note to a conversation.
    /// </summary>
    public async Task<ConversationNoteDto?> AddNoteAsync(Guid conversationId, Guid agentId, string content)
    {
        // Verify conversation exists
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation == null) return null;

        // Get agent info for the DTO
        var agent = await _agentRepository.GetByIdAsync(agentId);

        var note = new ConversationNote
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            AgentId = agentId,
            Content = content,
            CreatedAt = DateTime.UtcNow
        };

        await _conversationNoteRepository.AddAsync(note);
        await _conversationNoteRepository.SaveChangesAsync();

        return new ConversationNoteDto
        {
            Id = note.Id,
            ConversationId = note.ConversationId,
            AgentId = note.AgentId,
            AgentName = agent?.Name ?? string.Empty,
            Content = note.Content,
            CreatedAt = note.CreatedAt
        };
    }

    private static ConversationDto MapToDto(Conversation conversation)
    {
        return new ConversationDto
        {
            Id = conversation.Id,
            CustomerId = conversation.CustomerId,
            CustomerName = conversation.Customer?.Name ?? string.Empty,
            PhoneNumber = conversation.Customer?.Phone,
            AgentId = conversation.AgentId,
            AgentName = conversation.Agent?.Name,
            QueueId = conversation.QueueId,
            QueueName = conversation.Queue?.Name,
            Channel = conversation.Channel,
            State = conversation.State,
            StartTime = conversation.StartTime,
            EndTime = conversation.EndTime,
            DurationSeconds = conversation.DurationSeconds,
            MessageCount = conversation.Messages?.Count ?? 0,
            // SmartBot Handoff fields
            HandoffStatus = conversation.HandoffStatus,
            SmartBotSessionId = conversation.SmartBotSessionId,
            HandoffRequestedAt = conversation.HandoffRequestedAt,
            HandoffAcceptedAt = conversation.HandoffAcceptedAt,
            HandoffEndedAt = conversation.HandoffEndedAt,
            HandoffEndedBy = conversation.HandoffEndedBy
        };
    }
}
