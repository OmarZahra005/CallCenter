using CallCenter.Application.DTOs.Ivr;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/ivr")]
[Authorize]
public class IvrController : ControllerBase
{
    private readonly IIvrService _ivrService;
    private readonly ILogger<IvrController> _logger;

    public IvrController(IIvrService ivrService, ILogger<IvrController> logger)
    {
        _ivrService = ivrService;
        _logger = logger;
    }

    // ==================== Flow Management ====================

    /// <summary>
    /// Get all IVR flows with pagination
    /// </summary>
    [HttpGet("flows")]
    public async Task<IActionResult> GetFlows(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? isActive = null)
    {
        var result = await _ivrService.GetFlowsAsync(pageNumber, pageSize, isActive);
        return Ok(result);
    }

    /// <summary>
    /// Get a specific IVR flow by ID with all nodes
    /// </summary>
    [HttpGet("flows/{flowId:guid}")]
    public async Task<IActionResult> GetFlow(Guid flowId)
    {
        var flow = await _ivrService.GetFlowByIdAsync(flowId);
        if (flow == null)
        {
            return NotFound($"IVR flow {flowId} not found");
        }
        return Ok(flow);
    }

    /// <summary>
    /// Get the default IVR flow
    /// </summary>
    [HttpGet("flows/default")]
    public async Task<IActionResult> GetDefaultFlow()
    {
        var flow = await _ivrService.GetDefaultFlowAsync();
        if (flow == null)
        {
            return NotFound("No default IVR flow configured");
        }
        return Ok(flow);
    }

    /// <summary>
    /// Create a new IVR flow
    /// </summary>
    [HttpPost("flows")]
    public async Task<IActionResult> CreateFlow([FromBody] CreateIvrFlowRequest request)
    {
        var flow = await _ivrService.CreateFlowAsync(request);
        return CreatedAtAction(nameof(GetFlow), new { flowId = flow.Id }, flow);
    }

    /// <summary>
    /// Update an existing IVR flow
    /// </summary>
    [HttpPut("flows/{flowId:guid}")]
    public async Task<IActionResult> UpdateFlow(Guid flowId, [FromBody] UpdateIvrFlowRequest request)
    {
        var flow = await _ivrService.UpdateFlowAsync(flowId, request);
        if (flow == null)
        {
            return NotFound($"IVR flow {flowId} not found");
        }
        return Ok(flow);
    }

    /// <summary>
    /// Delete an IVR flow
    /// </summary>
    [HttpDelete("flows/{flowId:guid}")]
    public async Task<IActionResult> DeleteFlow(Guid flowId)
    {
        var result = await _ivrService.DeleteFlowAsync(flowId);
        if (!result)
        {
            return BadRequest("Cannot delete flow - it may have active sessions or not exist");
        }
        return NoContent();
    }

    /// <summary>
    /// Duplicate an IVR flow
    /// </summary>
    [HttpPost("flows/{flowId:guid}/duplicate")]
    public async Task<IActionResult> DuplicateFlow(Guid flowId, [FromQuery] string newName)
    {
        var flow = await _ivrService.DuplicateFlowAsync(flowId, newName);
        if (flow == null)
        {
            return NotFound($"IVR flow {flowId} not found");
        }
        return CreatedAtAction(nameof(GetFlow), new { flowId = flow.Id }, flow);
    }

    /// <summary>
    /// Validate an IVR flow
    /// </summary>
    [HttpPost("flows/{flowId:guid}/validate")]
    public async Task<IActionResult> ValidateFlow(Guid flowId)
    {
        var errors = await _ivrService.ValidateFlowAsync(flowId);
        return Ok(new { isValid = errors.Count == 0, errors });
    }

    /// <summary>
    /// Export an IVR flow as JSON
    /// </summary>
    [HttpGet("flows/{flowId:guid}/export")]
    public async Task<IActionResult> ExportFlow(Guid flowId)
    {
        try
        {
            var export = await _ivrService.ExportFlowAsync(flowId);
            return Ok(export);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Import an IVR flow from JSON
    /// </summary>
    [HttpPost("flows/import")]
    public async Task<IActionResult> ImportFlow([FromBody] IvrFlowExportDto importData, [FromQuery] string? newName = null)
    {
        var flow = await _ivrService.ImportFlowAsync(importData, newName);
        return CreatedAtAction(nameof(GetFlow), new { flowId = flow.Id }, flow);
    }

    // ==================== Node Management ====================

    /// <summary>
    /// Get a specific node by ID
    /// </summary>
    [HttpGet("nodes/{nodeId:guid}")]
    public async Task<IActionResult> GetNode(Guid nodeId)
    {
        var node = await _ivrService.GetNodeByIdAsync(nodeId);
        if (node == null)
        {
            return NotFound($"IVR node {nodeId} not found");
        }
        return Ok(node);
    }

    /// <summary>
    /// Create a new node in a flow
    /// </summary>
    [HttpPost("nodes")]
    public async Task<IActionResult> CreateNode([FromBody] CreateIvrNodeRequest request)
    {
        var node = await _ivrService.CreateNodeAsync(request);
        return CreatedAtAction(nameof(GetNode), new { nodeId = node.Id }, node);
    }

    /// <summary>
    /// Update an existing node
    /// </summary>
    [HttpPut("nodes/{nodeId:guid}")]
    public async Task<IActionResult> UpdateNode(Guid nodeId, [FromBody] UpdateIvrNodeRequest request)
    {
        var node = await _ivrService.UpdateNodeAsync(nodeId, request);
        if (node == null)
        {
            return NotFound($"IVR node {nodeId} not found");
        }
        return Ok(node);
    }

    /// <summary>
    /// Delete a node
    /// </summary>
    [HttpDelete("nodes/{nodeId:guid}")]
    public async Task<IActionResult> DeleteNode(Guid nodeId)
    {
        var result = await _ivrService.DeleteNodeAsync(nodeId);
        if (!result)
        {
            return BadRequest("Cannot delete node - it may be referenced by other nodes or is an entry/exit point");
        }
        return NoContent();
    }

    // ==================== Menu Option Management ====================

    /// <summary>
    /// Create a menu option for a node
    /// </summary>
    [HttpPost("menu-options")]
    public async Task<IActionResult> CreateMenuOption([FromBody] CreateMenuOptionRequest request)
    {
        var option = await _ivrService.CreateMenuOptionAsync(request);
        return Created($"/api/ivr/menu-options/{option.Id}", option);
    }

    /// <summary>
    /// Update a menu option
    /// </summary>
    [HttpPut("menu-options/{optionId:guid}")]
    public async Task<IActionResult> UpdateMenuOption(Guid optionId, [FromBody] UpdateMenuOptionRequest request)
    {
        var option = await _ivrService.UpdateMenuOptionAsync(optionId, request);
        if (option == null)
        {
            return NotFound($"Menu option {optionId} not found");
        }
        return Ok(option);
    }

    /// <summary>
    /// Delete a menu option
    /// </summary>
    [HttpDelete("menu-options/{optionId:guid}")]
    public async Task<IActionResult> DeleteMenuOption(Guid optionId)
    {
        var result = await _ivrService.DeleteMenuOptionAsync(optionId);
        if (!result)
        {
            return NotFound($"Menu option {optionId} not found");
        }
        return NoContent();
    }

    // ==================== Session Management ====================

    /// <summary>
    /// Get an active IVR session by call SID
    /// </summary>
    [HttpGet("sessions/by-call/{callSid}")]
    public async Task<IActionResult> GetSessionByCallSid(string callSid)
    {
        var session = await _ivrService.GetSessionByCallSidAsync(callSid);
        if (session == null)
        {
            return NotFound($"No session found for CallSid {callSid}");
        }
        return Ok(session);
    }

    /// <summary>
    /// Get an IVR session by ID
    /// </summary>
    [HttpGet("sessions/{sessionId:guid}")]
    public async Task<IActionResult> GetSession(Guid sessionId)
    {
        var session = await _ivrService.GetSessionByIdAsync(sessionId);
        if (session == null)
        {
            return NotFound($"Session {sessionId} not found");
        }
        return Ok(session);
    }
}
