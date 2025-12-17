namespace CallCenter.Application.DTOs.Rbac;

public class AgentPermissionsDto
{
    public Guid AgentId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsSuperAdmin { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
}
