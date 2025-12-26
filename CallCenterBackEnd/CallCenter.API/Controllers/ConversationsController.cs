using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Conversations;
using CallCenter.Application.Services;
using CallCenter.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConversationsController : ControllerBase
{
    private readonly IConversationService _conversationService;
    private readonly ISmartBotEscalationService _smartBotEscalationService;

    public ConversationsController(
        IConversationService conversationService,
        ISmartBotEscalationService smartBotEscalationService)
    {
        _conversationService = conversationService;
        _smartBotEscalationService = smartBotEscalationService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<ConversationDto>>> GetConversations(
        [FromQuery] PagedRequest request,
        [FromQuery] Guid? agentId = null,
        [FromQuery] ConversationState? state = null)
    {
        var result = await _conversationService.GetConversationsAsync(request, agentId, state);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ConversationDetailDto>> GetConversation(Guid id)
    {
        var conversation = await _conversationService.GetConversationByIdAsync(id);
        if (conversation == null) return NotFound();
        return Ok(conversation);
    }

    [HttpPost]
    public async Task<ActionResult<ConversationDto>> CreateConversation(CreateConversationRequest request)
    {
        var conversation = await _conversationService.CreateConversationAsync(request);
        return CreatedAtAction(nameof(GetConversation), new { id = conversation.Id }, conversation);
    }

    [HttpPut("{id}/close")]
    public async Task<ActionResult<ConversationDto>> CloseConversation(Guid id)
    {
        var conversation = await _conversationService.CloseConversationAsync(id);
        if (conversation == null) return NotFound();
        return Ok(conversation);
    }

    [HttpPut("{id}/transfer")]
    public async Task<ActionResult<ConversationDto>> TransferConversation(Guid id, TransferConversationRequest request)
    {
        var conversation = await _conversationService.TransferConversationAsync(id, request);
        if (conversation == null) return NotFound();
        return Ok(conversation);
    }

    [HttpGet("active/{agentId}")]
    public async Task<ActionResult<List<ConversationDto>>> GetActiveConversations(Guid agentId)
    {
        var conversations = await _conversationService.GetActiveConversationsAsync(agentId);
        return Ok(conversations);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<List<ConversationDto>>> GetByCustomer(Guid customerId)
    {
        var conversations = await _conversationService.GetByCustomerIdAsync(customerId);
        return Ok(conversations);
    }

    [HttpPost("{id}/messages")]
    public async Task<ActionResult<ConversationMessageDto>> SendMessage(Guid id, SendMessageRequest request)
    {
        var message = await _conversationService.SendMessageAsync(id, request);
        if (message == null) return NotFound();
        return Ok(message);
    }

    [HttpPut("{id}/read")]
    public async Task<ActionResult> MarkAsRead(Guid id)
    {
        var result = await _conversationService.MarkAsReadAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    /// <summary>
    /// Saves ACW (After Call Work) data to a conversation.
    /// </summary>
    [HttpPut("{id}/acw")]
    public async Task<ActionResult<ConversationDto>> SaveAcw(Guid id, SaveAcwRequest request)
    {
        var conversation = await _conversationService.SaveAcwDataAsync(id, request);
        if (conversation == null) return NotFound();
        return Ok(conversation);
    }

    /// <summary>
    /// Gets all notes for a conversation.
    /// </summary>
    [HttpGet("{id}/notes")]
    public async Task<ActionResult<List<ConversationNoteDto>>> GetNotes(Guid id)
    {
        var notes = await _conversationService.GetNotesAsync(id);
        return Ok(notes);
    }

    /// <summary>
    /// Adds a note to a conversation.
    /// </summary>
    [HttpPost("{id}/notes")]
    public async Task<ActionResult<ConversationNoteDto>> AddNote(Guid id, [FromBody] AddNoteRequest request, [FromQuery] Guid agentId)
    {
        var note = await _conversationService.AddNoteAsync(id, agentId, request.Content);
        if (note == null) return NotFound();
        return Ok(note);
    }

    /// <summary>
    /// Accepts a SmartBot handoff chat. Agent takes ownership of the conversation.
    /// </summary>
    [HttpPost("{id}/accept")]
    public async Task<ActionResult<AcceptChatResult>> AcceptChat(Guid id, [FromBody] AcceptChatRequest request)
    {
        var result = await _smartBotEscalationService.AcceptChatAsync(id, request.AgentId, request.AgentName);
        if (!result.Success)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }
        return Ok(result);
    }

    /// <summary>
    /// Handles agent disconnect from a SmartBot handoff chat.
    /// Can optionally re-queue the escalation for another agent.
    /// </summary>
    [HttpPost("{id}/agent-disconnect")]
    public async Task<IActionResult> AgentDisconnect(Guid id, [FromBody] AgentDisconnectRequest request)
    {
        var success = await _smartBotEscalationService.HandleAgentDisconnectAsync(
            id, request.AgentId, request.Reason, request.Requeue);

        if (!success)
        {
            return NotFound(new { error = "Conversation not found or agent not assigned" });
        }

        return Ok(new { success = true, requeued = request.Requeue });
    }
}

public class AcceptChatRequest
{
    public Guid AgentId { get; set; }
    public string AgentName { get; set; } = string.Empty;
}

public class AgentDisconnectRequest
{
    public Guid AgentId { get; set; }
    public string Reason { get; set; } = "Agent disconnected";
    public bool Requeue { get; set; } = true;
}
