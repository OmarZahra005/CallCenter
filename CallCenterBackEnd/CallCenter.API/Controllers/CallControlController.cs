using CallCenter.Application.Services;
using CallCenter.Application.DTOs.CallSurvey;
using CallCenter.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using CallCenter.API.Hubs;
using CallCenter.Application.DTOs.CallLog;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/calls")]
public class CallControlController : ControllerBase
{
    private readonly ICtiService _ctiService;
    private readonly IHubContext<CallCenterHub> _hubContext;
    private readonly ICallLogService _callLogService;
    private readonly ICallSurveyService _callSurveyService;
    private readonly ISurveyMessageService _surveyMessageService;
    private readonly ILogger<CallControlController> _logger;

    public CallControlController(
        ICtiService ctiService,
        IHubContext<CallCenterHub> hubContext,
        ICallLogService callLogService,
        ICallSurveyService callSurveyService,
        ISurveyMessageService surveyMessageService,
        ILogger<CallControlController> logger)
    {
        _ctiService = ctiService;
        _hubContext = hubContext;
        _callLogService = callLogService;
        _callSurveyService = callSurveyService;
        _surveyMessageService = surveyMessageService;
        _logger = logger;
    }

    /// <summary>
    /// Answer an incoming call
    /// </summary>
    [HttpPost("{callId}/answer")]
    public async Task<ActionResult<CallActionResult>> AnswerCall(string callId, [FromBody] CallActionRequest request)
    {
        await _ctiService.CreateEventAsync(new Application.DTOs.Cti.CreateCtiEventRequest
        {
            CallId = callId,
            AgentId = request.AgentId,
            EventType = CtiEventType.Answered,
            Direction = CallDirection.Inbound,
            Metadata = $"{{\"action\":\"answer\",\"timestamp\":\"{DateTime.UtcNow:O}\"}}"
        });

        await _hubContext.Clients.All.SendAsync("CallAnswered", new { callId, agentId = request.AgentId });

        return Ok(new CallActionResult
        {
            Success = true,
            CallId = callId,
            Action = "answer",
            Message = "Call answered successfully"
        });
    }

    /// <summary>
    /// Put call on hold
    /// </summary>
    [HttpPost("{callId}/hold")]
    public async Task<ActionResult<CallActionResult>> HoldCall(string callId, [FromBody] CallActionRequest request)
    {
        await _ctiService.CreateEventAsync(new Application.DTOs.Cti.CreateCtiEventRequest
        {
            CallId = callId,
            AgentId = request.AgentId,
            EventType = CtiEventType.Hold,
            Direction = CallDirection.Inbound,
            Metadata = $"{{\"action\":\"hold\",\"timestamp\":\"{DateTime.UtcNow:O}\"}}"
        });

        await _hubContext.Clients.All.SendAsync("CallOnHold", new { callId, agentId = request.AgentId });

        return Ok(new CallActionResult
        {
            Success = true,
            CallId = callId,
            Action = "hold",
            Message = "Call placed on hold"
        });
    }

    /// <summary>
    /// Resume call from hold
    /// </summary>
    [HttpPost("{callId}/resume")]
    public async Task<ActionResult<CallActionResult>> ResumeCall(string callId, [FromBody] CallActionRequest request)
    {
        await _ctiService.CreateEventAsync(new Application.DTOs.Cti.CreateCtiEventRequest
        {
            CallId = callId,
            AgentId = request.AgentId,
            EventType = CtiEventType.Answered,
            Direction = CallDirection.Inbound,
            Metadata = $"{{\"action\":\"resume\",\"timestamp\":\"{DateTime.UtcNow:O}\"}}"
        });

        await _hubContext.Clients.All.SendAsync("CallResumed", new { callId, agentId = request.AgentId });

        return Ok(new CallActionResult
        {
            Success = true,
            CallId = callId,
            Action = "resume",
            Message = "Call resumed"
        });
    }

    /// <summary>
    /// Transfer call to another agent or queue
    /// </summary>
    [HttpPost("{callId}/transfer")]
    public async Task<ActionResult<CallActionResult>> TransferCall(string callId, [FromBody] TransferCallRequest request)
    {
        await _ctiService.CreateEventAsync(new Application.DTOs.Cti.CreateCtiEventRequest
        {
            CallId = callId,
            AgentId = request.FromAgentId,
            EventType = CtiEventType.Transfer,
            Direction = CallDirection.Inbound,
            Metadata = $"{{\"action\":\"transfer\",\"toAgentId\":\"{request.ToAgentId}\",\"toQueueId\":\"{request.ToQueueId}\",\"type\":\"{request.TransferType}\",\"timestamp\":\"{DateTime.UtcNow:O}\"}}"
        });

        await _hubContext.Clients.All.SendAsync("CallTransferred", new
        {
            callId,
            fromAgentId = request.FromAgentId,
            toAgentId = request.ToAgentId,
            toQueueId = request.ToQueueId,
            transferType = request.TransferType
        });

        return Ok(new CallActionResult
        {
            Success = true,
            CallId = callId,
            Action = "transfer",
            Message = $"Call transferred ({request.TransferType})"
        });
    }

    /// <summary>
    /// End/hangup call
    /// </summary>
    [HttpPost("{callId}/hangup")]
    public async Task<ActionResult<CallActionResult>> HangupCall(string callId, [FromBody] HangupCallRequest request)
    {
        await _ctiService.CreateEventAsync(new Application.DTOs.Cti.CreateCtiEventRequest
        {
            CallId = callId,
            AgentId = request.AgentId,
            EventType = CtiEventType.End,
            Direction = CallDirection.Inbound,
            Metadata = $"{{\"action\":\"hangup\",\"reason\":\"{request.Reason}\",\"duration\":{request.DurationSeconds},\"timestamp\":\"{DateTime.UtcNow:O}\"}}"
        });

        await _hubContext.Clients.All.SendAsync("CallEnded", new
        {
            callId,
            agentId = request.AgentId,
            reason = request.Reason,
            duration = request.DurationSeconds
        });

        // Trigger post-call survey creation and message sending
        try
        {
            // Look up call log to get customer phone number
            var callLog = await _callLogService.GetByProviderIdAsync(callId);

            if (callLog != null && !string.IsNullOrEmpty(callLog.FromNumber))
            {
                // Check if survey already exists (idempotency)
                var surveyExists = await _callSurveyService.SurveyExistsForCallAsync(callId);

                if (!surveyExists)
                {
                    // Create survey request
                    var surveyRequest = new CreateCallSurveyRequest
                    {
                        AgentId = callLog.AssignedAgentId,
                        QueueId = null,
                        Direction = callLog.Direction,
                        CustomerContact = callLog.FromNumber,
                        Channel = "SMS",
                        ExpiryHours = 24
                    };

                    var surveyResult = await _callSurveyService.CreateSurveyAsync(callId, surveyRequest);

                    var isEligible = surveyResult.Status != "NotEligible";
                    _logger.LogInformation(
                        "Created post-call survey {SurveyId} for call {CallId}, status: {Status}, eligible: {IsEligible}",
                        surveyResult.SurveyId, callId, surveyResult.Status, isEligible);

                    // Send survey message if eligible (status is Pending, not NotEligible)
                    if (isEligible && surveyResult.SurveyId != Guid.Empty)
                    {
                        var messageSent = await _surveyMessageService.SendSurveyMessageAsync(surveyResult.SurveyId);

                        _logger.LogInformation(
                            "Survey message {MessageStatus} for call {CallId}, survey {SurveyId}",
                            messageSent ? "sent" : "failed to send", callId, surveyResult.SurveyId);
                    }
                }
                else
                {
                    _logger.LogDebug("Survey already exists for call {CallId}, skipping creation", callId);
                }
            }
            else
            {
                _logger.LogDebug(
                    "Skipping survey for call {CallId}: CallLog {CallLogStatus}, FromNumber: {HasFromNumber}",
                    callId,
                    callLog == null ? "not found" : "found",
                    callLog?.FromNumber != null);
            }
        }
        catch (Exception ex)
        {
            // Log error but don't fail the hangup operation
            _logger.LogError(ex, "Error creating/sending post-call survey for call {CallId}", callId);
        }

        return Ok(new CallActionResult
        {
            Success = true,
            CallId = callId,
            Action = "hangup",
            Message = "Call ended"
        });
    }

    /// <summary>
    /// Initiate outbound call
    /// </summary>
    [HttpPost("dial")]
    public async Task<ActionResult<CallActionResult>> DialCall([FromBody] DialCallRequest request)
    {
        var callId = Guid.NewGuid().ToString();

        await _ctiService.CreateEventAsync(new Application.DTOs.Cti.CreateCtiEventRequest
        {
            CallId = callId,
            AgentId = request.AgentId,
            EventType = CtiEventType.Ringing,
            Direction = CallDirection.Outbound,
            Metadata = $"{{\"action\":\"dial\",\"destination\":\"{request.Destination}\",\"customerId\":\"{request.CustomerId}\",\"crmRecordId\":\"{request.CrmRecordId}\",\"crmRecordType\":\"{request.CrmRecordType}\",\"timestamp\":\"{DateTime.UtcNow:O}\"}}"
        });

        await _hubContext.Clients.All.SendAsync("OutboundCallStarted", new
        {
            callId,
            agentId = request.AgentId,
            destination = request.Destination,
            customerId = request.CustomerId,
            crmRecordId = request.CrmRecordId,
            crmRecordType = request.CrmRecordType
        });

        return Ok(new CallActionResult
        {
            Success = true,
            CallId = callId,
            Action = "dial",
            Message = $"Dialing {request.Destination}"
        });
    }

    /// <summary>
    /// Mute/unmute call
    /// </summary>
    [HttpPost("{callId}/mute")]
    public async Task<ActionResult<CallActionResult>> MuteCall(string callId, [FromBody] MuteCallRequest request)
    {
        await _hubContext.Clients.All.SendAsync("CallMuteChanged", new
        {
            callId,
            agentId = request.AgentId,
            isMuted = request.IsMuted
        });

        return Ok(new CallActionResult
        {
            Success = true,
            CallId = callId,
            Action = request.IsMuted ? "mute" : "unmute",
            Message = request.IsMuted ? "Call muted" : "Call unmuted"
        });
    }

    /// <summary>
    /// Log call data (accepts any dynamic data)
    /// </summary>
    [HttpPost("log")]
    public async Task<ActionResult<CallLogDto>> LogCallData([FromForm] object request)
    {
        var result = await _callLogService.LogCallDataAsync(request);
        return Ok(result);
    }

    /// <summary>
    /// Get call log by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<CallSummaryDto>> GetCallById(Guid id)
    {
        var callLog = await _callLogService.GetByIdAsync(id);

        if (callLog == null)
        {
            return NotFound(new { message = "Call log not found" });
        }

        return Ok(MapToDto(callLog));
    }

    /// <summary>
    /// Get all active calls (ringing or in-progress)
    /// </summary>
    [HttpGet("active")]
    public async Task<ActionResult<List<CallSummaryDto>>> GetActiveCalls()
    {
        var activeCalls = await _callLogService.GetActiveCallsAsync();
        var callSummaries = activeCalls.Select(MapToDto).ToList();

        return Ok(callSummaries);
    }

    /// <summary>
    /// Get recent call history
    /// </summary>
    [HttpGet("history")]
    public async Task<ActionResult<List<CallSummaryDto>>> GetRecentHistory([FromQuery] int take = 50)
    {
        var recentCalls = await _callLogService.GetRecentHistoryAsync(take);
        var callSummaries = recentCalls.Select(MapToDto).ToList();

        return Ok(callSummaries);
    }

    /// <summary>
    /// Simulate incoming call logging (internal endpoint for testing)
    /// </summary>
    [HttpPost("simulate-incoming-log")]
    public async Task<ActionResult<CallSummaryDto>> SimulateIncomingCallLog([FromBody] CallLogCreateRequest request)
    {
        var callLog = await _callLogService.CreateIncomingAsync(
            request.ProviderCallId,
            request.From,
            request.To,
            request.Direction);

        var callSummary = MapToDto(callLog);

        // Broadcast to all connected clients via SignalR
        await _hubContext.Clients.All.SendAsync("IncomingCall", callSummary);

        return Ok(callSummary);
    }

    /// <summary>
    /// Simulate call status update (internal endpoint for testing)
    /// </summary>
    [HttpPost("simulate-status-update")]
    public async Task<ActionResult<CallSummaryDto>> SimulateCallStatusUpdate([FromBody] CallLogStatusUpdateRequest request)
    {
        var callLog = await _callLogService.UpdateStatusAsync(
            request.ProviderCallId,
            request.Status,
            request.EndedAtUtc,
            request.RecordingUrl);

        if (callLog == null)
        {
            return NotFound(new { message = "Call log not found" });
        }

        var callSummary = MapToDto(callLog);

        // Broadcast to all connected clients via SignalR based on status
        if (callLog.Status == "completed" || callLog.Status == "failed" || callLog.Status == "no-answer")
        {
            await _hubContext.Clients.All.SendAsync("CallEnded", callSummary);
        }
        else
        {
            await _hubContext.Clients.All.SendAsync("CallStatusUpdated", callSummary);
        }

        return Ok(callSummary);
    }

    /// <summary>
    /// Maps a CallLog entity to CallSummaryDto
    /// </summary>
    private static CallSummaryDto MapToDto(Domain.Entities.CallLog call)
    {
        return new CallSummaryDto
        {
            Id = call.Id,
            ProviderCallId = call.ProviderCallId,
            FromNumber = call.FromNumber,
            ToNumber = call.ToNumber,
            Direction = call.Direction,
            Status = call.Status,
            StartedAtUtc = call.StartedAtUtc,
            EndedAtUtc = call.EndedAtUtc,
            RecordingUrl = call.RecordingUrl
        };
    }

    ///// <summary>
    ///// Get all call logs
    ///// </summary>
    //[HttpGet("logs")]
    //public async Task<ActionResult<List<CallLogDto>>> GetAllLogs()
    //{
    //    var logs = await _callLogService.GetAllLogsAsync();
    //    return Ok(logs);
    //}

    ///// <summary>
    ///// Get call log by ID
    ///// </summary>
    //[HttpGet("logs/{id}")]
    //public async Task<ActionResult<CallLogDto>> GetLogById(Guid id)
    //{
    //    var log = await _callLogService.GetLogByIdAsync(id);
    //    if (log == null)
    //        return NotFound();
    //    return Ok(log);
    //}
}

// Request/Response DTOs
public record CallActionRequest
{
    public Guid AgentId { get; init; }
}

public record TransferCallRequest
{
    public Guid FromAgentId { get; init; }
    public Guid? ToAgentId { get; init; }
    public Guid? ToQueueId { get; init; }
    public string TransferType { get; init; } = "blind"; // blind, warm, conference
}

public record HangupCallRequest
{
    public Guid AgentId { get; init; }
    public string? Reason { get; init; }
    public int DurationSeconds { get; init; }
}

public record DialCallRequest
{
    public Guid AgentId { get; init; }
    public string Destination { get; init; } = string.Empty;
    public Guid? CustomerId { get; init; }
    /// <summary>
    /// CRM record ID (Contact, Lead, or Account ID) associated with this call
    /// </summary>
    public Guid? CrmRecordId { get; init; }
    /// <summary>
    /// Type of CRM record: "Contact", "Lead", or "Account"
    /// </summary>
    public string? CrmRecordType { get; init; }
}

public record MuteCallRequest
{
    public Guid AgentId { get; init; }
    public bool IsMuted { get; init; }
}

public record CallActionResult
{
    public bool Success { get; init; }
    public string CallId { get; init; } = string.Empty;
    public string Action { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
}

public record CallLogCreateRequest
{
    public string ProviderCallId { get; init; } = string.Empty;
    public string From { get; init; } = string.Empty;
    public string To { get; init; } = string.Empty;
    public string Direction { get; init; } = "inbound";
}

public record CallLogCreateResponse
{
    public Guid Id { get; init; }
    public string ProviderCallId { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTimeOffset StartedAtUtc { get; init; }
}

public record CallLogStatusUpdateRequest
{
    public string ProviderCallId { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTimeOffset? EndedAtUtc { get; init; }
    public string? RecordingUrl { get; init; }
}
