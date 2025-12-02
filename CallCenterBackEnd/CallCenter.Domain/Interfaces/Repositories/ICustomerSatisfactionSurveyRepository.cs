using CallCenter.Domain.Entities;

namespace CallCenter.Domain.Interfaces.Repositories;

public interface ICustomerSatisfactionSurveyRepository : IRepository<CustomerSatisfactionSurvey>
{
    Task<CustomerSatisfactionSurvey?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CustomerSatisfactionSurvey>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CustomerSatisfactionSurvey>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
}
