using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Sla;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SlaRulesController : ControllerBase
{
    private readonly ISlaService _slaService;

    public SlaRulesController(ISlaService slaService)
    {
        _slaService = slaService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<SlaRuleDto>>> GetRules([FromQuery] PagedRequest request)
    {
        var result = await _slaService.GetRulesAsync(request);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SlaRuleDto>> GetRule(Guid id)
    {
        var result = await _slaService.GetRuleByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<SlaRuleDto>> CreateRule(CreateSlaRuleRequest request)
    {
        var result = await _slaService.CreateRuleAsync(request);
        return CreatedAtAction(nameof(GetRule), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SlaRuleDto>> UpdateRule(Guid id, UpdateSlaRuleRequest request)
    {
        var result = await _slaService.UpdateRuleAsync(id, request);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteRule(Guid id)
    {
        var result = await _slaService.DeleteRuleAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("active")]
    public async Task<ActionResult<List<SlaRuleDto>>> GetActiveRules()
    {
        var result = await _slaService.GetActiveRulesAsync();
        return Ok(result);
    }
}
