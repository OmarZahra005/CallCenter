
using CallCenter.Domain.Models;
using CallCenter.Domain.Common.Models;

namespace CallCenter.Domain.Interfaces;
public interface IRepository<T> where T : class
{
    IQueryable<T> GetQueryable();
    Task<PagedResult<T>> GetPagedAsync(int page, int pageSize, string? searchTerm, string? sortBy, bool sortDescending, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    void Update(T entity);
    void DeleteAsync(T entity);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync<TKey>(TKey id, CancellationToken cancellationToken = default);
}
