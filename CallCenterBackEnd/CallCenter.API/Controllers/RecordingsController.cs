using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Recordings;
using CallCenter.Application.Services;
using CallCenter.API.Authorization;
using CallCenter.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[RoleAuthorize(AgentRole.Supervisor, AgentRole.QaEvaluator, AgentRole.Admin)]
public class RecordingsController : ControllerBase
{
    private readonly ICallRecordingService _recordingService;
    private readonly IRecordingStorageService _recordingStorageService;

    public RecordingsController(
        ICallRecordingService recordingService,
        IRecordingStorageService recordingStorageService)
    {
        _recordingService = recordingService;
        _recordingStorageService = recordingStorageService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<CallRecordingDto>>> GetRecordings([FromQuery] PagedRequest request)
    {
        var result = await _recordingService.GetRecordingsAsync(request);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CallRecordingDto>> GetRecording(Guid id)
    {
        var result = await _recordingService.GetRecordingByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CallRecordingDto>> CreateRecording(CreateRecordingRequest request)
    {
        var result = await _recordingService.CreateRecordingAsync(request);
        return CreatedAtAction(nameof(GetRecording), new { id = result.Id }, result);
    }

    [HttpGet("call/{callId}")]
    public async Task<ActionResult<List<CallRecordingDto>>> GetByCallId(string callId)
    {
        var result = await _recordingService.GetByCallIdAsync(callId);
        return Ok(result);
    }

    [HttpGet("conversation/{conversationId:guid}")]
    public async Task<ActionResult<List<CallRecordingDto>>> GetByConversationId(Guid conversationId)
    {
        var result = await _recordingService.GetByConversationIdAsync(conversationId);
        return Ok(result);
    }

    /// <summary>
    /// Stream recording audio file
    /// </summary>
    [HttpGet("{id:guid}/stream")]
    public async Task<IActionResult> StreamRecording(Guid id)
    {
        var stream = await _recordingStorageService.GetRecordingStreamAsync(id);
        if (stream == null)
            return NotFound();

        return File(stream, "audio/wav", enableRangeProcessing: true);
    }

    /// <summary>
    /// Get recording by CallSid
    /// </summary>
    [HttpGet("call-sid/{callSid}")]
    public async Task<ActionResult<CallRecordingDto>> GetByCallSid(string callSid)
    {
        var recordings = await _recordingService.GetByCallIdAsync(callSid);
        var recording = recordings.FirstOrDefault();

        return recording == null ? NotFound() : Ok(recording);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteRecording(Guid id)
    {
        var result = await _recordingService.DeleteRecordingAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
