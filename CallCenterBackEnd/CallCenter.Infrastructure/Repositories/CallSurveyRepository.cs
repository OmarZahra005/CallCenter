using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class CallSurveyRepository : Repository<CallSurvey>, ICallSurveyRepository
{
    public CallSurveyRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<CallSurvey?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Agent)
            .FirstOrDefaultAsync(s => s.Token == token, cancellationToken);
    }

    public async Task<CallSurvey?> GetByCallIdAsync(string callId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Agent)
            .FirstOrDefaultAsync(s => s.CallId == callId, cancellationToken);
    }

    public async Task<List<CallSurvey>> GetByStatusAsync(CallSurveyStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(s => s.Status == status)
            .OrderBy(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<CallSurvey>> GetExpiredSurveysAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Where(s => s.Status == CallSurveyStatus.Pending || s.Status == CallSurveyStatus.Sent)
            .Where(s => s.ExpiresAt < now)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<CallSurvey>> GetByAgentIdAsync(
        Guid agentId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Where(s => s.AgentId == agentId);

        if (fromDate.HasValue)
            query = query.Where(s => s.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(s => s.CreatedAt <= toDate.Value);

        return await query
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<CallSurvey>> GetByQueueIdAsync(
        Guid queueId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Where(s => s.QueueId == queueId);

        if (fromDate.HasValue)
            query = query.Where(s => s.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(s => s.CreatedAt <= toDate.Value);

        return await query
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<CallSurvey>> GetCompletedSurveysAsync(
        DateTime fromDate,
        DateTime toDate,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Agent)
            .Where(s => s.Status == CallSurveyStatus.Completed)
            .Where(s => s.RespondedAt >= fromDate && s.RespondedAt <= toDate)
            .OrderByDescending(s => s.RespondedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsForCallAsync(string callId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(s => s.CallId == callId, cancellationToken);
    }
}
