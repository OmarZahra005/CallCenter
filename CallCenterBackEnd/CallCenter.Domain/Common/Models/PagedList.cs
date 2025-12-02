namespace CallCenter.Domain.Common.Models;

public class PagedList<T>
{
    public List<T> Items { get; } = [];
    public int TotalCount { get; }
    public int PageNumber { get; }
    public int PageSize { get; }
    public int TotalPages { get => (int)Math.Ceiling(TotalCount / (double)PageSize); }
    public bool HasPrevious => PageNumber > 1;
    public bool HasNext => PageNumber < TotalPages;
    public string? Message { get; set; }
    public PagedList() { }
    public PagedList(List<T> items, int totalCount, int pageNumber, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        PageNumber = pageNumber;
        PageSize = pageSize;
    }
}