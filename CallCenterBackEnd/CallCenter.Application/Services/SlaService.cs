using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Sla;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Interfaces;

namespace CallCenter.Application.Services;

public interface ISlaService
{
    Task<PagedResponse<SlaRuleDto>> GetRulesAsync(PagedRequest request);
    Task<SlaRuleDto?> GetRuleByIdAsync(Guid id);
    Task<SlaRuleDto> CreateRuleAsync(CreateSlaRuleRequest request);
    Task<SlaRuleDto?> UpdateRuleAsync(Guid id, UpdateSlaRuleRequest request);
    Task<bool> DeleteRuleAsync(Guid id);
    Task<List<SlaRuleDto>> GetActiveRulesAsync();
}

public class SlaService : ISlaService
{
    private readonly IRepository<SlaRule> _repository;

    public SlaService(IRepository<SlaRule> repository)
    {
        _repository = repository;
    }

    public async Task<PagedResponse<SlaRuleDto>> GetRulesAsync(PagedRequest request)
    {
        var rules = await _repository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            null,
            request.SortBy,
            request.SortDescending);

        return new PagedResponse<SlaRuleDto>
        {
            Items = rules.Items.Select(MapToDto).ToList(),
            PageNumber = rules.CurrentPage,
            PageSize = rules.PageSize,
            TotalCount = rules.TotalCount,
            TotalPages = rules.PageCount
        };
    }

    public async Task<SlaRuleDto?> GetRuleByIdAsync(Guid id)
    {
        var all = await _repository.GetAllAsync();
        var rule = all.FirstOrDefault(r => r.Id == id);
        return rule != null ? MapToDto(rule) : null;
    }

    public async Task<SlaRuleDto> CreateRuleAsync(CreateSlaRuleRequest request)
    {
        var rule = new SlaRule
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Category = request.Category,
            Priority = request.Priority,
            FirstResponseTimeMinutes = request.FirstResponseTimeMinutes,
            ResolveTimeMinutes = request.ResolveTimeMinutes,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(rule);
        await _repository.SaveChangesAsync();
        return MapToDto(rule);
    }

    public async Task<SlaRuleDto?> UpdateRuleAsync(Guid id, UpdateSlaRuleRequest request)
    {
        var all = await _repository.GetAllAsync();
        var rule = all.FirstOrDefault(r => r.Id == id);
        if (rule == null) return null;

        rule.Name = request.Name;
        rule.Category = request.Category;
        rule.Priority = request.Priority;
        rule.FirstResponseTimeMinutes = request.FirstResponseTimeMinutes;
        rule.ResolveTimeMinutes = request.ResolveTimeMinutes;
        rule.IsActive = request.IsActive;
        rule.UpdatedAt = DateTime.UtcNow;

        _repository.Update(rule);
        await _repository.SaveChangesAsync();
        return MapToDto(rule);
    }

    public async Task<bool> DeleteRuleAsync(Guid id)
    {
        var all = await _repository.GetAllAsync();
        var rule = all.FirstOrDefault(r => r.Id == id);
        if (rule == null) return false;

        rule.IsActive = false;
        rule.UpdatedAt = DateTime.UtcNow;
        _repository.Update(rule);
        await _repository.SaveChangesAsync();
        return true;
    }

    public async Task<List<SlaRuleDto>> GetActiveRulesAsync()
    {
        var all = await _repository.GetAllAsync();
        return all.Where(r => r.IsActive).Select(MapToDto).ToList();
    }

    private static SlaRuleDto MapToDto(SlaRule rule)
    {
        return new SlaRuleDto
        {
            Id = rule.Id,
            Name = rule.Name,
            Category = rule.Category,
            Priority = rule.Priority,
            FirstResponseTimeMinutes = rule.FirstResponseTimeMinutes,
            ResolveTimeMinutes = rule.ResolveTimeMinutes,
            IsActive = rule.IsActive,
            CreatedAt = rule.CreatedAt
        };
    }
}
