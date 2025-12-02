using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Queues;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces.Repositories;

namespace CallCenter.Application.Services;

public interface IQueueService
{
    Task<PagedResponse<QueueDto>> GetQueuesAsync(PagedRequest request);
    Task<QueueDto?> GetQueueByIdAsync(Guid id);
    Task<QueueDto> CreateQueueAsync(CreateQueueRequest request);
    Task<QueueDto?> UpdateQueueAsync(Guid id, UpdateQueueRequest request);
    Task<bool> DeleteQueueAsync(Guid id);
    Task<List<QueueDto>> GetActiveQueuesAsync();
}

public class QueueService : IQueueService
{
    private readonly IQueueRepository _queueRepository;

    public QueueService(IQueueRepository queueRepository)
    {
        _queueRepository = queueRepository;
    }

    public async Task<PagedResponse<QueueDto>> GetQueuesAsync(PagedRequest request)
    {
        var queues = await _queueRepository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            null,
            request.SortBy,
            request.SortDescending);

        return new PagedResponse<QueueDto>
        {
            Items = queues.Items.Select(MapToDto).ToList(),
            PageNumber = queues.CurrentPage,
            PageSize = queues.PageSize,
            TotalCount = queues.TotalCount,
            TotalPages = queues.PageCount
        };
    }

    public async Task<QueueDto?> GetQueueByIdAsync(Guid id)
    {
        var queue = await _queueRepository.GetByIdAsync(id);
        if (queue == null) return null;
        return MapToDto(queue);
    }

    public async Task<QueueDto> CreateQueueAsync(CreateQueueRequest request)
    {
        var queue = new Queue
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Priority = request.Priority,
            MaxWaitTimeSeconds = request.MaxWaitTimeSeconds,
            TeamId = request.TeamId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _queueRepository.AddAsync(queue);
        await _queueRepository.SaveChangesAsync();
        return MapToDto(queue);
    }

    public async Task<QueueDto?> UpdateQueueAsync(Guid id, UpdateQueueRequest request)
    {
        var queue = await _queueRepository.GetByIdAsync(id);
        if (queue == null) return null;

        queue.Name = request.Name;
        queue.Description = request.Description;
        queue.Priority = request.Priority;
        queue.MaxWaitTimeSeconds = request.MaxWaitTimeSeconds;
        queue.TeamId = request.TeamId;
        queue.IsActive = request.IsActive;

        _queueRepository.Update(queue);
        await _queueRepository.SaveChangesAsync();
        return MapToDto(queue);
    }

    public async Task<bool> DeleteQueueAsync(Guid id)
    {
        var queue = await _queueRepository.GetByIdAsync(id);
        if (queue == null) return false;

        queue.IsActive = false;
        _queueRepository.Update(queue);
        await _queueRepository.SaveChangesAsync();
        return true;
    }

    public async Task<List<QueueDto>> GetActiveQueuesAsync()
    {
        var queues = await _queueRepository.GetActiveQueuesAsync();
        return queues.Select(MapToDto).ToList();
    }

    private static QueueDto MapToDto(Queue queue)
    {
        return new QueueDto
        {
            Id = queue.Id,
            Name = queue.Name,
            Description = queue.Description,
            Priority = queue.Priority,
            MaxWaitTimeSeconds = queue.MaxWaitTimeSeconds,
            TeamId = queue.TeamId,
            TeamName = queue.Team?.Name,
            IsActive = queue.IsActive,
            CreatedAt = queue.CreatedAt
        };
    }
}
