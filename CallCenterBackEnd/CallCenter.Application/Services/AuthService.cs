using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CallCenter.Application.DTOs.Auth;
using CallCenter.Domain.Constants;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CallCenter.Application.Services;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request, string? ipAddress = null);
    Task<AuthResponse?> RegisterAsync(RegisterRequest request, string? ipAddress = null);
    Task<AuthResponse?> RefreshTokenAsync(string token, string? ipAddress = null);
    Task<bool> RevokeTokenAsync(string token, string? ipAddress = null);
    Task<bool> ChangePasswordAsync(Guid agentId, ChangePasswordRequest request);
}

public class AuthService : IAuthService
{
    private readonly IRepository<Agent> _agentRepository;
    private readonly IRepository<RefreshToken> _refreshTokenRepository;
    private readonly IRepository<AgentRoleAssignment> _agentRoleRepository;
    private readonly IPermissionService _permissionService;
    private readonly IConfiguration _configuration;

    public AuthService(
        IRepository<Agent> agentRepository,
        IRepository<RefreshToken> refreshTokenRepository,
        IRepository<AgentRoleAssignment> agentRoleRepository,
        IPermissionService permissionService,
        IConfiguration configuration)
    {
        _agentRepository = agentRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _agentRoleRepository = agentRoleRepository;
        _permissionService = permissionService;
        _configuration = configuration;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, string? ipAddress = null)
    {
        var agents = await _agentRepository.GetAllAsync();
        var agent = agents.FirstOrDefault(a => a.Email.ToLower() == request.Email.ToLower());

        if (agent == null || string.IsNullOrEmpty(agent.PasswordHash))
            return null;

        if (!VerifyPassword(request.Password, agent.PasswordHash))
            return null;

        // Get RBAC info
        var permissionsSummary = await _permissionService.GetAgentPermissionsSummaryAsync(agent.Id);

        var accessToken = await GenerateJwtTokenAsync(agent);
        var refreshToken = await GenerateRefreshTokenAsync(agent.Id, ipAddress);

        return new AuthResponse
        {
            Id = agent.Id,
            Name = agent.Name,
            Email = agent.Email,
            TeamId = agent.TeamId?.ToString(),
            IsSuperAdmin = permissionsSummary.IsSuperAdmin,
            Roles = permissionsSummary.Roles,
            Permissions = permissionsSummary.Permissions,
#pragma warning disable CS0618 // Type or member is obsolete
            Role = agent.Role.ToString(), // Legacy support
#pragma warning restore CS0618
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            TokenExpires = DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes())
        };
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request, string? ipAddress = null)
    {
        var agents = await _agentRepository.GetAllAsync();
        if (agents.Any(a => a.Email.ToLower() == request.Email.ToLower()))
            return null;

        var agent = new Agent
        {
            Id = Guid.NewGuid(),
            EmployeeId = GenerateEmployeeId(),
            Name = request.Name,
            Email = request.Email,
            PasswordHash = HashPassword(request.Password),
            Phone = request.Phone,
            TeamId = request.TeamId,
#pragma warning disable CS0618
            Role = AgentRole.Agent, // Legacy field
#pragma warning restore CS0618
            Status = AgentStatus.Active,
            HireDate = DateOnly.FromDateTime(DateTime.UtcNow),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _agentRepository.AddAsync(agent);
        await _agentRepository.SaveChangesAsync();

        // Assign default Agent role
        var agentRoleAssignment = new AgentRoleAssignment
        {
            AgentId = agent.Id,
            RoleId = RbacConstants.AgentRoleId, // Default Agent role
            AssignedAt = DateTime.UtcNow
        };
        await _agentRoleRepository.AddAsync(agentRoleAssignment);
        await _agentRoleRepository.SaveChangesAsync();

        // Get RBAC info
        var permissionsSummary = await _permissionService.GetAgentPermissionsSummaryAsync(agent.Id);

        var accessToken = await GenerateJwtTokenAsync(agent);
        var refreshToken = await GenerateRefreshTokenAsync(agent.Id, ipAddress);

        return new AuthResponse
        {
            Id = agent.Id,
            Name = agent.Name,
            Email = agent.Email,
            TeamId = agent.TeamId?.ToString(),
            IsSuperAdmin = permissionsSummary.IsSuperAdmin,
            Roles = permissionsSummary.Roles,
            Permissions = permissionsSummary.Permissions,
#pragma warning disable CS0618
            Role = agent.Role.ToString(), // Legacy support
#pragma warning restore CS0618
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            TokenExpires = DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes())
        };
    }

    public async Task<AuthResponse?> RefreshTokenAsync(string token, string? ipAddress = null)
    {
        var refreshTokens = await _refreshTokenRepository.GetAllAsync();
        var refreshToken = refreshTokens.FirstOrDefault(rt => rt.Token == token);

        if (refreshToken == null || !refreshToken.IsActive)
            return null;

        var agents = await _agentRepository.GetAllAsync();
        var agent = agents.FirstOrDefault(a => a.Id == refreshToken.AgentId);

        if (agent == null)
            return null;

        // Revoke old token and create new one
        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.RevokedByIp = ipAddress;
        _refreshTokenRepository.Update(refreshToken);

        var newRefreshToken = await GenerateRefreshTokenAsync(agent.Id, ipAddress);
        refreshToken.ReplacedByToken = newRefreshToken.Token;
        await _refreshTokenRepository.SaveChangesAsync();

        // Get RBAC info
        var permissionsSummary = await _permissionService.GetAgentPermissionsSummaryAsync(agent.Id);

        var accessToken = await GenerateJwtTokenAsync(agent);

        return new AuthResponse
        {
            Id = agent.Id,
            Name = agent.Name,
            Email = agent.Email,
            TeamId = agent.TeamId?.ToString(),
            IsSuperAdmin = permissionsSummary.IsSuperAdmin,
            Roles = permissionsSummary.Roles,
            Permissions = permissionsSummary.Permissions,
#pragma warning disable CS0618
            Role = agent.Role.ToString(), // Legacy support
#pragma warning restore CS0618
            AccessToken = accessToken,
            RefreshToken = newRefreshToken.Token,
            TokenExpires = DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes())
        };
    }

    public async Task<bool> RevokeTokenAsync(string token, string? ipAddress = null)
    {
        var refreshTokens = await _refreshTokenRepository.GetAllAsync();
        var refreshToken = refreshTokens.FirstOrDefault(rt => rt.Token == token);

        if (refreshToken == null || !refreshToken.IsActive)
            return false;

        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.RevokedByIp = ipAddress;
        _refreshTokenRepository.Update(refreshToken);
        await _refreshTokenRepository.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ChangePasswordAsync(Guid agentId, ChangePasswordRequest request)
    {
        var agents = await _agentRepository.GetAllAsync();
        var agent = agents.FirstOrDefault(a => a.Id == agentId);

        if (agent == null || string.IsNullOrEmpty(agent.PasswordHash))
            return false;

        if (!VerifyPassword(request.CurrentPassword, agent.PasswordHash))
            return false;

        agent.PasswordHash = HashPassword(request.NewPassword);
        agent.UpdatedAt = DateTime.UtcNow;
        _agentRepository.Update(agent);
        await _agentRepository.SaveChangesAsync();

        return true;
    }

    private async Task<string> GenerateJwtTokenAsync(Agent agent)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:Key"] ?? "DefaultSecretKeyThatShouldBeChangedInProduction123!"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Get RBAC info for JWT claims
        var isSuperAdmin = await _permissionService.IsSuperAdminAsync(agent.Id);
        var roles = await _permissionService.GetAgentRolesAsync(agent.Id);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, agent.Id.ToString()),
            new Claim(ClaimTypes.Name, agent.Name),
            new Claim(ClaimTypes.Email, agent.Email),
            new Claim("TeamId", agent.TeamId?.ToString() ?? string.Empty),
            new Claim("IsSuperAdmin", isSuperAdmin.ToString().ToLower())
        };

        // Add role claims (multiple roles supported)
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role.SystemName));
        }

        // Legacy: Add old enum role for backward compatibility
#pragma warning disable CS0618
        claims.Add(new Claim("LegacyRole", agent.Role.ToString()));
#pragma warning restore CS0618

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "CallCenterAPI",
            audience: _configuration["Jwt:Audience"] ?? "CallCenterClient",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes()),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<RefreshToken> GenerateRefreshTokenAsync(Guid agentId, string? ipAddress)
    {
        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            AgentId = agentId,
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = ipAddress
        };

        await _refreshTokenRepository.AddAsync(refreshToken);
        await _refreshTokenRepository.SaveChangesAsync();

        return refreshToken;
    }

    private static readonly PasswordHasher<Agent> _passwordHasher = new();

    private static string HashPassword(string password)
    {
        return _passwordHasher.HashPassword(null!, password);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        var result = _passwordHasher.VerifyHashedPassword(null!, hash, password);
        return result == PasswordVerificationResult.Success || result == PasswordVerificationResult.SuccessRehashNeeded;
    }

    private static string GenerateEmployeeId()
    {
        return $"EMP{DateTime.UtcNow:yyyyMMdd}{RandomNumberGenerator.GetInt32(1000, 9999)}";
    }

    private int GetTokenExpirationMinutes()
    {
        return int.TryParse(_configuration["Jwt:ExpirationMinutes"], out var minutes) ? minutes : 60;
    }
}
