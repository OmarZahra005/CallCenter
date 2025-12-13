using CallCenter.Application.DTOs.Timeline;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TimelineController : ControllerBase
{
    private readonly ITimelineService _timelineService;

    public TimelineController(ITimelineService timelineService)
    {
        _timelineService = timelineService;
    }

    /// <summary>
    /// Gets the timeline of events for a specific conversation.
    /// Aggregates call logs, messages, and ticket events into a chronological timeline.
    /// </summary>
    [HttpGet("conversation/{conversationId}")]
    public async Task<ActionResult<List<TimelineEventDto>>> GetConversationTimeline(Guid conversationId)
    {
        var timeline = await _timelineService.GetConversationTimelineAsync(conversationId);
        return Ok(timeline);
    }
}
