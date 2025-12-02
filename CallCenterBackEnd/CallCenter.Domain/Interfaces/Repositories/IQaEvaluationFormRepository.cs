using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface IQaEvaluationFormRepository : IRepository<QaEvaluationForm>
{
    Task<QaEvaluationForm?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QaEvaluationForm>> GetActiveAsync(CancellationToken cancellationToken = default);
}
