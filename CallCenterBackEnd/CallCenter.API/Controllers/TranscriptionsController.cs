using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TranscriptionsController : ControllerBase
{
    private readonly ITranscriptionService _transcriptionService;

    public TranscriptionsController(ITranscriptionService transcriptionService)
    {
        _transcriptionService = transcriptionService;
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
}
