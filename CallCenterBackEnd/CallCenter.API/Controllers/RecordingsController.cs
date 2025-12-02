using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Recordings;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RecordingsController : ControllerBase
{
    private readonly ICallRecordingService _recordingService;

    public RecordingsController(ICallRecordingService recordingService)
    {
        _recordingService = recordingService;
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

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteRecording(Guid id)
    {
        var result = await _recordingService.DeleteRecordingAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
