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

    public ConversationsController(IConversationService conversationService)
    {
        _conversationService = conversationService;
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
}
