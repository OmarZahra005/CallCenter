using System.Text.Json;
using CallCenter.Application.DTOs.CallLog;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces;
using CallCenter.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace CallCenter.Application.Services;

public interface ICallLogService
{
    Task<object> LogCallDataAsync(object request);
    Task<CallLog> CreateIncomingAsync(string providerCallId, string from, string to, string direction);
    Task<CallLog?> UpdateStatusAsync(string providerCallId, string status, DateTimeOffset? endedAtUtc = null, string? recordingUrl = null);
    Task<CallLog> AssignToAgentAsync(string providerCallId, Guid agentId, string agentIdentity);
    Task<CallLog?> GetByProviderIdAsync(string providerCallId);
    Task<CallLog?> GetByIdAsync(Guid id);
    Task<List<CallLog>> GetActiveCallsAsync();
    Task<List<CallLog>> GetRecentHistoryAsync(int take = 50);
}

public class CallLogService : ICallLogService
{
    private readonly ILogger<CallLogService> _logger;
    private readonly ICallLogRepository _callLogRepository;

    public CallLogService(ILogger<CallLogService> logger, ICallLogRepository callLogRepository)
    {
        _logger = logger;
        _callLogRepository = callLogRepository;
    }

    public async Task<object> LogCallDataAsync(object request)
    {
        _logger.LogInformation("Call log data: {Data}", JsonSerializer.Serialize(request));
        return request;
    }

    public async Task<CallLog> CreateIncomingAsync(string providerCallId, string from, string to, string direction)
    {
        var callLog = new CallLog
        {
            Id = Guid.NewGuid(),
            ProviderCallId = providerCallId,
            FromNumber = from,
            ToNumber = to,
            Direction = direction,
            Status = "ringing",
            StartedAtUtc = DateTimeOffset.UtcNow
        };

        await _callLogRepository.AddAsync(callLog);
        await _callLogRepository.SaveChangesAsync();

        _logger.LogInformation("Created call log {CallLogId} for provider call {ProviderCallId}", callLog.Id, providerCallId);
        return callLog;
    }

    public async Task<CallLog?> UpdateStatusAsync(string providerCallId, string status, DateTimeOffset? endedAtUtc = null, string? recordingUrl = null)
    {
        var callLog = await _callLogRepository.GetByProviderIdAsync(providerCallId);

        if (callLog == null)
        {
            _logger.LogWarning("Call log not found for provider call {ProviderCallId}", providerCallId);
            return null;
        }

        callLog.Status = status;
        if (endedAtUtc.HasValue)
        {
            callLog.EndedAtUtc = endedAtUtc.Value;
        }
        if (!string.IsNullOrEmpty(recordingUrl))
        {
            callLog.RecordingUrl = recordingUrl;
        }

        _callLogRepository.Update(callLog);
        await _callLogRepository.SaveChangesAsync();

        _logger.LogInformation("Updated call log {CallLogId} status to {Status}", callLog.Id, status);
        return callLog;
    }

    public async Task<CallLog> AssignToAgentAsync(string providerCallId, Guid agentId, string agentIdentity)
    {
        var callLog = await _callLogRepository.GetByProviderIdAsync(providerCallId);

        if (callLog == null)
        {
            throw new InvalidOperationException($"Call log not found for provider call {providerCallId}");
        }

        callLog.AssignedAgentId = agentId;
        callLog.AssignedAgentIdentity = agentIdentity;

        _callLogRepository.Update(callLog);
        await _callLogRepository.SaveChangesAsync();

        _logger.LogInformation("Assigned call {CallLogId} to agent {AgentId} ({AgentIdentity})", callLog.Id, agentId, agentIdentity);
        return callLog;
    }

    public async Task<CallLog?> GetByProviderIdAsync(string providerCallId)
    {
        return await _callLogRepository.GetByProviderIdAsync(providerCallId);
    }

    public async Task<CallLog?> GetByIdAsync(Guid id)
    {
        var callLogs = await _callLogRepository.GetAllAsync();
        return callLogs.FirstOrDefault(c => c.Id == id);
    }

    public async Task<List<CallLog>> GetActiveCallsAsync()
    {
        var activeStatuses = new[] { "ringing", "in-progress", "Ringing", "InProgress", "In-Progress" };

        var allCalls = await _callLogRepository.GetAllAsync();
        return allCalls
            .Where(c => activeStatuses.Contains(c.Status))
            .OrderByDescending(c => c.StartedAtUtc)
            .ToList();
    }

    public async Task<List<CallLog>> GetRecentHistoryAsync(int take = 50)
    {
        var allCalls = await _callLogRepository.GetAllAsync();
        return allCalls
            .OrderByDescending(c => c.StartedAtUtc)
            .Take(take)
            .ToList();
    }
}
