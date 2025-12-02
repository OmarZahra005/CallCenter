using CallCenter.Application.DTOs.WhatsApp;
using CallCenter.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/whatsapp")]
public class WhatsAppWebhookController : ControllerBase
{
    private readonly IWhatsAppService _whatsAppService;
    private readonly WhatsAppOptions _options;
    private readonly ILogger<WhatsAppWebhookController> _logger;

    public WhatsAppWebhookController(
        IWhatsAppService whatsAppService,
        IOptions<WhatsAppOptions> options,
        ILogger<WhatsAppWebhookController> logger)
    {
        _whatsAppService = whatsAppService;
        _options = options.Value;
        _logger = logger;
    }

    /// <summary>
    /// Webhook verification endpoint for Meta
    /// </summary>
    [HttpGet("webhook")]
    public IActionResult VerifyWebhook(
        [FromQuery(Name = "hub.mode")] string mode,
        [FromQuery(Name = "hub.verify_token")] string verifyToken,
        [FromQuery(Name = "hub.challenge")] string challenge)
    {
        _logger.LogInformation("Webhook verification request received");

        if (mode == "subscribe" && verifyToken == _options.WebhookVerifyToken)
        {
            _logger.LogInformation("Webhook verified successfully");
            return Ok(challenge);
        }

        _logger.LogWarning("Webhook verification failed");
        return Unauthorized();
    }

    /// <summary>
    /// Receive incoming WhatsApp messages
    /// </summary>
    [HttpPost("webhook")]
    public async Task<IActionResult> ReceiveMessage([FromBody] WhatsAppWebhookPayload payload)
    {
        try
        {
            // Verify signature (optional but recommended)
            var signature = Request.Headers["X-Hub-Signature-256"].FirstOrDefault();
            if (!string.IsNullOrEmpty(signature))
            {
                using var reader = new StreamReader(Request.Body);
                var body = await reader.ReadToEndAsync();
                if (!_whatsAppService.VerifyWebhookSignature(signature, body))
                {
                    _logger.LogWarning("Invalid webhook signature");
                    return Unauthorized();
                }
            }

            // Process messages
            if (payload.Entry.Any(e => e.Changes.Any(c => c.Value.Messages?.Any() == true)))
            {
                await _whatsAppService.ProcessIncomingMessageAsync(payload);
            }

            // Process status updates
            if (payload.Entry.Any(e => e.Changes.Any(c => c.Value.Statuses?.Any() == true)))
            {
                await _whatsAppService.ProcessStatusUpdateAsync(payload);
            }

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing WhatsApp webhook");
            return Ok(); // Always return 200 to prevent retries
        }
    }

    /// <summary>
    /// Test endpoint to send a WhatsApp message
    /// </summary>
    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] SendWhatsAppMessageRequest request)
    {
        var result = await _whatsAppService.SendTextMessageAsync(request.PhoneNumber, request.Message);

        if (result)
            return Ok(new { success = true, message = "Message sent" });

        return BadRequest(new { success = false, message = "Failed to send message" });
    }
}

public class SendWhatsAppMessageRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
