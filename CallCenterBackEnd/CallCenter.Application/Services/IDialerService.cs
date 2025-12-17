using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Dialer;
using CallCenter.Domain.Enums;

namespace CallCenter.Application.Services;

public interface IDialerService
{
    // Campaign Management
    Task<PagedResponse<DialerCampaignDto>> GetCampaignsAsync(PagedRequest request, DialerCampaignStatus? status = null);
    Task<DialerCampaignDetailDto?> GetCampaignByIdAsync(Guid id);
    Task<DialerCampaignDto> CreateCampaignAsync(CreateCampaignRequest request);
    Task<DialerCampaignDto?> UpdateCampaignAsync(Guid id, UpdateCampaignRequest request);
    Task<bool> DeleteCampaignAsync(Guid id);
    Task<bool> StartCampaignAsync(Guid id);
    Task<bool> PauseCampaignAsync(Guid id);
    Task<bool> StopCampaignAsync(Guid id);

    // List Management
    Task<PagedResponse<DialerListDto>> GetListsAsync(PagedRequest request, Guid? campaignId = null);
    Task<DialerListDto?> GetListByIdAsync(Guid id);
    Task<DialerListDto> CreateListAsync(CreateListRequest request);
    Task<ImportResultDto> ImportListAsync(ImportListRequest request, Guid importedBy);
    Task<bool> AssignListToCampaignAsync(Guid listId, Guid campaignId);
    Task<bool> DeleteListAsync(Guid id);

    // Record Management
    Task<PagedResponse<DialerRecordDto>> GetRecordsAsync(PagedRequest request, Guid listId, DialerRecordStatus? status = null);
    Task<DialerRecordDetailDto?> GetRecordByIdAsync(Guid id);
    Task<DialerRecordDto?> UpdateRecordAsync(Guid id, UpdateRecordRequest request);

    // Dialer Session (Agent Operations)
    Task<DialerSessionDto?> GetAgentSessionAsync(Guid agentId, Guid campaignId);
    Task<bool> AgentLoginToCampaignAsync(Guid agentId, Guid campaignId);
    Task<bool> AgentLogoutFromCampaignAsync(Guid agentId, Guid campaignId);
    Task<DialerRecordDto?> GetNextRecordForAgentAsync(Guid agentId, Guid campaignId);
    Task<DialResultDto> DialRecordAsync(Guid agentId, DialRequest request);
    Task<bool> SkipRecordAsync(Guid agentId, SkipRecordRequest request);
    Task<DialerAttemptDto?> CompleteAttemptAsync(Guid attemptId, CompleteAttemptRequest request);

    // DNC Management
    Task<PagedResponse<DoNotCallEntryDto>> GetDncEntriesAsync(PagedRequest request);
    Task<DoNotCallEntryDto> AddDncEntryAsync(AddDncRequest request, Guid addedBy);
    Task<int> ImportDncEntriesAsync(ImportDncRequest request, Guid addedBy);
    Task<bool> RemoveDncEntryAsync(Guid id);
    Task<DncCheckResult> CheckDncAsync(string phoneNumber);
    Task<List<DncCheckResult>> CheckDncBatchAsync(List<string> phoneNumbers);

    // Statistics
    Task<CampaignStatsDto> GetCampaignStatsAsync(Guid campaignId);
    Task<List<AgentDialerStatsDto>> GetAgentStatsAsync(Guid campaignId);
}
