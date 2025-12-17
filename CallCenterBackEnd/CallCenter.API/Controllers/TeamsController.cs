using CallCenter.API.Authorization;
using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.Teams;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeamsController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamsController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    [HttpGet]
    [RequirePermission("teams.view")]
    public async Task<ActionResult<PagedResponse<TeamDto>>> GetTeams([FromQuery] PagedRequest request)
    {
        var result = await _teamService.GetTeamsAsync(request);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [RequirePermission("teams.view")]
    public async Task<ActionResult<TeamDetailDto>> GetTeam(Guid id)
    {
        var team = await _teamService.GetTeamByIdAsync(id);
        if (team == null) return NotFound();
        return Ok(team);
    }

    [HttpPost]
    [RequirePermission("teams.create")]
    public async Task<ActionResult<TeamDto>> CreateTeam(CreateTeamRequest request)
    {
        var team = await _teamService.CreateTeamAsync(request);
        return CreatedAtAction(nameof(GetTeam), new { id = team.Id }, team);
    }

    [HttpPut("{id}")]
    [RequirePermission("teams.edit")]
    public async Task<ActionResult<TeamDto>> UpdateTeam(Guid id, UpdateTeamRequest request)
    {
        var team = await _teamService.UpdateTeamAsync(id, request);
        if (team == null) return NotFound();
        return Ok(team);
    }

    [HttpDelete("{id}")]
    [RequirePermission("teams.delete")]
    public async Task<ActionResult> DeleteTeam(Guid id)
    {
        var result = await _teamService.DeleteTeamAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("active")]
    [RequirePermission("teams.view")]
    public async Task<ActionResult<List<TeamDto>>> GetActiveTeams()
    {
        var teams = await _teamService.GetActiveTeamsAsync();
        return Ok(teams);
    }
}
