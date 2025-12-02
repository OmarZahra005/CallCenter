using CallCenter.Application.Interfaces;
using CallCenter.Domain.Entities;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Repositories;

public class NotificationRepository : Repository<Notification>, INotificationRepository
{
    public NotificationRepository(ApplicationDbContext context) : base(context)
    {
    }

    public new async Task<Notification> AddAsync(Notification notification)
    {
        await _dbSet.AddAsync(notification);
        await _context.SaveChangesAsync();
        return notification;
    }

    public async Task<Notification?> GetByIdAsync(Guid id)
    {
        return await _dbSet.FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task<List<Notification>> GetByUserIdAsync(Guid userId, bool unreadOnly = false, int pageSize = 20)
    {
        var query = _dbSet.Where(n => n.RecipientId == userId);

        if (unreadOnly)
            query = query.Where(n => !n.IsRead);

        return await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task UpdateAsync(Notification notification)
    {
        _dbSet.Update(notification);
        await _context.SaveChangesAsync();
    }
}
