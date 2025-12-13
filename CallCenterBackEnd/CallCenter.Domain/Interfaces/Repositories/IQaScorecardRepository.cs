using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IQaScorecardRepository : IRepository<QaScorecard>
{
    Task<QaScorecard?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QaScorecard>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QaScorecard>> GetByEvaluatorIdAsync(Guid evaluatorId, CancellationToken cancellationToken = default);
    Task<QaScorecard?> GetByRecordingIdAsync(Guid recordingId, CancellationToken cancellationToken = default);
    Task<QaScorecard?> GetByCallSidAsync(string callSid, CancellationToken cancellationToken = default);
}
