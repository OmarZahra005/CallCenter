using CallCenter.Domain.Models;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Domain.Extensions;
public static class QueryableExtensions
{
    public static async Task<PagedResult<TDestination>> ToMappedPagedResultAsync<TSource, TDestination>(
    this IQueryable<TSource> query,
    IMapper mapper,
    int page,
    int pageSize)
    {
        var totalCount = await query.CountAsync();
        var pageCount = (int)Math.Ceiling(totalCount / (double)pageSize);

        // Ensure current page is within valid range
        page = Math.Max(1, Math.Min(page, pageCount));

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<TDestination>
        {
            Items = mapper.Map<IEnumerable<TDestination>>(items),
            TotalCount = totalCount,
            PageCount = pageCount,
            CurrentPage = page,
            PageSize = pageSize
        };
    }
    public static async Task<PagedResult<T>> ToPagedResultAsync<T>(
        this IQueryable<T> query,
        int page,
        int pageSize)
    {
        var totalCount = await query.CountAsync();
        var pageCount = (int)Math.Ceiling(totalCount / (double)pageSize);

        // Ensure current page is within valid range
        page = Math.Max(1, Math.Min(page, pageCount));

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<T>
        {
            Items = items,
            TotalCount = totalCount,
            PageCount = pageCount,
            CurrentPage = page,
            PageSize = pageSize
        };
    }
}
