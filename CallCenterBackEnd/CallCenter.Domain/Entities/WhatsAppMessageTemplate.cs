namespace CallCenter.Domain.Entities;

public class WhatsAppMessageTemplate
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = "UTILITY"; // MARKETING, UTILITY, AUTHENTICATION
    public string Language { get; set; } = "en";
    public string Status { get; set; } = "PENDING"; // APPROVED, PENDING, REJECTED
    public string Components { get; set; } = "[]"; // JSON array of components
    public int UsageCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastUsedAt { get; set; }
    public string? MetaTemplateId { get; set; } // Template ID from Meta/Facebook
}
