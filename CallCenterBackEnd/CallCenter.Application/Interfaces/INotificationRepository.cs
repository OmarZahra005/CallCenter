using CallCenter.Domain.Entities;

namespace CallCenter.Application.Interfaces;

public interface INotificationRepository
{
    Task<Notification> AddAsync(Notification notification);
    Task<Notification?> GetByIdAsync(Guid id);
    Task<List<Notification>> GetByUserIdAsync(Guid userId, bool unreadOnly = false, int pageSize = 20);
    Task UpdateAsync(Notification notification);
}
