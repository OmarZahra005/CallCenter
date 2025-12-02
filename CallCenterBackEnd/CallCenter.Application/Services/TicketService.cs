using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Tickets;
using CallCenter.Application.Interfaces;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;

namespace CallCenter.Application.Services;

public interface ITicketService
{
    Task<PagedResponse<TicketDto>> GetTicketsAsync(PagedRequest request, Guid? agentId = null, TicketStatus? status = null);
    Task<TicketDetailDto?> GetTicketByIdAsync(Guid id);
    Task<TicketDto> CreateTicketAsync(CreateTicketRequest request);
    Task<TicketDto?> UpdateTicketAsync(Guid id, UpdateTicketRequest request);
    Task<bool> DeleteTicketAsync(Guid id);
    Task<TicketDto?> AssignTicketAsync(Guid id, AssignTicketRequest request);
    Task<List<TicketDto>> GetByCustomerIdAsync(Guid customerId);
    Task<List<TicketDto>> GetByStatusAsync(TicketStatus status);
}

public class TicketService : ITicketService
{
    private readonly ITicketRepository _ticketRepository;
    private readonly IHubNotificationService _hubNotificationService;

    public TicketService(ITicketRepository ticketRepository, IHubNotificationService hubNotificationService)
    {
        _ticketRepository = ticketRepository;
        _hubNotificationService = hubNotificationService;
    }

    public async Task<PagedResponse<TicketDto>> GetTicketsAsync(PagedRequest request, Guid? agentId = null, TicketStatus? status = null)
    {
        var tickets = await _ticketRepository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            null,
            request.SortBy,
            request.SortDescending);

        var items = tickets.Items.AsEnumerable();

        if (agentId.HasValue)
            items = items.Where(t => t.AgentId == agentId.Value);

        if (status.HasValue)
            items = items.Where(t => t.Status == status.Value);

        return new PagedResponse<TicketDto>
        {
            Items = items.Select(MapToDto).ToList(),
            PageNumber = tickets.CurrentPage,
            PageSize = tickets.PageSize,
            TotalCount = tickets.TotalCount,
            TotalPages = tickets.PageCount
        };
    }

    public async Task<TicketDetailDto?> GetTicketByIdAsync(Guid id)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);
        if (ticket == null) return null;

        return new TicketDetailDto
        {
            Id = ticket.Id,
            TicketNumber = ticket.TicketNumber,
            CustomerId = ticket.CustomerId,
            CustomerName = ticket.Customer?.Name ?? string.Empty,
            AgentId = ticket.AgentId,
            AgentName = ticket.Agent?.Name,
            TeamId = ticket.TeamId,
            TeamName = ticket.Team?.Name,
            Subject = ticket.Subject,
            Description = ticket.Description,
            Category = ticket.Category,
            Subcategory = ticket.Subcategory,
            Resolution = ticket.Resolution,
            Status = ticket.Status,
            Priority = ticket.Priority,
            Source = ticket.Source,
            CreatedAt = ticket.CreatedAt,
            ResolvedAt = ticket.ResolvedAt,
            Notes = ticket.Notes?.Select(n => new TicketNoteDto
            {
                Id = n.Id,
                AgentId = n.AgentId,
                AgentName = n.Agent?.Name ?? string.Empty,
                Message = n.Message,
                IsInternal = n.IsInternal,
                CreatedAt = n.CreatedAt
            }).ToList() ?? new List<TicketNoteDto>(),
            StatusHistory = ticket.StatusHistory?.Select(h => new TicketStatusHistoryDto
            {
                Id = h.Id,
                FromStatus = h.FromStatus,
                ToStatus = h.ToStatus,
                ChangedByName = h.ChangedByAgent?.Name,
                Reason = h.Reason,
                CreatedAt = h.CreatedAt
            }).ToList() ?? new List<TicketStatusHistoryDto>()
        };
    }

    public async Task<TicketDto> CreateTicketAsync(CreateTicketRequest request)
    {
        var ticket = new Ticket
        {
            Id = Guid.NewGuid(),
            TicketNumber = $"TKT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            CustomerId = request.CustomerId,
            TeamId = request.TeamId,
            Subject = request.Subject,
            Description = request.Description,
            Category = request.Category,
            Subcategory = request.Subcategory,
            Status = TicketStatus.New,
            Priority = request.Priority,
            Source = request.Source,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _ticketRepository.AddAsync(ticket);
        await _ticketRepository.SaveChangesAsync();

        var dto = MapToDto(ticket);

        // Notify all clients about the new ticket
        await _hubNotificationService.NotifyNewTicketAsync(dto);

        return dto;
    }

    public async Task<TicketDto?> UpdateTicketAsync(Guid id, UpdateTicketRequest request)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);
        if (ticket == null) return null;

        ticket.AgentId = request.AgentId;
        ticket.TeamId = request.TeamId;
        ticket.Subject = request.Subject;
        ticket.Description = request.Description;
        ticket.Category = request.Category;
        ticket.Subcategory = request.Subcategory;
        ticket.Status = request.Status;
        ticket.Priority = request.Priority;
        ticket.UpdatedAt = DateTime.UtcNow;

        if (request.Status == TicketStatus.Resolved || request.Status == TicketStatus.Closed)
        {
            ticket.ResolvedAt = DateTime.UtcNow;
        }

        _ticketRepository.Update(ticket);
        await _ticketRepository.SaveChangesAsync();

        var dto = MapToDto(ticket);

        // Notify all clients about the ticket update
        await _hubNotificationService.NotifyTicketUpdatedAsync(dto);

        return dto;
    }

    public async Task<bool> DeleteTicketAsync(Guid id)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);
        if (ticket == null) return false;

        _ticketRepository.DeleteAsync(ticket);
        await _ticketRepository.SaveChangesAsync();
        return true;
    }

    public async Task<TicketDto?> AssignTicketAsync(Guid id, AssignTicketRequest request)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);
        if (ticket == null) return null;

        ticket.AgentId = request.AgentId;
        ticket.Status = TicketStatus.Open;
        ticket.UpdatedAt = DateTime.UtcNow;

        _ticketRepository.Update(ticket);
        await _ticketRepository.SaveChangesAsync();

        var dto = MapToDto(ticket);

        // Notify the assigned agent
        if (request.AgentId != Guid.Empty)
        {
            await _hubNotificationService.NotifyTicketAssignedAsync(request.AgentId.ToString(), dto);
        }

        return dto;
    }

    public async Task<List<TicketDto>> GetByCustomerIdAsync(Guid customerId)
    {
        var tickets = await _ticketRepository.GetByCustomerIdAsync(customerId);
        return tickets.Select(MapToDto).ToList();
    }

    public async Task<List<TicketDto>> GetByStatusAsync(TicketStatus status)
    {
        var tickets = await _ticketRepository.GetByStatusAsync(status);
        return tickets.Select(MapToDto).ToList();
    }

    private static TicketDto MapToDto(Ticket ticket)
    {
        return new TicketDto
        {
            Id = ticket.Id,
            TicketNumber = ticket.TicketNumber,
            CustomerId = ticket.CustomerId,
            CustomerName = ticket.Customer?.Name ?? string.Empty,
            AgentId = ticket.AgentId,
            AgentName = ticket.Agent?.Name,
            TeamId = ticket.TeamId,
            TeamName = ticket.Team?.Name,
            Subject = ticket.Subject,
            Category = ticket.Category,
            Status = ticket.Status,
            Priority = ticket.Priority,
            Source = ticket.Source,
            CreatedAt = ticket.CreatedAt,
            ResolvedAt = ticket.ResolvedAt
        };
    }
}
