using CallCenter.Domain.Enums;

namespace CallCenter.Application.DTOs.Customers;

public class CustomerDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? NationalId { get; set; }
    public CustomerStatus Status { get; set; }
    public CustomerSegment? Segment { get; set; }
    public PreferredLanguage PreferredLanguage { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CustomerDetailDto : CustomerDto
{
    public string? Address { get; set; }
    public string? Notes { get; set; }
    public int TotalInteractions { get; set; }
    public int OpenTickets { get; set; }
}

public class CreateCustomerRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? NationalId { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }
    public CustomerSegment? Segment { get; set; }
    public PreferredLanguage PreferredLanguage { get; set; } = PreferredLanguage.Ar;
}

public class UpdateCustomerRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? NationalId { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }
    public CustomerStatus Status { get; set; }
    public CustomerSegment? Segment { get; set; }
    public PreferredLanguage PreferredLanguage { get; set; }
}
