using System.Text.Json;
using System.Text.RegularExpressions;
using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Dialer;
using CallCenter.Application.Services;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CallCenter.Infrastructure.Services;

public class DialerService : IDialerService
{
    private readonly ApplicationDbContext _context;
    private readonly ITwilioVoiceService _twilioService;
    private readonly ILogger<DialerService> _logger;

    public DialerService(
        ApplicationDbContext context,
        ITwilioVoiceService twilioService,
        ILogger<DialerService> logger)
    {
        _context = context;
        _twilioService = twilioService;
        _logger = logger;
    }

    #region Campaign Management

    public async Task<PagedResponse<DialerCampaignDto>> GetCampaignsAsync(PagedRequest request, DialerCampaignStatus? status = null)
    {
        var query = _context.DialerCampaigns
            .Include(c => c.Team)
            .Include(c => c.Queue)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return new PagedResponse<DialerCampaignDto>
        {
            Items = items.Select(MapToCampaignDto).ToList(),
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };
    }

    public async Task<DialerCampaignDetailDto?> GetCampaignByIdAsync(Guid id)
    {
        var campaign = await _context.DialerCampaigns
            .Include(c => c.Team)
            .Include(c => c.Queue)
            .Include(c => c.DialerLists)
            .Include(c => c.CampaignAgents)
                .ThenInclude(ca => ca.Agent)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (campaign == null) return null;

        return new DialerCampaignDetailDto
        {
            Id = campaign.Id,
            Name = campaign.Name,
            Description = campaign.Description,
            DialingMode = campaign.DialingMode,
            Status = campaign.Status,
            ScheduledStartUtc = campaign.ScheduledStartUtc,
            ScheduledEndUtc = campaign.ScheduledEndUtc,
            ActualStartUtc = campaign.ActualStartUtc,
            ActualEndUtc = campaign.ActualEndUtc,
            CallWindowStart = campaign.CallWindowStart,
            CallWindowEnd = campaign.CallWindowEnd,
            TimeZone = campaign.TimeZone,
            ActiveDays = campaign.ActiveDays,
            MaxLinesPerAgent = campaign.MaxLinesPerAgent,
            TargetAbandonmentRate = campaign.TargetAbandonmentRate,
            MaxAttempts = campaign.MaxAttempts,
            RetryDelayMinutes = campaign.RetryDelayMinutes,
            RingDurationSeconds = campaign.RingDurationSeconds,
            AgentWrapUpSeconds = campaign.AgentWrapUpSeconds,
            CallerId = campaign.CallerId,
            CallerIdName = campaign.CallerIdName,
            TeamId = campaign.TeamId,
            TeamName = campaign.Team?.Name,
            QueueId = campaign.QueueId,
            QueueName = campaign.Queue?.Name,
            TotalRecords = campaign.TotalRecords,
            PendingRecords = campaign.PendingRecords,
            CompletedRecords = campaign.CompletedRecords,
            ConnectedCalls = campaign.ConnectedCalls,
            TotalAttempts = campaign.TotalAttempts,
            CreatedAt = campaign.CreatedAt,
            Lists = campaign.DialerLists.Select(MapToListDto).ToList(),
            Agents = campaign.CampaignAgents.Select(MapToCampaignAgentDto).ToList()
        };
    }

    public async Task<DialerCampaignDto> CreateCampaignAsync(CreateCampaignRequest request)
    {
        var campaign = new DialerCampaign
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            DialingMode = request.DialingMode,
            Status = DialerCampaignStatus.Draft,
            ScheduledStartUtc = request.ScheduledStartUtc,
            ScheduledEndUtc = request.ScheduledEndUtc,
            CallWindowStart = request.CallWindowStart,
            CallWindowEnd = request.CallWindowEnd,
            TimeZone = request.TimeZone,
            ActiveDays = request.ActiveDays,
            MaxLinesPerAgent = request.MaxLinesPerAgent,
            TargetAbandonmentRate = request.TargetAbandonmentRate,
            MaxAttempts = request.MaxAttempts,
            RetryDelayMinutes = request.RetryDelayMinutes,
            RingDurationSeconds = request.RingDurationSeconds,
            AgentWrapUpSeconds = request.AgentWrapUpSeconds,
            CallerId = request.CallerId,
            CallerIdName = request.CallerIdName,
            TeamId = request.TeamId,
            QueueId = request.QueueId
        };

        _context.DialerCampaigns.Add(campaign);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created dialer campaign {CampaignId}: {CampaignName}", campaign.Id, campaign.Name);
        return MapToCampaignDto(campaign);
    }

    public async Task<DialerCampaignDto?> UpdateCampaignAsync(Guid id, UpdateCampaignRequest request)
    {
        var campaign = await _context.DialerCampaigns.FindAsync(id);
        if (campaign == null) return null;

        if (request.Name != null) campaign.Name = request.Name;
        if (request.Description != null) campaign.Description = request.Description;
        if (request.DialingMode.HasValue) campaign.DialingMode = request.DialingMode.Value;
        if (request.ScheduledStartUtc.HasValue) campaign.ScheduledStartUtc = request.ScheduledStartUtc;
        if (request.ScheduledEndUtc.HasValue) campaign.ScheduledEndUtc = request.ScheduledEndUtc;
        if (request.CallWindowStart.HasValue) campaign.CallWindowStart = request.CallWindowStart.Value;
        if (request.CallWindowEnd.HasValue) campaign.CallWindowEnd = request.CallWindowEnd.Value;
        if (request.TimeZone != null) campaign.TimeZone = request.TimeZone;
        if (request.ActiveDays != null) campaign.ActiveDays = request.ActiveDays;
        if (request.MaxLinesPerAgent.HasValue) campaign.MaxLinesPerAgent = request.MaxLinesPerAgent.Value;
        if (request.TargetAbandonmentRate.HasValue) campaign.TargetAbandonmentRate = request.TargetAbandonmentRate.Value;
        if (request.MaxAttempts.HasValue) campaign.MaxAttempts = request.MaxAttempts.Value;
        if (request.RetryDelayMinutes.HasValue) campaign.RetryDelayMinutes = request.RetryDelayMinutes.Value;
        if (request.RingDurationSeconds.HasValue) campaign.RingDurationSeconds = request.RingDurationSeconds.Value;
        if (request.AgentWrapUpSeconds.HasValue) campaign.AgentWrapUpSeconds = request.AgentWrapUpSeconds.Value;
        if (request.CallerId != null) campaign.CallerId = request.CallerId;
        if (request.CallerIdName != null) campaign.CallerIdName = request.CallerIdName;
        if (request.TeamId.HasValue) campaign.TeamId = request.TeamId;
        if (request.QueueId.HasValue) campaign.QueueId = request.QueueId;

        campaign.MarkAsModified();
        await _context.SaveChangesAsync();

        return MapToCampaignDto(campaign);
    }

    public async Task<bool> DeleteCampaignAsync(Guid id)
    {
        var campaign = await _context.DialerCampaigns.FindAsync(id);
        if (campaign == null) return false;

        campaign.Status = DialerCampaignStatus.Cancelled;
        campaign.MarkAsModified();
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> StartCampaignAsync(Guid id)
    {
        var campaign = await _context.DialerCampaigns.FindAsync(id);
        if (campaign == null) return false;

        if (campaign.Status != DialerCampaignStatus.Draft &&
            campaign.Status != DialerCampaignStatus.Paused &&
            campaign.Status != DialerCampaignStatus.Scheduled)
            return false;

        campaign.Status = DialerCampaignStatus.Running;
        campaign.ActualStartUtc ??= DateTimeOffset.UtcNow;
        campaign.MarkAsModified();
        await _context.SaveChangesAsync();

        _logger.LogInformation("Started campaign {CampaignId}", id);
        return true;
    }

    public async Task<bool> PauseCampaignAsync(Guid id)
    {
        var campaign = await _context.DialerCampaigns.FindAsync(id);
        if (campaign == null || campaign.Status != DialerCampaignStatus.Running)
            return false;

        campaign.Status = DialerCampaignStatus.Paused;
        campaign.MarkAsModified();
        await _context.SaveChangesAsync();

        _logger.LogInformation("Paused campaign {CampaignId}", id);
        return true;
    }

    public async Task<bool> StopCampaignAsync(Guid id)
    {
        var campaign = await _context.DialerCampaigns.FindAsync(id);
        if (campaign == null) return false;

        campaign.Status = DialerCampaignStatus.Completed;
        campaign.ActualEndUtc = DateTimeOffset.UtcNow;
        campaign.MarkAsModified();
        await _context.SaveChangesAsync();

        _logger.LogInformation("Stopped campaign {CampaignId}", id);
        return true;
    }

    #endregion

    #region List Management

    public async Task<PagedResponse<DialerListDto>> GetListsAsync(PagedRequest request, Guid? campaignId = null)
    {
        var query = _context.DialerLists
            .Include(l => l.Campaign)
            .Include(l => l.ImportedByAgent)
            .AsQueryable();

        if (campaignId.HasValue)
            query = query.Where(l => l.CampaignId == campaignId.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return new PagedResponse<DialerListDto>
        {
            Items = items.Select(MapToListDto).ToList(),
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };
    }

    public async Task<DialerListDto?> GetListByIdAsync(Guid id)
    {
        var list = await _context.DialerLists
            .Include(l => l.Campaign)
            .Include(l => l.ImportedByAgent)
            .FirstOrDefaultAsync(l => l.Id == id);

        return list != null ? MapToListDto(list) : null;
    }

    public async Task<DialerListDto> CreateListAsync(CreateListRequest request)
    {
        var list = new DialerList
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            CampaignId = request.CampaignId,
            Status = DialerListStatus.Active
        };

        _context.DialerLists.Add(list);
        await _context.SaveChangesAsync();

        return MapToListDto(list);
    }

    public async Task<ImportResultDto> ImportListAsync(ImportListRequest request, Guid importedBy)
    {
        var result = new ImportResultDto
        {
            TotalRecords = request.Records.Count
        };

        // Create the list
        var list = new DialerList
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            CampaignId = request.CampaignId,
            Status = DialerListStatus.Processing,
            ImportedAtUtc = DateTimeOffset.UtcNow,
            ImportedBy = importedBy,
            TotalRecords = request.Records.Count
        };

        _context.DialerLists.Add(list);
        result.ListId = list.Id;
        result.ListName = list.Name;

        // Get existing DNC numbers
        var dncNumbers = await _context.DoNotCallEntries
            .Where(d => d.IsActive)
            .Select(d => d.NormalizedPhoneNumber)
            .ToHashSetAsync();

        // Track imported numbers for duplicate detection
        var importedNumbers = new HashSet<string>();

        foreach (var record in request.Records)
        {
            var normalizedPhone = NormalizePhoneNumber(record.PhoneNumber);

            // Validate phone number
            if (string.IsNullOrWhiteSpace(normalizedPhone) || !IsValidPhoneNumber(normalizedPhone))
            {
                result.InvalidRecords++;
                result.Errors.Add($"Invalid phone number: {record.PhoneNumber}");
                continue;
            }

            // Check for duplicates within import
            if (importedNumbers.Contains(normalizedPhone))
            {
                result.DuplicateRecords++;
                continue;
            }

            // Check DNC
            if (dncNumbers.Contains(normalizedPhone))
            {
                result.DncRecords++;
                list.DncRecords++;
                // Still import but mark as DNC
                var dncRecord = CreateDialerRecord(list.Id, record, normalizedPhone);
                dncRecord.Status = DialerRecordStatus.DoNotCall;
                _context.DialerRecords.Add(dncRecord);
                importedNumbers.Add(normalizedPhone);
                continue;
            }

            var dialerRecord = CreateDialerRecord(list.Id, record, normalizedPhone);
            _context.DialerRecords.Add(dialerRecord);
            importedNumbers.Add(normalizedPhone);
            result.ImportedRecords++;
        }

        list.ValidRecords = result.ImportedRecords;
        list.InvalidRecords = result.InvalidRecords;
        list.DuplicateRecords = result.DuplicateRecords;
        list.DncRecords = result.DncRecords;
        list.Status = DialerListStatus.Active;

        // Update campaign statistics if assigned
        if (list.CampaignId.HasValue)
        {
            var campaign = await _context.DialerCampaigns.FindAsync(list.CampaignId.Value);
            if (campaign != null)
            {
                campaign.TotalRecords += result.ImportedRecords;
                campaign.PendingRecords += result.ImportedRecords;
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Imported {ImportedCount} records to list {ListId}", result.ImportedRecords, list.Id);
        return result;
    }

    public async Task<bool> AssignListToCampaignAsync(Guid listId, Guid campaignId)
    {
        var list = await _context.DialerLists.FindAsync(listId);
        var campaign = await _context.DialerCampaigns.FindAsync(campaignId);

        if (list == null || campaign == null) return false;

        // Update statistics if changing campaigns
        if (list.CampaignId.HasValue && list.CampaignId != campaignId)
        {
            var oldCampaign = await _context.DialerCampaigns.FindAsync(list.CampaignId.Value);
            if (oldCampaign != null)
            {
                oldCampaign.TotalRecords -= list.ValidRecords;
                oldCampaign.PendingRecords -= await _context.DialerRecords
                    .CountAsync(r => r.ListId == listId && r.Status == DialerRecordStatus.Pending);
            }
        }

        list.CampaignId = campaignId;
        campaign.TotalRecords += list.ValidRecords;
        campaign.PendingRecords += await _context.DialerRecords
            .CountAsync(r => r.ListId == listId && r.Status == DialerRecordStatus.Pending);

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteListAsync(Guid id)
    {
        var list = await _context.DialerLists.FindAsync(id);
        if (list == null) return false;

        list.Status = DialerListStatus.Archived;
        list.MarkAsModified();
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Record Management

    public async Task<PagedResponse<DialerRecordDto>> GetRecordsAsync(PagedRequest request, Guid listId, DialerRecordStatus? status = null)
    {
        var query = _context.DialerRecords
            .Include(r => r.AssignedAgent)
            .Where(r => r.ListId == listId);

        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(r => r.Priority)
            .ThenBy(r => r.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return new PagedResponse<DialerRecordDto>
        {
            Items = items.Select(MapToRecordDto).ToList(),
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };
    }

    public async Task<DialerRecordDetailDto?> GetRecordByIdAsync(Guid id)
    {
        var record = await _context.DialerRecords
            .Include(r => r.AssignedAgent)
            .Include(r => r.Attempts)
                .ThenInclude(a => a.Agent)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (record == null) return null;

        return new DialerRecordDetailDto
        {
            Id = record.Id,
            ListId = record.ListId,
            PhoneNumber = record.PhoneNumber,
            PhoneNumber2 = record.PhoneNumber2,
            PhoneNumber3 = record.PhoneNumber3,
            FirstName = record.FirstName,
            LastName = record.LastName,
            Email = record.Email,
            Company = record.Company,
            Status = record.Status,
            AttemptCount = record.AttemptCount,
            LastAttemptUtc = record.LastAttemptUtc,
            NextAttemptUtc = record.NextAttemptUtc,
            LastDisposition = record.LastDisposition,
            Notes = record.Notes,
            AssignedAgentId = record.AssignedAgentId,
            AssignedAgentName = record.AssignedAgent?.Name,
            CallbackScheduledUtc = record.CallbackScheduledUtc,
            Priority = record.Priority,
            CustomerId = record.CustomerId,
            CreatedAt = record.CreatedAt,
            CustomFields = record.CustomFields,
            ContactTimeZone = record.ContactTimeZone,
            Attempts = record.Attempts.OrderByDescending(a => a.AttemptNumber).Select(MapToAttemptDto).ToList()
        };
    }

    public async Task<DialerRecordDto?> UpdateRecordAsync(Guid id, UpdateRecordRequest request)
    {
        var record = await _context.DialerRecords.FindAsync(id);
        if (record == null) return null;

        if (request.Notes != null) record.Notes = request.Notes;
        if (request.Status.HasValue) record.Status = request.Status.Value;
        if (request.CallbackScheduledUtc.HasValue) record.CallbackScheduledUtc = request.CallbackScheduledUtc;
        if (request.Priority.HasValue) record.Priority = request.Priority.Value;

        record.MarkAsModified();
        await _context.SaveChangesAsync();

        return MapToRecordDto(record);
    }

    #endregion

    #region Dialer Session (Agent Operations)

    public async Task<DialerSessionDto?> GetAgentSessionAsync(Guid agentId, Guid campaignId)
    {
        var campaign = await _context.DialerCampaigns.FindAsync(campaignId);
        if (campaign == null) return null;

        var agentSession = await _context.DialerCampaignAgents
            .Include(ca => ca.CurrentRecord)
            .FirstOrDefaultAsync(ca => ca.AgentId == agentId && ca.CampaignId == campaignId);

        var pendingCount = await _context.DialerRecords
            .CountAsync(r => r.List.CampaignId == campaignId && r.Status == DialerRecordStatus.Pending);

        var today = DateTimeOffset.UtcNow.Date;
        var agentCallsToday = agentSession != null
            ? await _context.DialerAttempts
                .CountAsync(a => a.AgentId == agentId && a.CampaignId == campaignId && a.StartedAtUtc.Date == today)
            : 0;
        var agentConnectsToday = agentSession != null
            ? await _context.DialerAttempts
                .CountAsync(a => a.AgentId == agentId && a.CampaignId == campaignId &&
                           a.StartedAtUtc.Date == today && a.ConnectedAtUtc.HasValue)
            : 0;

        return new DialerSessionDto
        {
            CampaignId = campaignId,
            CampaignName = campaign.Name,
            DialingMode = campaign.DialingMode,
            CampaignStatus = campaign.Status,
            IsAgentActive = agentSession?.IsActive ?? false,
            CurrentRecord = agentSession?.CurrentRecord != null ? MapToRecordDto(agentSession.CurrentRecord) : null,
            PendingRecords = pendingCount,
            AgentCallsToday = agentCallsToday,
            AgentConnectsToday = agentConnectsToday
        };
    }

    public async Task<bool> AgentLoginToCampaignAsync(Guid agentId, Guid campaignId)
    {
        var campaign = await _context.DialerCampaigns.FindAsync(campaignId);
        if (campaign == null || campaign.Status != DialerCampaignStatus.Running)
            return false;

        var existing = await _context.DialerCampaignAgents
            .FirstOrDefaultAsync(ca => ca.AgentId == agentId && ca.CampaignId == campaignId);

        if (existing != null)
        {
            existing.IsActive = true;
            existing.LoggedInAtUtc = DateTimeOffset.UtcNow;
            existing.LoggedOutAtUtc = null;
        }
        else
        {
            var campaignAgent = new DialerCampaignAgent
            {
                Id = Guid.NewGuid(),
                CampaignId = campaignId,
                AgentId = agentId,
                IsActive = true,
                LoggedInAtUtc = DateTimeOffset.UtcNow
            };
            _context.DialerCampaignAgents.Add(campaignAgent);
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Agent {AgentId} logged into campaign {CampaignId}", agentId, campaignId);
        return true;
    }

    public async Task<bool> AgentLogoutFromCampaignAsync(Guid agentId, Guid campaignId)
    {
        var campaignAgent = await _context.DialerCampaignAgents
            .FirstOrDefaultAsync(ca => ca.AgentId == agentId && ca.CampaignId == campaignId);

        if (campaignAgent == null) return false;

        // If agent has an assigned record, release it
        if (campaignAgent.CurrentRecordId.HasValue)
        {
            var record = await _context.DialerRecords.FindAsync(campaignAgent.CurrentRecordId.Value);
            if (record != null && record.Status == DialerRecordStatus.Pending)
            {
                record.AssignedAgentId = null;
                record.AssignedAtUtc = null;
            }
        }

        campaignAgent.IsActive = false;
        campaignAgent.LoggedOutAtUtc = DateTimeOffset.UtcNow;
        campaignAgent.CurrentRecordId = null;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Agent {AgentId} logged out from campaign {CampaignId}", agentId, campaignId);
        return true;
    }

    public async Task<DialerRecordDto?> GetNextRecordForAgentAsync(Guid agentId, Guid campaignId)
    {
        var campaign = await _context.DialerCampaigns.FindAsync(campaignId);
        if (campaign == null || campaign.Status != DialerCampaignStatus.Running)
            return null;

        var campaignAgent = await _context.DialerCampaignAgents
            .FirstOrDefaultAsync(ca => ca.AgentId == agentId && ca.CampaignId == campaignId && ca.IsActive);

        if (campaignAgent == null) return null;

        // Release any previously assigned record
        if (campaignAgent.CurrentRecordId.HasValue)
        {
            var oldRecord = await _context.DialerRecords.FindAsync(campaignAgent.CurrentRecordId.Value);
            if (oldRecord != null && oldRecord.Status == DialerRecordStatus.Pending)
            {
                oldRecord.AssignedAgentId = null;
                oldRecord.AssignedAtUtc = null;
            }
        }

        // Get next record based on priority and scheduling
        var now = DateTimeOffset.UtcNow;
        var nextRecord = await _context.DialerRecords
            .Where(r => r.List.CampaignId == campaignId)
            .Where(r => r.Status == DialerRecordStatus.Pending || r.Status == DialerRecordStatus.Callback)
            .Where(r => r.AssignedAgentId == null || r.AssignedAgentId == agentId)
            .Where(r => !r.NextAttemptUtc.HasValue || r.NextAttemptUtc <= now)
            .Where(r => r.AttemptCount < campaign.MaxAttempts)
            // Prioritize callbacks for this agent first
            .OrderByDescending(r => r.Status == DialerRecordStatus.Callback && r.CallbackAgentId == agentId)
            // Then by priority
            .ThenByDescending(r => r.Priority)
            // Then by oldest first
            .ThenBy(r => r.CreatedAt)
            .FirstOrDefaultAsync();

        if (nextRecord == null) return null;

        // Assign to agent
        nextRecord.AssignedAgentId = agentId;
        nextRecord.AssignedAtUtc = now;
        campaignAgent.CurrentRecordId = nextRecord.Id;
        campaignAgent.RecordAssignedAtUtc = now;

        await _context.SaveChangesAsync();

        return MapToRecordDto(nextRecord);
    }

    public async Task<DialResultDto> DialRecordAsync(Guid agentId, DialRequest request)
    {
        var result = new DialResultDto
        {
            RecordId = request.RecordId,
            Success = false
        };

        var record = await _context.DialerRecords
            .Include(r => r.List)
            .FirstOrDefaultAsync(r => r.Id == request.RecordId);

        if (record == null)
        {
            result.ErrorMessage = "Record not found";
            return result;
        }

        var campaign = await _context.DialerCampaigns.FindAsync(record.List.CampaignId);
        if (campaign == null || campaign.Status != DialerCampaignStatus.Running)
        {
            result.ErrorMessage = "Campaign not running";
            return result;
        }

        // Determine phone number to dial
        var phoneNumber = request.PhoneNumberToUse ?? record.PhoneNumber;
        result.PhoneNumber = phoneNumber;

        // Check DNC
        var normalizedPhone = NormalizePhoneNumber(phoneNumber);
        var isDnc = await _context.DoNotCallEntries
            .AnyAsync(d => d.NormalizedPhoneNumber == normalizedPhone && d.IsActive);

        if (isDnc)
        {
            record.Status = DialerRecordStatus.DoNotCall;
            await _context.SaveChangesAsync();
            result.ErrorMessage = "Number is on Do Not Call list";
            return result;
        }

        // Create attempt record
        var attempt = new DialerAttempt
        {
            Id = Guid.NewGuid(),
            RecordId = record.Id,
            CampaignId = campaign.Id,
            PhoneNumberDialed = phoneNumber,
            AttemptNumber = record.AttemptCount + 1,
            StartedAtUtc = DateTimeOffset.UtcNow,
            Outcome = DialerRecordStatus.Dialing,
            AgentId = agentId
        };

        _context.DialerAttempts.Add(attempt);

        // Update record status
        record.Status = DialerRecordStatus.Dialing;
        record.AttemptCount++;
        record.LastAttemptUtc = DateTimeOffset.UtcNow;

        // Update campaign agent status
        var campaignAgent = await _context.DialerCampaignAgents
            .FirstOrDefaultAsync(ca => ca.AgentId == agentId && ca.CampaignId == campaign.Id);

        if (campaignAgent != null)
        {
            campaignAgent.IsOnCall = true;
            campaignAgent.LastCallAtUtc = DateTimeOffset.UtcNow;
        }

        // Update campaign statistics
        campaign.TotalAttempts++;

        await _context.SaveChangesAsync();

        // Initiate the call via Twilio
        try
        {
            var callerId = campaign.CallerId ?? "+1234567890"; // Default caller ID
            var callSid = await _twilioService.InitiateOutboundCallAsync(phoneNumber, callerId, agentId.ToString());

            attempt.ProviderCallId = callSid;
            await _context.SaveChangesAsync();

            result.AttemptId = attempt.Id;
            result.ProviderCallId = callSid;
            result.Success = true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initiate call for record {RecordId}", record.Id);
            result.ErrorMessage = ex.Message;

            attempt.Outcome = DialerRecordStatus.Failed;
            attempt.EndedAtUtc = DateTimeOffset.UtcNow;
            record.Status = DialerRecordStatus.Failed;
            record.NextAttemptUtc = DateTimeOffset.UtcNow.AddMinutes(campaign.RetryDelayMinutes);

            if (campaignAgent != null)
                campaignAgent.IsOnCall = false;

            await _context.SaveChangesAsync();
        }

        return result;
    }

    public async Task<bool> SkipRecordAsync(Guid agentId, SkipRecordRequest request)
    {
        var record = await _context.DialerRecords
            .Include(r => r.List)
            .FirstOrDefaultAsync(r => r.Id == request.RecordId);

        if (record == null || record.AssignedAgentId != agentId)
            return false;

        record.Status = DialerRecordStatus.Skipped;
        record.Notes = request.Reason;
        record.AssignedAgentId = null;
        record.AssignedAtUtc = null;

        var campaignAgent = await _context.DialerCampaignAgents
            .FirstOrDefaultAsync(ca => ca.AgentId == agentId && ca.CampaignId == record.List.CampaignId);

        if (campaignAgent != null)
            campaignAgent.CurrentRecordId = null;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<DialerAttemptDto?> CompleteAttemptAsync(Guid attemptId, CompleteAttemptRequest request)
    {
        var attempt = await _context.DialerAttempts
            .Include(a => a.Record)
                .ThenInclude(r => r.List)
            .Include(a => a.Agent)
            .FirstOrDefaultAsync(a => a.Id == attemptId);

        if (attempt == null) return null;

        var campaign = await _context.DialerCampaigns.FindAsync(attempt.CampaignId);
        if (campaign == null) return null;

        // Update attempt
        attempt.EndedAtUtc = DateTimeOffset.UtcNow;
        attempt.Outcome = request.Outcome;
        attempt.DispositionCode = request.DispositionCode;
        attempt.DispositionNotes = request.DispositionNotes;
        attempt.IsConversion = request.IsConversion;

        if (attempt.ConnectedAtUtc.HasValue)
        {
            attempt.TalkDurationSeconds = (int)(attempt.EndedAtUtc.Value - attempt.ConnectedAtUtc.Value).TotalSeconds;
        }
        else
        {
            attempt.RingDurationSeconds = (int)(attempt.EndedAtUtc.Value - attempt.StartedAtUtc).TotalSeconds;
        }

        // Update record
        var record = attempt.Record;
        record.LastDisposition = request.DispositionCode;
        record.AssignedAgentId = null;
        record.AssignedAtUtc = null;

        // Determine record status based on outcome
        switch (request.Outcome)
        {
            case DialerRecordStatus.Connected:
            case DialerRecordStatus.Completed:
                record.Status = DialerRecordStatus.Completed;
                record.CompletedAtUtc = DateTimeOffset.UtcNow;
                campaign.CompletedRecords++;
                campaign.PendingRecords--;
                if (attempt.ConnectedAtUtc.HasValue)
                    campaign.ConnectedCalls++;
                break;

            case DialerRecordStatus.NoAnswer:
            case DialerRecordStatus.Busy:
            case DialerRecordStatus.Voicemail:
            case DialerRecordStatus.Failed:
                if (record.AttemptCount >= campaign.MaxAttempts)
                {
                    record.Status = request.Outcome;
                    campaign.PendingRecords--;
                }
                else
                {
                    record.Status = DialerRecordStatus.Pending;
                    record.NextAttemptUtc = DateTimeOffset.UtcNow.AddMinutes(campaign.RetryDelayMinutes);
                }
                break;

            case DialerRecordStatus.Callback:
                record.Status = DialerRecordStatus.Callback;
                record.CallbackScheduledUtc = request.CallbackScheduledUtc;
                record.CallbackAgentId = attempt.AgentId;
                attempt.CallbackScheduledUtc = request.CallbackScheduledUtc;
                attempt.CallbackNotes = request.CallbackNotes;
                break;

            case DialerRecordStatus.DoNotCall:
                record.Status = DialerRecordStatus.DoNotCall;
                campaign.PendingRecords--;
                // Add to DNC list
                await AddDncEntryAsync(new AddDncRequest
                {
                    PhoneNumber = attempt.PhoneNumberDialed,
                    Reason = "Customer request during call"
                }, attempt.AgentId ?? Guid.Empty);
                break;
        }

        // Update campaign agent
        var campaignAgent = await _context.DialerCampaignAgents
            .FirstOrDefaultAsync(ca => ca.AgentId == attempt.AgentId && ca.CampaignId == campaign.Id);

        if (campaignAgent != null)
        {
            campaignAgent.IsOnCall = false;
            campaignAgent.IsInWrapUp = true;
            campaignAgent.WrapUpEndsAtUtc = DateTimeOffset.UtcNow.AddSeconds(campaign.AgentWrapUpSeconds);
            campaignAgent.CurrentRecordId = null;
            campaignAgent.TotalCallsHandled++;
            if (attempt.ConnectedAtUtc.HasValue)
            {
                campaignAgent.TotalConnectedCalls++;
                campaignAgent.TotalTalkTimeSeconds += attempt.TalkDurationSeconds ?? 0;
            }
        }

        await _context.SaveChangesAsync();

        return MapToAttemptDto(attempt);
    }

    #endregion

    #region DNC Management

    public async Task<PagedResponse<DoNotCallEntryDto>> GetDncEntriesAsync(PagedRequest request)
    {
        var query = _context.DoNotCallEntries
            .Include(d => d.AddedByAgent)
            .Include(d => d.Customer)
            .Where(d => d.IsActive);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(d => d.AddedAtUtc)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return new PagedResponse<DoNotCallEntryDto>
        {
            Items = items.Select(d => new DoNotCallEntryDto
            {
                Id = d.Id,
                PhoneNumber = d.PhoneNumber,
                Source = d.Source,
                Reason = d.Reason,
                AddedAtUtc = d.AddedAtUtc,
                ExpiresAtUtc = d.ExpiresAtUtc,
                IsActive = d.IsActive,
                AddedByName = d.AddedByAgent?.Name,
                CustomerName = d.Customer?.Name
            }).ToList(),
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };
    }

    public async Task<DoNotCallEntryDto> AddDncEntryAsync(AddDncRequest request, Guid addedBy)
    {
        var normalizedPhone = NormalizePhoneNumber(request.PhoneNumber);

        // Check if already exists
        var existing = await _context.DoNotCallEntries
            .FirstOrDefaultAsync(d => d.NormalizedPhoneNumber == normalizedPhone && d.IsActive);

        if (existing != null)
        {
            return new DoNotCallEntryDto
            {
                Id = existing.Id,
                PhoneNumber = existing.PhoneNumber,
                Source = existing.Source,
                Reason = existing.Reason,
                AddedAtUtc = existing.AddedAtUtc,
                ExpiresAtUtc = existing.ExpiresAtUtc,
                IsActive = existing.IsActive
            };
        }

        var entry = new DoNotCallEntry
        {
            Id = Guid.NewGuid(),
            PhoneNumber = request.PhoneNumber,
            NormalizedPhoneNumber = normalizedPhone,
            Type = DncType.CustomerRequest,
            Source = "Manual Entry",
            Reason = request.Reason,
            AddedAtUtc = DateTimeOffset.UtcNow,
            ExpiresAtUtc = request.ExpiresAtUtc,
            IsActive = true,
            AddedByAgentId = addedBy
        };

        _context.DoNotCallEntries.Add(entry);
        await _context.SaveChangesAsync();

        // Mark any pending records with this number as DNC
        await _context.DialerRecords
            .Where(r => r.PhoneNumber == normalizedPhone || r.PhoneNumber == request.PhoneNumber)
            .Where(r => r.Status == DialerRecordStatus.Pending)
            .ExecuteUpdateAsync(s => s.SetProperty(r => r.Status, DialerRecordStatus.DoNotCall));

        return new DoNotCallEntryDto
        {
            Id = entry.Id,
            PhoneNumber = entry.PhoneNumber,
            Source = entry.Source,
            Reason = entry.Reason,
            AddedAtUtc = entry.AddedAtUtc,
            ExpiresAtUtc = entry.ExpiresAtUtc,
            IsActive = entry.IsActive
        };
    }

    public async Task<int> ImportDncEntriesAsync(ImportDncRequest request, Guid addedBy)
    {
        var importedCount = 0;

        foreach (var phone in request.PhoneNumbers)
        {
            var normalizedPhone = NormalizePhoneNumber(phone);

            var exists = await _context.DoNotCallEntries
                .AnyAsync(d => d.NormalizedPhoneNumber == normalizedPhone && d.IsActive);

            if (!exists)
            {
                var entry = new DoNotCallEntry
                {
                    Id = Guid.NewGuid(),
                    PhoneNumber = phone,
                    NormalizedPhoneNumber = normalizedPhone,
                    Type = DncType.Regulatory,
                    Source = request.Source,
                    Reason = request.Reason,
                    AddedAtUtc = DateTimeOffset.UtcNow,
                    IsActive = true,
                    AddedByAgentId = addedBy
                };
                _context.DoNotCallEntries.Add(entry);
                importedCount++;
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Imported {Count} DNC entries", importedCount);
        return importedCount;
    }

    public async Task<bool> RemoveDncEntryAsync(Guid id)
    {
        var entry = await _context.DoNotCallEntries.FindAsync(id);
        if (entry == null) return false;

        entry.IsActive = false;
        entry.MarkAsModified();
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<DncCheckResult> CheckDncAsync(string phoneNumber)
    {
        var normalizedPhone = NormalizePhoneNumber(phoneNumber);
        var entry = await _context.DoNotCallEntries
            .FirstOrDefaultAsync(d => d.NormalizedPhoneNumber == normalizedPhone && d.IsActive);

        return new DncCheckResult
        {
            PhoneNumber = phoneNumber,
            IsOnDnc = entry != null,
            Reason = entry?.Reason,
            AddedAtUtc = entry?.AddedAtUtc
        };
    }

    public async Task<List<DncCheckResult>> CheckDncBatchAsync(List<string> phoneNumbers)
    {
        var normalizedNumbers = phoneNumbers.Select(NormalizePhoneNumber).ToList();
        var dncEntries = await _context.DoNotCallEntries
            .Where(d => normalizedNumbers.Contains(d.NormalizedPhoneNumber) && d.IsActive)
            .ToDictionaryAsync(d => d.NormalizedPhoneNumber);

        return phoneNumbers.Select(phone =>
        {
            var normalized = NormalizePhoneNumber(phone);
            dncEntries.TryGetValue(normalized, out var entry);
            return new DncCheckResult
            {
                PhoneNumber = phone,
                IsOnDnc = entry != null,
                Reason = entry?.Reason,
                AddedAtUtc = entry?.AddedAtUtc
            };
        }).ToList();
    }

    #endregion

    #region Statistics

    public async Task<CampaignStatsDto> GetCampaignStatsAsync(Guid campaignId)
    {
        var campaign = await _context.DialerCampaigns.FindAsync(campaignId);
        if (campaign == null)
            return new CampaignStatsDto();

        var attempts = await _context.DialerAttempts
            .Where(a => a.CampaignId == campaignId)
            .ToListAsync();

        var stats = new CampaignStatsDto
        {
            CampaignId = campaignId,
            CampaignName = campaign.Name,
            TotalRecords = campaign.TotalRecords,
            PendingRecords = campaign.PendingRecords,
            CompletedRecords = campaign.CompletedRecords,
            ConnectedCalls = campaign.ConnectedCalls,
            TotalAttempts = campaign.TotalAttempts,
            NoAnswerCalls = attempts.Count(a => a.Outcome == DialerRecordStatus.NoAnswer),
            BusyCalls = attempts.Count(a => a.Outcome == DialerRecordStatus.Busy),
            VoicemailCalls = attempts.Count(a => a.Outcome == DialerRecordStatus.Voicemail),
            FailedCalls = attempts.Count(a => a.Outcome == DialerRecordStatus.Failed),
            DncCalls = attempts.Count(a => a.Outcome == DialerRecordStatus.DoNotCall),
            Conversions = attempts.Count(a => a.IsConversion == true),
            ActiveAgents = await _context.DialerCampaignAgents
                .CountAsync(ca => ca.CampaignId == campaignId && ca.IsActive),
            TotalTalkTimeSeconds = attempts.Sum(a => a.TalkDurationSeconds ?? 0)
        };

        stats.ConnectRate = stats.TotalAttempts > 0
            ? (decimal)stats.ConnectedCalls / stats.TotalAttempts * 100
            : 0;
        stats.ConversionRate = stats.ConnectedCalls > 0
            ? (decimal)stats.Conversions / stats.ConnectedCalls * 100
            : 0;
        stats.AverageHandleTimeSeconds = stats.ConnectedCalls > 0
            ? (decimal)stats.TotalTalkTimeSeconds / stats.ConnectedCalls
            : 0;

        return stats;
    }

    public async Task<List<AgentDialerStatsDto>> GetAgentStatsAsync(Guid campaignId)
    {
        var agents = await _context.DialerCampaignAgents
            .Include(ca => ca.Agent)
            .Where(ca => ca.CampaignId == campaignId)
            .ToListAsync();

        var attempts = await _context.DialerAttempts
            .Where(a => a.CampaignId == campaignId)
            .GroupBy(a => a.AgentId)
            .Select(g => new
            {
                AgentId = g.Key,
                TotalCalls = g.Count(),
                ConnectedCalls = g.Count(a => a.ConnectedAtUtc.HasValue),
                Conversions = g.Count(a => a.IsConversion == true),
                TotalTalkTime = g.Sum(a => a.TalkDurationSeconds ?? 0),
                TotalWrapUpTime = g.Sum(a => a.WrapUpDurationSeconds ?? 0)
            })
            .ToDictionaryAsync(g => g.AgentId);

        return agents.Select(ca =>
        {
            attempts.TryGetValue(ca.AgentId, out var agentAttempts);
            var totalCalls = agentAttempts?.TotalCalls ?? 0;
            var connectedCalls = agentAttempts?.ConnectedCalls ?? 0;
            var conversions = agentAttempts?.Conversions ?? 0;
            var talkTime = agentAttempts?.TotalTalkTime ?? 0;
            var wrapUpTime = agentAttempts?.TotalWrapUpTime ?? 0;

            return new AgentDialerStatsDto
            {
                AgentId = ca.AgentId,
                AgentName = ca.Agent.Name,
                TotalCalls = totalCalls,
                ConnectedCalls = connectedCalls,
                Conversions = conversions,
                ConnectRate = totalCalls > 0 ? (decimal)connectedCalls / totalCalls * 100 : 0,
                ConversionRate = connectedCalls > 0 ? (decimal)conversions / connectedCalls * 100 : 0,
                TotalTalkTimeSeconds = talkTime,
                TotalWrapUpTimeSeconds = wrapUpTime,
                AverageHandleTimeSeconds = connectedCalls > 0 ? (decimal)(talkTime + wrapUpTime) / connectedCalls : 0
            };
        }).ToList();
    }

    #endregion

    #region Helper Methods

    private static string NormalizePhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return string.Empty;

        // Remove all non-digit characters except leading +
        var normalized = Regex.Replace(phoneNumber, @"[^\d+]", "");

        // Ensure it starts with + if it has country code
        if (!normalized.StartsWith("+") && normalized.Length > 10)
            normalized = "+" + normalized;

        return normalized;
    }

    private static bool IsValidPhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return false;

        var digitsOnly = Regex.Replace(phoneNumber, @"[^\d]", "");
        return digitsOnly.Length >= 10 && digitsOnly.Length <= 15;
    }

    private static DialerRecord CreateDialerRecord(Guid listId, ImportRecordRequest request, string normalizedPhone)
    {
        return new DialerRecord
        {
            Id = Guid.NewGuid(),
            ListId = listId,
            PhoneNumber = normalizedPhone,
            PhoneNumber2 = request.PhoneNumber2,
            PhoneNumber3 = request.PhoneNumber3,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Company = request.Company,
            CustomFields = request.CustomFields != null ? JsonSerializer.Serialize(request.CustomFields) : null,
            Priority = request.Priority,
            ContactTimeZone = request.TimeZone,
            Status = DialerRecordStatus.Pending
        };
    }

    private static DialerCampaignDto MapToCampaignDto(DialerCampaign campaign)
    {
        return new DialerCampaignDto
        {
            Id = campaign.Id,
            Name = campaign.Name,
            Description = campaign.Description,
            DialingMode = campaign.DialingMode,
            Status = campaign.Status,
            ScheduledStartUtc = campaign.ScheduledStartUtc,
            ScheduledEndUtc = campaign.ScheduledEndUtc,
            ActualStartUtc = campaign.ActualStartUtc,
            ActualEndUtc = campaign.ActualEndUtc,
            CallWindowStart = campaign.CallWindowStart,
            CallWindowEnd = campaign.CallWindowEnd,
            TimeZone = campaign.TimeZone,
            ActiveDays = campaign.ActiveDays,
            MaxLinesPerAgent = campaign.MaxLinesPerAgent,
            TargetAbandonmentRate = campaign.TargetAbandonmentRate,
            MaxAttempts = campaign.MaxAttempts,
            RetryDelayMinutes = campaign.RetryDelayMinutes,
            CallerId = campaign.CallerId,
            TeamId = campaign.TeamId,
            TeamName = campaign.Team?.Name,
            QueueId = campaign.QueueId,
            QueueName = campaign.Queue?.Name,
            TotalRecords = campaign.TotalRecords,
            PendingRecords = campaign.PendingRecords,
            CompletedRecords = campaign.CompletedRecords,
            ConnectedCalls = campaign.ConnectedCalls,
            TotalAttempts = campaign.TotalAttempts,
            CreatedAt = campaign.CreatedAt
        };
    }

    private static DialerListDto MapToListDto(DialerList list)
    {
        return new DialerListDto
        {
            Id = list.Id,
            Name = list.Name,
            Description = list.Description,
            Status = list.Status,
            CampaignId = list.CampaignId,
            CampaignName = list.Campaign?.Name,
            SourceFileName = list.SourceFileName,
            ImportedAtUtc = list.ImportedAtUtc,
            ImportedByName = list.ImportedByAgent?.Name,
            TotalRecords = list.TotalRecords,
            ValidRecords = list.ValidRecords,
            InvalidRecords = list.InvalidRecords,
            DuplicateRecords = list.DuplicateRecords,
            DncRecords = list.DncRecords,
            CreatedAt = list.CreatedAt
        };
    }

    private static DialerRecordDto MapToRecordDto(DialerRecord record)
    {
        return new DialerRecordDto
        {
            Id = record.Id,
            ListId = record.ListId,
            PhoneNumber = record.PhoneNumber,
            PhoneNumber2 = record.PhoneNumber2,
            PhoneNumber3 = record.PhoneNumber3,
            FirstName = record.FirstName,
            LastName = record.LastName,
            Email = record.Email,
            Company = record.Company,
            Status = record.Status,
            AttemptCount = record.AttemptCount,
            LastAttemptUtc = record.LastAttemptUtc,
            NextAttemptUtc = record.NextAttemptUtc,
            LastDisposition = record.LastDisposition,
            Notes = record.Notes,
            AssignedAgentId = record.AssignedAgentId,
            AssignedAgentName = record.AssignedAgent?.Name,
            CallbackScheduledUtc = record.CallbackScheduledUtc,
            Priority = record.Priority,
            CustomerId = record.CustomerId,
            CreatedAt = record.CreatedAt
        };
    }

    private static DialerAttemptDto MapToAttemptDto(DialerAttempt attempt)
    {
        return new DialerAttemptDto
        {
            Id = attempt.Id,
            RecordId = attempt.RecordId,
            CampaignId = attempt.CampaignId,
            PhoneNumberDialed = attempt.PhoneNumberDialed,
            AttemptNumber = attempt.AttemptNumber,
            StartedAtUtc = attempt.StartedAtUtc,
            ConnectedAtUtc = attempt.ConnectedAtUtc,
            EndedAtUtc = attempt.EndedAtUtc,
            RingDurationSeconds = attempt.RingDurationSeconds,
            TalkDurationSeconds = attempt.TalkDurationSeconds,
            WrapUpDurationSeconds = attempt.WrapUpDurationSeconds,
            Outcome = attempt.Outcome,
            DispositionCode = attempt.DispositionCode,
            DispositionNotes = attempt.DispositionNotes,
            AgentId = attempt.AgentId,
            AgentName = attempt.Agent?.Name,
            ProviderCallId = attempt.ProviderCallId,
            RecordingUrl = attempt.RecordingUrl,
            IsConversion = attempt.IsConversion,
            CreatedAt = attempt.CreatedAt
        };
    }

    private static DialerCampaignAgentDto MapToCampaignAgentDto(DialerCampaignAgent ca)
    {
        return new DialerCampaignAgentDto
        {
            Id = ca.Id,
            CampaignId = ca.CampaignId,
            AgentId = ca.AgentId,
            AgentName = ca.Agent.Name,
            IsActive = ca.IsActive,
            IsOnCall = ca.IsOnCall,
            IsInWrapUp = ca.IsInWrapUp,
            LoggedInAtUtc = ca.LoggedInAtUtc,
            CurrentRecordId = ca.CurrentRecordId,
            TotalCallsHandled = ca.TotalCallsHandled,
            TotalConnectedCalls = ca.TotalConnectedCalls,
            TotalTalkTimeSeconds = ca.TotalTalkTimeSeconds
        };
    }

    #endregion
}
