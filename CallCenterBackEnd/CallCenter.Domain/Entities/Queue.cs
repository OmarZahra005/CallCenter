namespace CallCenter.Domain.Entities;

public class Queue
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Priority { get; set; } = 5;
    public int MaxWaitTimeSeconds { get; set; } = 300;
    public Guid? TeamId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Team? Team { get; set; }
    public virtual ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();
    public virtual ICollection<QueueMetric> Metrics { get; set; } = new List<QueueMetric>();
}
