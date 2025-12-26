using System.Security.Claims;
using System.Text.Json;
using CallCenter.API.Authorization;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/admin/alert-rules")]
[Authorize]
public class AlertRulesController : ControllerBase
{
    private readonly IRepository<AlertRule> _ruleRepository;
    private readonly IRepository<AlertLog> _logRepository;
    private readonly IRepository<Agent> _agentRepository;

    public AlertRulesController(
        IRepository<AlertRule> ruleRepository,
        IRepository<AlertLog> logRepository,
        IRepository<Agent> agentRepository)
    {
        _ruleRepository = ruleRepository;
        _logRepository = logRepository;
        _agentRepository = agentRepository;
    }

    [HttpGet]
    [RequirePermission("alerts.view")]
    public async Task<ActionResult<List<AlertRuleDto>>> GetRules()
    {
        var rules = await _ruleRepository.GetQueryable()
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var dtos = rules.Select(MapToRuleDto).ToList();
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    [RequirePermission("alerts.view")]
    public async Task<ActionResult<AlertRuleDto>> GetRule(Guid id)
    {
        var rule = await _ruleRepository.GetQueryable()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rule == null)
            return NotFound();

        return Ok(MapToRuleDto(rule));
    }

    [HttpPost]
    [RequirePermission("alerts.manage")]
    public async Task<ActionResult<AlertRuleDto>> CreateRule([FromBody] CreateAlertRuleRequest request)
    {
        var rule = new AlertRule
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Category = request.Category,
            Metric = request.Metric,
            Operator = request.Operator,
            Threshold = request.Threshold,
            Unit = GetUnitForMetric(request.Metric),
            Severity = ParseSeverity(request.Severity),
            Channels = JsonSerializer.Serialize(request.Channels),
            Recipients = JsonSerializer.Serialize(request.Recipients ?? new List<string>()),
            WebhookUrl = request.WebhookUrl,
            CooldownMinutes = request.CooldownMinutes,
            IsActive = request.IsActive,
            TriggerCount = 0,
            AlertType = MapCategoryToAlertType(request.Category),
            Condition = $"{request.Metric} {request.Operator} {request.Threshold}",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _ruleRepository.AddAsync(rule);
        await _ruleRepository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRule), new { id = rule.Id }, MapToRuleDto(rule));
    }

    [HttpPut("{id}")]
    [RequirePermission("alerts.manage")]
    public async Task<ActionResult<AlertRuleDto>> UpdateRule(Guid id, [FromBody] UpdateAlertRuleRequest request)
    {
        var rule = await _ruleRepository.GetQueryable()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rule == null)
            return NotFound();

        rule.Name = request.Name;
        rule.Description = request.Description;
        rule.Category = request.Category;
        rule.Metric = request.Metric;
        rule.Operator = request.Operator;
        rule.Threshold = request.Threshold;
        rule.Unit = GetUnitForMetric(request.Metric);
        rule.Severity = ParseSeverity(request.Severity);
        rule.Channels = JsonSerializer.Serialize(request.Channels);
        rule.Recipients = JsonSerializer.Serialize(request.Recipients ?? new List<string>());
        rule.WebhookUrl = request.WebhookUrl;
        rule.CooldownMinutes = request.CooldownMinutes;
        rule.IsActive = request.IsActive;
        rule.AlertType = MapCategoryToAlertType(request.Category);
        rule.Condition = $"{request.Metric} {request.Operator} {request.Threshold}";
        rule.UpdatedAt = DateTime.UtcNow;

        _ruleRepository.Update(rule);
        await _ruleRepository.SaveChangesAsync();

        return Ok(MapToRuleDto(rule));
    }

    [HttpDelete("{id}")]
    [RequirePermission("alerts.manage")]
    public async Task<ActionResult> DeleteRule(Guid id)
    {
        var rule = await _ruleRepository.GetQueryable()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rule == null)
            return NotFound();

        _ruleRepository.DeleteAsync(rule);
        await _ruleRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id}/toggle")]
    [RequirePermission("alerts.manage")]
    public async Task<ActionResult> ToggleRule(Guid id, [FromBody] ToggleRuleRequest request)
    {
        var rule = await _ruleRepository.GetQueryable()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rule == null)
            return NotFound();

        rule.IsActive = request.IsActive;
        rule.UpdatedAt = DateTime.UtcNow;

        _ruleRepository.Update(rule);
        await _ruleRepository.SaveChangesAsync();

        return Ok(new { success = true });
    }

    // Alert History endpoints
    [HttpGet("/api/admin/alert-history")]
    [RequirePermission("alerts.view")]
    public async Task<ActionResult<List<AlertHistoryDto>>> GetHistory()
    {
        var logs = await _logRepository.GetQueryable()
            .Include(l => l.AlertRule)
            .Include(l => l.AcknowledgedByAgent)
            .OrderByDescending(l => l.TriggeredAt)
            .Take(100)
            .ToListAsync();

        var dtos = logs.Select(MapToHistoryDto).ToList();
        return Ok(dtos);
    }

    [HttpPatch("/api/admin/alert-history/{id}/acknowledge")]
    [RequirePermission("alerts.manage")]
    public async Task<ActionResult> AcknowledgeAlert(Guid id)
    {
        var log = await _logRepository.GetQueryable()
            .FirstOrDefaultAsync(l => l.Id == id);

        if (log == null)
            return NotFound();

        var userId = GetCurrentUserId();
        log.Acknowledged = true;
        log.AcknowledgedBy = userId;
        log.AcknowledgedAt = DateTime.UtcNow;

        _logRepository.Update(log);
        await _logRepository.SaveChangesAsync();

        return Ok(new { success = true });
    }

    private static AlertRuleDto MapToRuleDto(AlertRule rule)
    {
        List<string> channels;
        List<string> recipients;

        try
        {
            channels = JsonSerializer.Deserialize<List<string>>(rule.Channels) ?? new();
        }
        catch
        {
            channels = new();
        }

        try
        {
            recipients = JsonSerializer.Deserialize<List<string>>(rule.Recipients) ?? new();
        }
        catch
        {
            recipients = new();
        }

        return new AlertRuleDto
        {
            Id = rule.Id.ToString(),
            Name = rule.Name,
            Description = rule.Description,
            Category = rule.Category,
            Metric = rule.Metric,
            Operator = rule.Operator,
            Threshold = rule.Threshold,
            Unit = rule.Unit,
            Severity = rule.Severity.ToString().ToLower(),
            Channels = channels,
            Recipients = recipients,
            WebhookUrl = rule.WebhookUrl,
            IsActive = rule.IsActive,
            CooldownMinutes = rule.CooldownMinutes,
            LastTriggeredAt = rule.LastTriggeredAt?.ToString("o"),
            TriggerCount = rule.TriggerCount,
            CreatedAt = rule.CreatedAt.ToString("o"),
            UpdatedAt = rule.UpdatedAt.ToString("o")
        };
    }

    private static AlertHistoryDto MapToHistoryDto(AlertLog log)
    {
        return new AlertHistoryDto
        {
            Id = log.Id.ToString(),
            RuleId = log.AlertRuleId.ToString(),
            RuleName = log.AlertRule?.Name ?? "Unknown",
            Severity = log.Severity.ToString().ToLower(),
            Message = log.Message,
            MetricValue = log.MetricValue,
            Threshold = log.ThresholdValue,
            TriggeredAt = log.TriggeredAt.ToString("o"),
            ResolvedAt = log.ResolvedAt?.ToString("o"),
            Acknowledged = log.Acknowledged,
            AcknowledgedBy = log.AcknowledgedByAgent?.Name
        };
    }

    private static AlertSeverity ParseSeverity(string severity)
    {
        return severity.ToLower() switch
        {
            "info" => AlertSeverity.Info,
            "warning" => AlertSeverity.Warning,
            "critical" => AlertSeverity.Critical,
            "error" => AlertSeverity.Error,
            _ => AlertSeverity.Warning
        };
    }

    private static AlertType MapCategoryToAlertType(string category)
    {
        return category.ToLower() switch
        {
            "queue" => AlertType.QueueOverflow,
            "agent" => AlertType.AgentUnavailable,
            "system" => AlertType.SystemError,
            "quality" => AlertType.LowServiceLevel,
            "sla" => AlertType.SlaBreach,
            _ => AlertType.SystemError
        };
    }

    private static string? GetUnitForMetric(string metric)
    {
        return metric switch
        {
            "queue_wait_time" or "avg_handle_time" => "s",
            "api_response_time" => "ms",
            "avg_resolution_time" => "h",
            "agent_utilization" or "service_level" or "error_rate" or "cpu_usage" or
            "memory_usage" or "qa_score" or "first_call_resolution" or "sla_breach_rate" => "%",
            "abandoned_calls" => "/hr",
            _ => null
        };
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}

// DTOs
public class AlertRuleDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = "queue";
    public string Metric { get; set; } = string.Empty;
    public string Operator { get; set; } = "gt";
    public decimal Threshold { get; set; }
    public string? Unit { get; set; }
    public string Severity { get; set; } = "warning";
    public List<string> Channels { get; set; } = new();
    public List<string> Recipients { get; set; } = new();
    public string? WebhookUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public int CooldownMinutes { get; set; } = 15;
    public string? LastTriggeredAt { get; set; }
    public int TriggerCount { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
}

public class CreateAlertRuleRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = "queue";
    public string Metric { get; set; } = string.Empty;
    public string Operator { get; set; } = "gt";
    public decimal Threshold { get; set; }
    public string Severity { get; set; } = "warning";
    public List<string> Channels { get; set; } = new();
    public List<string>? Recipients { get; set; }
    public string? WebhookUrl { get; set; }
    public int CooldownMinutes { get; set; } = 15;
    public bool IsActive { get; set; } = true;
}

public class UpdateAlertRuleRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = "queue";
    public string Metric { get; set; } = string.Empty;
    public string Operator { get; set; } = "gt";
    public decimal Threshold { get; set; }
    public string Severity { get; set; } = "warning";
    public List<string> Channels { get; set; } = new();
    public List<string>? Recipients { get; set; }
    public string? WebhookUrl { get; set; }
    public int CooldownMinutes { get; set; } = 15;
    public bool IsActive { get; set; } = true;
}

public class ToggleRuleRequest
{
    public bool IsActive { get; set; }
}

public class AlertHistoryDto
{
    public string Id { get; set; } = string.Empty;
    public string RuleId { get; set; } = string.Empty;
    public string RuleName { get; set; } = string.Empty;
    public string Severity { get; set; } = "warning";
    public string Message { get; set; } = string.Empty;
    public decimal MetricValue { get; set; }
    public decimal Threshold { get; set; }
    public string TriggeredAt { get; set; } = string.Empty;
    public string? ResolvedAt { get; set; }
    public bool Acknowledged { get; set; }
    public string? AcknowledgedBy { get; set; }
}
