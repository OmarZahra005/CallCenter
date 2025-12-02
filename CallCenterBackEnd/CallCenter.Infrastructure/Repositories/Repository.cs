using CallCenter.Domain.Interfaces;
using CallCenter.Domain.Models;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly ApplicationDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(ApplicationDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public IQueryable<T> GetQueryable()
    {
        return _dbSet.AsQueryable();
    }

    public async Task<PagedResult<T>> GetPagedAsync(
        int page,
        int pageSize,
        string? searchTerm,
        string? sortBy,
        bool sortDescending,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.AsQueryable();

        var totalCount = await query.CountAsync(cancellationToken);
        var pageCount = (int)Math.Ceiling(totalCount / (double)pageSize);

        if (!string.IsNullOrEmpty(sortBy))
        {
            var property = typeof(T).GetProperty(sortBy);
            if (property != null)
            {
                query = sortDescending
                    ? query.OrderByDescending(e => EF.Property<object>(e, sortBy))
                    : query.OrderBy(e => EF.Property<object>(e, sortBy));
            }
        }

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<T>
        {
            Items = items,
            TotalCount = totalCount,
            PageCount = pageCount,
            CurrentPage = page,
            PageSize = pageSize,
            Page = page
        };
    }

    public async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.ToListAsync(cancellationToken);
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.CountAsync(cancellationToken);
    }

    public async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
        return entity;
    }

    public void Update(T entity)
    {
        _dbSet.Update(entity);
    }

    public void DeleteAsync(T entity)
    {
        _dbSet.Remove(entity);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync<TKey>(TKey id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbSet.FindAsync(new object[] { id! }, cancellationToken);
        return entity != null;
    }
}
