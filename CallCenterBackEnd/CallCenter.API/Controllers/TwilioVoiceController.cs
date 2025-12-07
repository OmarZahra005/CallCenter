using CallCenter.Application.DTOs.CallLog;
using CallCenter.Application.DTOs.Twilio;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using CallCenter.API.Hubs;
using Twilio.TwiML;
using Twilio.TwiML.Voice;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/twilio/voice")]
public class TwilioVoiceController : ControllerBase
{
    private readonly ITwilioVoiceService _twilioVoiceService;
    private readonly ICallLogService _callLogService;
    private readonly IHubContext<CallCenterHub> _hubContext;
    private readonly ILogger<TwilioVoiceController> _logger;
    private readonly TwilioOptions _twilioOptions;
    private readonly IAgentRoutingService _agentRoutingService;
    private readonly IRecordingStorageService _recordingStorageService;

    public TwilioVoiceController(
        ITwilioVoiceService twilioVoiceService,
        ICallLogService callLogService,
        IHubContext<CallCenterHub> hubContext,
        ILogger<TwilioVoiceController> logger,
        IOptions<TwilioOptions> twilioOptions,
        IAgentRoutingService agentRoutingService,
        IRecordingStorageService recordingStorageService)
    {
        _twilioVoiceService = twilioVoiceService;
        _callLogService = callLogService;
        _hubContext = hubContext;
        _logger = logger;
        _twilioOptions = twilioOptions.Value;
        _agentRoutingService = agentRoutingService;
        _recordingStorageService = recordingStorageService;
    }

    private async System.Threading.Tasks.Task LogToFileAsync(string message)
    {
        try
        {
            var logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Logs");
            Directory.CreateDirectory(logDirectory);

            var logFilePath = Path.Combine(logDirectory, $"TwilioVoice_{DateTime.UtcNow:yyyy-MM-dd}.log");
            var logEntry = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] {message}{Environment.NewLine}";

            await System.IO.File.AppendAllTextAsync(logFilePath, logEntry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write to log file");
        }
        // Ensure all code paths return a value (Task)
        return;
    }

    private string MaskSensitiveData(string data)
    {
        if (string.IsNullOrEmpty(data))
            return "[empty]";

        if (data.Length <= 8)
            return new string('*', data.Length);

        // Show first 4 and last 4 characters
        return $"{data.Substring(0, 4)}...{data.Substring(data.Length - 4)}";
    }

    /// <summary>
    /// Twilio webhook for incoming voice calls
    /// </summary>
    [HttpPost("incoming")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> IncomingCall()
    {
        await LogToFileAsync("=== IncomingCall Method Started ===");

        try
        {
            // Log Twilio configuration (mask sensitive data)
            await LogToFileAsync("--- Twilio Configuration ---");
            await LogToFileAsync($"AccountSid: {MaskSensitiveData(_twilioOptions.AccountSid)}");
            await LogToFileAsync($"ApiKeySid: {MaskSensitiveData(_twilioOptions.ApiKeySid)}");
            await LogToFileAsync($"ApiKeySecret: {MaskSensitiveData(_twilioOptions.ApiKeySecret)}");
            await LogToFileAsync($"VoiceTwimlAppSid: {_twilioOptions.VoiceTwimlAppSid}");
            await LogToFileAsync($"CallerId: {_twilioOptions.CallerId}");
            await LogToFileAsync($"WebhookAuthToken: {MaskSensitiveData(_twilioOptions.WebhookAuthToken)}");
            await LogToFileAsync("--- End Configuration ---");

            // Log request headers
            await LogToFileAsync("--- Request Headers ---");
            foreach (var header in Request.Headers)
            {
                await LogToFileAsync($"{header.Key}: {header.Value}");
            }

            // Log request body
            await LogToFileAsync("--- Request Body ---");
            foreach (var formField in Request.Form)
            {
                await LogToFileAsync($"{formField.Key}: {formField.Value}");
            }
            await LogToFileAsync("--- End Request Data ---");

            // Validate Twilio signature
            var signature = Request.Headers["X-Twilio-Signature"].ToString();
            var url = $"{Request.Scheme}://{Request.Host}{Request.Path}{Request.QueryString}";
            var parameters = Request.Form.ToDictionary(k => k.Key, v => v.Value.ToString());

            _logger.LogInformation("Twilio Signature From Header: {Signature}", signature);
            _logger.LogInformation("Using WebhookAuthToken (first 4 chars): {TokenStart}", _twilioOptions.WebhookAuthToken?.Substring(0, 4));
            _logger.LogInformation("Validation URL: {Url}", url);
            _logger.LogInformation("Form Keys: {Keys}", string.Join(", ", Request.Form.Keys));

            await LogToFileAsync($"Validating signature for URL: {url}");
            await LogToFileAsync($"Twilio Signature: {signature}");
            await LogToFileAsync($"WebhookAuthToken (first 4 chars): {_twilioOptions.WebhookAuthToken?.Substring(0, 4)}");
            await LogToFileAsync($"Form Keys: {string.Join(", ", Request.Form.Keys)}");

            if (!_twilioVoiceService.ValidateSignature(signature, url, parameters))
            {
                _logger.LogWarning("Invalid Twilio signature for incoming call");
                await LogToFileAsync("ERROR: Invalid Twilio signature");
                return Unauthorized("Invalid signature");
            }

            // Extract call parameters
            var callSid = Request.Form["CallSid"].ToString();
            var from = Request.Form["From"].ToString();
            var to = Request.Form["To"].ToString();
            var callStatus = Request.Form["CallStatus"].ToString();

            await LogToFileAsync($"Incoming call - From: {from}, To: {to}, CallSid: {callSid}, Status: {callStatus}");
            _logger.LogInformation("Incoming call from {From} to {To}, CallSid: {CallSid}", from, to, callSid);

            // Create call log in database
            await LogToFileAsync($"Creating call log in database for CallSid: {callSid}");
            var callLog = await _callLogService.CreateIncomingAsync(
                callSid,
                from,
                to,
                "inbound"
            );
            await LogToFileAsync($"Call log created with ID: {callLog.Id}");

            // Map to DTO and broadcast via SignalR
            var callSummary = new CallSummaryDto
            {
                Id = callLog.Id,
                ProviderCallId = callLog.ProviderCallId,
                FromNumber = callLog.FromNumber,
                ToNumber = callLog.ToNumber,
                Direction = callLog.Direction,
                Status = callLog.Status,
                StartedAtUtc = callLog.StartedAtUtc,
                EndedAtUtc = callLog.EndedAtUtc,
                RecordingUrl = callLog.RecordingUrl
            };

            await LogToFileAsync($"Broadcasting CallCreated event via SignalR for CallSid: {callSid}");
            await _hubContext.Clients.All.SendAsync("CallCreated", callSummary);

            // Try to find an available agent using round-robin
            await LogToFileAsync("Selecting available agent for call routing...");
            var selectedAgent = await _agentRoutingService.SelectNextAvailableAgentAsync();

            var response = new VoiceResponse();

            if (selectedAgent != null)
            {
                // Assign call to agent in database
                await _callLogService.AssignToAgentAsync(callSid, selectedAgent.Id, selectedAgent.Email);
                await LogToFileAsync($"Assigned call to agent: {selectedAgent.Name} ({selectedAgent.Email})");

                // Dial the agent's browser using Twilio Client
                var dial = new Dial
                {
                    Timeout = 30,  // Ring for 30 seconds
                    Action = new Uri($"{Request.Scheme}://{Request.Host}/api/twilio/voice/dial-status"),
                    Method = Twilio.Http.HttpMethod.Post,  // Explicitly set POST method
                    Record = Twilio.TwiML.Voice.Dial.RecordEnum.RecordFromAnswerDual,  // Enable dual-channel recording
                    RecordingStatusCallback = new Uri($"{Request.Scheme}://{Request.Host}/api/twilio/voice/recording-status-callback"),
                    RecordingStatusCallbackMethod = Twilio.Http.HttpMethod.Post
                };
                dial.Client(selectedAgent.Email);  // Use email as Twilio Client identity
                response.Append(dial);

                await LogToFileAsync($"Returning TwiML response - dialing agent's browser at {selectedAgent.Email}");

                // Notify the specific agent via SignalR
                await _hubContext.Clients.User(selectedAgent.Id.ToString())
                    .SendAsync("IncomingCall", new { CallSid = callSid, From = from, To = to });
                await LogToFileAsync($"Sent IncomingCall notification to agent {selectedAgent.Id}");
            }
            else
            {
                // No agents available - play message and record voicemail
                await LogToFileAsync("No available agents - routing to voicemail");
                response.Say("All agents are currently busy. Please leave a message after the tone.");

                var record = new Record
                {
                    MaxLength = 60,
                    Action = new Uri($"{Request.Scheme}://{Request.Host}/api/twilio/voice/voicemail")
                };
                response.Append(record);

                await LogToFileAsync("Returning TwiML response - voicemail recording");
            }

            await LogToFileAsync("=== IncomingCall Method Completed Successfully ===");

            return Content(response.ToString(), "application/xml");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing incoming call webhook");
            await LogToFileAsync($"ERROR: Exception in IncomingCall - {ex.Message}");
            await LogToFileAsync($"Stack Trace: {ex.StackTrace}");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Twilio webhook for call status updates
    /// </summary>
    [HttpPost("status-callback")]
    [HttpGet("status-callback")]  // Accept both GET and POST
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> StatusCallback()
    {
        await LogToFileAsync("=== StatusCallback Method Started ===");

        try
        {
            // Log Twilio configuration (mask sensitive data)
            await LogToFileAsync("--- Twilio Configuration ---");
            await LogToFileAsync($"AccountSid: {MaskSensitiveData(_twilioOptions.AccountSid)}");
            await LogToFileAsync($"ApiKeySid: {MaskSensitiveData(_twilioOptions.ApiKeySid)}");
            await LogToFileAsync($"ApiKeySecret: {MaskSensitiveData(_twilioOptions.ApiKeySecret)}");
            await LogToFileAsync($"VoiceTwimlAppSid: {_twilioOptions.VoiceTwimlAppSid}");
            await LogToFileAsync($"CallerId: {_twilioOptions.CallerId}");
            await LogToFileAsync($"WebhookAuthToken: {MaskSensitiveData(_twilioOptions.WebhookAuthToken)}");
            await LogToFileAsync("--- End Configuration ---");

            // Log request headers
            await LogToFileAsync("--- Request Headers ---");
            foreach (var header in Request.Headers)
            {
                await LogToFileAsync($"{header.Key}: {header.Value}");
            }

            // Log request body
            await LogToFileAsync("--- Request Body ---");
            foreach (var formField in Request.Form)
            {
                await LogToFileAsync($"{formField.Key}: {formField.Value}");
            }
            await LogToFileAsync("--- End Request Data ---");

            // Validate Twilio signature
            var signature = Request.Headers["X-Twilio-Signature"].ToString();
            var url = $"{Request.Scheme}://{Request.Host}{Request.Path}{Request.QueryString}";
            var parameters = Request.Form.ToDictionary(k => k.Key, v => v.Value.ToString());

            _logger.LogInformation("Twilio Signature From Header: {Signature}", signature);
            _logger.LogInformation("Using WebhookAuthToken (first 4 chars): {TokenStart}", _twilioOptions.WebhookAuthToken?.Substring(0, 4));
            _logger.LogInformation("Validation URL: {Url}", url);
            _logger.LogInformation("Form Keys: {Keys}", string.Join(", ", Request.Form.Keys));

            await LogToFileAsync($"Validating signature for URL: {url}");
            await LogToFileAsync($"Twilio Signature: {signature}");
            await LogToFileAsync($"WebhookAuthToken (first 4 chars): {_twilioOptions.WebhookAuthToken?.Substring(0, 4)}");
            await LogToFileAsync($"Form Keys: {string.Join(", ", Request.Form.Keys)}");

            if (!_twilioVoiceService.ValidateSignature(signature, url, parameters))
            {
                _logger.LogWarning("Invalid Twilio signature for status callback");
                await LogToFileAsync("ERROR: Invalid Twilio signature for status callback");
                return Unauthorized("Invalid signature");
            }

            // Extract call parameters
            var callSid = Request.Form["CallSid"].ToString();
            var callStatus = Request.Form["CallStatus"].ToString();
            var recordingUrl = Request.Form["RecordingUrl"].ToString();

            await LogToFileAsync($"Status callback - CallSid: {callSid}, Status: {callStatus}, RecordingUrl: {(string.IsNullOrEmpty(recordingUrl) ? "None" : recordingUrl)}");
            _logger.LogInformation("Call status update for CallSid: {CallSid}, Status: {CallStatus}", callSid, callStatus);

            // Determine if call has ended
            DateTimeOffset? endedAt = null;
            if (callStatus == "completed" || callStatus == "failed" || callStatus == "busy" || callStatus == "no-answer")
            {
                endedAt = DateTimeOffset.UtcNow;
                await LogToFileAsync($"Call ended with status: {callStatus} at {endedAt}");
            }
            else
            {
                await LogToFileAsync($"Call status updated to: {callStatus} (call still active)");
            }

            // Update call log in database
            await LogToFileAsync($"Updating call log in database for CallSid: {callSid}");
            var callLog = await _callLogService.UpdateStatusAsync(
                callSid,
                callStatus,
                endedAt,
                string.IsNullOrEmpty(recordingUrl) ? null : recordingUrl
            );

            if (callLog != null)
            {
                await LogToFileAsync($"Call log updated successfully - ID: {callLog.Id}, Status: {callLog.Status}");

                // Map to DTO and broadcast via SignalR
                var callSummary = new CallSummaryDto
                {
                    Id = callLog.Id,
                    ProviderCallId = callLog.ProviderCallId,
                    FromNumber = callLog.FromNumber,
                    ToNumber = callLog.ToNumber,
                    Direction = callLog.Direction,
                    Status = callLog.Status,
                    StartedAtUtc = callLog.StartedAtUtc,
                    EndedAtUtc = callLog.EndedAtUtc,
                    RecordingUrl = callLog.RecordingUrl
                };

                await LogToFileAsync($"Broadcasting CallStatusChanged event via SignalR for CallSid: {callSid}");
                await _hubContext.Clients.All.SendAsync("CallStatusChanged", callSummary);
            }
            else
            {
                await LogToFileAsync($"WARNING: Call log not found for CallSid: {callSid}");
            }

            await LogToFileAsync("=== StatusCallback Method Completed Successfully ===");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing status callback webhook");
            await LogToFileAsync($"ERROR: Exception in StatusCallback - {ex.Message}");
            await LogToFileAsync($"Stack Trace: {ex.StackTrace}");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Twilio webhook for dial status (agent answered, busy, no-answer, etc.)
    /// </summary>
    [HttpPost("dial-status")]
    [HttpGet("dial-status")]  // Accept both GET and POST
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> DialStatus()
    {
        await LogToFileAsync("=== DialStatus Method Started ===");

        try
        {
            // Log request headers
            await LogToFileAsync("--- Request Headers ---");
            foreach (var header in Request.Headers)
            {
                await LogToFileAsync($"{header.Key}: {header.Value}");
            }

            // Log request body
            await LogToFileAsync("--- Request Body ---");
            foreach (var formField in Request.Form)
            {
                await LogToFileAsync($"{formField.Key}: {formField.Value}");
            }
            await LogToFileAsync("--- End Request Data ---");

            // Validate Twilio signature
            var signature = Request.Headers["X-Twilio-Signature"].ToString();
            var url = $"{Request.Scheme}://{Request.Host}{Request.Path}{Request.QueryString}";
            var parameters = Request.Form.ToDictionary(k => k.Key, v => v.Value.ToString());

            if (!_twilioVoiceService.ValidateSignature(signature, url, parameters))
            {
                _logger.LogWarning("Invalid Twilio signature for dial status");
                await LogToFileAsync("ERROR: Invalid Twilio signature for dial status");
                return Unauthorized("Invalid signature");
            }

            var callSid = Request.Form["CallSid"].ToString();
            var dialCallStatus = Request.Form["DialCallStatus"].ToString();

            await LogToFileAsync($"Dial status for CallSid {callSid}: {dialCallStatus}");

            // DialCallStatus values: "completed", "answered", "busy", "no-answer", "failed", "canceled"
            if (dialCallStatus == "no-answer" || dialCallStatus == "busy" || dialCallStatus == "failed")
            {
                // Agent didn't answer - try next agent or send to voicemail
                await LogToFileAsync($"Agent didn't answer (status: {dialCallStatus}), trying next agent");

                var selectedAgent = await _agentRoutingService.SelectNextAvailableAgentAsync();

                var response = new VoiceResponse();

                if (selectedAgent != null)
                {
                    await _callLogService.AssignToAgentAsync(callSid, selectedAgent.Id, selectedAgent.Email);
                    await LogToFileAsync($"Rerouted to agent: {selectedAgent.Name} ({selectedAgent.Email})");

                    var dial = new Dial
                    {
                        Timeout = 30,
                        Action = new Uri($"{Request.Scheme}://{Request.Host}/api/twilio/voice/dial-status"),
                        Record = Twilio.TwiML.Voice.Dial.RecordEnum.RecordFromAnswerDual,  // Enable dual-channel recording
                        RecordingStatusCallback = new Uri($"{Request.Scheme}://{Request.Host}/api/twilio/voice/recording-status-callback"),
                        RecordingStatusCallbackMethod = Twilio.Http.HttpMethod.Post
                    };
                    dial.Client(selectedAgent.Email);
                    response.Append(dial);
                }
                else
                {
                    // No more agents available - send to voicemail
                    await LogToFileAsync("No more agents available - routing to voicemail");
                    response.Say("All agents are currently unavailable. Please leave a message after the tone.");

                    var record = new Record
                    {
                        MaxLength = 60,
                        Action = new Uri($"{Request.Scheme}://{Request.Host}/api/twilio/voice/voicemail")
                    };
                    response.Append(record);
                }

                await LogToFileAsync("=== DialStatus Method Completed - Returning TwiML ===");
                return Content(response.ToString(), "application/xml");
            }

            // If answered or completed, just return empty response (call continues)
            await LogToFileAsync($"Dial status {dialCallStatus} - call proceeding normally");
            await LogToFileAsync("=== DialStatus Method Completed Successfully ===");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing dial status callback");
            await LogToFileAsync($"ERROR: Exception in DialStatus - {ex.Message}");
            await LogToFileAsync($"Stack Trace: {ex.StackTrace}");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Twilio webhook for voicemail recording
    /// </summary>
    [HttpPost("voicemail")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> Voicemail()
    {
        await LogToFileAsync("=== Voicemail Method Started ===");

        try
        {
            // Log request body
            await LogToFileAsync("--- Request Body ---");
            foreach (var formField in Request.Form)
            {
                await LogToFileAsync($"{formField.Key}: {formField.Value}");
            }
            await LogToFileAsync("--- End Request Data ---");

            var callSid = Request.Form["CallSid"].ToString();
            var recordingUrl = Request.Form["RecordingUrl"].ToString();

            await LogToFileAsync($"Voicemail recorded for CallSid {callSid}: {recordingUrl}");

            // Update call log with voicemail recording URL and status
            await _callLogService.UpdateStatusAsync(
                callSid,
                "voicemail",
                DateTimeOffset.UtcNow,
                recordingUrl
            );

            var response = new VoiceResponse();
            response.Say("Thank you for your message. Goodbye.");
            response.Hangup();

            await LogToFileAsync("=== Voicemail Method Completed Successfully ===");
            return Content(response.ToString(), "application/xml");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing voicemail");
            await LogToFileAsync($"ERROR: Exception in Voicemail - {ex.Message}");
            await LogToFileAsync($"Stack Trace: {ex.StackTrace}");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Twilio webhook for recording completion
    /// </summary>
    [HttpPost("recording-status-callback")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> RecordingStatusCallback()
    {
        await LogToFileAsync("=== RecordingStatusCallback Started ===");

        try
        {
            // Log request headers
            await LogToFileAsync("--- Request Headers ---");
            foreach (var header in Request.Headers)
            {
                await LogToFileAsync($"{header.Key}: {header.Value}");
            }

            // Log request body
            await LogToFileAsync("--- Request Body ---");
            foreach (var formField in Request.Form)
            {
                await LogToFileAsync($"{formField.Key}: {formField.Value}");
            }
            await LogToFileAsync("--- End Request Data ---");

            // Validate Twilio signature
            var signature = Request.Headers["X-Twilio-Signature"].ToString();
            var url = $"{Request.Scheme}://{Request.Host}{Request.Path}{Request.QueryString}";
            var parameters = Request.Form.ToDictionary(k => k.Key, v => v.Value.ToString());

            if (!_twilioVoiceService.ValidateSignature(signature, url, parameters))
            {
                _logger.LogWarning("Invalid Twilio signature for recording callback");
                await LogToFileAsync("ERROR: Invalid Twilio signature for recording callback");
                return Unauthorized("Invalid signature");
            }

            // Extract recording data
            var callSid = Request.Form["CallSid"].ToString();
            var recordingSid = Request.Form["RecordingSid"].ToString();
            var recordingUrl = Request.Form["RecordingUrl"].ToString();
            var recordingStatus = Request.Form["RecordingStatus"].ToString();
            var recordingDuration = int.TryParse(Request.Form["RecordingDuration"].ToString(), out var duration) ? duration : 0;
            var recordingChannels = Request.Form["RecordingChannels"].ToString();

            await LogToFileAsync($"Recording callback - CallSid: {callSid}, RecordingSid: {recordingSid}, Status: {recordingStatus}, Duration: {duration}s, Channels: {recordingChannels}");

            // Process completed recordings
            if (recordingStatus == "completed")
            {
                await LogToFileAsync($"Processing completed recording for CallSid: {callSid}");
                await _recordingStorageService.ProcessRecordingAsync(
                    callSid,
                    recordingSid,
                    recordingUrl,
                    duration,
                    recordingChannels
                );
            }
            else
            {
                await LogToFileAsync($"Recording status is '{recordingStatus}', skipping processing");
            }

            await LogToFileAsync("=== RecordingStatusCallback Completed Successfully ===");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing recording callback");
            await LogToFileAsync($"ERROR: Exception in RecordingStatusCallback - {ex.Message}");
            await LogToFileAsync($"Stack Trace: {ex.StackTrace}");
            return StatusCode(500, "Internal server error");
        }
    }
}
