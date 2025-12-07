using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/voice-client")]
public class VoiceClientController : ControllerBase
{
    private readonly ITwilioVoiceService _twilioVoiceService;
    private readonly ILogger<VoiceClientController> _logger;

    public VoiceClientController(
        ITwilioVoiceService twilioVoiceService,
        ILogger<VoiceClientController> logger)
    {
        _twilioVoiceService = twilioVoiceService;
        _logger = logger;
    }

    /// <summary>
    /// Generate a Twilio access token for WebRTC voice client
    /// </summary>
    [HttpGet("token")]
    public IActionResult GetToken([FromQuery] string identity)
    {
        if (string.IsNullOrWhiteSpace(identity))
        {
            return BadRequest(new { message = "Identity is required" });
        }

        try
        {
            var token = _twilioVoiceService.GenerateAccessToken(identity);

            _logger.LogInformation("Generated voice client token for identity: {Identity}", identity);

            return Ok(new
            {
                identity = identity,
                token = token
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating voice client token for identity: {Identity}", identity);
            return StatusCode(500, new { message = "Failed to generate token" });
        }
    }
}
