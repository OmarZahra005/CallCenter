using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MockCtiController : ControllerBase
{
    private readonly IMockCtiService _mockCtiService;

    public MockCtiController(IMockCtiService mockCtiService)
    {
        _mockCtiService = mockCtiService;
    }

    [HttpPost("incoming-call")]
    public async Task<ActionResult> SimulateIncomingCall([FromBody] SimulateIncomingCallRequest request)
    {
        await _mockCtiService.SimulateIncomingCallAsync(
            request.AgentId,
            request.CallerNumber,
            request.CallerName);

        return Ok(new { message = "Incoming call simulated", agentId = request.AgentId });
    }

    [HttpPost("call-answered")]
    public async Task<ActionResult> SimulateCallAnswered([FromBody] SimulateCallAnsweredRequest request)
    {
        await _mockCtiService.SimulateCallAnsweredAsync(request.AgentId, request.CallId);
        return Ok(new { message = "Call answered simulated", callId = request.CallId });
    }

    [HttpPost("call-ended")]
    public async Task<ActionResult> SimulateCallEnded([FromBody] SimulateCallEndedRequest request)
    {
        await _mockCtiService.SimulateCallEndedAsync(
            request.AgentId,
            request.CallId,
            request.DurationSeconds);

        return Ok(new { message = "Call ended simulated", callId = request.CallId });
    }

    [HttpPost("call-transferred")]
    public async Task<ActionResult> SimulateCallTransferred([FromBody] SimulateCallTransferredRequest request)
    {
        await _mockCtiService.SimulateCallTransferredAsync(
            request.FromAgentId,
            request.ToAgentId,
            request.CallId);

        return Ok(new { message = "Call transferred simulated", callId = request.CallId });
    }
}

public class SimulateIncomingCallRequest
{
    public Guid AgentId { get; set; }
    public string CallerNumber { get; set; } = string.Empty;
    public string? CallerName { get; set; }
}

public class SimulateCallAnsweredRequest
{
    public Guid AgentId { get; set; }
    public Guid CallId { get; set; }
}

public class SimulateCallEndedRequest
{
    public Guid AgentId { get; set; }
    public Guid CallId { get; set; }
    public int DurationSeconds { get; set; }
}

public class SimulateCallTransferredRequest
{
    public Guid FromAgentId { get; set; }
    public Guid ToAgentId { get; set; }
    public Guid CallId { get; set; }
}
