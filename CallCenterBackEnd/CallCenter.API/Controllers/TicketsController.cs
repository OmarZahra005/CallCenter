using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Tickets;
using CallCenter.Application.Services;
using CallCenter.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<TicketDto>>> GetTickets(
        [FromQuery] PagedRequest request,
        [FromQuery] Guid? agentId = null,
        [FromQuery] TicketStatus? status = null)
    {
        var result = await _ticketService.GetTicketsAsync(request, agentId, status);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketDetailDto>> GetTicket(Guid id)
    {
        var ticket = await _ticketService.GetTicketByIdAsync(id);
        if (ticket == null) return NotFound();
        return Ok(ticket);
    }

    [HttpPost]
    public async Task<ActionResult<TicketDto>> CreateTicket(CreateTicketRequest request)
    {
        var ticket = await _ticketService.CreateTicketAsync(request);
        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TicketDto>> UpdateTicket(Guid id, UpdateTicketRequest request)
    {
        var ticket = await _ticketService.UpdateTicketAsync(id, request);
        if (ticket == null) return NotFound();
        return Ok(ticket);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTicket(Guid id)
    {
        var result = await _ticketService.DeleteTicketAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPut("{id}/assign")]
    public async Task<ActionResult<TicketDto>> AssignTicket(Guid id, AssignTicketRequest request)
    {
        var ticket = await _ticketService.AssignTicketAsync(id, request);
        if (ticket == null) return NotFound();
        return Ok(ticket);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<List<TicketDto>>> GetByCustomer(Guid customerId)
    {
        var tickets = await _ticketService.GetByCustomerIdAsync(customerId);
        return Ok(tickets);
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<List<TicketDto>>> GetByStatus(TicketStatus status)
    {
        var tickets = await _ticketService.GetByStatusAsync(status);
        return Ok(tickets);
    }
}
