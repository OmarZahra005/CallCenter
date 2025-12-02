namespace CallCenter.Domain.Entities;

public class DatabaseVersion
{
    public int Id { get; set; }
    public required string Version { get; set; }
    public required string Type { get; set; }
    public DateTime AppliedOn { get; set; }
    public required string Description { get; set; }
}
