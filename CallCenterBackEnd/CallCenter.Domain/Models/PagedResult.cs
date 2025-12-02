namespace CallCenter.Domain.Models;
public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int PageCount { get; set; }
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int Page { get; set; }

    // Helper properties
    public bool HasPreviousPage => CurrentPage > 1;
    public bool HasNextPage => CurrentPage < PageCount;
}
