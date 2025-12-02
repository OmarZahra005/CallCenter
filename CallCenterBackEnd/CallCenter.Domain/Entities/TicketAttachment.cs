namespace CallCenter.Domain.Entities;

public class TicketAttachment
{
    public Guid Id { get; set; }
    public Guid TicketId { get; set; }
    public Guid? UploadedBy { get; set; }
    public string Filename { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Ticket Ticket { get; set; } = null!;
    public virtual Agent? UploadedByAgent { get; set; }
}
