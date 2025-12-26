using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.DataExports;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Application.Services;

public interface IDataExportService
{
    Task<PagedResponse<DataExportDto>> GetExportsAsync(PagedRequest request);
    Task<DataExportDto?> GetExportByIdAsync(Guid id);
    Task<DataExportDto> CreateExportAsync(CreateDataExportRequest request, Guid userId, string userName);
    Task<bool> DeleteExportAsync(Guid id);
    Task<List<ScheduledExportDto>> GetScheduledExportsAsync();
    Task<ScheduledExportDto?> GetScheduledExportByIdAsync(Guid id);
    Task<ScheduledExportDto> CreateScheduledExportAsync(CreateScheduledExportRequest request, Guid userId);
    Task<ScheduledExportDto?> UpdateScheduledExportAsync(Guid id, UpdateScheduledExportRequest request);
    Task<bool> DeleteScheduledExportAsync(Guid id);
    Task<bool> ToggleScheduledExportAsync(Guid id, bool isActive);
}

public class DataExportService : IDataExportService
{
    private readonly IRepository<DataExport> _exportRepository;
    private readonly IRepository<ScheduledExport> _scheduledRepository;

    public DataExportService(
        IRepository<DataExport> exportRepository,
        IRepository<ScheduledExport> scheduledRepository)
    {
        _exportRepository = exportRepository;
        _scheduledRepository = scheduledRepository;
    }

    public async Task<PagedResponse<DataExportDto>> GetExportsAsync(PagedRequest request)
    {
        var exports = await _exportRepository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            null,
            request.SortBy ?? "CreatedAt",
            request.SortDescending);

        return new PagedResponse<DataExportDto>
        {
            Items = exports.Items.Select(MapToDto).ToList(),
            PageNumber = exports.CurrentPage,
            PageSize = exports.PageSize,
            TotalCount = exports.TotalCount,
            TotalPages = exports.PageCount
        };
    }

    public async Task<DataExportDto?> GetExportByIdAsync(Guid id)
    {
        var export = await _exportRepository.GetQueryable().FirstOrDefaultAsync(e => e.Id == id);
        return export == null ? null : MapToDto(export);
    }

    public async Task<DataExportDto> CreateExportAsync(CreateDataExportRequest request, Guid userId, string userName)
    {
        var export = new DataExport
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Type = DataExportType.Manual,
            DataSource = request.DataSource,
            Format = ParseFormat(request.Format),
            Status = DataExportStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedById = userId,
            CreatedByName = userName
        };

        // Store date filters in Filters JSON if provided
        if (request.DateFrom.HasValue || request.DateTo.HasValue)
        {
            var filters = new { dateFrom = request.DateFrom, dateTo = request.DateTo };
            export.Filters = System.Text.Json.JsonSerializer.Serialize(filters);
        }

        await _exportRepository.AddAsync(export);
        await _exportRepository.SaveChangesAsync();

        // In a real implementation, you would queue a background job here to process the export
        // For now, we'll just mark it as completed with some sample data
        export.Status = DataExportStatus.Completed;
        export.CompletedAt = DateTime.UtcNow;
        export.RecordCount = 100;
        export.FileSize = 1024 * 50; // 50 KB
        export.FileUrl = $"/exports/{export.Id}.{request.Format.ToLower()}";
        _exportRepository.Update(export);
        await _exportRepository.SaveChangesAsync();

        return MapToDto(export);
    }

    public async Task<bool> DeleteExportAsync(Guid id)
    {
        var export = await _exportRepository.GetQueryable().FirstOrDefaultAsync(e => e.Id == id);
        if (export == null) return false;

        _exportRepository.DeleteAsync(export);
        await _exportRepository.SaveChangesAsync();
        return true;
    }

    public async Task<List<ScheduledExportDto>> GetScheduledExportsAsync()
    {
        var scheduled = await _scheduledRepository.GetAllAsync();
        return scheduled.Select(MapToScheduledDto).ToList();
    }

    public async Task<ScheduledExportDto?> GetScheduledExportByIdAsync(Guid id)
    {
        var scheduled = await _scheduledRepository.GetQueryable().FirstOrDefaultAsync(s => s.Id == id);
        return scheduled == null ? null : MapToScheduledDto(scheduled);
    }

    public async Task<ScheduledExportDto> CreateScheduledExportAsync(CreateScheduledExportRequest request, Guid userId)
    {
        var scheduled = new ScheduledExport
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            DataSource = request.DataSource,
            Format = ParseFormat(request.Format),
            Schedule = ParseSchedule(request.Schedule),
            ScheduleTime = request.ScheduleTime,
            ScheduleDayOfWeek = request.ScheduleDayOfWeek,
            ScheduleDayOfMonth = request.ScheduleDayOfMonth,
            Recipients = string.Join(",", request.Recipients),
            IsActive = request.IsActive,
            NextRunAt = CalculateNextRun(request.Schedule, request.ScheduleTime, request.ScheduleDayOfWeek, request.ScheduleDayOfMonth),
            CreatedAt = DateTime.UtcNow,
            CreatedById = userId
        };

        await _scheduledRepository.AddAsync(scheduled);
        await _scheduledRepository.SaveChangesAsync();

        return MapToScheduledDto(scheduled);
    }

    public async Task<ScheduledExportDto?> UpdateScheduledExportAsync(Guid id, UpdateScheduledExportRequest request)
    {
        var scheduled = await _scheduledRepository.GetQueryable().FirstOrDefaultAsync(s => s.Id == id);
        if (scheduled == null) return null;

        scheduled.Name = request.Name;
        scheduled.DataSource = request.DataSource;
        scheduled.Format = ParseFormat(request.Format);
        scheduled.Schedule = ParseSchedule(request.Schedule);
        scheduled.ScheduleTime = request.ScheduleTime;
        scheduled.ScheduleDayOfWeek = request.ScheduleDayOfWeek;
        scheduled.ScheduleDayOfMonth = request.ScheduleDayOfMonth;
        scheduled.Recipients = string.Join(",", request.Recipients);
        scheduled.IsActive = request.IsActive;
        scheduled.NextRunAt = request.IsActive
            ? CalculateNextRun(request.Schedule, request.ScheduleTime, request.ScheduleDayOfWeek, request.ScheduleDayOfMonth)
            : null;

        _scheduledRepository.Update(scheduled);
        await _scheduledRepository.SaveChangesAsync();

        return MapToScheduledDto(scheduled);
    }

    public async Task<bool> DeleteScheduledExportAsync(Guid id)
    {
        var scheduled = await _scheduledRepository.GetQueryable().FirstOrDefaultAsync(s => s.Id == id);
        if (scheduled == null) return false;

        _scheduledRepository.DeleteAsync(scheduled);
        await _scheduledRepository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleScheduledExportAsync(Guid id, bool isActive)
    {
        var scheduled = await _scheduledRepository.GetQueryable().FirstOrDefaultAsync(s => s.Id == id);
        if (scheduled == null) return false;

        scheduled.IsActive = isActive;
        scheduled.NextRunAt = isActive
            ? CalculateNextRun(
                scheduled.Schedule.ToString().ToLower(),
                scheduled.ScheduleTime,
                scheduled.ScheduleDayOfWeek,
                scheduled.ScheduleDayOfMonth)
            : null;

        _scheduledRepository.Update(scheduled);
        await _scheduledRepository.SaveChangesAsync();
        return true;
    }

    private static DataExportDto MapToDto(DataExport export)
    {
        return new DataExportDto
        {
            Id = export.Id,
            Name = export.Name,
            Type = export.Type.ToString().ToLower(),
            DataSource = export.DataSource,
            Format = export.Format.ToString().ToLower(),
            Filters = export.Filters,
            Status = export.Status.ToString().ToLower(),
            Progress = export.Progress,
            FileSize = export.FileSize,
            FileUrl = export.FileUrl,
            RecordCount = export.RecordCount,
            ErrorMessage = export.ErrorMessage,
            CreatedAt = export.CreatedAt,
            CompletedAt = export.CompletedAt,
            ExpiresAt = export.ExpiresAt,
            CreatedBy = export.CreatedByName
        };
    }

    private static ScheduledExportDto MapToScheduledDto(ScheduledExport scheduled)
    {
        return new ScheduledExportDto
        {
            Id = scheduled.Id,
            Name = scheduled.Name,
            DataSource = scheduled.DataSource,
            Format = scheduled.Format.ToString().ToLower(),
            Schedule = scheduled.Schedule.ToString().ToLower(),
            ScheduleTime = scheduled.ScheduleTime,
            ScheduleDayOfWeek = scheduled.ScheduleDayOfWeek,
            ScheduleDayOfMonth = scheduled.ScheduleDayOfMonth,
            Filters = scheduled.Filters,
            Recipients = scheduled.Recipients.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList(),
            IsActive = scheduled.IsActive,
            LastRunAt = scheduled.LastRunAt,
            NextRunAt = scheduled.NextRunAt,
            CreatedAt = scheduled.CreatedAt
        };
    }

    private static ExportFormat ParseFormat(string format)
    {
        return format.ToLower() switch
        {
            "csv" => ExportFormat.Csv,
            "json" => ExportFormat.Json,
            "pdf" => ExportFormat.Pdf,
            _ => ExportFormat.Xlsx
        };
    }

    private static ExportSchedule ParseSchedule(string schedule)
    {
        return schedule.ToLower() switch
        {
            "weekly" => ExportSchedule.Weekly,
            "monthly" => ExportSchedule.Monthly,
            _ => ExportSchedule.Daily
        };
    }

    private static DateTime? CalculateNextRun(string schedule, string time, int? dayOfWeek, int? dayOfMonth)
    {
        var timeParts = time.Split(':');
        var hour = int.Parse(timeParts[0]);
        var minute = timeParts.Length > 1 ? int.Parse(timeParts[1]) : 0;

        var now = DateTime.UtcNow;
        var next = new DateTime(now.Year, now.Month, now.Day, hour, minute, 0, DateTimeKind.Utc);

        return schedule.ToLower() switch
        {
            "daily" => next <= now ? next.AddDays(1) : next,
            "weekly" => CalculateNextWeeklyRun(next, dayOfWeek ?? 1),
            "monthly" => CalculateNextMonthlyRun(next, dayOfMonth ?? 1),
            _ => next.AddDays(1)
        };
    }

    private static DateTime CalculateNextWeeklyRun(DateTime next, int dayOfWeek)
    {
        var daysUntil = ((dayOfWeek - (int)next.DayOfWeek + 7) % 7);
        if (daysUntil == 0 && next <= DateTime.UtcNow)
            daysUntil = 7;
        return next.AddDays(daysUntil);
    }

    private static DateTime CalculateNextMonthlyRun(DateTime next, int dayOfMonth)
    {
        var result = new DateTime(next.Year, next.Month, Math.Min(dayOfMonth, DateTime.DaysInMonth(next.Year, next.Month)), next.Hour, next.Minute, 0, DateTimeKind.Utc);
        if (result <= DateTime.UtcNow)
            result = result.AddMonths(1);
        return result;
    }
}
