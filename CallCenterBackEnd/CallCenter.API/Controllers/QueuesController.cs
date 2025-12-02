using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Queues;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QueuesController : ControllerBase
{
    private readonly IQueueService _queueService;

    public QueuesController(IQueueService queueService)
    {
        _queueService = queueService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<QueueDto>>> GetQueues([FromQuery] PagedRequest request)
    {
        var result = await _queueService.GetQueuesAsync(request);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<QueueDto>> GetQueue(Guid id)
    {
        var queue = await _queueService.GetQueueByIdAsync(id);
        if (queue == null) return NotFound();
        return Ok(queue);
    }

    [HttpPost]
    public async Task<ActionResult<QueueDto>> CreateQueue(CreateQueueRequest request)
    {
        var queue = await _queueService.CreateQueueAsync(request);
        return CreatedAtAction(nameof(GetQueue), new { id = queue.Id }, queue);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<QueueDto>> UpdateQueue(Guid id, UpdateQueueRequest request)
    {
        var queue = await _queueService.UpdateQueueAsync(id, request);
        if (queue == null) return NotFound();
        return Ok(queue);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteQueue(Guid id)
    {
        var result = await _queueService.DeleteQueueAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
