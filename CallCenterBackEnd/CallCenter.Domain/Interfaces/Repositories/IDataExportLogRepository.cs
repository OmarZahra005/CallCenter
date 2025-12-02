using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IDataExportLogRepository : IRepository<DataExportLog>
{
    Task<DataExportLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DataExportLog>> GetByExportedByAsync(Guid agentId, CancellationToken cancellationToken = default);
}
