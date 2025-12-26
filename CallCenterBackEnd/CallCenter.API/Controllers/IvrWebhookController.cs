using CallCenter.Application.DTOs.Ivr;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

/// <summary>
/// Handles Twilio webhooks for IVR interactions
/// </summary>
[ApiController]
[Route("api/ivr/webhook")]
public class IvrWebhookController : ControllerBase
{
    private readonly IIvrService _ivrService;
    private readonly ITwilioVoiceService _twilioVoiceService;
    private readonly ILogger<IvrWebhookController> _logger;

    public IvrWebhookController(
        IIvrService ivrService,
        ITwilioVoiceService twilioVoiceService,
        ILogger<IvrWebhookController> logger)
    {
        _ivrService = ivrService;
        _twilioVoiceService = twilioVoiceService;
        _logger = logger;
    }

    /// <summary>
    /// Entry point for IVR - called when an incoming call should go through IVR
    /// </summary>
    [HttpPost("entry")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> Entry()
    {
        try
        {
            // Validate Twilio signature
            if (!await ValidateTwilioSignatureAsync())
            {
                _logger.LogWarning("Invalid Twilio signature for IVR entry");
                return Unauthorized("Invalid signature");
            }

            var callSid = Request.Form["CallSid"].ToString();
            var from = Request.Form["From"].ToString();
            var to = Request.Form["To"].ToString();

            _logger.LogInformation("IVR Entry - CallSid: {CallSid}, From: {From}, To: {To}", callSid, from, to);

            var request = new IvrTwimlRequest
            {
                CallSid = callSid,
                From = from,
                To = to
            };

            var response = await _ivrService.GenerateEntryTwimlAsync(request);

            _logger.LogInformation("IVR Entry Response for {CallSid} - SessionId: {SessionId}", callSid, response.SessionId);

            return Content(response.Twiml, "application/xml");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in IVR entry webhook");
            return Content(GenerateErrorTwiml(), "application/xml");
        }
    }

    /// <summary>
    /// Handle DTMF input from caller
    /// </summary>
    [HttpPost("dtmf")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> HandleDtmf([FromQuery] Guid sessionId)
    {
        try
        {
            // Validate Twilio signature
            if (!await ValidateTwilioSignatureAsync())
            {
                _logger.LogWarning("Invalid Twilio signature for DTMF webhook");
                return Unauthorized("Invalid signature");
            }

            var callSid = Request.Form["CallSid"].ToString();
            var digits = Request.Form["Digits"].ToString();

            _logger.LogInformation("DTMF Input - CallSid: {CallSid}, SessionId: {SessionId}, Digits: {Digits}",
                callSid, sessionId, digits);

            var request = new IvrTwimlRequest
            {
                CallSid = callSid,
                Digits = digits
            };

            var response = await _ivrService.ProcessDtmfInputAsync(request);

            _logger.LogInformation("DTMF Response for {CallSid} - CurrentNodeId: {NodeId}, Outcome: {Outcome}",
                callSid, response.CurrentNodeId, response.Outcome);

            return Content(response.Twiml, "application/xml");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing DTMF input");
            return Content(GenerateErrorTwiml(), "application/xml");
        }
    }

    /// <summary>
    /// Handle timeout (no input received)
    /// </summary>
    [HttpPost("timeout")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> HandleTimeout([FromQuery] Guid sessionId)
    {
        try
        {
            // Validate Twilio signature
            if (!await ValidateTwilioSignatureAsync())
            {
                _logger.LogWarning("Invalid Twilio signature for timeout webhook");
                return Unauthorized("Invalid signature");
            }

            var callSid = Request.Form["CallSid"].ToString();

            _logger.LogInformation("Timeout - CallSid: {CallSid}, SessionId: {SessionId}", callSid, sessionId);

            // Treat timeout as empty digits (will trigger invalid input handling)
            var request = new IvrTwimlRequest
            {
                CallSid = callSid,
                Digits = ""
            };

            var response = await _ivrService.ProcessDtmfInputAsync(request);

            return Content(response.Twiml, "application/xml");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling timeout");
            return Content(GenerateErrorTwiml(), "application/xml");
        }
    }

    /// <summary>
    /// Navigate to next node (used after PlayMessage nodes)
    /// </summary>
    [HttpPost("next")]
    [HttpGet("next")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> NextNode([FromQuery] Guid sessionId, [FromQuery] Guid nodeId)
    {
        try
        {
            var callSid = Request.Form["CallSid"].ToString();

            // Check if this is a GET request (redirect from TwiML)
            if (string.IsNullOrEmpty(callSid) && Request.Query.ContainsKey("CallSid"))
            {
                callSid = Request.Query["CallSid"].ToString();
            }

            _logger.LogInformation("NextNode - CallSid: {CallSid}, SessionId: {SessionId}, NodeId: {NodeId}",
                callSid, sessionId, nodeId);

            // This is essentially a DTMF with no digits - triggers progression to next node
            var request = new IvrTwimlRequest
            {
                CallSid = callSid,
                NodeId = nodeId
            };

            var response = await _ivrService.ProcessDtmfInputAsync(request);

            return Content(response.Twiml, "application/xml");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in next node navigation");
            return Content(GenerateErrorTwiml(), "application/xml");
        }
    }

    /// <summary>
    /// End IVR session (called when transferring out of IVR)
    /// </summary>
    [HttpPost("end")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> EndSession([FromQuery] string outcome = "completed")
    {
        try
        {
            var callSid = Request.Form["CallSid"].ToString();

            _logger.LogInformation("End IVR Session - CallSid: {CallSid}, Outcome: {Outcome}", callSid, outcome);

            await _ivrService.EndSessionAsync(callSid, outcome);

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error ending IVR session");
            return Ok(); // Still return OK to Twilio
        }
    }

    // ==================== Helper Methods ====================

    private async Task<bool> ValidateTwilioSignatureAsync()
    {
        var signature = Request.Headers["X-Twilio-Signature"].ToString();
        var url = $"{Request.Scheme}://{Request.Host}{Request.Path}{Request.QueryString}";
        var parameters = Request.Form.ToDictionary(k => k.Key, v => v.Value.ToString());

        return await _twilioVoiceService.ValidateSignatureAsync(signature, url, parameters);
    }

    private string GenerateErrorTwiml()
    {
        var response = new Twilio.TwiML.VoiceResponse();
        response.Say("We're sorry, we encountered an error processing your request. Please try again later.");
        response.Hangup();
        return response.ToString();
    }
}
