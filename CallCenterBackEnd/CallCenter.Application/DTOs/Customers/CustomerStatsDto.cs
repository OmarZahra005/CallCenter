namespace CallCenter.Application.DTOs.Customers;

public class CustomerStatsDto
{
    public int TotalCalls { get; set; }
    public int TotalTickets { get; set; }
    public int OpenTickets { get; set; }
    public DateTime? LastInteractionDate { get; set; }
    public int TotalConversations { get; set; }
    public double? AvgCallDurationSeconds { get; set; }
    public int ResolvedTickets { get; set; }
    public int TotalMessages { get; set; }
}
