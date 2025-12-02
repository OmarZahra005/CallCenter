namespace CallCenter.Application.DTOs.Queues;

public class QueueDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Priority { get; set; }
    public int MaxWaitTimeSeconds { get; set; }
    public Guid? TeamId { get; set; }
    public string? TeamName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateQueueRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Priority { get; set; } = 5;
    public int MaxWaitTimeSeconds { get; set; } = 300;
    public Guid? TeamId { get; set; }
}

public class UpdateQueueRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Priority { get; set; }
    public int MaxWaitTimeSeconds { get; set; }
    public Guid? TeamId { get; set; }
    public bool IsActive { get; set; }
}
