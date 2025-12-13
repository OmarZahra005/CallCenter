using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TranscriptionsController : ControllerBase
{
    private readonly ITranscriptionService _transcriptionService;
    private readonly IRecordingStorageService _recordingStorageService;

    public TranscriptionsController(
        ITranscriptionService transcriptionService,
        IRecordingStorageService recordingStorageService)
    {
        _transcriptionService = transcriptionService;
        _recordingStorageService = recordingStorageService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TranscriptionDto>> GetById(Guid id)
    {
        var transcription = await _transcriptionService.GetByIdAsync(id);
        if (transcription == null) return NotFound();
        return Ok(transcription);
    }

    [HttpGet("recording/{recordingId}")]
    public async Task<ActionResult<TranscriptionDto>> GetByRecordingId(Guid recordingId)
    {
        var transcription = await _transcriptionService.GetByRecordingIdAsync(recordingId);
        if (transcription == null) return NotFound();
        return Ok(transcription);
    }

    [HttpGet("call/{callSid}")]
    public async Task<ActionResult<TranscriptionDto>> GetByCallSid(string callSid)
    {
        // Use GetOrCreate to automatically process transcription if it doesn't exist
        var transcription = await _transcriptionService.GetOrCreateByCallSidAsync(callSid);
        if (transcription == null) return NotFound();
        return Ok(transcription);
    }

    [HttpPost]
    public async Task<ActionResult<TranscriptionDto>> Create(CreateTranscriptionRequest request)
    {
        var transcription = await _transcriptionService.CreateTranscriptionAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = transcription.Id }, transcription);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TranscriptionDto>> Update(Guid id, UpdateTranscriptionRequest request)
    {
        var transcription = await _transcriptionService.UpdateTranscriptionAsync(id, request);
        if (transcription == null) return NotFound();
        return Ok(transcription);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await _transcriptionService.DeleteTranscriptionAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("recording/{recordingId}/request")]
    public async Task<ActionResult<TranscriptionDto>> RequestTranscription(Guid recordingId)
    {
        var transcription = await _transcriptionService.RequestTranscriptionAsync(recordingId);
        return Ok(transcription);
    }

    /// <summary>
    /// Process transcription for a recording by calling external API
    /// </summary>
    [HttpPost("recording/{recordingId}/process")]
    public async Task<ActionResult<TranscriptionDto>> ProcessTranscription(Guid recordingId)
    {
        // Get the file path for the recording
        var filePath = await _recordingStorageService.GetRecordingLocalPathAsync(recordingId);
        if (string.IsNullOrEmpty(filePath))
        {
            return NotFound(new { message = "Recording file not found" });
        }

        var transcription = await _transcriptionService.ProcessTranscriptionAsync(recordingId, filePath);
        if (transcription == null)
        {
            return StatusCode(500, new { message = "Transcription processing failed" });
        }

        return Ok(transcription);
    }
}
