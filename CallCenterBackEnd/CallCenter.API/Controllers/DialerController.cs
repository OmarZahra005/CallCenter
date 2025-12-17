using CallCenter.API.Authorization;
using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Dialer;
using CallCenter.Application.Services;
using CallCenter.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DialerController : ControllerBase
{
    private readonly IDialerService _dialerService;
    private readonly ILogger<DialerController> _logger;

    public DialerController(IDialerService dialerService, ILogger<DialerController> logger)
    {
        _dialerService = dialerService;
        _logger = logger;
    }

    private Guid GetCurrentAgentId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? Guid.Parse(claim.Value) : Guid.Empty;
    }

    #region Campaign Endpoints

    [HttpGet("campaigns")]
    [RequirePermission("dialer.view")]
    public async Task<ActionResult<PagedResponse<DialerCampaignDto>>> GetCampaigns(
        [FromQuery] PagedRequest request,
        [FromQuery] DialerCampaignStatus? status = null)
    {
        var result = await _dialerService.GetCampaignsAsync(request, status);
        return Ok(result);
    }

    [HttpGet("campaigns/{id}")]
    [RequirePermission("dialer.view")]
    public async Task<ActionResult<DialerCampaignDetailDto>> GetCampaign(Guid id)
    {
        var campaign = await _dialerService.GetCampaignByIdAsync(id);
        if (campaign == null) return NotFound();
        return Ok(campaign);
    }

    [HttpPost("campaigns")]
    [RequirePermission("dialer.campaigns_manage")]
    public async Task<ActionResult<DialerCampaignDto>> CreateCampaign(CreateCampaignRequest request)
    {
        var campaign = await _dialerService.CreateCampaignAsync(request);
        return CreatedAtAction(nameof(GetCampaign), new { id = campaign.Id }, campaign);
    }

    [HttpPut("campaigns/{id}")]
    [RequirePermission("dialer.campaigns_manage")]
    public async Task<ActionResult<DialerCampaignDto>> UpdateCampaign(Guid id, UpdateCampaignRequest request)
    {
        var campaign = await _dialerService.UpdateCampaignAsync(id, request);
        if (campaign == null) return NotFound();
        return Ok(campaign);
    }

    [HttpDelete("campaigns/{id}")]
    [RequirePermission("dialer.campaigns_manage")]
    public async Task<ActionResult> DeleteCampaign(Guid id)
    {
        var result = await _dialerService.DeleteCampaignAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("campaigns/{id}/start")]
    [RequirePermission("dialer.campaigns_manage")]
    public async Task<ActionResult> StartCampaign(Guid id)
    {
        var result = await _dialerService.StartCampaignAsync(id);
        if (!result) return BadRequest("Cannot start campaign. Check status and configuration.");
        return Ok(new { message = "Campaign started successfully" });
    }

    [HttpPost("campaigns/{id}/pause")]
    [RequirePermission("dialer.campaigns_manage")]
    public async Task<ActionResult> PauseCampaign(Guid id)
    {
        var result = await _dialerService.PauseCampaignAsync(id);
        if (!result) return BadRequest("Cannot pause campaign. It may not be running.");
        return Ok(new { message = "Campaign paused successfully" });
    }

    [HttpPost("campaigns/{id}/stop")]
    [RequirePermission("dialer.campaigns_manage")]
    public async Task<ActionResult> StopCampaign(Guid id)
    {
        var result = await _dialerService.StopCampaignAsync(id);
        if (!result) return NotFound();
        return Ok(new { message = "Campaign stopped successfully" });
    }

    [HttpGet("campaigns/{id}/stats")]
    [RequirePermission("dialer.view")]
    public async Task<ActionResult<CampaignStatsDto>> GetCampaignStats(Guid id)
    {
        var stats = await _dialerService.GetCampaignStatsAsync(id);
        return Ok(stats);
    }

    [HttpGet("campaigns/{id}/agent-stats")]
    [RequirePermission("dialer.view")]
    public async Task<ActionResult<List<AgentDialerStatsDto>>> GetCampaignAgentStats(Guid id)
    {
        var stats = await _dialerService.GetAgentStatsAsync(id);
        return Ok(stats);
    }

    #endregion

    #region List Endpoints

    [HttpGet("lists")]
    [RequirePermission("dialer.lists_manage")]
    public async Task<ActionResult<PagedResponse<DialerListDto>>> GetLists(
        [FromQuery] PagedRequest request,
        [FromQuery] Guid? campaignId = null)
    {
        var result = await _dialerService.GetListsAsync(request, campaignId);
        return Ok(result);
    }

    [HttpGet("lists/{id}")]
    [RequirePermission("dialer.lists_manage")]
    public async Task<ActionResult<DialerListDto>> GetList(Guid id)
    {
        var list = await _dialerService.GetListByIdAsync(id);
        if (list == null) return NotFound();
        return Ok(list);
    }

    [HttpPost("lists")]
    [RequirePermission("dialer.lists_manage")]
    public async Task<ActionResult<DialerListDto>> CreateList(CreateListRequest request)
    {
        var list = await _dialerService.CreateListAsync(request);
        return CreatedAtAction(nameof(GetList), new { id = list.Id }, list);
    }

    [HttpPost("lists/import")]
    [RequirePermission("dialer.lists_manage")]
    public async Task<ActionResult<ImportResultDto>> ImportList(ImportListRequest request)
    {
        var agentId = GetCurrentAgentId();
        var result = await _dialerService.ImportListAsync(request, agentId);
        return Ok(result);
    }

    [HttpPost("lists/{listId}/assign/{campaignId}")]
    [RequirePermission("dialer.lists_manage")]
    public async Task<ActionResult> AssignListToCampaign(Guid listId, Guid campaignId)
    {
        var result = await _dialerService.AssignListToCampaignAsync(listId, campaignId);
        if (!result) return NotFound();
        return Ok(new { message = "List assigned to campaign successfully" });
    }

    [HttpDelete("lists/{id}")]
    [RequirePermission("dialer.lists_manage")]
    public async Task<ActionResult> DeleteList(Guid id)
    {
        var result = await _dialerService.DeleteListAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    #endregion

    #region Record Endpoints

    [HttpGet("lists/{listId}/records")]
    [RequirePermission("dialer.lists_manage")]
    public async Task<ActionResult<PagedResponse<DialerRecordDto>>> GetRecords(
        Guid listId,
        [FromQuery] PagedRequest request,
        [FromQuery] DialerRecordStatus? status = null)
    {
        var result = await _dialerService.GetRecordsAsync(request, listId, status);
        return Ok(result);
    }

    [HttpGet("records/{id}")]
    [RequirePermission("dialer.view")]
    public async Task<ActionResult<DialerRecordDetailDto>> GetRecord(Guid id)
    {
        var record = await _dialerService.GetRecordByIdAsync(id);
        if (record == null) return NotFound();
        return Ok(record);
    }

    [HttpPut("records/{id}")]
    [RequirePermission("dialer.lists_manage")]
    public async Task<ActionResult<DialerRecordDto>> UpdateRecord(Guid id, UpdateRecordRequest request)
    {
        var record = await _dialerService.UpdateRecordAsync(id, request);
        if (record == null) return NotFound();
        return Ok(record);
    }

    #endregion

    #region Agent Session Endpoints

    [HttpGet("session/{campaignId}")]
    [RequirePermission("dialer.view")]
    public async Task<ActionResult<DialerSessionDto>> GetAgentSession(Guid campaignId)
    {
        var agentId = GetCurrentAgentId();
        var session = await _dialerService.GetAgentSessionAsync(agentId, campaignId);
        if (session == null) return NotFound();
        return Ok(session);
    }

    [HttpPost("session/{campaignId}/login")]
    [RequirePermission("dialer.view")]
    public async Task<ActionResult> AgentLogin(Guid campaignId)
    {
        var agentId = GetCurrentAgentId();
        var result = await _dialerService.AgentLoginToCampaignAsync(agentId, campaignId);
        if (!result) return BadRequest("Cannot login to campaign. Check if campaign is running.");
        return Ok(new { message = "Logged into campaign successfully" });
    }

    [HttpPost("session/{campaignId}/logout")]
    [RequirePermission("dialer.view")]
    public async Task<ActionResult> AgentLogout(Guid campaignId)
    {
        var agentId = GetCurrentAgentId();
        var result = await _dialerService.AgentLogoutFromCampaignAsync(agentId, campaignId);
        if (!result) return NotFound();
        return Ok(new { message = "Logged out from campaign successfully" });
    }

    [HttpPost("session/{campaignId}/next-record")]
    [RequirePermission("dialer.view")]
    public async Task<ActionResult<DialerRecordDto>> GetNextRecord(Guid campaignId)
    {
        var agentId = GetCurrentAgentId();
        var record = await _dialerService.GetNextRecordForAgentAsync(agentId, campaignId);
        if (record == null) return NotFound("No records available");
        return Ok(record);
    }

    [HttpPost("session/dial")]
    [RequirePermission("dialer.view")]
    public async Task<ActionResult<DialResultDto>> Dial(DialRequest request)
    {
        var agentId = GetCurrentAgentId();
        var result = await _dialerService.DialRecordAsync(agentId, request);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("session/skip")]
    [RequirePermission("dialer.view")]
    public async Task<ActionResult> SkipRecord(SkipRecordRequest request)
    {
        var agentId = GetCurrentAgentId();
        var result = await _dialerService.SkipRecordAsync(agentId, request);
        if (!result) return BadRequest("Cannot skip record");
        return Ok(new { message = "Record skipped successfully" });
    }

    [HttpPost("attempts/{attemptId}/complete")]
    [RequirePermission("dialer.view")]
    public async Task<ActionResult<DialerAttemptDto>> CompleteAttempt(Guid attemptId, CompleteAttemptRequest request)
    {
        var attempt = await _dialerService.CompleteAttemptAsync(attemptId, request);
        if (attempt == null) return NotFound();
        return Ok(attempt);
    }

    #endregion

    #region DNC Endpoints

    [HttpGet("dnc")]
    [RequirePermission("dialer.dnc_manage")]
    public async Task<ActionResult<PagedResponse<DoNotCallEntryDto>>> GetDncEntries([FromQuery] PagedRequest request)
    {
        var result = await _dialerService.GetDncEntriesAsync(request);
        return Ok(result);
    }

    [HttpPost("dnc")]
    [RequirePermission("dialer.dnc_manage")]
    public async Task<ActionResult<DoNotCallEntryDto>> AddDncEntry(AddDncRequest request)
    {
        var agentId = GetCurrentAgentId();
        var entry = await _dialerService.AddDncEntryAsync(request, agentId);
        return Ok(entry);
    }

    [HttpPost("dnc/import")]
    [RequirePermission("dialer.dnc_manage")]
    public async Task<ActionResult<object>> ImportDncEntries(ImportDncRequest request)
    {
        var agentId = GetCurrentAgentId();
        var count = await _dialerService.ImportDncEntriesAsync(request, agentId);
        return Ok(new { imported = count });
    }

    [HttpDelete("dnc/{id}")]
    [RequirePermission("dialer.dnc_manage")]
    public async Task<ActionResult> RemoveDncEntry(Guid id)
    {
        var result = await _dialerService.RemoveDncEntryAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("dnc/check")]
    [RequirePermission("dialer.view")]
    public async Task<ActionResult<DncCheckResult>> CheckDnc([FromQuery] string phoneNumber)
    {
        var result = await _dialerService.CheckDncAsync(phoneNumber);
        return Ok(result);
    }

    [HttpPost("dnc/check-batch")]
    [RequirePermission("dialer.view")]
    public async Task<ActionResult<List<DncCheckResult>>> CheckDncBatch([FromBody] List<string> phoneNumbers)
    {
        var results = await _dialerService.CheckDncBatchAsync(phoneNumbers);
        return Ok(results);
    }

    #endregion
}
