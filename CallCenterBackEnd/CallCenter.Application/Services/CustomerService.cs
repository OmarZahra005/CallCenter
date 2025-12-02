using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Customers;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;

namespace CallCenter.Application.Services;

public interface ICustomerService
{
    Task<PagedResponse<CustomerDto>> GetCustomersAsync(PagedRequest request, string? search = null);
    Task<CustomerDetailDto?> GetCustomerByIdAsync(Guid id);
    Task<CustomerDto> CreateCustomerAsync(CreateCustomerRequest request);
    Task<CustomerDto?> UpdateCustomerAsync(Guid id, UpdateCustomerRequest request);
    Task<bool> DeleteCustomerAsync(Guid id);
    Task<CustomerDto?> GetByPhoneAsync(string phone);
    Task<CustomerDto?> GetByEmailAsync(string email);
}

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _customerRepository;

    public CustomerService(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<PagedResponse<CustomerDto>> GetCustomersAsync(PagedRequest request, string? search = null)
    {
        var customers = await _customerRepository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            search,
            request.SortBy,
            request.SortDescending);

        return new PagedResponse<CustomerDto>
        {
            Items = customers.Items.Select(MapToDto).ToList(),
            PageNumber = customers.CurrentPage,
            PageSize = customers.PageSize,
            TotalCount = customers.TotalCount,
            TotalPages = customers.PageCount
        };
    }

    public async Task<CustomerDetailDto?> GetCustomerByIdAsync(Guid id)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        if (customer == null) return null;

        return new CustomerDetailDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,
            NationalId = customer.NationalId,
            Address = customer.Address,
            Notes = customer.Notes,
            Status = customer.Status,
            Segment = customer.Segment,
            PreferredLanguage = customer.PreferredLanguage,
            CreatedAt = customer.CreatedAt,
            TotalInteractions = customer.Interactions?.Count ?? 0,
            OpenTickets = customer.Tickets?.Count(t => t.Status != TicketStatus.Closed) ?? 0
        };
    }

    public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerRequest request)
    {
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Phone = request.Phone,
            Email = request.Email,
            NationalId = request.NationalId,
            Address = request.Address,
            Notes = request.Notes,
            Status = CustomerStatus.Active,
            Segment = request.Segment,
            PreferredLanguage = request.PreferredLanguage,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _customerRepository.AddAsync(customer);
        await _customerRepository.SaveChangesAsync();
        return MapToDto(customer);
    }

    public async Task<CustomerDto?> UpdateCustomerAsync(Guid id, UpdateCustomerRequest request)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        if (customer == null) return null;

        customer.Name = request.Name;
        customer.Phone = request.Phone;
        customer.Email = request.Email;
        customer.NationalId = request.NationalId;
        customer.Address = request.Address;
        customer.Notes = request.Notes;
        customer.Status = request.Status;
        customer.Segment = request.Segment;
        customer.PreferredLanguage = request.PreferredLanguage;
        customer.UpdatedAt = DateTime.UtcNow;

        _customerRepository.Update(customer);
        await _customerRepository.SaveChangesAsync();
        return MapToDto(customer);
    }

    public async Task<bool> DeleteCustomerAsync(Guid id)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        if (customer == null) return false;

        customer.Status = CustomerStatus.Inactive;
        customer.UpdatedAt = DateTime.UtcNow;
        _customerRepository.Update(customer);
        await _customerRepository.SaveChangesAsync();
        return true;
    }

    public async Task<CustomerDto?> GetByPhoneAsync(string phone)
    {
        var customer = await _customerRepository.GetByPhoneAsync(phone);
        return customer != null ? MapToDto(customer) : null;
    }

    public async Task<CustomerDto?> GetByEmailAsync(string email)
    {
        var customer = await _customerRepository.GetByEmailAsync(email);
        return customer != null ? MapToDto(customer) : null;
    }

    private static CustomerDto MapToDto(Customer customer)
    {
        return new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,
            NationalId = customer.NationalId,
            Status = customer.Status,
            Segment = customer.Segment,
            PreferredLanguage = customer.PreferredLanguage,
            CreatedAt = customer.CreatedAt
        };
    }
}
