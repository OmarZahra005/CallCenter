using CallCenter.API.Authorization;
using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Tickets;
using CallCenter.Application.Services;
using CallCenter.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpGet]
    [RequirePermission("tickets.view")]
    public async Task<ActionResult<PagedResponse<TicketDto>>> GetTickets(
        [FromQuery] PagedRequest request,
        [FromQuery] Guid? agentId = null,
        [FromQuery] TicketStatus? status = null)
    {
        var result = await _ticketService.GetTicketsAsync(request, agentId, status);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [RequirePermission("tickets.view")]
    public async Task<ActionResult<TicketDetailDto>> GetTicket(Guid id)
    {
        var ticket = await _ticketService.GetTicketByIdAsync(id);
        if (ticket == null) return NotFound();
        return Ok(ticket);
    }

    [HttpPost]
    [RequirePermission("tickets.create")]
    public async Task<ActionResult<TicketDto>> CreateTicket(CreateTicketRequest request)
    {
        var ticket = await _ticketService.CreateTicketAsync(request);
        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
    }

    [HttpPut("{id}")]
    [RequirePermission("tickets.edit")]
    public async Task<ActionResult<TicketDto>> UpdateTicket(Guid id, UpdateTicketRequest request)
    {
        var ticket = await _ticketService.UpdateTicketAsync(id, request);
        if (ticket == null) return NotFound();
        return Ok(ticket);
    }

    [HttpDelete("{id}")]
    [RequirePermission("tickets.delete")]
    public async Task<ActionResult> DeleteTicket(Guid id)
    {
        var result = await _ticketService.DeleteTicketAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPut("{id}/assign")]
    [RequirePermission("tickets.assign")]
    public async Task<ActionResult<TicketDto>> AssignTicket(Guid id, AssignTicketRequest request)
    {
        var ticket = await _ticketService.AssignTicketAsync(id, request);
        if (ticket == null) return NotFound();
        return Ok(ticket);
    }

    [HttpGet("customer/{customerId}")]
    [RequirePermission("tickets.view")]
    public async Task<ActionResult<List<TicketDto>>> GetByCustomer(Guid customerId)
    {
        var tickets = await _ticketService.GetByCustomerIdAsync(customerId);
        return Ok(tickets);
    }

    [HttpGet("status/{status}")]
    [RequirePermission("tickets.view")]
    public async Task<ActionResult<List<TicketDto>>> GetByStatus(TicketStatus status)
    {
        var tickets = await _ticketService.GetByStatusAsync(status);
        return Ok(tickets);
    }

    /// <summary>
    /// Gets all tickets linked to a specific conversation.
    /// </summary>
    [HttpGet("conversation/{conversationId}")]
    [RequirePermission("tickets.view")]
    public async Task<ActionResult<List<TicketDto>>> GetByConversation(Guid conversationId)
    {
        var tickets = await _ticketService.GetByConversationIdAsync(conversationId);
        return Ok(tickets);
    }
}
