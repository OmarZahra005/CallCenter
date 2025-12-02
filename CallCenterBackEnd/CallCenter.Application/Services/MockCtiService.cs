using CallCenter.Application.Interfaces;

namespace CallCenter.Application.Services;

public interface IMockCtiService
{
    Task SimulateIncomingCallAsync(Guid agentId, string callerNumber, string? callerName = null);
    Task SimulateCallAnsweredAsync(Guid agentId, Guid callId);
    Task SimulateCallEndedAsync(Guid agentId, Guid callId, int durationSeconds);
    Task SimulateCallTransferredAsync(Guid fromAgentId, Guid toAgentId, Guid callId);
    Task SimulateCallOnHoldAsync(Guid agentId, Guid callId);
    Task StartAutoCallSimulationAsync(CancellationToken cancellationToken);
}

public class MockCtiService : IMockCtiService
{
    private readonly IHubNotificationService _hubNotificationService;
    private static readonly Random _random = new();
    private static readonly string[] _callerNames = { "John Smith", "Jane Doe", "Bob Wilson", "Alice Brown", "Charlie Davis", "Emma Johnson" };
    private static readonly string[] _phoneNumbers = { "+1-555-0100", "+1-555-0101", "+1-555-0102", "+1-555-0103", "+1-555-0104" };

    public MockCtiService(IHubNotificationService hubNotificationService)
    {
        _hubNotificationService = hubNotificationService;
    }

    public async Task SimulateIncomingCallAsync(Guid agentId, string callerNumber, string? callerName = null)
    {
        var callInfo = new
        {
            CallId = Guid.NewGuid(),
            CallerNumber = callerNumber,
            CallerName = callerName ?? _callerNames[_random.Next(_callerNames.Length)],
            Direction = "Inbound",
            QueueName = "General Support",
            WaitTimeSeconds = _random.Next(5, 60),
            StartTime = DateTime.UtcNow
        };

        await _hubNotificationService.NotifyIncomingCallAsync(agentId.ToString(), callInfo);
    }

    public async Task SimulateCallAnsweredAsync(Guid agentId, Guid callId)
    {
        var callInfo = new
        {
            CallId = callId,
            AgentId = agentId,
            AnsweredAt = DateTime.UtcNow,
            Status = "Connected"
        };

        await _hubNotificationService.NotifyCallAnsweredAsync(agentId.ToString(), callInfo);

        // Also update agent state to Busy
        await _hubNotificationService.NotifyAgentStateChangedAsync(agentId.ToString(), "Busy", "On call");
    }

    public async Task SimulateCallEndedAsync(Guid agentId, Guid callId, int durationSeconds)
    {
        var callSummary = new
        {
            CallId = callId,
            AgentId = agentId,
            DurationSeconds = durationSeconds,
            EndedAt = DateTime.UtcNow,
            Disposition = "Resolved",
            WrapUpRequired = true
        };

        await _hubNotificationService.NotifyCallEndedAsync(agentId.ToString(), callSummary);

        // Update agent state to ACW (After Call Work)
        await _hubNotificationService.NotifyAgentStateChangedAsync(agentId.ToString(), "ACW", "Completing call wrap-up");
    }

    public async Task SimulateCallTransferredAsync(Guid fromAgentId, Guid toAgentId, Guid callId)
    {
        var transferInfo = new
        {
            CallId = callId,
            FromAgentId = fromAgentId,
            ToAgentId = toAgentId,
            TransferredAt = DateTime.UtcNow,
            TransferType = "Warm"
        };

        // Notify the receiving agent
        await _hubNotificationService.NotifyIncomingCallAsync(toAgentId.ToString(), new
        {
            CallId = callId,
            Direction = "Transfer",
            FromAgentId = fromAgentId,
            TransferType = "Warm"
        });

        // Update original agent state to Available
        await _hubNotificationService.NotifyAgentStateChangedAsync(fromAgentId.ToString(), "Available", "Transfer completed");
    }

    public async Task SimulateCallOnHoldAsync(Guid agentId, Guid callId)
    {
        var holdInfo = new
        {
            CallId = callId,
            AgentId = agentId,
            HoldStartTime = DateTime.UtcNow
        };

        await _hubNotificationService.BroadcastNotificationAsync(
            "Call On Hold",
            $"Agent placed call {callId} on hold",
            "warning");
    }

    public async Task StartAutoCallSimulationAsync(CancellationToken cancellationToken)
    {
        // This method would be called by a background service to simulate continuous call flow
        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                // Wait between 30 seconds to 2 minutes before next call
                var delaySeconds = _random.Next(30, 120);
                await Task.Delay(TimeSpan.FromSeconds(delaySeconds), cancellationToken);

                // Simulate incoming call to a random agent
                var agentId = Guid.NewGuid(); // In real use, would pick from actual available agents
                var phoneNumber = _phoneNumbers[_random.Next(_phoneNumbers.Length)];

                await SimulateIncomingCallAsync(agentId, phoneNumber);

                // Simulate call being answered after 5-15 seconds
                await Task.Delay(TimeSpan.FromSeconds(_random.Next(5, 15)), cancellationToken);
                var callId = Guid.NewGuid();
                await SimulateCallAnsweredAsync(agentId, callId);

                // Simulate call duration of 1-5 minutes
                var durationSeconds = _random.Next(60, 300);
                await Task.Delay(TimeSpan.FromSeconds(Math.Min(durationSeconds, 60)), cancellationToken);
                await SimulateCallEndedAsync(agentId, callId, durationSeconds);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }
}
