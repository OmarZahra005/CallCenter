using CallCenter.Application.DTOs.WhatsApp;
using CallCenter.Application.Interfaces;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace CallCenter.Application.Services;

public class MockWhatsAppService : IWhatsAppService
{
    private readonly IConversationRepository _conversationRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly ILogger<MockWhatsAppService> _logger;
    private static bool _initialized = false;

    public MockWhatsAppService(
        IConversationRepository conversationRepository,
        ICustomerRepository customerRepository,
        ILogger<MockWhatsAppService> logger)
    {
        _conversationRepository = conversationRepository;
        _customerRepository = customerRepository;
        _logger = logger;
    }

    public async Task InitializeMockDataAsync()
    {
        if (_initialized) return;
        _initialized = true;

        _logger.LogInformation("Initializing mock WhatsApp data...");

        // Create mock customers if they don't exist
        var mockCustomers = new[]
        {
            new { Name = "Ahmed Hassan", Phone = "966501234567", Email = "ahmed@email.com" },
            new { Name = "Sara Ali", Phone = "966509876543", Email = "sara@email.com" },
            new { Name = "Omar Khalid", Phone = "966555123456", Email = "omar@email.com" },
            new { Name = "Fatima Mohamed", Phone = "966501112233", Email = "fatima@email.com" },
            new { Name = "Khalid Abdullah", Phone = "966507778899", Email = "khalid@company.com" }
        };

        foreach (var mockCustomer in mockCustomers)
        {
            var existing = await _customerRepository.GetByPhoneAsync(mockCustomer.Phone);
            if (existing == null)
            {
                var customer = new Customer
                {
                    Id = Guid.NewGuid(),
                    Name = mockCustomer.Name,
                    Phone = mockCustomer.Phone,
                    Email = mockCustomer.Email,
                    Status = CustomerStatus.Active,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _customerRepository.AddAsync(customer);
                await _customerRepository.SaveChangesAsync();

                // Create a WhatsApp conversation for this customer
                var conversation = new Conversation
                {
                    Id = Guid.NewGuid(),
                    CustomerId = customer.Id,
                    Channel = Channel.Whatsapp,
                    State = ConversationState.Active,
                    StartTime = DateTime.UtcNow.AddHours(-2),
                    CreatedAt = DateTime.UtcNow.AddHours(-2),
                    Messages = new List<ConversationMessage>()
                };

                // Add some mock messages
                var messages = GetMockMessages(customer.Name, customer.Id);
                foreach (var msg in messages)
                {
                    msg.ConversationId = conversation.Id;
                    conversation.Messages.Add(msg);
                }

                await _conversationRepository.AddAsync(conversation);
                await _conversationRepository.SaveChangesAsync();

                _logger.LogInformation("Created mock WhatsApp conversation for {CustomerName}", customer.Name);
            }
        }

        _logger.LogInformation("Mock WhatsApp data initialization complete");
    }

    private List<ConversationMessage> GetMockMessages(string customerName, Guid customerId)
    {
        var now = DateTime.UtcNow;
        var messages = new List<ConversationMessage>();

        if (customerName == "Ahmed Hassan")
        {
            messages.AddRange(new[]
            {
                new ConversationMessage
                {
                    Id = Guid.NewGuid(),
                    SenderType = SenderType.Customer,
                    SenderId = null,
                    Message = "Hello, I have a question about my recent order",
                    CreatedAt = now.AddMinutes(-10),
                    IsRead = true
                },
                new ConversationMessage
                {
                    Id = Guid.NewGuid(),
                    SenderType = SenderType.Customer,
                    SenderId = null,
                    Message = "My order number is ORD-2024-1234",
                    CreatedAt = now.AddMinutes(-6),
                    IsRead = true
                },
                new ConversationMessage
                {
                    Id = Guid.NewGuid(),
                    SenderType = SenderType.Customer,
                    SenderId = null,
                    Message = "I need help with my order",
                    CreatedAt = now.AddMinutes(-5),
                    IsRead = false
                }
            });
        }
        else if (customerName == "Sara Ali")
        {
            messages.Add(new ConversationMessage
            {
                Id = Guid.NewGuid(),
                SenderType = SenderType.Customer,
                SenderId = null,
                Message = "When will my delivery arrive? I placed an order 3 days ago.",
                CreatedAt = now.AddMinutes(-30),
                IsRead = false
            });
        }
        else if (customerName == "Omar Khalid")
        {
            messages.AddRange(new[]
            {
                new ConversationMessage
                {
                    Id = Guid.NewGuid(),
                    SenderType = SenderType.Customer,
                    SenderId = null,
                    Message = "Hi, I need to change my delivery address",
                    CreatedAt = now.AddHours(-3),
                    IsRead = true
                },
                new ConversationMessage
                {
                    Id = Guid.NewGuid(),
                    SenderType = SenderType.Customer,
                    SenderId = null,
                    Message = "My new address is 123 New Street, Riyadh",
                    CreatedAt = now.AddHours(-2.2),
                    IsRead = true
                },
                new ConversationMessage
                {
                    Id = Guid.NewGuid(),
                    SenderType = SenderType.Customer,
                    SenderId = null,
                    Message = "Please confirm the update",
                    CreatedAt = now.AddHours(-2),
                    IsRead = true
                }
            });
        }
        else if (customerName == "Fatima Mohamed")
        {
            messages.AddRange(new[]
            {
                new ConversationMessage
                {
                    Id = Guid.NewGuid(),
                    SenderType = SenderType.Customer,
                    SenderId = null,
                    Message = "I want to know about your premium plans",
                    CreatedAt = now.AddHours(-1),
                    IsRead = false
                },
                new ConversationMessage
                {
                    Id = Guid.NewGuid(),
                    SenderType = SenderType.Customer,
                    SenderId = null,
                    Message = "Can you send me the pricing details?",
                    CreatedAt = now.AddMinutes(-45),
                    IsRead = false
                }
            });
        }
        else if (customerName == "Khalid Abdullah")
        {
            messages.Add(new ConversationMessage
            {
                Id = Guid.NewGuid(),
                SenderType = SenderType.Customer,
                SenderId = null,
                Message = "Hello, I'm interested in your enterprise plan for my company",
                CreatedAt = now.AddDays(-1),
                IsRead = false
            });
        }

        return messages;
    }

    public async Task<bool> SendTextMessageAsync(string phoneNumber, string message)
    {
        _logger.LogInformation("[MOCK] Sending WhatsApp message to {PhoneNumber}: {Message}", phoneNumber, message);
        await Task.Delay(100); // Simulate API delay
        return true;
    }

    public async Task<bool> SendImageMessageAsync(string phoneNumber, string imageUrl, string? caption = null)
    {
        _logger.LogInformation("[MOCK] Sending WhatsApp image to {PhoneNumber}: {ImageUrl}", phoneNumber, imageUrl);
        await Task.Delay(100);
        return true;
    }

    public async Task<bool> SendDocumentMessageAsync(string phoneNumber, string documentUrl, string filename, string? caption = null)
    {
        _logger.LogInformation("[MOCK] Sending WhatsApp document to {PhoneNumber}: {Filename}", phoneNumber, filename);
        await Task.Delay(100);
        return true;
    }

    public async Task ProcessIncomingMessageAsync(WhatsAppWebhookPayload payload)
    {
        _logger.LogInformation("[MOCK] Processing incoming WhatsApp message");
        await Task.CompletedTask;
    }

    public async Task ProcessStatusUpdateAsync(WhatsAppWebhookPayload payload)
    {
        _logger.LogInformation("[MOCK] Processing WhatsApp status update");
        await Task.CompletedTask;
    }

    public bool VerifyWebhookSignature(string signature, string payload)
    {
        return true; // Always valid in mock mode
    }
}
