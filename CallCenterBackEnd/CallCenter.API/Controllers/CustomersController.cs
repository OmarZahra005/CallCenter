using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Customers;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<CustomerDto>>> GetCustomers(
        [FromQuery] PagedRequest request,
        [FromQuery] string? search = null)
    {
        var result = await _customerService.GetCustomersAsync(request, search);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDetailDto>> GetCustomer(Guid id)
    {
        var customer = await _customerService.GetCustomerByIdAsync(id);
        if (customer == null) return NotFound();
        return Ok(customer);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> CreateCustomer(CreateCustomerRequest request)
    {
        var customer = await _customerService.CreateCustomerAsync(request);
        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CustomerDto>> UpdateCustomer(Guid id, UpdateCustomerRequest request)
    {
        var customer = await _customerService.UpdateCustomerAsync(id, request);
        if (customer == null) return NotFound();
        return Ok(customer);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCustomer(Guid id)
    {
        var result = await _customerService.DeleteCustomerAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("phone/{phone}")]
    public async Task<ActionResult<CustomerDto>> GetByPhone(string phone)
    {
        var customer = await _customerService.GetByPhoneAsync(phone);
        if (customer == null) return NotFound();
        return Ok(customer);
    }

    [HttpGet("email/{email}")]
    public async Task<ActionResult<CustomerDto>> GetByEmail(string email)
    {
        var customer = await _customerService.GetByEmailAsync(email);
        if (customer == null) return NotFound();
        return Ok(customer);
    }
}
