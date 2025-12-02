using CallCenter.Application.Services;
using CallCenter.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using CallCenter.API.Hubs;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/calls")]
public class CallControlController : ControllerBase
{
    private readonly ICtiService _ctiService;
    private readonly IHubContext<CallCenterHub> _hubContext;

    public CallControlController(
        ICtiService ctiService,
        IHubContext<CallCenterHub> hubContext)
    {
        _ctiService = ctiService;
        _hubContext = hubContext;
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
            Metadata = $"{{\"action\":\"dial\",\"destination\":\"{request.Destination}\",\"customerId\":\"{request.CustomerId}\",\"timestamp\":\"{DateTime.UtcNow:O}\"}}"
        });

        await _hubContext.Clients.All.SendAsync("OutboundCallStarted", new
        {
            callId,
            agentId = request.AgentId,
            destination = request.Destination,
            customerId = request.CustomerId
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
