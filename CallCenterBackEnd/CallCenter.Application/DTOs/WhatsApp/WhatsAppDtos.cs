namespace CallCenter.Application.DTOs.WhatsApp;

// Configuration options
public class WhatsAppOptions
{
    public bool UseMockData { get; set; } = true;
    public string PhoneNumberId { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string WebhookVerifyToken { get; set; } = string.Empty;
    public string BusinessAccountId { get; set; } = string.Empty;
    public string ApiVersion { get; set; } = "v17.0";
}

// Webhook payload from Meta
public class WhatsAppWebhookPayload
{
    public string Object { get; set; } = string.Empty;
    public List<WhatsAppEntry> Entry { get; set; } = new();
}

public class WhatsAppEntry
{
    public string Id { get; set; } = string.Empty;
    public List<WhatsAppChange> Changes { get; set; } = new();
}

public class WhatsAppChange
{
    public WhatsAppValue Value { get; set; } = new();
    public string Field { get; set; } = string.Empty;
}

public class WhatsAppValue
{
    public string MessagingProduct { get; set; } = string.Empty;
    public WhatsAppMetadata Metadata { get; set; } = new();
    public List<WhatsAppContact> Contacts { get; set; } = new();
    public List<WhatsAppIncomingMessage> Messages { get; set; } = new();
    public List<WhatsAppStatus> Statuses { get; set; } = new();
}

public class WhatsAppMetadata
{
    public string DisplayPhoneNumber { get; set; } = string.Empty;
    public string PhoneNumberId { get; set; } = string.Empty;
}

public class WhatsAppContact
{
    public WhatsAppProfile Profile { get; set; } = new();
    public string WaId { get; set; } = string.Empty;
}

public class WhatsAppProfile
{
    public string Name { get; set; } = string.Empty;
}

public class WhatsAppIncomingMessage
{
    public string From { get; set; } = string.Empty;
    public string Id { get; set; } = string.Empty;
    public string Timestamp { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public WhatsAppTextContent? Text { get; set; }
    public WhatsAppImageContent? Image { get; set; }
    public WhatsAppDocumentContent? Document { get; set; }
}

public class WhatsAppTextContent
{
    public string Body { get; set; } = string.Empty;
}

public class WhatsAppImageContent
{
    public string Id { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public string Sha256 { get; set; } = string.Empty;
    public string? Caption { get; set; }
}

public class WhatsAppDocumentContent
{
    public string Id { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public string Sha256 { get; set; } = string.Empty;
    public string Filename { get; set; } = string.Empty;
    public string? Caption { get; set; }
}

public class WhatsAppStatus
{
    public string Id { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Timestamp { get; set; } = string.Empty;
    public string RecipientId { get; set; } = string.Empty;
}

// Outbound message request
public class WhatsAppSendMessageRequest
{
    public string MessagingProduct { get; set; } = "whatsapp";
    public string RecipientType { get; set; } = "individual";
    public string To { get; set; } = string.Empty;
    public string Type { get; set; } = "text";
    public WhatsAppTextContent? Text { get; set; }
    public WhatsAppMediaContent? Image { get; set; }
    public WhatsAppMediaContent? Document { get; set; }
}

public class WhatsAppMediaContent
{
    public string? Id { get; set; }
    public string? Link { get; set; }
    public string? Caption { get; set; }
    public string? Filename { get; set; }
}

// API Response
public class WhatsAppSendMessageResponse
{
    public string MessagingProduct { get; set; } = string.Empty;
    public List<WhatsAppMessageContact> Contacts { get; set; } = new();
    public List<WhatsAppSentMessage> Messages { get; set; } = new();
}

public class WhatsAppMessageContact
{
    public string Input { get; set; } = string.Empty;
    public string WaId { get; set; } = string.Empty;
}

public class WhatsAppSentMessage
{
    public string Id { get; set; } = string.Empty;
}
