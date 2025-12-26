using System.Security.Claims;
using CallCenter.API.Authorization;
using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Customers;
using CallCenter.Application.Services;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;
    private readonly IRepository<CustomerNote> _noteRepository;
    private readonly IRepository<Agent> _agentRepository;

    public CustomersController(
        ICustomerService customerService,
        IRepository<CustomerNote> noteRepository,
        IRepository<Agent> agentRepository)
    {
        _customerService = customerService;
        _noteRepository = noteRepository;
        _agentRepository = agentRepository;
    }

    [HttpGet]
    [RequirePermission("customers.view")]
    public async Task<ActionResult<PagedResponse<CustomerDto>>> GetCustomers(
        [FromQuery] PagedRequest request,
        [FromQuery] string? search = null)
    {
        var result = await _customerService.GetCustomersAsync(request, search);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [RequirePermission("customers.view")]
    public async Task<ActionResult<CustomerDetailDto>> GetCustomer(Guid id)
    {
        var customer = await _customerService.GetCustomerByIdAsync(id);
        if (customer == null) return NotFound();
        return Ok(customer);
    }

    [HttpPost]
    [RequirePermission("customers.create")]
    public async Task<ActionResult<CustomerDto>> CreateCustomer(CreateCustomerRequest request)
    {
        var customer = await _customerService.CreateCustomerAsync(request);
        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    [HttpPut("{id}")]
    [RequirePermission("customers.edit")]
    public async Task<ActionResult<CustomerDto>> UpdateCustomer(Guid id, UpdateCustomerRequest request)
    {
        var customer = await _customerService.UpdateCustomerAsync(id, request);
        if (customer == null) return NotFound();
        return Ok(customer);
    }

    [HttpDelete("{id}")]
    [RequirePermission("customers.delete")]
    public async Task<ActionResult> DeleteCustomer(Guid id)
    {
        var result = await _customerService.DeleteCustomerAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("phone/{phone}")]
    [RequirePermission("customers.view")]
    public async Task<ActionResult<CustomerDto>> GetByPhone(string phone)
    {
        var customer = await _customerService.GetByPhoneAsync(phone);
        if (customer == null) return NotFound();
        return Ok(customer);
    }

    [HttpGet("email/{email}")]
    [RequirePermission("customers.view")]
    public async Task<ActionResult<CustomerDto>> GetByEmail(string email)
    {
        var customer = await _customerService.GetByEmailAsync(email);
        if (customer == null) return NotFound();
        return Ok(customer);
    }

    [HttpGet("{id}/stats")]
    [RequirePermission("customers.view")]
    public async Task<ActionResult<CustomerStatsDto>> GetCustomerStats(Guid id)
    {
        // First verify customer exists
        var customer = await _customerService.GetCustomerByIdAsync(id);
        if (customer == null) return NotFound();

        var stats = await _customerService.GetCustomerStatsAsync(id);
        return Ok(stats);
    }

    // Customer Notes endpoints

    [HttpGet("{customerId}/notes")]
    [RequirePermission("customers.view")]
    public async Task<ActionResult<List<CustomerNoteDto>>> GetCustomerNotes(Guid customerId)
    {
        var notes = await _noteRepository.GetQueryable()
            .Where(n => n.CustomerId == customerId)
            .Include(n => n.Agent)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        var noteDtos = notes.Select(n => new CustomerNoteDto
        {
            Id = n.Id.ToString(),
            CustomerId = n.CustomerId.ToString(),
            Content = n.Note,
            Category = n.IsImportant ? "important" : "general",
            AuthorId = n.AgentId.ToString(),
            AuthorName = n.Agent?.Name ?? "Unknown",
            CreatedAt = n.CreatedAt.ToString("o"),
            UpdatedAt = n.CreatedAt.ToString("o"),
        }).ToList();

        return Ok(noteDtos);
    }

    [HttpPost("{customerId}/notes")]
    [RequirePermission("customers.edit")]
    public async Task<ActionResult<CustomerNoteDto>> CreateCustomerNote(Guid customerId, [FromBody] CreateCustomerNoteRequest request)
    {
        var userId = GetCurrentUserId();

        var note = new CustomerNote
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId,
            AgentId = userId,
            Note = request.Content,
            IsImportant = request.Category == "important",
            CreatedAt = DateTime.UtcNow,
        };

        await _noteRepository.AddAsync(note);
        await _noteRepository.SaveChangesAsync();

        // Get agent name
        var agent = await _agentRepository.GetQueryable().FirstOrDefaultAsync(a => a.Id == userId);

        return CreatedAtAction(nameof(GetCustomerNotes), new { customerId }, new CustomerNoteDto
        {
            Id = note.Id.ToString(),
            CustomerId = note.CustomerId.ToString(),
            Content = note.Note,
            Category = note.IsImportant ? "important" : request.Category ?? "general",
            AuthorId = note.AgentId.ToString(),
            AuthorName = agent?.Name ?? "Unknown",
            CreatedAt = note.CreatedAt.ToString("o"),
            UpdatedAt = note.CreatedAt.ToString("o"),
        });
    }

    [HttpPut("{customerId}/notes/{noteId}")]
    [RequirePermission("customers.edit")]
    public async Task<ActionResult<CustomerNoteDto>> UpdateCustomerNote(
        Guid customerId,
        Guid noteId,
        [FromBody] UpdateCustomerNoteRequest request)
    {
        var note = await _noteRepository.GetQueryable()
            .Include(n => n.Agent)
            .FirstOrDefaultAsync(n => n.Id == noteId && n.CustomerId == customerId);

        if (note == null) return NotFound();

        note.Note = request.Content;
        note.IsImportant = request.Category == "important";

        _noteRepository.Update(note);
        await _noteRepository.SaveChangesAsync();

        return Ok(new CustomerNoteDto
        {
            Id = note.Id.ToString(),
            CustomerId = note.CustomerId.ToString(),
            Content = note.Note,
            Category = note.IsImportant ? "important" : request.Category ?? "general",
            AuthorId = note.AgentId.ToString(),
            AuthorName = note.Agent?.Name ?? "Unknown",
            CreatedAt = note.CreatedAt.ToString("o"),
            UpdatedAt = DateTime.UtcNow.ToString("o"),
        });
    }

    [HttpDelete("{customerId}/notes/{noteId}")]
    [RequirePermission("customers.edit")]
    public async Task<ActionResult> DeleteCustomerNote(Guid customerId, Guid noteId)
    {
        var note = await _noteRepository.GetQueryable()
            .FirstOrDefaultAsync(n => n.Id == noteId && n.CustomerId == customerId);

        if (note == null) return NotFound();

        _noteRepository.DeleteAsync(note);
        await _noteRepository.SaveChangesAsync();

        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}

public class CustomerNoteDto
{
    public string Id { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string AuthorId { get; set; } = string.Empty;
    public string? AuthorName { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
}

public class CreateCustomerNoteRequest
{
    public string Content { get; set; } = string.Empty;
    public string? Category { get; set; }
}

public class UpdateCustomerNoteRequest
{
    public string Content { get; set; } = string.Empty;
    public string? Category { get; set; }
}
