using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IQaFormCriteriaRepository : IRepository<QaFormCriteria>
{
    Task<QaFormCriteria?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QaFormCriteria>> GetByFormIdAsync(Guid formId, CancellationToken cancellationToken = default);
}
