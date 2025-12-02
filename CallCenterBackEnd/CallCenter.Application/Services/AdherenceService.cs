using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces;

namespace CallCenter.Application.Services;

public interface IAdherenceService
{
    Task<AdherenceDto> GetAgentAdherenceAsync(Guid agentId, DateTime date);
    Task<List<AdherenceDto>> GetTeamAdherenceAsync(Guid teamId, DateTime date);
    Task<AdherenceDto> RecordAdherenceEventAsync(RecordAdherenceRequest request);
    Task<AdherenceSummaryDto> GetAdherenceSummaryAsync(Guid agentId, DateTime startDate, DateTime endDate);
}

public class AdherenceService : IAdherenceService
{
    private readonly IRepository<ScheduleAdherence> _repository;

    public AdherenceService(IRepository<ScheduleAdherence> repository)
    {
        _repository = repository;
    }

    public async Task<AdherenceDto> GetAgentAdherenceAsync(Guid agentId, DateTime date)
    {
        var all = await _repository.GetAllAsync();
        var adherenceRecords = all.Where(a => a.AgentId == agentId && a.Date == DateOnly.FromDateTime(date)).ToList();

        if (!adherenceRecords.Any())
        {
            return new AdherenceDto
            {
                AgentId = agentId,
                Date = DateOnly.FromDateTime(date),
                ScheduledMinutes = 0,
                ActualMinutes = 0,
                AdherencePercentage = 100,
                ConformancePercentage = 100
            };
        }

        var totalScheduled = adherenceRecords.Sum(a => a.ScheduledMinutes);
        var totalActual = adherenceRecords.Sum(a => a.ActualMinutes);
        var adherencePercent = totalScheduled > 0 ? (float)totalActual / totalScheduled * 100 : 100;

        return new AdherenceDto
        {
            AgentId = agentId,
            Date = DateOnly.FromDateTime(date),
            ScheduledMinutes = totalScheduled,
            ActualMinutes = totalActual,
            AdherencePercentage = Math.Min(adherencePercent, 100),
            ConformancePercentage = CalculateConformance(adherenceRecords),
            Events = adherenceRecords.Select(a => new AdherenceEventDto
            {
                ScheduledActivity = a.ScheduledActivity,
                ActualActivity = a.ActualActivity,
                ScheduledStart = a.ScheduledStart,
                ActualStart = a.ActualStart,
                Duration = a.ActualMinutes,
                IsCompliant = a.ActualActivity == a.ScheduledActivity
            }).ToList()
        };
    }

    public async Task<List<AdherenceDto>> GetTeamAdherenceAsync(Guid teamId, DateTime date)
    {
        var all = await _repository.GetAllAsync();
        var dateOnly = DateOnly.FromDateTime(date);

        var agentIds = all.Where(a => a.Date == dateOnly)
            .Select(a => a.AgentId)
            .Distinct();

        var results = new List<AdherenceDto>();
        foreach (var agentId in agentIds)
        {
            results.Add(await GetAgentAdherenceAsync(agentId, date));
        }

        return results;
    }

    public async Task<AdherenceDto> RecordAdherenceEventAsync(RecordAdherenceRequest request)
    {
        var adherence = new ScheduleAdherence
        {
            Id = Guid.NewGuid(),
            AgentId = request.AgentId,
            Date = request.Date,
            ScheduledActivity = request.ScheduledActivity,
            ActualActivity = request.ActualActivity,
            ScheduledStart = request.ScheduledStart,
            ActualStart = request.ActualStart,
            ScheduledMinutes = request.ScheduledMinutes,
            ActualMinutes = request.ActualMinutes,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(adherence);
        await _repository.SaveChangesAsync();

        return await GetAgentAdherenceAsync(request.AgentId, request.Date.ToDateTime(TimeOnly.MinValue));
    }

    public async Task<AdherenceSummaryDto> GetAdherenceSummaryAsync(Guid agentId, DateTime startDate, DateTime endDate)
    {
        var all = await _repository.GetAllAsync();
        var records = all.Where(a =>
            a.AgentId == agentId &&
            a.Date >= DateOnly.FromDateTime(startDate) &&
            a.Date <= DateOnly.FromDateTime(endDate)).ToList();

        if (!records.Any())
        {
            return new AdherenceSummaryDto
            {
                AgentId = agentId,
                StartDate = DateOnly.FromDateTime(startDate),
                EndDate = DateOnly.FromDateTime(endDate),
                AverageAdherence = 100,
                AverageConformance = 100,
                TotalScheduledMinutes = 0,
                TotalActualMinutes = 0
            };
        }

        var totalScheduled = records.Sum(r => r.ScheduledMinutes);
        var totalActual = records.Sum(r => r.ActualMinutes);
        var avgAdherence = totalScheduled > 0 ? (float)totalActual / totalScheduled * 100 : 100;

        return new AdherenceSummaryDto
        {
            AgentId = agentId,
            StartDate = DateOnly.FromDateTime(startDate),
            EndDate = DateOnly.FromDateTime(endDate),
            AverageAdherence = Math.Min(avgAdherence, 100),
            AverageConformance = CalculateConformance(records),
            TotalScheduledMinutes = totalScheduled,
            TotalActualMinutes = totalActual,
            DailyAdherence = records.GroupBy(r => r.Date)
                .Select(g => new DailyAdherenceDto
                {
                    Date = g.Key,
                    Adherence = g.Sum(r => r.ScheduledMinutes) > 0
                        ? (float)g.Sum(r => r.ActualMinutes) / g.Sum(r => r.ScheduledMinutes) * 100
                        : 100
                }).ToList()
        };
    }

    private static float CalculateConformance(List<ScheduleAdherence> records)
    {
        if (!records.Any()) return 100;
        var compliant = records.Count(r => r.ActualActivity == r.ScheduledActivity);
        return (float)compliant / records.Count * 100;
    }
}

// DTOs
public record AdherenceDto
{
    public Guid AgentId { get; init; }
    public DateOnly Date { get; init; }
    public int ScheduledMinutes { get; init; }
    public int ActualMinutes { get; init; }
    public float AdherencePercentage { get; init; }
    public float ConformancePercentage { get; init; }
    public List<AdherenceEventDto> Events { get; init; } = new();
}

public record AdherenceEventDto
{
    public string? ScheduledActivity { get; init; }
    public string? ActualActivity { get; init; }
    public TimeSpan ScheduledStart { get; init; }
    public TimeSpan ActualStart { get; init; }
    public int Duration { get; init; }
    public bool IsCompliant { get; init; }
}

public record AdherenceSummaryDto
{
    public Guid AgentId { get; init; }
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public float AverageAdherence { get; init; }
    public float AverageConformance { get; init; }
    public int TotalScheduledMinutes { get; init; }
    public int TotalActualMinutes { get; init; }
    public List<DailyAdherenceDto> DailyAdherence { get; init; } = new();
}

public record DailyAdherenceDto
{
    public DateOnly Date { get; init; }
    public float Adherence { get; init; }
}

public record RecordAdherenceRequest
{
    public Guid AgentId { get; init; }
    public DateOnly Date { get; init; }
    public string? ScheduledActivity { get; init; }
    public string? ActualActivity { get; init; }
    public TimeSpan ScheduledStart { get; init; }
    public TimeSpan ActualStart { get; init; }
    public int ScheduledMinutes { get; init; }
    public int ActualMinutes { get; init; }
}
