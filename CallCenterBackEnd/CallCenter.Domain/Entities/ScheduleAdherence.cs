namespace CallCenter.Domain.Entities;

public class ScheduleAdherence
{
    public Guid Id { get; set; }
    public Guid AgentId { get; set; }
    public DateOnly Date { get; set; }
    public string? ScheduledActivity { get; set; }
    public string? ActualActivity { get; set; }
    public TimeSpan ScheduledStart { get; set; }
    public TimeSpan ActualStart { get; set; }
    public int ScheduledMinutes { get; set; }
    public int ActualMinutes { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public virtual Agent Agent { get; set; } = null!;
}
