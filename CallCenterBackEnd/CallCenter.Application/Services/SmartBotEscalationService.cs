using System.Text.Json;
using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.SmartBot;
using CallCenter.Application.Interfaces;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;
using CallCenter.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

// SenderType enum reference for SmartBot messages

namespace CallCenter.Application.Services;

public interface ISmartBotEscalationService
{
    Task<SmartBotEscalationResponse> CreateEscalationAsync(SmartBotEscalationRequest request);
    Task<SmartBotEscalationStatusResponse?> GetEscalationStatusAsync(string smartBotConversationId);
    Task<SmartBotEscalationStatusResponse?> GetEscalationByIdAsync(Guid escalationId);
    Task<bool> UpdateEscalationStatusAsync(SmartBotStatusUpdateRequest request);
    Task<bool> SendMessageToAgentAsync(SmartBotMessageRequest request);
    Task<SmartBotEscalationDto?> GetEscalationDetailAsync(Guid escalationId);
    Task<AcceptChatResult> AcceptChatAsync(Guid conversationId, Guid agentId, string agentName);
    Task<bool> CancelEscalationFromSmartBotAsync(SmartBotCancelRequest request);
    Task<bool> HandleAgentDisconnectAsync(Guid conversationId, Guid agentId, string reason, bool requeue = true);

    // Admin/Dashboard methods
    Task<PagedResponse<SmartBotEscalationDto>> GetEscalationsPagedAsync(
        PagedRequest request,
        SmartBotEscalationStatus? status = null,
        Guid? agentId = null,
        DateTime? fromDate = null,
        DateTime? toDate = null);
    Task<SmartBotEscalationDto?> GetEscalationByConversationIdAsync(Guid conversationId);
    Task<List<SmartBotEscalationDto>> GetActiveEscalationsAsync();
    Task<EscalationStatsDto> GetEscalationStatsAsync(DateTime? fromDate = null, DateTime? toDate = null);
}

public class SmartBotCancelRequest
{
    public string SmartBotConversationId { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string CancelledBy { get; set; } = "Customer";
}

public class AcceptChatResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public Guid? EscalationId { get; set; }
    public string? AgentName { get; set; }
}

public class SmartBotEscalationService : ISmartBotEscalationService
{
    private readonly IRepository<SmartBotEscalation> _escalationRepository;
    private readonly IRepository<SmartBotEscalationLog> _escalationLogRepository;
    private readonly ITicketRepository _ticketRepository;
    private readonly IConversationRepository _conversationRepository;
    private readonly IConversationMessageRepository _messageRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IEnhancedRoutingService _enhancedRoutingService;
    private readonly IHubNotificationService _hubNotificationService;
    private readonly ISmartBotWebhookService _webhookService;
    private readonly ILogger<SmartBotEscalationService> _logger;

    public SmartBotEscalationService(
        IRepository<SmartBotEscalation> escalationRepository,
        IRepository<SmartBotEscalationLog> escalationLogRepository,
        ITicketRepository ticketRepository,
        IConversationRepository conversationRepository,
        IConversationMessageRepository messageRepository,
        ICustomerRepository customerRepository,
        IEnhancedRoutingService enhancedRoutingService,
        IHubNotificationService hubNotificationService,
        ISmartBotWebhookService webhookService,
        ILogger<SmartBotEscalationService> logger)
    {
        _escalationRepository = escalationRepository;
        _escalationLogRepository = escalationLogRepository;
        _ticketRepository = ticketRepository;
        _conversationRepository = conversationRepository;
        _messageRepository = messageRepository;
        _customerRepository = customerRepository;
        _enhancedRoutingService = enhancedRoutingService;
        _hubNotificationService = hubNotificationService;
        _webhookService = webhookService;
        _logger = logger;
    }

    public async Task<SmartBotEscalationResponse> CreateEscalationAsync(SmartBotEscalationRequest request)
    {
        try
        {
            _logger.LogInformation(
                "Creating escalation for SmartBot conversation {ConversationId}",
                request.SmartBotConversationId);

            // Find or create customer
            var customerId = await FindOrCreateCustomerAsync(request.Customer);

            // Create conversation for the escalation
            var conversation = await CreateConversationAsync(customerId, request);

            // Create ticket
            var ticket = await CreateTicketAsync(customerId, conversation.Id, request);

            // Parse enums
            var reason = ParseEscalationReason(request.Reason);
            var mode = ParseEscalationMode(request.Mode);
            var priority = ParsePriority(request.Priority);

            // Create escalation record
            var escalation = new SmartBotEscalation
            {
                Id = Guid.NewGuid(),
                SmartBotConversationId = request.SmartBotConversationId,
                SmartBotSessionId = request.SmartBotSessionId,
                SmartBotChatbotId = request.SmartBotChatbotId,
                TicketId = ticket.Id,
                ConversationId = conversation.Id,
                CustomerId = customerId,
                Status = SmartBotEscalationStatus.Pending,
                Reason = reason,
                Mode = mode,
                Priority = priority,
                Topic = request.Topic,
                Sentiment = request.Sentiment,
                CustomerName = request.Customer?.Name,
                CustomerEmail = request.Customer?.Email,
                CustomerPhone = request.Customer?.Phone,
                PreferredLanguage = request.PreferredLanguage,
                TranscriptJson = JsonSerializer.Serialize(request.Transcript),
                ContextVariablesJson = request.ContextVariables != null
                    ? JsonSerializer.Serialize(request.ContextVariables)
                    : null,
                EscalatedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Try to assign an agent immediately
            var (agentAssigned, queuePosition, estimatedWait) = await TryAssignAgentAsync(escalation);

            await _escalationRepository.AddAsync(escalation);
            await _escalationRepository.SaveChangesAsync();

            // Log escalation creation
            await LogEscalationEventAsync(escalation.Id, "Created", "Escalation created from SmartBot",
                $"Reason: {reason}, Mode: {mode}", "SmartBot");

            // Notify agents about new escalation
            await _hubNotificationService.NotifySmartBotEscalationAsync(escalation.Id, "created");

            // If no agent was assigned, notify SmartBot about queue position
            if (!agentAssigned && queuePosition.HasValue)
            {
                _ = _webhookService.NotifyNoAgentsAvailableAsync(
                    request.SmartBotConversationId,
                    escalation.Id.ToString(),
                    queuePosition,
                    estimatedWait);
            }

            _logger.LogInformation(
                "Created escalation {EscalationId} for SmartBot conversation {ConversationId}. Agent assigned: {AgentAssigned}",
                escalation.Id, request.SmartBotConversationId, agentAssigned);

            return new SmartBotEscalationResponse
            {
                Success = true,
                EscalationId = escalation.Id,
                TicketId = ticket.Id,
                TicketNumber = ticket.TicketNumber,
                ConversationId = conversation.Id,
                Status = escalation.Status.ToString(),
                AgentAvailable = agentAssigned,
                QueuePosition = queuePosition,
                EstimatedWaitTimeSeconds = estimatedWait,
                AssignedAgent = escalation.AssignedAgentId.HasValue
                    ? new SmartBotAgentInfo
                    {
                        AgentId = escalation.AssignedAgentId.Value,
                        Name = escalation.AssignedAgentName ?? "Agent"
                    }
                    : null
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create escalation for SmartBot conversation {ConversationId}",
                request.SmartBotConversationId);

            return new SmartBotEscalationResponse
            {
                Success = false,
                ErrorMessage = "Failed to create escalation. Please try again."
            };
        }
    }

    public async Task<SmartBotEscalationStatusResponse?> GetEscalationStatusAsync(string smartBotConversationId)
    {
        var escalations = await _escalationRepository.GetAllAsync();
        var escalation = escalations.FirstOrDefault(e => e.SmartBotConversationId == smartBotConversationId);

        if (escalation == null)
            return null;

        return MapToStatusResponse(escalation);
    }

    public async Task<SmartBotEscalationStatusResponse?> GetEscalationByIdAsync(Guid escalationId)
    {
        var escalations = await _escalationRepository.GetAllAsync();
        var escalation = escalations.FirstOrDefault(e => e.Id == escalationId);
        if (escalation == null)
            return null;

        return MapToStatusResponse(escalation);
    }

    public async Task<bool> UpdateEscalationStatusAsync(SmartBotStatusUpdateRequest request)
    {
        var escalations = await _escalationRepository.GetAllAsync();
        var escalation = escalations.FirstOrDefault(e => e.SmartBotConversationId == request.SmartBotConversationId);

        if (escalation == null)
        {
            _logger.LogWarning("Escalation not found for SmartBot conversation {ConversationId}",
                request.SmartBotConversationId);
            return false;
        }

        var oldStatus = escalation.Status;
        var newStatus = ParseEscalationStatus(request.Status);

        escalation.Status = newStatus;
        escalation.UpdatedAt = DateTime.UtcNow;

        if (newStatus == SmartBotEscalationStatus.Resolved || newStatus == SmartBotEscalationStatus.Closed)
        {
            escalation.ResolvedAt = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(request.Reason))
                escalation.Resolution = request.Reason;

            // Update conversation handoff status to Ended
            var conversation = await _conversationRepository.GetByIdAsync(escalation.ConversationId);
            if (conversation != null)
            {
                conversation.HandoffStatus = HandoffStatus.Ended;
                conversation.HandoffEndedAt = DateTime.UtcNow;
                conversation.HandoffEndedBy = "Agent";
                conversation.State = ConversationState.Closed;
                conversation.EndTime = DateTime.UtcNow;
                _conversationRepository.Update(conversation);
            }
        }

        _escalationRepository.Update(escalation);
        await _escalationRepository.SaveChangesAsync();

        await LogEscalationEventAsync(escalation.Id, "StatusChanged",
            $"Status changed from {oldStatus} to {newStatus}",
            request.Reason, "SmartBot");

        // Send webhook to SmartBot
        if (newStatus == SmartBotEscalationStatus.Resolved || newStatus == SmartBotEscalationStatus.Closed)
        {
            _ = _webhookService.NotifyResolvedAsync(
                escalation.SmartBotConversationId,
                escalation.Id.ToString(),
                escalation.Resolution ?? "Resolved",
                null,
                escalation.AssignedAgentId?.ToString(),
                escalation.AssignedAgentName);
        }
        else
        {
            _ = _webhookService.NotifyStatusChangedAsync(
                escalation.SmartBotConversationId,
                escalation.Id.ToString(),
                oldStatus.ToString(),
                newStatus.ToString(),
                request.Reason,
                escalation.AssignedAgentId?.ToString(),
                escalation.AssignedAgentName);
        }

        return true;
    }

    public async Task<bool> SendMessageToAgentAsync(SmartBotMessageRequest request)
    {
        try
        {
            var escalations = await _escalationRepository.GetAllAsync();
            var escalation = escalations.FirstOrDefault(e => e.SmartBotConversationId == request.SmartBotConversationId);

            if (escalation == null)
            {
                _logger.LogWarning("Escalation not found for SmartBot conversation {ConversationId}",
                    request.SmartBotConversationId);
                return false;
            }

            _logger.LogInformation(
                "Saving customer message for escalation {EscalationId}, conversation {ConversationId}",
                escalation.Id, escalation.ConversationId);

            // Parse sender type
            var senderType = request.SenderType?.ToLowerInvariant() == "agent"
                ? SenderType.Agent
                : SenderType.Customer;

            // Create and persist message to database
            var message = new ConversationMessage
            {
                Id = Guid.NewGuid(),
                ConversationId = escalation.ConversationId,
                SenderType = senderType,
                SenderId = null, // Customer messages don't have a SenderId
                Message = request.Message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _messageRepository.AddAsync(message);
            await _messageRepository.SaveChangesAsync();

            _logger.LogInformation(
                "Message {MessageId} saved to conversation {ConversationId}",
                message.Id, escalation.ConversationId);

            // Notify agents via SignalR for real-time update
            await _hubNotificationService.NotifySmartBotMessageAsync(
                escalation.Id,
                escalation.ConversationId,
                request.Message,
                request.SenderType);

            // Log the event
            await LogEscalationEventAsync(escalation.Id, "MessageReceived",
                "Message received from customer via SmartBot",
                null, "SmartBot");

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save customer message for SmartBot conversation {ConversationId}",
                request.SmartBotConversationId);
            return false;
        }
    }

    public async Task<SmartBotEscalationDto?> GetEscalationDetailAsync(Guid escalationId)
    {
        var escalations = await _escalationRepository.GetAllAsync();
        var escalation = escalations.FirstOrDefault(e => e.Id == escalationId);
        if (escalation == null)
            return null;

        var logs = await _escalationLogRepository.GetAllAsync();
        var escalationLogs = logs.Where(l => l.EscalationId == escalationId)
            .OrderByDescending(l => l.Timestamp)
            .ToList();

        var ticket = await _ticketRepository.GetByIdAsync(escalation.TicketId);

        return new SmartBotEscalationDto
        {
            Id = escalation.Id,
            SmartBotConversationId = escalation.SmartBotConversationId,
            SmartBotSessionId = escalation.SmartBotSessionId,
            SmartBotChatbotId = escalation.SmartBotChatbotId,
            TicketId = escalation.TicketId,
            TicketNumber = ticket?.TicketNumber ?? string.Empty,
            ConversationId = escalation.ConversationId,
            CustomerId = escalation.CustomerId,
            CustomerName = escalation.CustomerName,
            Status = escalation.Status,
            Reason = escalation.Reason,
            Mode = escalation.Mode,
            Priority = escalation.Priority,
            Topic = escalation.Topic,
            Sentiment = escalation.Sentiment,
            AssignedAgentId = escalation.AssignedAgentId,
            AssignedAgentName = escalation.AssignedAgentName,
            AssignedQueueId = escalation.AssignedQueueId,
            QueuePosition = escalation.QueuePosition,
            EstimatedWaitTimeSeconds = escalation.EstimatedWaitTimeSeconds,
            EscalatedAt = escalation.EscalatedAt,
            AgentAssignedAt = escalation.AgentAssignedAt,
            ResolvedAt = escalation.ResolvedAt,
            Resolution = escalation.Resolution,
            Logs = escalationLogs.Select(l => new SmartBotEscalationLogDto
            {
                Id = l.Id,
                EventType = l.EventType,
                Action = l.Action,
                Details = l.Details,
                ActorName = l.ActorName,
                Source = l.Source,
                Timestamp = l.Timestamp
            }).ToList()
        };
    }

    public async Task<AcceptChatResult> AcceptChatAsync(Guid conversationId, Guid agentId, string agentName)
    {
        try
        {
            _logger.LogInformation(
                "Agent {AgentId} ({AgentName}) accepting SmartBot chat for conversation {ConversationId}",
                agentId, agentName, conversationId);

            // Find the escalation for this conversation
            var escalations = await _escalationRepository.GetAllAsync();
            var escalation = escalations.FirstOrDefault(e => e.ConversationId == conversationId);

            if (escalation == null)
            {
                _logger.LogWarning("No escalation found for conversation {ConversationId}", conversationId);
                return new AcceptChatResult
                {
                    Success = false,
                    ErrorMessage = "No SmartBot escalation found for this conversation"
                };
            }

            // Check if already assigned
            if (escalation.AssignedAgentId.HasValue)
            {
                _logger.LogWarning(
                    "Escalation {EscalationId} already assigned to agent {AssignedAgentId}",
                    escalation.Id, escalation.AssignedAgentId);
                return new AcceptChatResult
                {
                    Success = false,
                    ErrorMessage = $"Chat already assigned to {escalation.AssignedAgentName ?? "another agent"}"
                };
            }

            // Update escalation with agent assignment
            escalation.AssignedAgentId = agentId;
            escalation.AssignedAgentName = agentName;
            escalation.AgentAssignedAt = DateTime.UtcNow;
            escalation.Status = SmartBotEscalationStatus.Assigned;
            escalation.UpdatedAt = DateTime.UtcNow;

            _escalationRepository.Update(escalation);
            await _escalationRepository.SaveChangesAsync();

            // Update conversation handoff status to Connected
            var conversation = await _conversationRepository.GetByIdAsync(conversationId);
            if (conversation != null)
            {
                conversation.HandoffStatus = HandoffStatus.Connected;
                conversation.HandoffAcceptedAt = DateTime.UtcNow;
                conversation.AgentId = agentId;
                conversation.State = ConversationState.Active;
                _conversationRepository.Update(conversation);
                await _conversationRepository.SaveChangesAsync();
            }

            // Remove from queue if was queued
            await _enhancedRoutingService.RemoveFromQueueAsync(escalation.Id);

            // Log the event
            await LogEscalationEventAsync(escalation.Id, "AgentAccepted",
                $"Agent {agentName} accepted the chat",
                null, "CallCenter");

            // Send webhook to SmartBot to notify agent joined
            _logger.LogInformation(
                "Sending agent-assigned webhook to SmartBot: ConversationId={SmartBotConversationId}, EscalationId={EscalationId}",
                escalation.SmartBotConversationId, escalation.Id);

            var webhookSuccess = await _webhookService.NotifyAgentAssignedAsync(
                escalation.SmartBotConversationId,
                escalation.Id.ToString(),
                escalation.TicketId.ToString(),
                agentId.ToString(),
                agentName);

            if (!webhookSuccess)
            {
                _logger.LogWarning(
                    "Failed to send agent-assigned webhook to SmartBot for escalation {EscalationId}",
                    escalation.Id);
            }
            else
            {
                _logger.LogInformation(
                    "Successfully sent agent-assigned webhook to SmartBot for escalation {EscalationId}",
                    escalation.Id);
            }

            // Notify via SignalR
            await _hubNotificationService.NotifySmartBotEscalationAsync(escalation.Id, "agent_assigned");

            _logger.LogInformation(
                "Agent {AgentName} successfully accepted SmartBot chat for escalation {EscalationId}",
                agentName, escalation.Id);

            return new AcceptChatResult
            {
                Success = true,
                EscalationId = escalation.Id,
                AgentName = agentName
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to accept SmartBot chat for conversation {ConversationId}",
                conversationId);

            return new AcceptChatResult
            {
                Success = false,
                ErrorMessage = "Failed to accept chat. Please try again."
            };
        }
    }

    public async Task<bool> CancelEscalationFromSmartBotAsync(SmartBotCancelRequest request)
    {
        try
        {
            _logger.LogInformation(
                "Processing cancel request from SmartBot for conversation {ConversationId}, reason: {Reason}",
                request.SmartBotConversationId, request.Reason);

            // Find escalation by SmartBot conversation ID
            var escalations = await _escalationRepository.GetAllAsync();
            var escalation = escalations.FirstOrDefault(e =>
                e.SmartBotConversationId == request.SmartBotConversationId);

            if (escalation == null)
            {
                _logger.LogWarning(
                    "Escalation not found for SmartBot conversation {ConversationId}",
                    request.SmartBotConversationId);
                return false;
            }

            // Update escalation status
            escalation.Status = SmartBotEscalationStatus.Closed;
            escalation.ResolvedAt = DateTime.UtcNow;
            escalation.Resolution = request.Reason ?? "Ended by customer";
            escalation.UpdatedAt = DateTime.UtcNow;

            _escalationRepository.Update(escalation);

            // Update conversation handoff status
            var conversation = await _conversationRepository.GetByIdAsync(escalation.ConversationId);
            if (conversation != null)
            {
                conversation.HandoffStatus = HandoffStatus.Ended;
                conversation.HandoffEndedAt = DateTime.UtcNow;
                conversation.HandoffEndedBy = request.CancelledBy;
                conversation.State = ConversationState.Closed;
                conversation.EndTime = DateTime.UtcNow;
                _conversationRepository.Update(conversation);
            }

            await _escalationRepository.SaveChangesAsync();
            await _conversationRepository.SaveChangesAsync();

            // Log the event
            await LogEscalationEventAsync(escalation.Id, "EscalationCancelled",
                $"Escalation cancelled by {request.CancelledBy}: {request.Reason ?? "No reason provided"}",
                null, "SmartBot");

            // Notify via SignalR (to update agent's UI)
            await _hubNotificationService.NotifySmartBotEscalationAsync(escalation.Id, "cancelled");

            _logger.LogInformation(
                "SmartBot escalation {EscalationId} cancelled successfully",
                escalation.Id);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to cancel escalation for SmartBot conversation {ConversationId}",
                request.SmartBotConversationId);
            return false;
        }
    }

    public async Task<bool> HandleAgentDisconnectAsync(Guid conversationId, Guid agentId, string reason, bool requeue = true)
    {
        try
        {
            _logger.LogInformation(
                "Handling agent {AgentId} disconnect for conversation {ConversationId}, requeue: {Requeue}",
                agentId, conversationId, requeue);

            // Find escalation by conversation ID
            var escalations = await _escalationRepository.GetAllAsync();
            var escalation = escalations.FirstOrDefault(e => e.ConversationId == conversationId);

            if (escalation == null)
            {
                _logger.LogWarning(
                    "No escalation found for conversation {ConversationId} during agent disconnect",
                    conversationId);
                return false;
            }

            // Verify the disconnecting agent was actually assigned
            if (escalation.AssignedAgentId != agentId)
            {
                _logger.LogWarning(
                    "Agent {AgentId} trying to disconnect from conversation {ConversationId} but was not assigned",
                    agentId, conversationId);
                return false;
            }

            var previousAgentName = escalation.AssignedAgentName ?? "Agent";

            if (requeue)
            {
                // Re-queue the escalation
                escalation.AssignedAgentId = null;
                escalation.AssignedAgentName = null;
                escalation.AgentAssignedAt = null;
                escalation.Status = SmartBotEscalationStatus.Queued;
                escalation.UpdatedAt = DateTime.UtcNow;

                // Add back to queue
                var queueInfo = await _enhancedRoutingService.AddToQueueAsync(
                    escalation.Id, escalation.Topic, escalation.Priority);

                escalation.QueuePosition = queueInfo.Position;
                escalation.EstimatedWaitTimeSeconds = queueInfo.EstimatedWaitTimeSeconds;

                _escalationRepository.Update(escalation);

                // Update conversation handoff status back to WaitingForAgent
                var conversation = await _conversationRepository.GetByIdAsync(conversationId);
                if (conversation != null)
                {
                    conversation.HandoffStatus = HandoffStatus.WaitingForAgent;
                    conversation.AgentId = null;
                    conversation.State = ConversationState.Waiting;
                    _conversationRepository.Update(conversation);
                }

                await _escalationRepository.SaveChangesAsync();
                await _conversationRepository.SaveChangesAsync();

                // Log the event
                await LogEscalationEventAsync(escalation.Id, "AgentDisconnected",
                    $"Agent {previousAgentName} disconnected, escalation re-queued",
                    reason, "CallCenter");

                // Notify SmartBot about agent disconnect with requeue flag
                _ = _webhookService.NotifyAgentDisconnectedAsync(
                    escalation.SmartBotConversationId,
                    escalation.Id.ToString(),
                    agentId.ToString(),
                    previousAgentName,
                    reason,
                    willRequeue: true);

                // Notify via SignalR
                await _hubNotificationService.NotifySmartBotEscalationAsync(escalation.Id, "agent_disconnected_requeued");

                _logger.LogInformation(
                    "Escalation {EscalationId} re-queued after agent disconnect, position: {Position}",
                    escalation.Id, queueInfo.Position);
            }
            else
            {
                // End the escalation
                escalation.Status = SmartBotEscalationStatus.Closed;
                escalation.ResolvedAt = DateTime.UtcNow;
                escalation.Resolution = $"Agent disconnected: {reason}";
                escalation.UpdatedAt = DateTime.UtcNow;

                _escalationRepository.Update(escalation);

                // Update conversation
                var conversation = await _conversationRepository.GetByIdAsync(conversationId);
                if (conversation != null)
                {
                    conversation.HandoffStatus = HandoffStatus.Ended;
                    conversation.HandoffEndedAt = DateTime.UtcNow;
                    conversation.HandoffEndedBy = "Agent";
                    conversation.State = ConversationState.Closed;
                    conversation.EndTime = DateTime.UtcNow;
                    _conversationRepository.Update(conversation);
                }

                await _escalationRepository.SaveChangesAsync();
                await _conversationRepository.SaveChangesAsync();

                // Log the event
                await LogEscalationEventAsync(escalation.Id, "AgentDisconnectedClosed",
                    $"Agent {previousAgentName} disconnected, escalation closed",
                    reason, "CallCenter");

                // Notify SmartBot about agent disconnect without requeue
                _ = _webhookService.NotifyAgentDisconnectedAsync(
                    escalation.SmartBotConversationId,
                    escalation.Id.ToString(),
                    agentId.ToString(),
                    previousAgentName,
                    reason,
                    willRequeue: false);

                // Notify via SignalR
                await _hubNotificationService.NotifySmartBotEscalationAsync(escalation.Id, "agent_disconnected_closed");

                _logger.LogInformation(
                    "Escalation {EscalationId} closed after agent disconnect",
                    escalation.Id);
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to handle agent disconnect for conversation {ConversationId}",
                conversationId);
            return false;
        }
    }

    #region Admin/Dashboard Methods

    public async Task<PagedResponse<SmartBotEscalationDto>> GetEscalationsPagedAsync(
        PagedRequest request,
        SmartBotEscalationStatus? status = null,
        Guid? agentId = null,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var allEscalations = await _escalationRepository.GetAllAsync();
        var query = allEscalations.AsQueryable();

        // Apply filters
        if (status.HasValue)
            query = query.Where(e => e.Status == status.Value);

        if (agentId.HasValue)
            query = query.Where(e => e.AssignedAgentId == agentId.Value);

        if (fromDate.HasValue)
            query = query.Where(e => e.EscalatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(e => e.EscalatedAt <= toDate.Value);

        var totalCount = query.Count();

        // Sort by escalated at descending (newest first)
        var escalations = query
            .OrderByDescending(e => e.EscalatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var logs = await _escalationLogRepository.GetAllAsync();
        var tickets = await _ticketRepository.GetAllAsync();

        var items = escalations.Select(e => new SmartBotEscalationDto
        {
            Id = e.Id,
            SmartBotConversationId = e.SmartBotConversationId,
            SmartBotSessionId = e.SmartBotSessionId,
            SmartBotChatbotId = e.SmartBotChatbotId,
            TicketId = e.TicketId,
            TicketNumber = tickets.FirstOrDefault(t => t.Id == e.TicketId)?.TicketNumber ?? "",
            ConversationId = e.ConversationId,
            CustomerId = e.CustomerId,
            CustomerName = e.CustomerName,
            Status = e.Status,
            Reason = e.Reason,
            Mode = e.Mode,
            Priority = e.Priority,
            Topic = e.Topic,
            Sentiment = e.Sentiment,
            AssignedAgentId = e.AssignedAgentId,
            AssignedAgentName = e.AssignedAgentName,
            AssignedQueueId = e.AssignedQueueId,
            QueuePosition = e.QueuePosition,
            EstimatedWaitTimeSeconds = e.EstimatedWaitTimeSeconds,
            EscalatedAt = e.EscalatedAt,
            AgentAssignedAt = e.AgentAssignedAt,
            ResolvedAt = e.ResolvedAt,
            Resolution = e.Resolution,
            Logs = logs.Where(l => l.EscalationId == e.Id)
                .OrderByDescending(l => l.Timestamp)
                .Select(l => new SmartBotEscalationLogDto
                {
                    Id = l.Id,
                    EventType = l.EventType,
                    Action = l.Action,
                    Details = l.Details,
                    ActorName = l.ActorName,
                    Source = l.Source,
                    Timestamp = l.Timestamp
                }).ToList()
        }).ToList();

        return new PagedResponse<SmartBotEscalationDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / request.PageSize)
        };
    }

    public async Task<SmartBotEscalationDto?> GetEscalationByConversationIdAsync(Guid conversationId)
    {
        var escalations = await _escalationRepository.GetAllAsync();
        var escalation = escalations.FirstOrDefault(e => e.ConversationId == conversationId);

        if (escalation == null)
            return null;

        return await GetEscalationDetailAsync(escalation.Id);
    }

    public async Task<List<SmartBotEscalationDto>> GetActiveEscalationsAsync()
    {
        var activeStatuses = new[]
        {
            SmartBotEscalationStatus.Pending,
            SmartBotEscalationStatus.Queued,
            SmartBotEscalationStatus.Assigned,
            SmartBotEscalationStatus.Active
        };

        var allEscalations = await _escalationRepository.GetAllAsync();
        var activeEscalations = allEscalations
            .Where(e => activeStatuses.Contains(e.Status))
            .OrderBy(e => e.EscalatedAt)
            .ToList();

        var logs = await _escalationLogRepository.GetAllAsync();
        var tickets = await _ticketRepository.GetAllAsync();

        return activeEscalations.Select(e => new SmartBotEscalationDto
        {
            Id = e.Id,
            SmartBotConversationId = e.SmartBotConversationId,
            SmartBotSessionId = e.SmartBotSessionId,
            SmartBotChatbotId = e.SmartBotChatbotId,
            TicketId = e.TicketId,
            TicketNumber = tickets.FirstOrDefault(t => t.Id == e.TicketId)?.TicketNumber ?? "",
            ConversationId = e.ConversationId,
            CustomerId = e.CustomerId,
            CustomerName = e.CustomerName,
            Status = e.Status,
            Reason = e.Reason,
            Mode = e.Mode,
            Priority = e.Priority,
            Topic = e.Topic,
            Sentiment = e.Sentiment,
            AssignedAgentId = e.AssignedAgentId,
            AssignedAgentName = e.AssignedAgentName,
            AssignedQueueId = e.AssignedQueueId,
            QueuePosition = e.QueuePosition,
            EstimatedWaitTimeSeconds = e.EstimatedWaitTimeSeconds,
            EscalatedAt = e.EscalatedAt,
            AgentAssignedAt = e.AgentAssignedAt,
            ResolvedAt = e.ResolvedAt,
            Resolution = e.Resolution,
            Logs = logs.Where(l => l.EscalationId == e.Id)
                .OrderByDescending(l => l.Timestamp)
                .Take(5) // Only last 5 logs for list view
                .Select(l => new SmartBotEscalationLogDto
                {
                    Id = l.Id,
                    EventType = l.EventType,
                    Action = l.Action,
                    Details = l.Details,
                    ActorName = l.ActorName,
                    Source = l.Source,
                    Timestamp = l.Timestamp
                }).ToList()
        }).ToList();
    }

    public async Task<EscalationStatsDto> GetEscalationStatsAsync(DateTime? fromDate = null, DateTime? toDate = null)
    {
        var allEscalations = await _escalationRepository.GetAllAsync();
        var query = allEscalations.AsQueryable();

        // Apply date filters
        if (fromDate.HasValue)
            query = query.Where(e => e.EscalatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(e => e.EscalatedAt <= toDate.Value);

        var escalations = query.ToList();

        var stats = new EscalationStatsDto
        {
            TotalEscalations = escalations.Count,
            PendingCount = escalations.Count(e => e.Status == SmartBotEscalationStatus.Pending),
            QueuedCount = escalations.Count(e => e.Status == SmartBotEscalationStatus.Queued),
            AssignedCount = escalations.Count(e => e.Status == SmartBotEscalationStatus.Assigned),
            ActiveCount = escalations.Count(e => e.Status == SmartBotEscalationStatus.Active),
            ResolvedCount = escalations.Count(e => e.Status == SmartBotEscalationStatus.Resolved),
            ClosedCount = escalations.Count(e => e.Status == SmartBotEscalationStatus.Closed),
            AbandonedCount = escalations.Count(e => e.Status == SmartBotEscalationStatus.Abandoned),
        };

        // Calculate average wait time (time from escalation to agent assignment)
        var assignedEscalations = escalations.Where(e => e.AgentAssignedAt.HasValue).ToList();
        if (assignedEscalations.Count > 0)
        {
            stats.AverageWaitTimeSeconds = assignedEscalations
                .Average(e => (e.AgentAssignedAt!.Value - e.EscalatedAt).TotalSeconds);
        }

        // Calculate average handle time (time from assignment to resolution)
        var resolvedEscalations = escalations.Where(e => e.AgentAssignedAt.HasValue && e.ResolvedAt.HasValue).ToList();
        if (resolvedEscalations.Count > 0)
        {
            stats.AverageHandleTimeSeconds = resolvedEscalations
                .Average(e => (e.ResolvedAt!.Value - e.AgentAssignedAt!.Value).TotalSeconds);
        }

        // Resolution rate
        var completedEscalations = escalations.Where(e =>
            e.Status == SmartBotEscalationStatus.Resolved ||
            e.Status == SmartBotEscalationStatus.Closed ||
            e.Status == SmartBotEscalationStatus.Abandoned).ToList();

        if (completedEscalations.Count > 0)
        {
            var resolvedOrClosed = completedEscalations.Count(e =>
                e.Status == SmartBotEscalationStatus.Resolved ||
                e.Status == SmartBotEscalationStatus.Closed);
            stats.ResolutionRate = (double)resolvedOrClosed / completedEscalations.Count * 100;
        }

        // Group by reason
        stats.ByReason = escalations
            .GroupBy(e => e.Reason.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        // Group by priority
        stats.ByPriority = escalations
            .GroupBy(e => e.Priority.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        // Group by agent (only assigned)
        stats.ByAgent = escalations
            .Where(e => e.AssignedAgentId.HasValue && !string.IsNullOrEmpty(e.AssignedAgentName))
            .GroupBy(e => e.AssignedAgentName!)
            .ToDictionary(g => g.Key, g => g.Count());

        // Oldest pending escalation
        var pendingEscalations = escalations
            .Where(e => e.Status == SmartBotEscalationStatus.Pending || e.Status == SmartBotEscalationStatus.Queued)
            .OrderBy(e => e.EscalatedAt)
            .FirstOrDefault();

        stats.OldestPendingEscalation = pendingEscalations?.EscalatedAt;

        return stats;
    }

    #endregion

    #region Private Helper Methods

    private async Task<Guid?> FindOrCreateCustomerAsync(SmartBotCustomerInfo? customerInfo)
    {
        if (customerInfo == null)
            return null;

        // Try to find existing customer by email or phone
        var customers = await _customerRepository.GetAllAsync();

        Customer? customer = null;

        if (!string.IsNullOrEmpty(customerInfo.Email))
        {
            customer = customers.FirstOrDefault(c =>
                c.Email != null && c.Email.Equals(customerInfo.Email, StringComparison.OrdinalIgnoreCase));
        }

        if (customer == null && !string.IsNullOrEmpty(customerInfo.Phone))
        {
            customer = customers.FirstOrDefault(c =>
                c.Phone != null && c.Phone == customerInfo.Phone);
        }

        if (customer != null)
            return customer.Id;

        // Create new customer
        customer = new Customer
        {
            Id = Guid.NewGuid(),
            Name = customerInfo.Name ?? "SmartBot Customer",
            Email = customerInfo.Email,
            Phone = customerInfo.Phone,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _customerRepository.AddAsync(customer);
        await _customerRepository.SaveChangesAsync();

        return customer.Id;
    }

    private async Task<Conversation> CreateConversationAsync(Guid? customerId, SmartBotEscalationRequest request)
    {
        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId ?? Guid.Empty,
            Channel = Channel.SmartBot,
            State = ConversationState.Waiting,
            StartTime = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            // Set handoff status for SmartBot escalations
            HandoffStatus = HandoffStatus.WaitingForAgent,
            SmartBotSessionId = request.SmartBotSessionId,
            HandoffRequestedAt = DateTime.UtcNow
        };

        await _conversationRepository.AddAsync(conversation);
        await _conversationRepository.SaveChangesAsync();

        return conversation;
    }

    private async Task<Ticket> CreateTicketAsync(Guid? customerId, Guid conversationId, SmartBotEscalationRequest request)
    {
        var ticket = new Ticket
        {
            Id = Guid.NewGuid(),
            TicketNumber = $"SB-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            CustomerId = customerId ?? Guid.Empty,
            ConversationId = conversationId,
            Subject = $"SmartBot Escalation: {request.Topic ?? request.Reason}",
            Description = $"Escalation from SmartBot. Reason: {request.Reason}. Sentiment: {request.Sentiment ?? "N/A"}",
            Category = "SmartBot Escalation",
            Subcategory = request.Topic,
            Status = TicketStatus.New,
            Priority = ParsePriority(request.Priority),
            Source = TicketSource.SmartBot,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _ticketRepository.AddAsync(ticket);
        await _ticketRepository.SaveChangesAsync();

        return ticket;
    }

    private async Task<(bool assigned, int? queuePosition, int? estimatedWait)> TryAssignAgentAsync(SmartBotEscalation escalation)
    {
        // Use enhanced routing with skill matching, priority, and working hours
        var routingRequest = new EscalationRoutingRequest
        {
            EscalationId = escalation.Id,
            Topic = escalation.Topic,
            Priority = escalation.Priority,
            PreferredLanguage = escalation.PreferredLanguage
        };

        var routingResult = await _enhancedRoutingService.RouteEscalationAsync(routingRequest);

        if (routingResult.IsOutsideWorkingHours)
        {
            _logger.LogInformation(
                "Escalation {EscalationId} received outside working hours",
                escalation.Id);

            escalation.Status = SmartBotEscalationStatus.Queued;
            escalation.QueuePosition = null;
            escalation.EstimatedWaitTimeSeconds = null;

            return (false, null, null);
        }

        if (routingResult.AgentAssigned && routingResult.AssignedAgent != null)
        {
            escalation.Status = SmartBotEscalationStatus.Assigned;
            escalation.AssignedAgentId = routingResult.AssignedAgent.Id;
            escalation.AssignedAgentName = routingResult.AssignedAgent.Name;
            escalation.AgentAssignedAt = DateTime.UtcNow;

            // Update conversation handoff status to Connected
            var conversation = await _conversationRepository.GetByIdAsync(escalation.ConversationId);
            if (conversation != null)
            {
                conversation.HandoffStatus = HandoffStatus.Connected;
                conversation.HandoffAcceptedAt = DateTime.UtcNow;
                conversation.AgentId = routingResult.AssignedAgent.Id;
                conversation.State = ConversationState.Active;
                _conversationRepository.Update(conversation);
                await _conversationRepository.SaveChangesAsync();
            }

            // Remove from queue if was queued
            await _enhancedRoutingService.RemoveFromQueueAsync(escalation.Id);

            // Send webhook to SmartBot
            _ = _webhookService.NotifyAgentAssignedAsync(
                escalation.SmartBotConversationId,
                escalation.Id.ToString(),
                escalation.TicketId.ToString(),
                routingResult.AssignedAgent.Id.ToString(),
                routingResult.AssignedAgent.Name);

            return (true, null, null);
        }

        if (routingResult.AddedToQueue)
        {
            escalation.Status = SmartBotEscalationStatus.Queued;
            escalation.QueuePosition = routingResult.QueuePosition;
            escalation.EstimatedWaitTimeSeconds = routingResult.EstimatedWaitTimeSeconds;

            return (false, routingResult.QueuePosition, routingResult.EstimatedWaitTimeSeconds);
        }

        // Fallback: No agent available, not queued
        escalation.Status = SmartBotEscalationStatus.Queued;
        var queueInfo = await _enhancedRoutingService.AddToQueueAsync(
            escalation.Id, escalation.Topic, escalation.Priority);

        escalation.QueuePosition = queueInfo.Position;
        escalation.EstimatedWaitTimeSeconds = queueInfo.EstimatedWaitTimeSeconds;

        return (false, queueInfo.Position, queueInfo.EstimatedWaitTimeSeconds);
    }

    private async Task LogEscalationEventAsync(Guid escalationId, string eventType, string action, string? details, string source)
    {
        var log = new SmartBotEscalationLog
        {
            Id = Guid.NewGuid(),
            EscalationId = escalationId,
            EventType = eventType,
            Action = action,
            Details = details,
            Source = source,
            Timestamp = DateTime.UtcNow
        };

        await _escalationLogRepository.AddAsync(log);
        await _escalationLogRepository.SaveChangesAsync();
    }

    private SmartBotEscalationStatusResponse MapToStatusResponse(SmartBotEscalation escalation)
    {
        return new SmartBotEscalationStatusResponse
        {
            EscalationId = escalation.Id,
            SmartBotConversationId = escalation.SmartBotConversationId,
            Status = escalation.Status.ToString(),
            QueuePosition = escalation.QueuePosition,
            EstimatedWaitTimeSeconds = escalation.EstimatedWaitTimeSeconds,
            AssignedAgent = escalation.AssignedAgentId.HasValue
                ? new SmartBotAgentInfo
                {
                    AgentId = escalation.AssignedAgentId.Value,
                    Name = escalation.AssignedAgentName ?? "Agent"
                }
                : null,
            AgentAssignedAt = escalation.AgentAssignedAt,
            Resolution = escalation.Resolution,
            ResolvedAt = escalation.ResolvedAt
        };
    }

    private static SmartBotEscalationReason ParseEscalationReason(string reason)
    {
        return reason.ToLowerInvariant() switch
        {
            "user_request" or "userrequest" => SmartBotEscalationReason.UserRequest,
            "failed_attempts" or "failedattempts" => SmartBotEscalationReason.FailedAttempts,
            "no_match" or "nomatchfound" => SmartBotEscalationReason.NoMatchFound,
            "low_confidence" or "lowconfidence" => SmartBotEscalationReason.LowConfidence,
            "repeated_question" or "repeatedquestion" => SmartBotEscalationReason.RepeatedQuestion,
            "negative_sentiment" or "negativesentiment" => SmartBotEscalationReason.NegativeSentiment,
            "keyword" or "keyworddetection" => SmartBotEscalationReason.KeywordDetection,
            "timeout" or "timeoutexceeded" => SmartBotEscalationReason.TimeoutExceeded,
            _ => SmartBotEscalationReason.UserRequest
        };
    }

    private static SmartBotEscalationMode ParseEscalationMode(string mode)
    {
        return mode.ToLowerInvariant() switch
        {
            "livechat" or "live_chat" or "chat" => SmartBotEscalationMode.LiveChat,
            "callback" or "call_back" => SmartBotEscalationMode.Callback,
            "email" or "emailfollowup" or "email_followup" => SmartBotEscalationMode.EmailFollowUp,
            "external" or "externalchat" or "external_chat" => SmartBotEscalationMode.ExternalChat,
            _ => SmartBotEscalationMode.LiveChat
        };
    }

    private static TicketPriority ParsePriority(string priority)
    {
        return priority.ToLowerInvariant() switch
        {
            "low" => TicketPriority.Low,
            "normal" or "medium" => TicketPriority.Normal,
            "high" => TicketPriority.High,
            "urgent" or "critical" => TicketPriority.Urgent,
            _ => TicketPriority.Normal
        };
    }

    private static SmartBotEscalationStatus ParseEscalationStatus(string status)
    {
        return status.ToLowerInvariant() switch
        {
            "pending" => SmartBotEscalationStatus.Pending,
            "queued" => SmartBotEscalationStatus.Queued,
            "assigned" => SmartBotEscalationStatus.Assigned,
            "active" => SmartBotEscalationStatus.Active,
            "resolved" => SmartBotEscalationStatus.Resolved,
            "closed" => SmartBotEscalationStatus.Closed,
            "abandoned" => SmartBotEscalationStatus.Abandoned,
            "transferred" => SmartBotEscalationStatus.Transferred,
            _ => SmartBotEscalationStatus.Pending
        };
    }

    #endregion
}
