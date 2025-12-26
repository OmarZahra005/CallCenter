using CallCenter.Application.DTOs.CallLog;
using CallCenter.Application.DTOs.CallSurvey;
using CallCenter.Application.DTOs.CrmIntegration;
using CallCenter.Application.DTOs.Twilio;
using CallCenter.Application.Helpers;
using CallCenter.Application.Interfaces;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using CallCenter.API.Hubs;
using System.Security.Claims;
using Twilio.TwiML;
using Twilio.TwiML.Voice;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/twilio/voice")]
public class TwilioVoiceController : ControllerBase
{
    private readonly ITwilioVoiceService _twilioVoiceService;
    private readonly ICallLogService _callLogService;
    private readonly IConversationService _conversationService;
    private readonly IHubContext<CallCenterHub> _hubContext;
    private readonly IHubNotificationService _hubNotificationService;
    private readonly ILogger<TwilioVoiceController> _logger;
    private readonly IAgentRoutingService _agentRoutingService;
    private readonly IRecordingStorageService _recordingStorageService;
    private readonly IIvrService _ivrService;
    private readonly ICallSurveyService _callSurveyService;
    private readonly ISurveyMessageService _surveyMessageService;
    private readonly ICrmIntegrationService _crmIntegrationService;
    private readonly IAgentService _agentService;

    public TwilioVoiceController(
        ITwilioVoiceService twilioVoiceService,
        ICallLogService callLogService,
        IConversationService conversationService,
        IHubContext<CallCenterHub> hubContext,
        IHubNotificationService hubNotificationService,
        ILogger<TwilioVoiceController> logger,
        IAgentRoutingService agentRoutingService,
        IRecordingStorageService recordingStorageService,
        IIvrService ivrService,
        ICallSurveyService callSurveyService,
        ISurveyMessageService surveyMessageService,
        ICrmIntegrationService crmIntegrationService,
        IAgentService agentService)
    {
        _twilioVoiceService = twilioVoiceService;
        _callLogService = callLogService;
        _conversationService = conversationService;
        _hubContext = hubContext;
        _hubNotificationService = hubNotificationService;
        _logger = logger;
        _agentRoutingService = agentRoutingService;
        _recordingStorageService = recordingStorageService;
        _ivrService = ivrService;
        _callSurveyService = callSurveyService;
        _surveyMessageService = surveyMessageService;
        _crmIntegrationService = crmIntegrationService;
        _agentService = agentService;
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

    /// <summary>
    /// Dedicated logging for outbound calls to separate log file
    /// </summary>
    private async System.Threading.Tasks.Task LogOutboundAsync(string message)
    {
        try
        {
            var logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Logs");
            Directory.CreateDirectory(logDirectory);

            var logFilePath = Path.Combine(logDirectory, $"OutboundCalls_{DateTime.UtcNow:yyyy-MM-dd}.log");
            var logEntry = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] {message}{Environment.NewLine}";

            await System.IO.File.AppendAllTextAsync(logFilePath, logEntry);
            _logger.LogInformation("[OUTBOUND] {Message}", message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write to outbound log file");
        }
    }

    /// <summary>
    /// Safely get first N characters of a string for logging (prevents substring errors)
    /// </summary>
    private static string SafeTokenPreview(string? token, int length = 4)
    {
        if (string.IsNullOrEmpty(token))
            return "(not set)";
        return token.Length >= length ? token.Substring(0, length) : token;
    }

    /// <summary>
    /// Log call errors with structured format including CallSid, CallerNumber, Service, Error, and Timestamp
    /// </summary>
    private async System.Threading.Tasks.Task LogCallErrorAsync(string callSid, string callerNumber, string serviceName, string errorMessage)
    {
        var timestamp = DateTime.UtcNow;
        var logEntry = $"[CALL_ERROR] CallSid: {callSid}, Caller: {callerNumber}, " +
                       $"Service: {serviceName}, Error: {errorMessage}, Time: {timestamp:O}";

        _logger.LogError(logEntry);
        await LogToFileAsync(logEntry);
    }

    /// <summary>
    /// Safely execute an async operation that returns a value, catching and logging any errors
    /// </summary>
    private async System.Threading.Tasks.Task<T?> SafeExecuteAsync<T>(
        Func<System.Threading.Tasks.Task<T>> action,
        string serviceName,
        string callSid,
        string callerNumber) where T : class
    {
        try
        {
            return await action();
        }
        catch (Exception ex)
        {
            await LogCallErrorAsync(callSid, callerNumber, serviceName, ex.Message);
            return null;
        }
    }

    /// <summary>
    /// Safely execute an async operation without return value, catching and logging any errors
    /// </summary>
    private async System.Threading.Tasks.Task SafeExecuteAsync(
        Func<System.Threading.Tasks.Task> action,
        string serviceName,
        string callSid,
        string callerNumber)
    {
        try
        {
            await action();
        }
        catch (Exception ex)
        {
            await LogCallErrorAsync(callSid, callerNumber, serviceName, ex.Message);
        }
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
    /// Diagnostic endpoint to verify the incoming webhook URL is accessible (GET)
    /// </summary>
    [HttpGet("incoming")]
    public IActionResult IncomingCallCheck()
    {
        return Ok(new {
            status = "ok",
            message = "Incoming webhook endpoint is accessible",
            timestamp = DateTime.UtcNow,
            pathBase = Request.PathBase.Value,
            fullUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}/api/twilio/voice/incoming"
        });
    }

    /// <summary>
    /// Simple diagnostic POST endpoint - no validation, just logs and returns TwiML
    /// Use this URL in TwiML App to test: /api/twilio/voice/test-webhook
    /// </summary>
    [HttpPost("test-webhook")]
    public async Task<IActionResult> TestWebhook()
    {
        try
        {
            await LogToFileAsync("=== TEST WEBHOOK CALLED ===");
            await LogToFileAsync($"Request Host: {Request.Host}");
            await LogToFileAsync($"Request Path: {Request.Path}");
            await LogToFileAsync($"Content-Type: {Request.ContentType}");
            await LogToFileAsync($"Form keys: {string.Join(", ", Request.Form.Keys)}");
            foreach (var key in Request.Form.Keys)
            {
                await LogToFileAsync($"  {key}: {Request.Form[key]}");
            }
            await LogToFileAsync("=== TEST WEBHOOK COMPLETE ===");

            // Return simple TwiML that says something
            var response = new VoiceResponse();
            response.Say("Test webhook received successfully. This is a diagnostic endpoint.");
            response.Hangup();
            return Content(response.ToString(), "application/xml");
        }
        catch (Exception ex)
        {
            await LogToFileAsync($"TEST WEBHOOK ERROR: {ex.Message}");
            var response = new VoiceResponse();
            response.Say("Error in test webhook.");
            response.Hangup();
            return Content(response.ToString(), "application/xml");
        }
    }

    /// <summary>
    /// Twilio webhook for incoming voice calls
    /// Also handles outgoing calls from device.connect() - detects via callLogId + To params
    /// </summary>
    [HttpPost("incoming")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> IncomingCall()
    {
        await LogToFileAsync("=== IncomingCall Method Started ===");

        // Log all form data immediately for debugging
        await LogToFileAsync($"Form keys: {string.Join(", ", Request.Form.Keys)}");
        foreach (var key in Request.Form.Keys)
        {
            await LogToFileAsync($"  {key}: {Request.Form[key]}");
        }

        try
        {
            // DETECT OUTGOING CALL: Check for callLogId and To params from device.connect()
            var callLogId = Request.Form["callLogId"].ToString();
            var toNumber = Request.Form["To"].ToString();

            if (!string.IsNullOrEmpty(callLogId) && !string.IsNullOrEmpty(toNumber))
            {
                await LogToFileAsync($"*** OUTGOING CALL DETECTED - Routing to OutgoingCall handler ***");
                await LogToFileAsync($"callLogId: {callLogId}, To: {toNumber}");
                return await OutgoingCall();
            }

            await LogToFileAsync("Processing as INCOMING call (no callLogId/To params)");

            // Get Twilio options from database
            var twilioOptions = await _twilioVoiceService.GetOptionsAsync();

            // Log Twilio configuration (mask sensitive data)
            await LogToFileAsync("--- Twilio Configuration ---");
            await LogToFileAsync($"AccountSid: {MaskSensitiveData(twilioOptions.AccountSid)}");
            await LogToFileAsync($"ApiKeySid: {MaskSensitiveData(twilioOptions.ApiKeySid)}");
            await LogToFileAsync($"ApiKeySecret: {MaskSensitiveData(twilioOptions.ApiKeySecret)}");
            await LogToFileAsync($"VoiceTwimlAppSid: {twilioOptions.VoiceTwimlAppSid}");
            await LogToFileAsync($"CallerId: {twilioOptions.CallerId}");
            await LogToFileAsync($"WebhookAuthToken: {MaskSensitiveData(twilioOptions.WebhookAuthToken)}");
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
            _logger.LogInformation("Using WebhookAuthToken (first 4 chars): {TokenStart}", SafeTokenPreview(twilioOptions.WebhookAuthToken));
            _logger.LogInformation("Validation URL: {Url}", url);
            _logger.LogInformation("Form Keys: {Keys}", string.Join(", ", Request.Form.Keys));

            await LogToFileAsync($"Validating signature for URL: {url}");
            await LogToFileAsync($"Twilio Signature: {signature}");
            await LogToFileAsync($"WebhookAuthToken (first 4 chars): {SafeTokenPreview(twilioOptions.WebhookAuthToken)}");
            await LogToFileAsync($"Form Keys: {string.Join(", ", Request.Form.Keys)}");

            if (!await _twilioVoiceService.ValidateSignatureAsync(signature, url, parameters))
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

            // CRITICAL: Create call log in database - this must succeed for call tracking
            await LogToFileAsync($"Creating call log in database for CallSid: {callSid}");
            var callLog = await _callLogService.CreateIncomingAsync(
                callSid,
                from,
                to,
                "inbound"
            );
            await LogToFileAsync($"Call log created with ID: {callLog.Id}");

            // SECONDARY: Send incoming call event to CRM and get screen pop data
            // This is non-blocking - call handling continues even if CRM is unavailable
            ScreenPopDto? screenPop = null;
            if (_crmIntegrationService.IsEnabled)
            {
                await LogToFileAsync($"Sending incoming call event to CRM for CallSid: {callSid}");
                screenPop = await SafeExecuteAsync(
                    () => _crmIntegrationService.SendIncomingCallAsync(new IncomingCallEvent
                    {
                        CallId = callSid,
                        PhoneNumber = from,
                        AgentId = null, // Agent not assigned yet
                        Timestamp = DateTime.UtcNow
                    }),
                    "CrmIntegrationService.SendIncomingCall",
                    callSid, from);

                if (screenPop != null)
                {
                    await LogToFileAsync($"Received screen pop from CRM - IsNewCaller: {screenPop.IsNewCaller}, AccountId: {screenPop.AccountId}");

                    // Broadcast screen pop data to frontend via SignalR
                    await SafeExecuteAsync(
                        () => _hubContext.Clients.All.SendAsync("CrmScreenPop", new
                        {
                            callSid,
                            phoneNumber = from,
                            screenPop
                        }),
                        "SignalR.CrmScreenPop",
                        callSid, from);
                }
                else
                {
                    await LogToFileAsync("No screen pop data received from CRM (new caller or CRM unavailable)");
                }
            }
            else
            {
                await LogToFileAsync("CRM integration is disabled, skipping incoming call event");
            }

            // Check if call should go through IVR first
            var fromIvr = Request.Query["fromIvr"].ToString().ToLower() == "true";
            await LogToFileAsync($"fromIvr parameter: {fromIvr}");

            if (!fromIvr)
            {
                // Check if an IVR flow exists for this number
                await LogToFileAsync($"Checking for IVR flow for number: {to}");
                var ivrFlow = await SafeExecuteAsync(
                    () => _ivrService.GetFlowForPhoneNumberAsync(to),
                    "IvrService.GetFlowForPhoneNumber",
                    callSid, from);

                // If no specific flow for this number, check for default flow
                if (ivrFlow == null)
                {
                    await LogToFileAsync("No specific IVR flow found, checking for default flow");
                    ivrFlow = await SafeExecuteAsync(
                        () => _ivrService.GetDefaultFlowAsync(),
                        "IvrService.GetDefaultFlow",
                        callSid, from);
                }

                if (ivrFlow != null && ivrFlow.IsActive)
                {
                    await LogToFileAsync($"IVR flow found: {ivrFlow.Name} (ID: {ivrFlow.Id}) - redirecting to IVR");

                    // Redirect to IVR entry webhook
                    var ivrResponse = new VoiceResponse();
                    var ivrEntryUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}/api/ivr/webhook/entry";
                    ivrResponse.Redirect(new Uri(ivrEntryUrl), Twilio.Http.HttpMethod.Post);

                    await LogToFileAsync($"Returning TwiML redirect to IVR entry: {ivrEntryUrl}");
                    return Content(ivrResponse.ToString(), "application/xml");
                }
                else
                {
                    await LogToFileAsync("No active IVR flow found - proceeding with direct agent routing");
                }
            }
            else
            {
                await LogToFileAsync("Call coming from IVR - proceeding with agent routing");
            }

            // SECONDARY: Create voice conversation (auto-creates customer if not found)
            // Call continues even if this fails
            await LogToFileAsync($"Creating voice conversation for phone: {from}");
            var conversation = await SafeExecuteAsync(
                () => _conversationService.CreateVoiceConversationAsync(from),
                "ConversationService.CreateVoiceConversation",
                callSid, from);

            if (conversation != null)
            {
                await LogToFileAsync($"Conversation created with ID: {conversation.Id}");

                // SECONDARY: Link CallLog to Conversation
                await SafeExecuteAsync(
                    async () =>
                    {
                        var linkedCallLog = await _callLogService.LinkToConversationAsync(callSid, conversation.Id);
                        if (linkedCallLog != null)
                        {
                            await LogToFileAsync($"CallLog linked to Conversation: {conversation.Id}");
                        }
                    },
                    "CallLogService.LinkToConversation",
                    callSid, from);

                // SECONDARY: Broadcast ConversationCreated event via SignalR
                var conversationDto = await SafeExecuteAsync(
                    () => _conversationService.GetConversationDtoByIdAsync(conversation.Id),
                    "ConversationService.GetConversationDtoById",
                    callSid, from);

                if (conversationDto != null)
                {
                    await SafeExecuteAsync(
                        () => _hubNotificationService.NotifyConversationCreatedAsync(conversationDto),
                        "HubNotificationService.NotifyConversationCreated",
                        callSid, from);
                    await LogToFileAsync($"Broadcast ConversationCreated event for Conversation: {conversation.Id}");

                    // SECONDARY: Broadcast TimelineEvent for CallStarted
                    await SafeExecuteAsync(
                        () => _hubNotificationService.NotifyTimelineEventAsync(conversation.Id, new
                        {
                            eventType = "CallStarted",
                            description = $"Incoming call from {from}",
                            timestamp = DateTime.UtcNow,
                            metadata = new { fromNumber = from, toNumber = to, callSid }
                        }),
                        "HubNotificationService.NotifyTimelineEvent",
                        callSid, from);
                    await LogToFileAsync($"Broadcast TimelineEvent (CallStarted) for Conversation: {conversation.Id}");
                }
            }
            else
            {
                await LogToFileAsync($"WARNING: Conversation creation failed, continuing without conversation tracking");
            }

            // SECONDARY: Map to DTO and broadcast via SignalR
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

            await SafeExecuteAsync(
                () => _hubContext.Clients.All.SendAsync("CallCreated", callSummary),
                "SignalR.CallCreated",
                callSid, from);
            await LogToFileAsync($"Broadcasting CallCreated event via SignalR for CallSid: {callSid}");

            // SECONDARY: Try to find an available agent using round-robin
            await LogToFileAsync("Selecting available agent for call routing...");
            var selectedAgent = await SafeExecuteAsync(
                () => _agentRoutingService.SelectNextAvailableAgentAsync(),
                "AgentRoutingService.SelectNextAvailableAgent",
                callSid, from);

            var response = new VoiceResponse();

            // Arabic welcome message for all incoming calls
            response.Say(
               "مرحبًا بكم في ابتكار واكثر. يرجى الانتظار حتى يتم تحويل مكالمتكم.",
               language: "ar-SA",
               voice: "Polly.Zeina"
           );
            await LogToFileAsync("Playing Arabic welcome message");

            if (selectedAgent != null)
            {
                // SECONDARY: Assign call to agent in database
                await SafeExecuteAsync(
                    () => _callLogService.AssignToAgentAsync(callSid, selectedAgent.Id, selectedAgent.Email),
                    "CallLogService.AssignToAgent",
                    callSid, from);
                await LogToFileAsync($"Assigned call to agent: {selectedAgent.Name} ({selectedAgent.Email})");

                // Dial the agent's browser using Twilio Client
                var dial = new Dial
                {
                    Timeout = 30,  // Ring for 30 seconds
                    Action = new Uri($"{Request.Scheme}://{Request.Host}{Request.PathBase}/api/twilio/voice/dial-status"),
                    Method = Twilio.Http.HttpMethod.Post,  // Explicitly set POST method
                    Record = Twilio.TwiML.Voice.Dial.RecordEnum.RecordFromAnswerDual,  // Enable dual-channel recording
                    RecordingStatusCallback = new Uri($"{Request.Scheme}://{Request.Host}{Request.PathBase}/api/twilio/voice/recording-status-callback"),
                    RecordingStatusCallbackMethod = Twilio.Http.HttpMethod.Post
                };
                dial.Client(selectedAgent.Email);  // Use email as Twilio Client identity
                response.Append(dial);

                await LogToFileAsync($"Returning TwiML response - dialing agent's browser at {selectedAgent.Email}");

                // NOTE: IncomingCall banner is now shown by frontend's Twilio Device onIncoming event
                // This ensures banner only appears AFTER IVR completes and dial actually starts
                await LogToFileAsync($"Agent {selectedAgent.Id} will receive incoming call via Twilio Device");
            }
            else
            {
                // No agents available - play message and record voicemail
                await LogToFileAsync("No available agents - routing to voicemail");
                response.Say("All agents are currently busy. Please leave a message after the tone.");

                var record = new Record
                {
                    MaxLength = 60,
                    Action = new Uri($"{Request.Scheme}://{Request.Host}{Request.PathBase}/api/twilio/voice/voicemail")
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
            // Get Twilio options from database
            var twilioOptions = await _twilioVoiceService.GetOptionsAsync();

            // Log Twilio configuration (mask sensitive data)
            await LogToFileAsync("--- Twilio Configuration ---");
            await LogToFileAsync($"AccountSid: {MaskSensitiveData(twilioOptions.AccountSid)}");
            await LogToFileAsync($"ApiKeySid: {MaskSensitiveData(twilioOptions.ApiKeySid)}");
            await LogToFileAsync($"ApiKeySecret: {MaskSensitiveData(twilioOptions.ApiKeySecret)}");
            await LogToFileAsync($"VoiceTwimlAppSid: {twilioOptions.VoiceTwimlAppSid}");
            await LogToFileAsync($"CallerId: {twilioOptions.CallerId}");
            await LogToFileAsync($"WebhookAuthToken: {MaskSensitiveData(twilioOptions.WebhookAuthToken)}");
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
            _logger.LogInformation("Using WebhookAuthToken (first 4 chars): {TokenStart}", SafeTokenPreview(twilioOptions.WebhookAuthToken));
            _logger.LogInformation("Validation URL: {Url}", url);
            _logger.LogInformation("Form Keys: {Keys}", string.Join(", ", Request.Form.Keys));

            await LogToFileAsync($"Validating signature for URL: {url}");
            await LogToFileAsync($"Twilio Signature: {signature}");
            await LogToFileAsync($"WebhookAuthToken (first 4 chars): {SafeTokenPreview(twilioOptions.WebhookAuthToken)}");
            await LogToFileAsync($"Form Keys: {string.Join(", ", Request.Form.Keys)}");

            if (!await _twilioVoiceService.ValidateSignatureAsync(signature, url, parameters))
            {
                _logger.LogWarning("Invalid Twilio signature for status callback");
                await LogToFileAsync("ERROR: Invalid Twilio signature for status callback");
                return Unauthorized("Invalid signature");
            }

            // Extract call parameters
            var callSid = Request.Form["CallSid"].ToString();
            var callStatus = Request.Form["CallStatus"].ToString();
            var recordingUrl = Request.Form["RecordingUrl"].ToString();
            var callerNumber = Request.Form["From"].ToString(); // For error logging
            var twilioDirection = Request.Form["Direction"].ToString(); // Twilio's direction field

            // Check for outbound call identification via query parameters
            var directionParam = Request.Query["direction"].ToString();
            var callIdParam = Request.Query["callId"].ToString();
            var isOutboundCall = directionParam == "outbound" || twilioDirection == "outbound-api" || twilioDirection == "outbound-dial";

            await LogToFileAsync($"Status callback - CallSid: {callSid}, Status: {callStatus}, Direction: {twilioDirection}, IsOutbound: {isOutboundCall}, CallIdParam: {callIdParam}");
            _logger.LogInformation("Call status update for CallSid: {CallSid}, Status: {CallStatus}, Direction: {TwilioDirection}", callSid, callStatus, twilioDirection);

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

            // CRITICAL: Update call log in database - this must succeed
            // For outbound calls, try to find by callId parameter first, then by CallSid
            Domain.Entities.CallLog? callLog = null;

            if (isOutboundCall && !string.IsNullOrEmpty(callIdParam) && Guid.TryParse(callIdParam, out var callLogId))
            {
                // Outbound call - look up by internal CallLog ID first
                await LogToFileAsync($"Looking up outbound call log by ID: {callLogId}");
                callLog = await _callLogService.GetByIdAsync(callLogId);

                if (callLog != null)
                {
                    // Update status for outbound call
                    callLog = await _callLogService.UpdateStatusByIdAsync(
                        callLogId,
                        callStatus,
                        endedAt
                    );
                    await LogToFileAsync($"Updated outbound call log by ID - Status: {callStatus}");

                    // Broadcast outbound-specific SignalR event
                    await SafeExecuteAsync(
                        () => _hubContext.Clients.All.SendAsync("OutboundCallStatusChanged", new
                        {
                            callId = callLogId,
                            providerCallId = callSid,
                            status = callStatus,
                            customerNumber = callLog.ToNumber,
                            timestamp = DateTime.UtcNow
                        }),
                        "SignalR.OutboundCallStatusChanged",
                        callSid, callLog.ToNumber);
                }
            }

            // If not found by callId (or not outbound), try by CallSid (standard path)
            if (callLog == null)
            {
                await LogToFileAsync($"Looking up call log by ProviderCallId: {callSid}");
                callLog = await _callLogService.UpdateStatusAsync(
                    callSid,
                    callStatus,
                    endedAt,
                    string.IsNullOrEmpty(recordingUrl) ? null : recordingUrl
                );
            }
            else if (!string.IsNullOrEmpty(recordingUrl))
            {
                // Update recording URL for outbound call if we found it by ID
                await _callLogService.UpdateStatusAsync(callLog.ProviderCallId, null, null, recordingUrl);
                await LogToFileAsync($"Updated recording URL for outbound call: {recordingUrl}");
            }

            if (callLog != null)
            {
                await LogToFileAsync($"Call log updated successfully - ID: {callLog.Id}, Status: {callLog.Status}");
                callerNumber = callLog.FromNumber; // Use actual caller number for logging

                // SECONDARY: Update conversation state based on call status
                if (callLog.ConversationId.HasValue)
                {
                    Application.DTOs.Conversations.ConversationDto? updatedConversation = null;

                    if (callStatus == "completed")
                    {
                        // Calculate duration if we have start and end times
                        int? durationSeconds = null;
                        if (callLog.EndedAtUtc.HasValue)
                        {
                            durationSeconds = (int)(callLog.EndedAtUtc.Value - callLog.StartedAtUtc).TotalSeconds;
                        }

                        // SECONDARY: Close conversation
                        updatedConversation = await SafeExecuteAsync(
                            () => _conversationService.CloseVoiceConversationAsync(callLog.ConversationId.Value, durationSeconds),
                            "ConversationService.CloseVoiceConversation",
                            callSid, callerNumber);
                        await LogToFileAsync($"Conversation {callLog.ConversationId} closed with duration {durationSeconds}s");

                        // SECONDARY: Broadcast TimelineEvent for CallEnded
                        await SafeExecuteAsync(
                            () => _hubNotificationService.NotifyTimelineEventAsync(callLog.ConversationId.Value, new
                            {
                                eventType = "CallEnded",
                                description = $"Call ended (duration: {durationSeconds}s)",
                                timestamp = DateTime.UtcNow,
                                agentId = callLog.AssignedAgentId,
                                agentName = callLog.AssignedAgentIdentity,
                                metadata = new { durationSeconds, endReason = callStatus }
                            }),
                            "HubNotificationService.NotifyTimelineEvent",
                            callSid, callerNumber);
                        await LogToFileAsync($"Broadcast TimelineEvent (CallEnded) for Conversation: {callLog.ConversationId}");

                        // SECONDARY: Notify CRM that call has ended
                        if (_crmIntegrationService.IsEnabled)
                        {
                            await SafeExecuteAsync(
                                () => _crmIntegrationService.SendCallEndedAsync(new CallEndedEvent
                                {
                                    CallId = callSid,
                                    Disposition = "completed",
                                    Notes = durationSeconds.HasValue ? $"Duration: {durationSeconds}s" : null,
                                    Timestamp = DateTime.UtcNow
                                }),
                                "CrmIntegrationService.SendCallEnded",
                                callSid, callerNumber);
                            await LogToFileAsync($"Sent CallEnded event to CRM for CallSid: {callSid}");
                        }
                    }
                    else if (callStatus == "failed" || callStatus == "busy" || callStatus == "no-answer" || callStatus == "canceled")
                    {
                        // SECONDARY: Call didn't complete successfully - mark as abandoned
                        updatedConversation = await SafeExecuteAsync(
                            () => _conversationService.AbandonConversationAsync(callLog.ConversationId.Value),
                            "ConversationService.AbandonConversation",
                            callSid, callerNumber);
                        await LogToFileAsync($"Conversation {callLog.ConversationId} marked as abandoned (status: {callStatus})");

                        // SECONDARY: Broadcast TimelineEvent for CallEnded (abandoned)
                        await SafeExecuteAsync(
                            () => _hubNotificationService.NotifyTimelineEventAsync(callLog.ConversationId.Value, new
                            {
                                eventType = "CallEnded",
                                description = $"Call ended ({callStatus})",
                                timestamp = DateTime.UtcNow,
                                agentId = callLog.AssignedAgentId,
                                agentName = callLog.AssignedAgentIdentity,
                                metadata = new { endReason = callStatus }
                            }),
                            "HubNotificationService.NotifyTimelineEvent",
                            callSid, callerNumber);
                        await LogToFileAsync($"Broadcast TimelineEvent (CallEnded - {callStatus}) for Conversation: {callLog.ConversationId}");

                        // SECONDARY: Notify CRM that call was abandoned
                        if (_crmIntegrationService.IsEnabled)
                        {
                            await SafeExecuteAsync(
                                () => _crmIntegrationService.SendCallEndedAsync(new CallEndedEvent
                                {
                                    CallId = callSid,
                                    Disposition = callStatus, // failed, busy, no-answer, canceled
                                    Notes = null,
                                    Timestamp = DateTime.UtcNow
                                }),
                                "CrmIntegrationService.SendCallEnded",
                                callSid, callerNumber);
                            await LogToFileAsync($"Sent CallEnded (abandoned: {callStatus}) event to CRM for CallSid: {callSid}");
                        }
                    }

                    // SECONDARY: Broadcast ConversationUpdated event via SignalR
                    if (updatedConversation != null)
                    {
                        await SafeExecuteAsync(
                            () => _hubNotificationService.NotifyConversationUpdatedAsync(updatedConversation),
                            "HubNotificationService.NotifyConversationUpdated",
                            callSid, callerNumber);
                        await LogToFileAsync($"Broadcast ConversationUpdated event for Conversation: {callLog.ConversationId}");
                    }
                }

                // SECONDARY: Create post-call customer survey for completed calls
                // For outbound calls, customer is ToNumber; for inbound, customer is FromNumber
                var customerPhoneForSurvey = callLog.Direction == "outbound" ? callLog.ToNumber : callLog.FromNumber;
                if (callStatus == "completed" && !string.IsNullOrEmpty(customerPhoneForSurvey))
                {
                    await SafeExecuteAsync(async () =>
                    {
                        // Only create survey if one doesn't already exist for this call
                        if (!await _callSurveyService.SurveyExistsForCallAsync(callSid))
                        {
                            var surveyRequest = new CreateCallSurveyRequest
                            {
                                AgentId = callLog.AssignedAgentId,
                                QueueId = null, // QueueId not directly on CallLog - can be enhanced later if needed
                                Direction = callLog.Direction,
                                CustomerContact = customerPhoneForSurvey, // Customer phone number (varies by direction)
                                Channel = "SMS", // Default to SMS, can be configured
                                ExpiryHours = 24
                            };

                            var surveyResult = await _callSurveyService.CreateSurveyAsync(callSid, surveyRequest);
                            await LogToFileAsync($"Post-call survey created - SurveyId: {surveyResult.SurveyId}, Token: {surveyResult.Token}, Status: {surveyResult.Status}, Direction: {callLog.Direction}");

                            // Send survey message if eligible (status is Pending, not NotEligible)
                            if (surveyResult.Status != "NotEligible" && surveyResult.SurveyId != Guid.Empty)
                            {
                                var messageSent = await _surveyMessageService.SendSurveyMessageAsync(surveyResult.SurveyId);
                                await LogToFileAsync($"Survey message {(messageSent ? "sent successfully" : "failed to send")} for SurveyId: {surveyResult.SurveyId}");
                            }
                        }
                        else
                        {
                            await LogToFileAsync($"Survey already exists for CallSid: {callSid}, skipping creation");
                        }
                    }, "CallSurveyService.CreateSurvey", callSid, callerNumber);
                }

                // SECONDARY: Map to DTO and broadcast via SignalR
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

                await SafeExecuteAsync(
                    () => _hubContext.Clients.All.SendAsync("CallStatusChanged", callSummary),
                    "SignalR.CallStatusChanged",
                    callSid, callerNumber);
                await LogToFileAsync($"Broadcasting CallStatusChanged event via SignalR for CallSid: {callSid}");
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

            if (!await _twilioVoiceService.ValidateSignatureAsync(signature, url, parameters))
            {
                _logger.LogWarning("Invalid Twilio signature for dial status");
                await LogToFileAsync("ERROR: Invalid Twilio signature for dial status");
                return Unauthorized("Invalid signature");
            }

            var callSid = Request.Form["CallSid"].ToString();
            var dialCallStatus = Request.Form["DialCallStatus"].ToString();
            var callerNumber = Request.Form["From"].ToString(); // For error logging

            await LogToFileAsync($"Dial status for CallSid {callSid}: {dialCallStatus}");

            // DialCallStatus values: "completed", "answered", "busy", "no-answer", "failed", "canceled"
            if (dialCallStatus == "no-answer" || dialCallStatus == "busy" || dialCallStatus == "failed")
            {
                // Agent didn't answer - try next agent or send to voicemail
                await LogToFileAsync($"Agent didn't answer (status: {dialCallStatus}), trying next agent");

                // SECONDARY: Get next available agent
                var selectedAgent = await SafeExecuteAsync(
                    () => _agentRoutingService.SelectNextAvailableAgentAsync(),
                    "AgentRoutingService.SelectNextAvailableAgent",
                    callSid, callerNumber);

                var response = new VoiceResponse();

                if (selectedAgent != null)
                {
                    // SECONDARY: Assign call to new agent
                    await SafeExecuteAsync(
                        () => _callLogService.AssignToAgentAsync(callSid, selectedAgent.Id, selectedAgent.Email),
                        "CallLogService.AssignToAgent",
                        callSid, callerNumber);
                    await LogToFileAsync($"Rerouted to agent: {selectedAgent.Name} ({selectedAgent.Email})");

                    var dial = new Dial
                    {
                        Timeout = 30,
                        Action = new Uri($"{Request.Scheme}://{Request.Host}{Request.PathBase}/api/twilio/voice/dial-status"),
                        Record = Twilio.TwiML.Voice.Dial.RecordEnum.RecordFromAnswerDual,  // Enable dual-channel recording
                        RecordingStatusCallback = new Uri($"{Request.Scheme}://{Request.Host}{Request.PathBase}/api/twilio/voice/recording-status-callback"),
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
                        Action = new Uri($"{Request.Scheme}://{Request.Host}{Request.PathBase}/api/twilio/voice/voicemail")
                    };
                    response.Append(record);
                }

                await LogToFileAsync("=== DialStatus Method Completed - Returning TwiML ===");
                return Content(response.ToString(), "application/xml");
            }

            // If answered or completed, agent has picked up the call
            if (dialCallStatus == "answered" || dialCallStatus == "completed")
            {
                await LogToFileAsync($"Agent answered call - updating conversation state");

                // SECONDARY: Get CallLog to find ConversationId and AgentId
                var callLog = await SafeExecuteAsync(
                    () => _callLogService.GetByProviderIdAsync(callSid),
                    "CallLogService.GetByProviderId",
                    callSid, callerNumber);

                if (callLog != null && callLog.ConversationId.HasValue && callLog.AssignedAgentId.HasValue)
                {
                    callerNumber = callLog.FromNumber; // Use actual caller number

                    // SECONDARY: Update CallLog status from "ringing" to "in-progress"
                    await SafeExecuteAsync(
                        () => _callLogService.UpdateStatusAsync(callSid, "in-progress"),
                        "CallLogService.UpdateStatus",
                        callSid, callerNumber);
                    await LogToFileAsync($"CallLog status updated to 'in-progress' for CallSid: {callSid}");

                    // SECONDARY: Update conversation: assign agent and set state to Active
                    var updatedConversation = await SafeExecuteAsync(
                        () => _conversationService.AssignAgentToConversationAsync(
                            callLog.ConversationId.Value,
                            callLog.AssignedAgentId.Value),
                        "ConversationService.AssignAgentToConversation",
                        callSid, callerNumber);
                    await LogToFileAsync($"Conversation {callLog.ConversationId} assigned to agent {callLog.AssignedAgentId}, state set to Active");

                    // SECONDARY: Broadcast ConversationUpdated event via SignalR
                    if (updatedConversation != null)
                    {
                        await SafeExecuteAsync(
                            () => _hubNotificationService.NotifyConversationUpdatedAsync(updatedConversation),
                            "HubNotificationService.NotifyConversationUpdated",
                            callSid, callerNumber);
                        await LogToFileAsync($"Broadcast ConversationUpdated event for Conversation: {callLog.ConversationId}");
                    }

                    // SECONDARY: Broadcast TimelineEvent for CallAnswered
                    await SafeExecuteAsync(
                        () => _hubNotificationService.NotifyTimelineEventAsync(callLog.ConversationId.Value, new
                        {
                            eventType = "CallAnswered",
                            description = $"Call answered by {callLog.AssignedAgentIdentity ?? "agent"}",
                            timestamp = DateTime.UtcNow,
                            agentId = callLog.AssignedAgentId,
                            agentName = callLog.AssignedAgentIdentity
                        }),
                        "HubNotificationService.NotifyTimelineEvent",
                        callSid, callerNumber);
                    await LogToFileAsync($"Broadcast TimelineEvent (CallAnswered) for Conversation: {callLog.ConversationId}");

                    // SECONDARY: Notify CRM that call was connected
                    if (_crmIntegrationService.IsEnabled)
                    {
                        await SafeExecuteAsync(
                            () => _crmIntegrationService.SendCallConnectedAsync(new CallConnectedEvent
                            {
                                CallId = callSid,
                                Timestamp = DateTime.UtcNow
                            }),
                            "CrmIntegrationService.SendCallConnected",
                            callSid, callerNumber);
                        await LogToFileAsync($"Sent CallConnected event to CRM for CallSid: {callSid}");
                    }
                }
                else
                {
                    await LogToFileAsync($"WARNING: Could not update conversation - CallLog: {callLog?.Id}, ConversationId: {callLog?.ConversationId}, AgentId: {callLog?.AssignedAgentId}");
                }
            }

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

        var callSid = "";
        var callerNumber = "";

        try
        {
            // Log request body
            await LogToFileAsync("--- Request Body ---");
            foreach (var formField in Request.Form)
            {
                await LogToFileAsync($"{formField.Key}: {formField.Value}");
            }
            await LogToFileAsync("--- End Request Data ---");

            callSid = Request.Form["CallSid"].ToString();
            callerNumber = Request.Form["From"].ToString();
            var recordingUrl = Request.Form["RecordingUrl"].ToString();

            await LogToFileAsync($"Voicemail recorded for CallSid {callSid}: {recordingUrl}");

            // SECONDARY: Update call log with voicemail recording URL and status
            // Call continues even if this fails - TwiML response still returns
            await SafeExecuteAsync(
                () => _callLogService.UpdateStatusAsync(
                    callSid,
                    "voicemail",
                    DateTimeOffset.UtcNow,
                    recordingUrl
                ),
                "CallLogService.UpdateStatus",
                callSid, callerNumber);

            var response = new VoiceResponse();
            response.Say("Thank you for your message. Goodbye.");
            response.Hangup();

            await LogToFileAsync("=== Voicemail Method Completed Successfully ===");
            return Content(response.ToString(), "application/xml");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing voicemail");
            await LogCallErrorAsync(callSid, callerNumber, "Voicemail", ex.Message);
            await LogToFileAsync($"ERROR: Exception in Voicemail - {ex.Message}");
            await LogToFileAsync($"Stack Trace: {ex.StackTrace}");

            // Still return a valid TwiML response even on error
            var response = new VoiceResponse();
            response.Say("Thank you for your message. Goodbye.");
            response.Hangup();
            return Content(response.ToString(), "application/xml");
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

        var callSid = "";
        var callerNumber = "";

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

            if (!await _twilioVoiceService.ValidateSignatureAsync(signature, url, parameters))
            {
                _logger.LogWarning("Invalid Twilio signature for recording callback");
                await LogToFileAsync("ERROR: Invalid Twilio signature for recording callback");
                return Unauthorized("Invalid signature");
            }

            // Extract recording data
            callSid = Request.Form["CallSid"].ToString();
            callerNumber = Request.Form["From"].ToString();
            var recordingSid = Request.Form["RecordingSid"].ToString();
            var recordingUrl = Request.Form["RecordingUrl"].ToString();
            var recordingStatus = Request.Form["RecordingStatus"].ToString();
            var recordingDuration = int.TryParse(Request.Form["RecordingDuration"].ToString(), out var duration) ? duration : 0;
            var recordingChannels = Request.Form["RecordingChannels"].ToString();

            await LogToFileAsync($"Recording callback - CallSid: {callSid}, RecordingSid: {recordingSid}, Status: {recordingStatus}, Duration: {duration}s, Channels: {recordingChannels}");

            // Process completed recordings - the service has its own internal try-catch
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

                // SECONDARY: Notify CRM that recording is ready
                if (_crmIntegrationService.IsEnabled)
                {
                    await SafeExecuteAsync(
                        () => _crmIntegrationService.SendRecordingReadyAsync(new RecordingReadyEvent
                        {
                            CallId = callSid,
                            RecordingUrl = recordingUrl
                        }),
                        "CrmIntegrationService.SendRecordingReady",
                        callSid, callerNumber);
                    await LogToFileAsync($"Sent RecordingReady event to CRM for CallSid: {callSid}");
                }
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
            await LogCallErrorAsync(callSid, callerNumber, "RecordingStatusCallback", ex.Message);
            await LogToFileAsync($"ERROR: Exception in RecordingStatusCallback - {ex.Message}");
            await LogToFileAsync($"Stack Trace: {ex.StackTrace}");
            // Return OK to Twilio even on error - don't fail the webhook
            return Ok();
        }
    }

    /// <summary>
    /// Put a call on hold and broadcast timeline event
    /// </summary>
    [HttpPost("hold/{callSid}")]
    public async Task<IActionResult> HoldCall(string callSid)
    {
        await LogToFileAsync($"=== HoldCall Method Started for CallSid: {callSid} ===");

        try
        {
            var callLog = await _callLogService.GetByProviderIdAsync(callSid);
            if (callLog == null)
            {
                await LogToFileAsync($"ERROR: CallLog not found for CallSid: {callSid}");
                return NotFound($"Call not found: {callSid}");
            }

            var callerNumber = callLog.FromNumber;

            // SECONDARY: Update CallLog status to on-hold
            await SafeExecuteAsync(
                () => _callLogService.UpdateStatusAsync(callSid, "on-hold"),
                "CallLogService.UpdateStatus",
                callSid, callerNumber);
            await LogToFileAsync($"CallLog status updated to 'on-hold' for CallSid: {callSid}");

            // SECONDARY: Broadcast timeline event if conversation exists
            if (callLog.ConversationId.HasValue)
            {
                await SafeExecuteAsync(
                    () => _hubNotificationService.NotifyTimelineEventAsync(callLog.ConversationId.Value, new
                    {
                        eventType = "OnHold",
                        description = "Call placed on hold",
                        timestamp = DateTime.UtcNow,
                        agentId = callLog.AssignedAgentId,
                        agentName = callLog.AssignedAgentIdentity
                    }),
                    "HubNotificationService.NotifyTimelineEvent",
                    callSid, callerNumber);
                await LogToFileAsync($"Broadcast TimelineEvent (OnHold) for Conversation: {callLog.ConversationId}");
            }

            await LogToFileAsync("=== HoldCall Method Completed Successfully ===");
            return Ok(new { message = "Call placed on hold", callSid });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error placing call on hold");
            await LogCallErrorAsync(callSid, "", "HoldCall", ex.Message);
            await LogToFileAsync($"ERROR: Exception in HoldCall - {ex.Message}");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Resume a call from hold and broadcast timeline event
    /// </summary>
    [HttpPost("resume/{callSid}")]
    public async Task<IActionResult> ResumeCall(string callSid)
    {
        await LogToFileAsync($"=== ResumeCall Method Started for CallSid: {callSid} ===");

        try
        {
            var callLog = await _callLogService.GetByProviderIdAsync(callSid);
            if (callLog == null)
            {
                await LogToFileAsync($"ERROR: CallLog not found for CallSid: {callSid}");
                return NotFound($"Call not found: {callSid}");
            }

            var callerNumber = callLog.FromNumber;

            // SECONDARY: Update CallLog status back to in-progress
            await SafeExecuteAsync(
                () => _callLogService.UpdateStatusAsync(callSid, "in-progress"),
                "CallLogService.UpdateStatus",
                callSid, callerNumber);
            await LogToFileAsync($"CallLog status updated to 'in-progress' for CallSid: {callSid}");

            // SECONDARY: Broadcast timeline event if conversation exists
            if (callLog.ConversationId.HasValue)
            {
                await SafeExecuteAsync(
                    () => _hubNotificationService.NotifyTimelineEventAsync(callLog.ConversationId.Value, new
                    {
                        eventType = "Resumed",
                        description = "Call resumed from hold",
                        timestamp = DateTime.UtcNow,
                        agentId = callLog.AssignedAgentId,
                        agentName = callLog.AssignedAgentIdentity
                    }),
                    "HubNotificationService.NotifyTimelineEvent",
                    callSid, callerNumber);
                await LogToFileAsync($"Broadcast TimelineEvent (Resumed) for Conversation: {callLog.ConversationId}");
            }

            await LogToFileAsync("=== ResumeCall Method Completed Successfully ===");
            return Ok(new { message = "Call resumed", callSid });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resuming call");
            await LogCallErrorAsync(callSid, "", "ResumeCall", ex.Message);
            await LogToFileAsync($"ERROR: Exception in ResumeCall - {ex.Message}");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Toggle mute and broadcast timeline event
    /// </summary>
    [HttpPost("mute/{callSid}")]
    public async Task<IActionResult> MuteCall(string callSid, [FromQuery] bool muted)
    {
        await LogToFileAsync($"=== MuteCall Method Started for CallSid: {callSid}, Muted: {muted} ===");

        try
        {
            var callLog = await _callLogService.GetByProviderIdAsync(callSid);
            if (callLog == null)
            {
                await LogToFileAsync($"ERROR: CallLog not found for CallSid: {callSid}");
                return NotFound($"Call not found: {callSid}");
            }

            var callerNumber = callLog.FromNumber;

            // SECONDARY: Broadcast timeline event if conversation exists
            if (callLog.ConversationId.HasValue)
            {
                var eventType = muted ? "Muted" : "Unmuted";
                var description = muted ? "Call muted" : "Call unmuted";

                await SafeExecuteAsync(
                    () => _hubNotificationService.NotifyTimelineEventAsync(callLog.ConversationId.Value, new
                    {
                        eventType,
                        description,
                        timestamp = DateTime.UtcNow,
                        agentId = callLog.AssignedAgentId,
                        agentName = callLog.AssignedAgentIdentity
                    }),
                    "HubNotificationService.NotifyTimelineEvent",
                    callSid, callerNumber);
                await LogToFileAsync($"Broadcast TimelineEvent ({eventType}) for Conversation: {callLog.ConversationId}");
            }

            await LogToFileAsync("=== MuteCall Method Completed Successfully ===");
            return Ok(new { message = muted ? "Call muted" : "Call unmuted", callSid, muted });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling mute");
            await LogCallErrorAsync(callSid, "", "MuteCall", ex.Message);
            await LogToFileAsync($"ERROR: Exception in MuteCall - {ex.Message}");
            return StatusCode(500, "Internal server error");
        }
    }

    #region Outbound Calling - Agent-first Conference Pattern

    /// <summary>
    /// Initiates an outbound call to a customer using Agent-first Conference pattern
    /// The agent's browser will ring first, and when answered, the customer is dialed
    /// </summary>
    [HttpPost("initiate-outbound")]
    [Authorize]
    public async Task<IActionResult> InitiateOutboundCall([FromBody] InitiateOutboundRequest request)
    {
        await LogOutboundAsync("========================================");
        await LogOutboundAsync("=== STEP 1: InitiateOutboundCall START ===");
        await LogOutboundAsync($"Request: CustomerNumber={request.CustomerNumber}, CustomerId={request.CustomerId}, IdempotencyKey={request.IdempotencyKey ?? "none"}");

        try
        {
            // IDEMPOTENCY CHECK: Return existing call if same key was used recently
            if (!string.IsNullOrEmpty(request.IdempotencyKey))
            {
                var existingCall = await _callLogService.GetByIdempotencyKeyAsync(request.IdempotencyKey, TimeSpan.FromSeconds(60));
                if (existingCall != null)
                {
                    await LogOutboundAsync($"*** IDEMPOTENCY HIT: Returning existing call {existingCall.Id} ***");
                    return Ok(new InitiateOutboundResponse
                    {
                        CallId = existingCall.Id,
                        ProviderCallId = existingCall.ProviderCallId,
                        CustomerNumber = existingCall.ToNumber,
                        Status = existingCall.Status,
                        InitiatedAt = existingCall.StartedAtUtc
                    });
                }
            }

            // Get Twilio options from database
            var twilioOptions = await _twilioVoiceService.GetOptionsAsync();
            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
            await LogOutboundAsync($"BaseUrl: {baseUrl}");

            // 1. Validate and normalize phone number to E.164 format
            var normalizedNumber = PhoneValidation.NormalizeToE164(request.CustomerNumber);
            if (normalizedNumber == null)
            {
                await LogOutboundAsync($"ERROR: Invalid phone number format: {request.CustomerNumber}");
                return BadRequest(new { error = "Invalid phone number format. Expected formats: +966512345678, 0512345678, or 00966512345678" });
            }
            await LogOutboundAsync($"Normalized phone number: {normalizedNumber}");

            // 2. Get agent identity and phone number from auth context
            var agentEmail = User.FindFirst(ClaimTypes.Email)?.Value
                             ?? User.FindFirst(ClaimTypes.Name)?.Value
                             ?? User.FindFirst("preferred_username")?.Value;

            if (string.IsNullOrEmpty(agentEmail))
            {
                await LogOutboundAsync("ERROR: Could not determine agent identity from auth context");
                return Unauthorized(new { error = "Could not determine agent identity" });
            }
            await LogOutboundAsync($"Agent email: {agentEmail}");

            // 2b. Verify agent exists in database (phone number not needed for WebRTC)
            var agent = await _agentService.GetAgentByEmailAsync(agentEmail);
            if (agent == null)
            {
                await LogOutboundAsync($"ERROR: Agent not found for email: {agentEmail}");
                return BadRequest(new { error = "Agent not found. Please ensure your account is set up correctly." });
            }
            await LogOutboundAsync($"Agent found: {agent.Name}, using Twilio Client identity: {agentEmail}");

            // 3. Create CallLog record with direction=outbound, status=initiating
            var callLog = await _callLogService.CreateOutboundAsync(
                from: twilioOptions.CallerId,
                to: normalizedNumber,
                agentIdentity: agentEmail,
                customerId: request.CustomerId,
                conversationId: request.ConversationId,
                idempotencyKey: request.IdempotencyKey
            );
            await LogOutboundAsync($"Created CallLog ID: {callLog.Id}, IdempotencyKey: {request.IdempotencyKey ?? "none"}");

            // 4. Validate and Initialize Twilio client
            await LogOutboundAsync($"Twilio AccountSid: {(string.IsNullOrEmpty(twilioOptions.AccountSid) ? "EMPTY" : twilioOptions.AccountSid.Substring(0, Math.Min(8, twilioOptions.AccountSid.Length)) + "...")}");
            await LogOutboundAsync($"Twilio AuthToken: {(string.IsNullOrEmpty(twilioOptions.AuthToken) ? "EMPTY" : "***" + twilioOptions.AuthToken.Substring(Math.Max(0, twilioOptions.AuthToken.Length - 4)))}");
            await LogOutboundAsync($"Twilio CallerId: {twilioOptions.CallerId}");

            if (string.IsNullOrEmpty(twilioOptions.AccountSid) || string.IsNullOrEmpty(twilioOptions.AuthToken))
            {
                await LogOutboundAsync("ERROR: Twilio credentials are missing!");
                return StatusCode(500, new { error = "Twilio credentials are not configured. Please check system settings." });
            }

            Twilio.TwilioClient.Init(twilioOptions.AccountSid, twilioOptions.AuthToken);
            await LogOutboundAsync("Twilio client initialized");

            // 5. Call Twilio API - dial AGENT's BROWSER via Twilio Client (WebRTC)
            var twimlUrl = $"{baseUrl}/api/twilio/voice/outgoing?callId={callLog.Id}&customerNumber={Uri.EscapeDataString(normalizedNumber)}";
            var statusCallbackUrl = $"{baseUrl}/api/twilio/voice/status-callback?callId={callLog.Id}&direction=outbound";

            await LogOutboundAsync($"TwiML URL: {twimlUrl}");
            await LogOutboundAsync($"Status Callback URL: {statusCallbackUrl}");
            await LogOutboundAsync($"Dialing agent BROWSER (Twilio Client): {agentEmail}");

            var call = await Twilio.Rest.Api.V2010.Account.CallResource.CreateAsync(
                to: new Twilio.Types.Client(agentEmail),  // Dial agent's BROWSER via Twilio Client identity
                from: new Twilio.Types.PhoneNumber(twilioOptions.CallerId),
                url: new Uri(twimlUrl),
                statusCallback: new Uri(statusCallbackUrl),
                statusCallbackEvent: new List<string> { "initiated", "ringing", "answered", "completed" },
                statusCallbackMethod: Twilio.Http.HttpMethod.Post
            );

            await LogOutboundAsync($"=== STEP 1 COMPLETE: Agent call created ===");
            await LogOutboundAsync($"CallSid: {call.Sid}, Status: {call.Status}");

            // 6. Update CallLog with Twilio CallSid
            await _callLogService.UpdateProviderCallIdAsync(callLog.Id, call.Sid);

            // 7. Broadcast SignalR event
            await SafeExecuteAsync(
                () => _hubContext.Clients.All.SendAsync("OutboundCallInitiated", new
                {
                    callId = callLog.Id,
                    providerCallId = call.Sid,
                    customerNumber = normalizedNumber,
                    agentIdentity = agentEmail,
                    status = "initiating",
                    timestamp = DateTime.UtcNow
                }),
                "SignalR.OutboundCallInitiated",
                call.Sid, normalizedNumber);

            // 8. Return response
            var response = new InitiateOutboundResponse
            {
                CallId = callLog.Id,
                ProviderCallId = call.Sid,
                CustomerNumber = normalizedNumber,
                Status = "initiating",
                InitiatedAt = callLog.StartedAtUtc
            };

            await LogToFileAsync("=== InitiateOutboundCall Method Completed Successfully ===");
            return Ok(response);
        }
        catch (Twilio.Exceptions.ApiException twilioEx)
        {
            await LogToFileAsync($"ERROR: Twilio API error - {twilioEx.Message}, Code: {twilioEx.Code}");
            _logger.LogError(twilioEx, "Twilio API error initiating outbound call");

            // Check for specific error codes
            if (twilioEx.Code == 21215)
            {
                return BadRequest(new { error = "Geographic permission not enabled for this destination. Please enable it in Twilio Console." });
            }
            if (twilioEx.Code == 21214)
            {
                return BadRequest(new { error = "Invalid 'To' phone number format." });
            }

            return StatusCode(500, new { error = $"Twilio error: {twilioEx.Message}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initiating outbound call");
            await LogToFileAsync($"ERROR: Exception in InitiateOutboundCall - {ex.Message}");
            await LogToFileAsync($"Stack Trace: {ex.StackTrace}");
            return StatusCode(500, new { error = "Failed to initiate outbound call" });
        }
    }

    /// <summary>
    /// Prepare an outbound call - creates CallLog without dialing
    /// Used for direct browser-initiated calls via device.connect()
    /// Flow: Frontend calls this → gets callLogId → browser uses device.connect({To, callLogId})
    /// </summary>
    [HttpPost("prepare-outbound")]
    [Authorize]
    public async Task<IActionResult> PrepareOutboundCall([FromBody] PrepareOutboundRequest request)
    {
        await LogOutboundAsync("========================================");
        await LogOutboundAsync("=== PREPARE OUTBOUND CALL START ===");
        await LogOutboundAsync($"Request: CustomerNumber={request.CustomerNumber}, CustomerId={request.CustomerId}, IdempotencyKey={request.IdempotencyKey ?? "none"}");

        try
        {
            // IDEMPOTENCY CHECK: Return existing call if same key was used recently
            if (!string.IsNullOrEmpty(request.IdempotencyKey))
            {
                var existingCall = await _callLogService.GetByIdempotencyKeyAsync(request.IdempotencyKey, TimeSpan.FromSeconds(60));
                if (existingCall != null)
                {
                    await LogOutboundAsync($"*** IDEMPOTENCY HIT: Returning existing call {existingCall.Id} ***");
                    return Ok(new PrepareOutboundResponse
                    {
                        CallLogId = existingCall.Id,
                        CustomerNumber = existingCall.ToNumber,
                        CustomerName = request.CustomerName,
                        Status = existingCall.Status,
                        PreparedAt = existingCall.StartedAtUtc
                    });
                }
            }

            // Get Twilio options from database (for CallerId)
            var twilioOptions = await _twilioVoiceService.GetOptionsAsync();

            // 1. Validate and normalize phone number to E.164 format
            var normalizedNumber = PhoneValidation.NormalizeToE164(request.CustomerNumber);
            if (normalizedNumber == null)
            {
                await LogOutboundAsync($"ERROR: Invalid phone number format: {request.CustomerNumber}");
                return BadRequest(new { error = "Invalid phone number format. Expected formats: +966512345678, 0512345678, or 00966512345678" });
            }
            await LogOutboundAsync($"Normalized phone number: {normalizedNumber}");

            // 2. Get agent identity from auth context
            var agentEmail = User.FindFirst(ClaimTypes.Email)?.Value
                             ?? User.FindFirst(ClaimTypes.Name)?.Value
                             ?? User.FindFirst("preferred_username")?.Value;

            if (string.IsNullOrEmpty(agentEmail))
            {
                await LogOutboundAsync("ERROR: Could not determine agent identity from auth context");
                return Unauthorized(new { error = "Could not determine agent identity" });
            }
            await LogOutboundAsync($"Agent email: {agentEmail}");

            // 3. Verify agent exists in database
            var agent = await _agentService.GetAgentByEmailAsync(agentEmail);
            if (agent == null)
            {
                await LogOutboundAsync($"ERROR: Agent not found for email: {agentEmail}");
                return BadRequest(new { error = "Agent not found. Please ensure your account is set up correctly." });
            }
            await LogOutboundAsync($"Agent found: {agent.Name}");

            // 4. Create CallLog record with status=preparing (NO DIALING YET)
            var callLog = await _callLogService.CreateOutboundAsync(
                from: twilioOptions.CallerId,
                to: normalizedNumber,
                agentIdentity: agentEmail,
                customerId: request.CustomerId,
                conversationId: request.ConversationId,
                idempotencyKey: request.IdempotencyKey
            );

            // Update status to "preparing" to indicate browser will connect
            await _callLogService.UpdateStatusByIdAsync(callLog.Id, "preparing");

            await LogOutboundAsync($"Created CallLog ID: {callLog.Id} with status 'preparing'");
            await LogOutboundAsync("=== PREPARE OUTBOUND COMPLETE - Browser should now call device.connect() ===");

            // 5. Return response - frontend will use callLogId for device.connect()
            return Ok(new PrepareOutboundResponse
            {
                CallLogId = callLog.Id,
                CustomerNumber = normalizedNumber,
                CustomerName = request.CustomerName,
                Status = "preparing",
                PreparedAt = callLog.StartedAtUtc
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error preparing outbound call");
            await LogOutboundAsync($"ERROR: Exception in PrepareOutboundCall - {ex.Message}");
            return StatusCode(500, new { error = "Failed to prepare outbound call" });
        }
    }

    /// <summary>
    /// TwiML endpoint for outbound calls - Direct browser connection pattern
    /// Browser calls device.connect() → Twilio executes this TwiML → Agent joins conference + Customer dialed
    /// Supports both: (1) Direct browser connect (params in Form), (2) Legacy backend dial (params in Query)
    /// </summary>
    [HttpPost("outgoing")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> OutgoingCall()
    {
        await LogOutboundAsync("=== STEP 2: OutgoingCall TwiML START ===");

        try
        {
            // Get Twilio options from database
            var twilioOptions = await _twilioVoiceService.GetOptionsAsync();
            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";

            // Log request body
            await LogOutboundAsync("--- Twilio Request Form Data ---");
            foreach (var formField in Request.Form)
            {
                await LogOutboundAsync($"  {formField.Key}: {formField.Value}");
            }

            // Validate Twilio signature
            var signature = Request.Headers["X-Twilio-Signature"].ToString();
            var url = $"{Request.Scheme}://{Request.Host}{Request.Path}{Request.QueryString}";
            var parameters = Request.Form.ToDictionary(k => k.Key, v => v.Value.ToString());

            if (!await _twilioVoiceService.ValidateSignatureAsync(signature, url, parameters))
            {
                await LogOutboundAsync("ERROR: Invalid Twilio signature for outgoing call");
                return Unauthorized("Invalid signature");
            }
            await LogOutboundAsync("Twilio signature validated OK");

            // Extract parameters - check Form first (from device.connect), then Query (legacy)
            // device.connect sends params as: To, callLogId
            // Legacy backend dial sends as query params: callId, customerNumber
            var callId = Request.Form["callLogId"].ToString();
            var customerNumber = Request.Form["To"].ToString();
            var isDirectBrowserConnect = !string.IsNullOrEmpty(callId) && !string.IsNullOrEmpty(customerNumber);

            if (!isDirectBrowserConnect)
            {
                // Fall back to legacy query params
                callId = Request.Query["callId"].ToString();
                customerNumber = Request.Query["customerNumber"].ToString();
                await LogOutboundAsync("Using legacy query params (backend-initiated dial)");
            }
            else
            {
                await LogOutboundAsync("Using direct browser connect params (device.connect)");
            }

            await LogOutboundAsync($"CallId: {callId}");
            await LogOutboundAsync($"CustomerNumber: {customerNumber}");

            if (string.IsNullOrEmpty(callId) || string.IsNullOrEmpty(customerNumber))
            {
                await LogOutboundAsync("ERROR: Missing callId or customerNumber parameters");
                return BadRequest("Missing required parameters");
            }

            // Update CallLog status to 'connecting' for direct browser connect
            if (isDirectBrowserConnect && Guid.TryParse(callId, out var parsedCallLogId))
            {
                await _callLogService.UpdateStatusByIdAsync(parsedCallLogId, "connecting");
                await LogOutboundAsync($"Updated CallLog {callId} status to 'connecting'");

                // Link CallLog to Twilio CallSid - required for recording callback to find the CallLog
                var callSid = Request.Form["CallSid"].ToString();
                if (!string.IsNullOrEmpty(callSid))
                {
                    await _callLogService.UpdateProviderCallIdAsync(parsedCallLogId, callSid);
                    await LogOutboundAsync($"Linked CallLog {callId} to CallSid: {callSid}");
                }
            }

            // Build TwiML response - Agent-first Conference pattern
            var response = new VoiceResponse();

            // Play message to agent
            response.Say(
                "جاري الاتصال بالعميل. يرجى الانتظار.",
                language: "ar-SA",
                voice: "Polly.Zeina"
            );

            // Create conference name based on callId
            var conferenceName = $"outbound-{callId}";
            await LogOutboundAsync($"Conference name: {conferenceName}");

            // Conference event callback URL
            var conferenceCallbackUrl = $"{baseUrl}/api/twilio/voice/outbound-conference-event?callId={callId}&customerNumber={Uri.EscapeDataString(customerNumber)}";
            await LogOutboundAsync($"Conference callback URL: {conferenceCallbackUrl}");

            // Build Dial verb with Conference
            var dial = new Dial(
                callerId: twilioOptions.CallerId,
                action: new Uri($"{baseUrl}/api/twilio/voice/outbound-dial-status?callId={callId}"),
                method: Twilio.Http.HttpMethod.Post,
                record: Twilio.TwiML.Voice.Dial.RecordEnum.RecordFromAnswerDual,
                recordingStatusCallback: new Uri($"{baseUrl}/api/twilio/voice/recording-status-callback"),
                recordingStatusCallbackMethod: Twilio.Http.HttpMethod.Post
            );

            // Add Conference with status callback to trigger customer dial when agent joins
            var conference = new Conference(
                conferenceName,
                startConferenceOnEnter: true,
                endConferenceOnExit: true,
                beep: Conference.BeepEnum.False,
                waitUrl: new Uri("http://twimlets.com/holdmusic?Bucket=com.twilio.music.classical"),
                statusCallback: new Uri(conferenceCallbackUrl),
                statusCallbackEvent: new List<Conference.EventEnum> { Conference.EventEnum.Start, Conference.EventEnum.Join, Conference.EventEnum.End }
            );

            dial.Append(conference);
            response.Append(dial);

            var twiml = response.ToString();
            await LogOutboundAsync($"=== STEP 2 COMPLETE: Returning TwiML ===");
            await LogOutboundAsync($"TwiML: {twiml}");

            return Content(twiml, "application/xml");
        }
        catch (Exception ex)
        {
            await LogOutboundAsync($"ERROR in OutgoingCall: {ex.Message}");
            await LogOutboundAsync($"Stack Trace: {ex.StackTrace}");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Twilio webhook for conference events during outbound calls
    /// When agent joins the conference, dial the customer into the same conference
    /// </summary>
    [HttpPost("outbound-conference-event")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> OutboundConferenceEvent()
    {
        await LogOutboundAsync("=== STEP 3: OutboundConferenceEvent START ===");

        try
        {
            // Get Twilio options from database
            var twilioOptions = await _twilioVoiceService.GetOptionsAsync();
            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";

            // Log all form data from Twilio
            await LogOutboundAsync("--- Twilio Conference Event Form Data ---");
            foreach (var formField in Request.Form)
            {
                await LogOutboundAsync($"  {formField.Key}: {formField.Value}");
            }

            // Extract conference event data
            var statusCallbackEvent = Request.Form["StatusCallbackEvent"].ToString();
            var conferenceSid = Request.Form["ConferenceSid"].ToString();
            var callSid = Request.Form["CallSid"].ToString();
            var callId = Request.Query["callId"].ToString();
            var customerNumber = Request.Query["customerNumber"].ToString();

            await LogOutboundAsync($"Event Type: {statusCallbackEvent}");
            await LogOutboundAsync($"ConferenceSid: {conferenceSid}");
            await LogOutboundAsync($"CallSid: {callSid}");
            await LogOutboundAsync($"CallId: {callId}");
            await LogOutboundAsync($"CustomerNumber: {customerNumber}");

            // When agent joins the conference, dial the customer
            if (statusCallbackEvent == "participant-join")
            {
                await LogOutboundAsync("*** PARTICIPANT-JOIN EVENT - DIALING CUSTOMER ***");

                // CRITICAL: Check if customer was already dialed to prevent duplicate dials
                if (Guid.TryParse(callId, out var parsedCallLogId))
                {
                    var existingCallLog = await _callLogService.GetByIdAsync(parsedCallLogId);
                    if (existingCallLog?.CustomerDialed == true)
                    {
                        await LogOutboundAsync("*** SKIPPING - Customer already dialed for this call ***");
                        await LogOutboundAsync($"CustomerDialed={existingCallLog.CustomerDialed}, ConferenceSid={existingCallLog.OutboundConferenceSid}");
                        return Ok();
                    }

                    // Mark customer as dialed BEFORE making the API call to prevent race conditions
                    await _callLogService.SetCustomerDialedAsync(parsedCallLogId, true, conferenceSid);
                    await LogOutboundAsync("CustomerDialed flag set to true");
                }

                await LogOutboundAsync($"Initializing Twilio client...");

                // Initialize Twilio client
                Twilio.TwilioClient.Init(twilioOptions.AccountSid, twilioOptions.AuthToken);
                await LogOutboundAsync("Twilio client initialized");

                try
                {
                    var customerStatusCallbackUrl = $"{baseUrl}/api/twilio/voice/status-callback?callId={callId}&direction=outbound";
                    await LogOutboundAsync($"Customer status callback URL: {customerStatusCallbackUrl}");
                    await LogOutboundAsync($"Dialing customer: {customerNumber} from {twilioOptions.CallerId}");

                    // Add customer to conference using Twilio REST API
                    var participant = await Twilio.Rest.Api.V2010.Account.Conference.ParticipantResource.CreateAsync(
                        pathConferenceSid: conferenceSid,
                        from: new Twilio.Types.PhoneNumber(twilioOptions.CallerId),
                        to: new Twilio.Types.PhoneNumber(customerNumber),
                        statusCallback: new Uri(customerStatusCallbackUrl),
                        statusCallbackEvent: new List<string> { "initiated", "ringing", "answered", "completed" },
                        endConferenceOnExit: true,
                        record: true
                    );

                    await LogOutboundAsync($"=== CUSTOMER DIAL SUCCESS ===");
                    await LogOutboundAsync($"Customer CallSid: {participant.CallSid}");
                    await LogOutboundAsync($"Customer Status: {participant.Status}");

                    // Update CallLog status to "ringing-customer"
                    if (Guid.TryParse(callId, out var callLogId))
                    {
                        await SafeExecuteAsync(
                            () => _callLogService.UpdateStatusByIdAsync(callLogId, "ringing-customer"),
                            "CallLogService.UpdateStatusById",
                            callSid, customerNumber);
                        await LogOutboundAsync($"CallLog status updated to 'ringing-customer'");

                        // Broadcast SignalR event
                        await SafeExecuteAsync(
                            () => _hubContext.Clients.All.SendAsync("OutboundCallRingingCustomer", new
                            {
                                callId,
                                customerNumber,
                                conferenceSid,
                                timestamp = DateTime.UtcNow
                            }),
                            "SignalR.OutboundCallRingingCustomer",
                            callSid, customerNumber);
                    }
                }
                catch (Twilio.Exceptions.ApiException twilioEx)
                {
                    await LogOutboundAsync($"!!! TWILIO API ERROR !!!");
                    await LogOutboundAsync($"Error Message: {twilioEx.Message}");
                    await LogOutboundAsync($"Error Code: {twilioEx.Code}");
                    await LogOutboundAsync($"More Info: {twilioEx.MoreInfo}");
                    _logger.LogError(twilioEx, "Failed to dial customer into conference");

                    // Update CallLog with error status
                    if (Guid.TryParse(callId, out var callLogId))
                    {
                        await SafeExecuteAsync(
                            () => _callLogService.UpdateStatusByIdAsync(callLogId, "failed", DateTimeOffset.UtcNow),
                            "CallLogService.UpdateStatusById",
                            callSid, customerNumber);
                    }
                }
            }
            else if (statusCallbackEvent == "conference-start")
            {
                await LogOutboundAsync("Conference started");
            }
            else if (statusCallbackEvent == "conference-end")
            {
                await LogOutboundAsync("Conference ended");

                // Update CallLog status to completed if not already
                if (Guid.TryParse(callId, out var callLogId))
                {
                    var callLog = await _callLogService.GetByIdAsync(callLogId);
                    if (callLog != null && callLog.Status != "completed" && callLog.Status != "failed")
                    {
                        await SafeExecuteAsync(
                            () => _callLogService.UpdateStatusByIdAsync(callLogId, "completed", DateTimeOffset.UtcNow),
                            "CallLogService.UpdateStatusById",
                            callSid, customerNumber);
                        await LogOutboundAsync($"CallLog status updated to 'completed'");
                    }
                }
            }
            else
            {
                await LogOutboundAsync($"Unhandled event type: {statusCallbackEvent}");
            }

            await LogOutboundAsync("=== STEP 3 COMPLETE ===");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing outbound conference event");
            await LogOutboundAsync($"!!! EXCEPTION in OutboundConferenceEvent !!!");
            await LogOutboundAsync($"Error: {ex.Message}");
            await LogOutboundAsync($"Stack: {ex.StackTrace}");
            return Ok(); // Return OK to Twilio even on error
        }
    }

    /// <summary>
    /// Twilio webhook for outbound dial status (when agent hangs up or call ends)
    /// </summary>
    [HttpPost("outbound-dial-status")]
    [HttpGet("outbound-dial-status")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> OutboundDialStatus()
    {
        await LogOutboundAsync("=== OutboundDialStatus START ===");

        try
        {
            // Log request body
            await LogOutboundAsync("--- Form Data ---");
            foreach (var formField in Request.Form)
            {
                await LogOutboundAsync($"  {formField.Key}: {formField.Value}");
            }

            // Validate Twilio signature
            var signature = Request.Headers["X-Twilio-Signature"].ToString();
            var url = $"{Request.Scheme}://{Request.Host}{Request.Path}{Request.QueryString}";
            var parameters = Request.Form.ToDictionary(k => k.Key, v => v.Value.ToString());

            if (!await _twilioVoiceService.ValidateSignatureAsync(signature, url, parameters))
            {
                await LogOutboundAsync("ERROR: Invalid Twilio signature for outbound dial status");
                return Unauthorized("Invalid signature");
            }

            var callSid = Request.Form["CallSid"].ToString();
            var dialCallStatus = Request.Form["DialCallStatus"].ToString();
            var callId = Request.Query["callId"].ToString();

            await LogOutboundAsync($"CallSid: {callSid}");
            await LogOutboundAsync($"DialCallStatus: {dialCallStatus}");
            await LogOutboundAsync($"CallId: {callId}");

            // Update CallLog based on dial status
            if (Guid.TryParse(callId, out var callLogId))
            {
                var endedAt = DateTimeOffset.UtcNow;

                if (dialCallStatus == "completed" || dialCallStatus == "answered")
                {
                    await LogOutboundAsync($"Dial completed normally");
                }
                else if (dialCallStatus == "busy" || dialCallStatus == "no-answer" || dialCallStatus == "failed" || dialCallStatus == "canceled")
                {
                    await LogOutboundAsync($"Dial failed with status: {dialCallStatus}");
                    await SafeExecuteAsync(
                        () => _callLogService.UpdateStatusByIdAsync(callLogId, dialCallStatus, endedAt),
                        "CallLogService.UpdateStatusById",
                        callSid, "");

                    await SafeExecuteAsync(
                        () => _hubContext.Clients.All.SendAsync("OutboundCallFailed", new
                        {
                            callId,
                            status = dialCallStatus,
                            timestamp = endedAt
                        }),
                        "SignalR.OutboundCallFailed",
                        callSid, "");
                }
            }

            await LogOutboundAsync("=== OutboundDialStatus COMPLETE ===");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing outbound dial status");
            await LogOutboundAsync($"!!! EXCEPTION: {ex.Message}");
            await LogOutboundAsync($"Stack: {ex.StackTrace}");
            return Ok(); // Return OK to Twilio even on error
        }
    }

    #endregion
}
