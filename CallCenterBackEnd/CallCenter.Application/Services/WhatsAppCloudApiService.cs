using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using CallCenter.Application.DTOs.Conversations;
using CallCenter.Application.DTOs.WhatsApp;
using CallCenter.Application.Interfaces;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CallCenter.Application.Services;

public class WhatsAppCloudApiService : IWhatsAppService
{
    private readonly HttpClient _httpClient;
    private readonly WhatsAppOptions _options;
    private readonly IConversationRepository _conversationRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly ILogger<WhatsAppCloudApiService> _logger;

    public WhatsAppCloudApiService(
        HttpClient httpClient,
        IOptions<WhatsAppOptions> options,
        IConversationRepository conversationRepository,
        ICustomerRepository customerRepository,
        ILogger<WhatsAppCloudApiService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _conversationRepository = conversationRepository;
        _customerRepository = customerRepository;
        _logger = logger;

        _httpClient.BaseAddress = new Uri($"https://graph.facebook.com/{_options.ApiVersion}/");
        _httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _options.AccessToken);
    }

    public async Task<bool> SendTextMessageAsync(string phoneNumber, string message)
    {
        try
        {
            var request = new WhatsAppSendMessageRequest
            {
                To = NormalizePhoneNumber(phoneNumber),
                Type = "text",
                Text = new WhatsAppTextContent { Body = message }
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"{_options.PhoneNumberId}/messages",
                request,
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower });

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("WhatsApp message sent to {PhoneNumber}", phoneNumber);
                return true;
            }

            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError("Failed to send WhatsApp message: {Error}", error);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending WhatsApp message to {PhoneNumber}", phoneNumber);
            return false;
        }
    }

    public async Task<bool> SendImageMessageAsync(string phoneNumber, string imageUrl, string? caption = null)
    {
        try
        {
            var request = new WhatsAppSendMessageRequest
            {
                To = NormalizePhoneNumber(phoneNumber),
                Type = "image",
                Image = new WhatsAppMediaContent { Link = imageUrl, Caption = caption }
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"{_options.PhoneNumberId}/messages",
                request,
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower });

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending WhatsApp image to {PhoneNumber}", phoneNumber);
            return false;
        }
    }

    public async Task<bool> SendDocumentMessageAsync(string phoneNumber, string documentUrl, string filename, string? caption = null)
    {
        try
        {
            var request = new WhatsAppSendMessageRequest
            {
                To = NormalizePhoneNumber(phoneNumber),
                Type = "document",
                Document = new WhatsAppMediaContent { Link = documentUrl, Filename = filename, Caption = caption }
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"{_options.PhoneNumberId}/messages",
                request,
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower });

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending WhatsApp document to {PhoneNumber}", phoneNumber);
            return false;
        }
    }

    public async Task ProcessIncomingMessageAsync(WhatsAppWebhookPayload payload)
    {
        foreach (var entry in payload.Entry)
        {
            foreach (var change in entry.Changes)
            {
                if (change.Value.Messages == null || !change.Value.Messages.Any())
                    continue;

                foreach (var message in change.Value.Messages)
                {
                    await ProcessSingleMessageAsync(message, change.Value.Contacts.FirstOrDefault());
                }
            }
        }
    }

    private async Task ProcessSingleMessageAsync(WhatsAppIncomingMessage message, WhatsAppContact? contact)
    {
        try
        {
            var phoneNumber = message.From;
            var customerName = contact?.Profile.Name ?? phoneNumber;

            // Find or create customer
            var customer = await FindOrCreateCustomerAsync(phoneNumber, customerName);

            // Find active conversation or create new one
            var conversation = await FindOrCreateConversationAsync(customer.Id, phoneNumber);

            // Extract message content
            var messageContent = message.Type switch
            {
                "text" => message.Text?.Body ?? string.Empty,
                "image" => $"[Image] {message.Image?.Caption ?? ""}",
                "document" => $"[Document: {message.Document?.Filename}] {message.Document?.Caption ?? ""}",
                _ => $"[{message.Type}]"
            };

            // Add message to conversation
            var conversationMessage = new ConversationMessage
            {
                Id = Guid.NewGuid(),
                ConversationId = conversation.Id,
                SenderType = SenderType.Customer,
                SenderId = customer.Id,
                Message = messageContent,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            // Handle media URL if present
            if (message.Image != null)
            {
                conversationMessage.MediaUrl = await GetMediaUrlAsync(message.Image.Id);
            }
            else if (message.Document != null)
            {
                conversationMessage.AttachmentUrl = await GetMediaUrlAsync(message.Document.Id);
            }

            conversation.Messages ??= new List<ConversationMessage>();
            conversation.Messages.Add(conversationMessage);

            _conversationRepository.Update(conversation);
            await _conversationRepository.SaveChangesAsync();

            // Notify agents via SignalR (could use NotifyTicketUpdatedAsync or similar)
            // For now, just log - real-time notifications would need a dedicated method

            _logger.LogInformation("Processed WhatsApp message from {PhoneNumber}", phoneNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing WhatsApp message from {PhoneNumber}", message.From);
        }
    }

    private async Task<Customer> FindOrCreateCustomerAsync(string phoneNumber, string name)
    {
        var normalizedPhone = NormalizePhoneNumber(phoneNumber);
        var customer = await _customerRepository.GetByPhoneAsync(normalizedPhone);

        if (customer == null)
        {
            customer = new Customer
            {
                Id = Guid.NewGuid(),
                Name = name,
                Phone = normalizedPhone,
                Status = CustomerStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _customerRepository.AddAsync(customer);
            await _customerRepository.SaveChangesAsync();
            _logger.LogInformation("Created new customer from WhatsApp: {Phone}", normalizedPhone);
        }

        return customer;
    }

    private async Task<Conversation> FindOrCreateConversationAsync(Guid customerId, string phoneNumber)
    {
        // Find active WhatsApp conversation for this customer
        var conversations = await _conversationRepository.GetByCustomerIdAsync(customerId);
        var activeConversation = conversations
            .FirstOrDefault(c => c.Channel == Channel.Whatsapp &&
                                 c.State != ConversationState.Closed &&
                                 c.State != ConversationState.Abandoned);

        if (activeConversation != null)
            return activeConversation;

        // Create new conversation
        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId,
            Channel = Channel.Whatsapp,
            State = ConversationState.Waiting,
            StartTime = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            Messages = new List<ConversationMessage>()
        };

        await _conversationRepository.AddAsync(conversation);
        await _conversationRepository.SaveChangesAsync();

        _logger.LogInformation("Created new WhatsApp conversation for customer {CustomerId}", customerId);
        return conversation;
    }

    private async Task<string?> GetMediaUrlAsync(string mediaId)
    {
        try
        {
            var response = await _httpClient.GetAsync(mediaId);
            if (response.IsSuccessStatusCode)
            {
                var mediaInfo = await response.Content.ReadFromJsonAsync<JsonElement>();
                return mediaInfo.GetProperty("url").GetString();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting media URL for {MediaId}", mediaId);
        }
        return null;
    }

    public async Task ProcessStatusUpdateAsync(WhatsAppWebhookPayload payload)
    {
        foreach (var entry in payload.Entry)
        {
            foreach (var change in entry.Changes)
            {
                if (change.Value.Statuses == null || !change.Value.Statuses.Any())
                    continue;

                foreach (var status in change.Value.Statuses)
                {
                    _logger.LogInformation("WhatsApp message {MessageId} status: {Status}",
                        status.Id, status.Status);
                    // Could update message status in database here
                }
            }
        }
    }

    public bool VerifyWebhookSignature(string signature, string payload)
    {
        if (string.IsNullOrEmpty(_options.AccessToken))
            return true; // Skip verification if no token configured

        try
        {
            var expectedSignature = "sha256=" + ComputeHmacSha256(payload, _options.AccessToken);
            return signature == expectedSignature;
        }
        catch
        {
            return false;
        }
    }

    private static string ComputeHmacSha256(string data, string key)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
    }

    private static string NormalizePhoneNumber(string phone)
    {
        // Remove all non-digit characters except leading +
        var normalized = new string(phone.Where(c => char.IsDigit(c) || c == '+').ToArray());

        // Ensure it starts with country code (no +)
        if (normalized.StartsWith("+"))
            normalized = normalized[1..];

        return normalized;
    }
}
