using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Cti;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CtiEventsController : ControllerBase
{
    private readonly ICtiService _ctiService;

    public CtiEventsController(ICtiService ctiService)
    {
        _ctiService = ctiService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<CtiEventDto>>> GetEvents([FromQuery] PagedRequest request, [FromQuery] Guid? agentId = null)
    {
        var result = await _ctiService.GetEventsAsync(request, agentId);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CtiEventDto>> GetEvent(Guid id)
    {
        var result = await _ctiService.GetEventByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CtiEventDto>> CreateEvent(CreateCtiEventRequest request)
    {
        var result = await _ctiService.CreateEventAsync(request);
        return CreatedAtAction(nameof(GetEvent), new { id = result.Id }, result);
    }

    [HttpGet("call/{callId}")]
    public async Task<ActionResult<List<CtiEventDto>>> GetByCallId(string callId)
    {
        var result = await _ctiService.GetByCallIdAsync(callId);
        return Ok(result);
    }
}
