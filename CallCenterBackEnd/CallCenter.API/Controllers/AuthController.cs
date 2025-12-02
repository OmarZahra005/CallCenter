using CallCenter.Application.DTOs.Auth;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var ipAddress = GetIpAddress();
        var result = await _authService.LoginAsync(request, ipAddress);

        if (result == null)
            return Unauthorized(new { message = "Invalid email or password" });

        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var ipAddress = GetIpAddress();
        var result = await _authService.RegisterAsync(request, ipAddress);

        if (result == null)
            return BadRequest(new { message = "Email already exists" });

        return Ok(result);
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponse>> RefreshToken(RefreshTokenRequest request)
    {
        var ipAddress = GetIpAddress();
        var result = await _authService.RefreshTokenAsync(request.RefreshToken, ipAddress);

        if (result == null)
            return Unauthorized(new { message = "Invalid or expired refresh token" });

        return Ok(result);
    }

    [Authorize]
    [HttpPost("revoke-token")]
    public async Task<ActionResult> RevokeToken(RefreshTokenRequest request)
    {
        var ipAddress = GetIpAddress();
        var result = await _authService.RevokeTokenAsync(request.RefreshToken, ipAddress);

        if (!result)
            return BadRequest(new { message = "Token not found or already revoked" });

        return Ok(new { message = "Token revoked successfully" });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var agentId = GetCurrentAgentId();
        if (agentId == null)
            return Unauthorized();

        var result = await _authService.ChangePasswordAsync(agentId.Value, request);

        if (!result)
            return BadRequest(new { message = "Current password is incorrect" });

        return Ok(new { message = "Password changed successfully" });
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult GetCurrentUser()
    {
        var agentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var name = User.FindFirst(ClaimTypes.Name)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var teamId = User.FindFirst("TeamId")?.Value;

        return Ok(new
        {
            id = agentId,
            name,
            email,
            role,
            teamId
        });
    }

    private string? GetIpAddress()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
            return Request.Headers["X-Forwarded-For"];

        return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString();
    }

    private Guid? GetCurrentAgentId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
