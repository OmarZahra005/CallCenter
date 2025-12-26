using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using CallCenter.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CallCenter.Application.Services;

public class SmartBotWebhookService : ISmartBotWebhookService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmartBotWebhookService> _logger;
    private readonly string? _webhookBaseUrl;
    private readonly string? _webhookSecret;

    public SmartBotWebhookService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<SmartBotWebhookService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        _webhookBaseUrl = configuration["SmartBotIntegration:WebhookUrl"];
        _webhookSecret = configuration["SmartBotIntegration:WebhookSecret"];
    }

    public async Task<bool> NotifyAgentAssignedAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        string callCenterTicketId,
        string agentId,
        string agentName,
        string? agentEmail = null)
    {
        // Match the AgentAssignedWebhook DTO format expected by SmartBot
        var payload = new
        {
            EventType = "agent_assigned",
            EscalationId = Guid.TryParse(smartBotEscalationId, out var escId) ? escId : Guid.Empty,
            SmartBotConversationId = smartBotConversationId,
            CallCenterTicketId = callCenterTicketId,
            Agent = new
            {
                AgentId = Guid.TryParse(agentId, out var parsedId) ? parsedId : Guid.Empty,
                Name = agentName,
                Email = agentEmail
            },
            Timestamp = DateTime.UtcNow
        };

        return await SendWebhookAsync("agent-assigned", payload);
    }

    public async Task<bool> SendAgentMessageAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        string message,
        string agentId,
        string agentName)
    {
        // Match the AgentMessageWebhook DTO format expected by SmartBot
        var payload = new
        {
            EventType = "agent_message",
            EscalationId = smartBotEscalationId,
            SmartBotConversationId = smartBotConversationId,
            MessageId = Guid.NewGuid(),
            Content = message,
            Agent = new
            {
                AgentId = Guid.TryParse(agentId, out var parsedId) ? parsedId : Guid.Empty,
                Name = agentName
            },
            Timestamp = DateTime.UtcNow
        };

        return await SendWebhookAsync("message", payload);
    }

    public async Task<bool> NotifyStatusChangedAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        string oldStatus,
        string newStatus,
        string? reason = null,
        string? agentId = null,
        string? agentName = null)
    {
        // Match the StatusChangedWebhook DTO format expected by SmartBot
        var payload = new
        {
            EventType = "status_changed",
            EscalationId = Guid.TryParse(smartBotEscalationId, out var escId) ? escId : Guid.Empty,
            SmartBotConversationId = smartBotConversationId,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            Reason = reason,
            Timestamp = DateTime.UtcNow
        };

        return await SendWebhookAsync("status-changed", payload);
    }

    public async Task<bool> NotifyResolvedAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        string resolution,
        string? notes = null,
        string? agentId = null,
        string? agentName = null)
    {
        // Match the EscalationResolvedWebhook DTO format expected by SmartBot
        var payload = new
        {
            EventType = "escalation_resolved",
            EscalationId = Guid.TryParse(smartBotEscalationId, out var escId) ? escId : Guid.Empty,
            SmartBotConversationId = smartBotConversationId,
            Resolution = resolution,
            ResolutionNotes = notes,
            ResolvedByAgent = agentId != null ? new
            {
                AgentId = Guid.TryParse(agentId, out var parsedId) ? parsedId : Guid.Empty,
                Name = agentName ?? "Agent"
            } : null,
            Timestamp = DateTime.UtcNow
        };

        return await SendWebhookAsync("resolved", payload);
    }

    public async Task<bool> NotifyQueueUpdateAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        int position,
        int? estimatedWaitSeconds = null)
    {
        // Match the QueuePositionWebhook DTO format expected by SmartBot
        var payload = new
        {
            EventType = "queue_position_updated",
            EscalationId = Guid.TryParse(smartBotEscalationId, out var escId) ? escId : Guid.Empty,
            SmartBotConversationId = smartBotConversationId,
            QueuePosition = position,
            EstimatedWaitTimeSeconds = estimatedWaitSeconds ?? 0,
            Timestamp = DateTime.UtcNow
        };

        return await SendWebhookAsync("queue-position", payload);
    }

    public async Task<bool> SendTypingIndicatorAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        bool isTyping)
    {
        var payload = new
        {
            SmartBotConversationId = smartBotConversationId,
            SmartBotEscalationId = smartBotEscalationId,
            IsTyping = isTyping
        };

        return await SendWebhookAsync("agent-typing", payload);
    }

    public async Task<bool> NotifyAgentDisconnectedAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        string agentId,
        string agentName,
        string reason,
        bool willRequeue = false)
    {
        var payload = new
        {
            EventType = "agent_disconnected",
            EscalationId = Guid.TryParse(smartBotEscalationId, out var escId) ? escId : Guid.Empty,
            SmartBotConversationId = smartBotConversationId,
            Agent = new
            {
                AgentId = Guid.TryParse(agentId, out var parsedId) ? parsedId : Guid.Empty,
                Name = agentName
            },
            Reason = reason,
            WillRequeue = willRequeue,
            Timestamp = DateTime.UtcNow
        };

        return await SendWebhookAsync("agent-disconnected", payload);
    }

    public async Task<bool> NotifyNoAgentsAvailableAsync(
        string smartBotConversationId,
        string smartBotEscalationId,
        int? queuePosition = null,
        int? estimatedWaitSeconds = null)
    {
        var payload = new
        {
            EventType = "no_agents_available",
            EscalationId = Guid.TryParse(smartBotEscalationId, out var escId) ? escId : Guid.Empty,
            SmartBotConversationId = smartBotConversationId,
            QueuePosition = queuePosition,
            EstimatedWaitTimeSeconds = estimatedWaitSeconds,
            Timestamp = DateTime.UtcNow
        };

        return await SendWebhookAsync("no-agents-available", payload);
    }

    public async Task<bool> HealthCheckAsync(string smartBotWebhookUrl)
    {
        try
        {
            var url = smartBotWebhookUrl.TrimEnd('/') + "/api/webhooks/callcenter/health";
            var response = await _httpClient.GetAsync(url);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "SmartBot webhook health check failed");
            return false;
        }
    }

    #region Private Methods

    private async Task<bool> SendWebhookAsync<T>(string endpoint, T payload)
    {
        if (string.IsNullOrEmpty(_webhookBaseUrl))
        {
            _logger.LogWarning("SmartBot webhook URL not configured, skipping webhook: {Endpoint}", endpoint);
            return false;
        }

        try
        {
            var url = _webhookBaseUrl.TrimEnd('/') + "/api/webhooks/callcenter/" + endpoint;
            var json = JsonSerializer.Serialize(payload);

            _logger.LogInformation(
                ">>> SENDING webhook to SmartBot: URL={Url}, Payload={Payload}",
                url, json);

            // Add signature headers
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var signature = GenerateSignature(json, timestamp);

            var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };

            request.Headers.Add("X-Webhook-Signature", signature);
            request.Headers.Add("X-Webhook-Timestamp", timestamp.ToString());

            var response = await _httpClient.SendAsync(request);

            _logger.LogInformation(
                ">>> Webhook response: Endpoint={Endpoint}, StatusCode={StatusCode}",
                endpoint, response.StatusCode);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Webhook sent successfully: {Endpoint}", endpoint);
                return true;
            }

            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogWarning(
                "SmartBot webhook failed: {Endpoint}, Status: {StatusCode}, Response: {Response}",
                endpoint, response.StatusCode, errorContent);

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send webhook to SmartBot: {Endpoint}", endpoint);
            return false;
        }
    }

    private string GenerateSignature(string payload, long timestamp)
    {
        if (string.IsNullOrEmpty(_webhookSecret))
        {
            return string.Empty;
        }

        var signedPayload = $"{timestamp}.{payload}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_webhookSecret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(signedPayload));
        return Convert.ToBase64String(hash);
    }

    #endregion
}
