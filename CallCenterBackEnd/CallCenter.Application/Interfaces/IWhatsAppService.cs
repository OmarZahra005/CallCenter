using CallCenter.Application.DTOs.WhatsApp;

namespace CallCenter.Application.Interfaces;

public interface IWhatsAppService
{
    Task<bool> SendTextMessageAsync(string phoneNumber, string message);
    Task<bool> SendImageMessageAsync(string phoneNumber, string imageUrl, string? caption = null);
    Task<bool> SendDocumentMessageAsync(string phoneNumber, string documentUrl, string filename, string? caption = null);
    Task ProcessIncomingMessageAsync(WhatsAppWebhookPayload payload);
    Task ProcessStatusUpdateAsync(WhatsAppWebhookPayload payload);
    bool VerifyWebhookSignature(string signature, string payload);
}
