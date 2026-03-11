using CallCenter.Domain.Constants;
using CallCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CallCenter.Infrastructure.Data.Seeds;

public static class RbacSeedData
{
    // Fixed GUIDs for seed data
    private static readonly DateTime SeedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    // Use constants from Domain layer
    public static Guid SuperAdminRoleId => RbacConstants.SuperAdminRoleId;
    public static Guid AdministratorRoleId => RbacConstants.AdministratorRoleId;
    public static Guid SupervisorRoleId => RbacConstants.SupervisorRoleId;
    public static Guid QaEvaluatorRoleId => RbacConstants.QaEvaluatorRoleId;
    public static Guid TeamLeadRoleId => RbacConstants.TeamLeadRoleId;
    public static Guid AgentRoleId => RbacConstants.AgentRoleId;

    // Admin user ID (existing)
    public static readonly Guid AdminUserId = Guid.Parse("00000000-0000-0000-0000-000000000001");
    // OmarZahra user ID
    public static readonly Guid OmarZahraUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public static void SeedRbac(ModelBuilder modelBuilder)
    {
        SeedPermissions(modelBuilder);
        SeedRoles(modelBuilder);
        SeedRolePermissions(modelBuilder);
        SeedDefaultAdminRoleAssignment(modelBuilder);
    }

    private static void SeedPermissions(ModelBuilder modelBuilder)
    {
        var permissions = GetAllPermissions();
        modelBuilder.Entity<Permission>().HasData(permissions);
    }

    private static void SeedRoles(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>().HasData(
            new Role
            {
                Id = SuperAdminRoleId,
                Name = "Super Admin",
                SystemName = "super_admin",
                Description = "Full system access, bypasses all permission checks",
                IsSystemRole = true,
                IsSuperAdmin = true,
                IsActive = true,
                CreatedAt = SeedDate,
                UpdatedAt = SeedDate
            },
            new Role
            {
                Id = AdministratorRoleId,
                Name = "Administrator",
                SystemName = "administrator",
                Description = "Full system access with explicit permissions",
                IsSystemRole = true,
                IsSuperAdmin = false,
                IsActive = true,
                CreatedAt = SeedDate,
                UpdatedAt = SeedDate
            },
            new Role
            {
                Id = SupervisorRoleId,
                Name = "Supervisor",
                SystemName = "supervisor",
                Description = "Team management, QA, WFM, and most operations",
                IsSystemRole = true,
                IsSuperAdmin = false,
                IsActive = true,
                CreatedAt = SeedDate,
                UpdatedAt = SeedDate
            },
            new Role
            {
                Id = QaEvaluatorRoleId,
                Name = "QA Evaluator",
                SystemName = "qa_evaluator",
                Description = "Quality assurance, recordings, and limited analytics",
                IsSystemRole = true,
                IsSuperAdmin = false,
                IsActive = true,
                CreatedAt = SeedDate,
                UpdatedAt = SeedDate
            },
            new Role
            {
                Id = TeamLeadRoleId,
                Name = "Team Lead",
                SystemName = "team_lead",
                Description = "Team management, WFM, and tickets",
                IsSystemRole = true,
                IsSuperAdmin = false,
                IsActive = true,
                CreatedAt = SeedDate,
                UpdatedAt = SeedDate
            },
            new Role
            {
                Id = AgentRoleId,
                Name = "Agent",
                SystemName = "agent",
                Description = "Basic call operations and ticket handling",
                IsSystemRole = true,
                IsSuperAdmin = false,
                IsActive = true,
                CreatedAt = SeedDate,
                UpdatedAt = SeedDate
            }
        );
    }

    private static void SeedRolePermissions(ModelBuilder modelBuilder)
    {
        var rolePermissions = new List<RolePermission>();
        var permissions = GetAllPermissions();

        // Administrator gets all permissions
        foreach (var permission in permissions)
        {
            rolePermissions.Add(new RolePermission
            {
                RoleId = AdministratorRoleId,
                PermissionId = permission.Id,
                AssignedAt = SeedDate
            });
        }

        // Supervisor permissions
        var supervisorPermissions = permissions.Where(p =>
            p.SystemName.StartsWith("dashboard.") ||
            p.SystemName.StartsWith("agents.") ||
            p.SystemName.StartsWith("teams.") ||
            p.SystemName.StartsWith("calls.") ||
            p.SystemName.StartsWith("recordings.") ||
            p.SystemName.StartsWith("qa.") ||
            p.SystemName.StartsWith("wfm.") ||
            p.SystemName.StartsWith("tickets.") ||
            p.SystemName.StartsWith("customers.") ||
            p.SystemName.StartsWith("reports.") ||
            p.SystemName.StartsWith("analytics.") ||
            p.SystemName.StartsWith("dialer.") ||
            p.SystemName.StartsWith("knowledge.")
        ).ToList();

        foreach (var permission in supervisorPermissions)
        {
            rolePermissions.Add(new RolePermission
            {
                RoleId = SupervisorRoleId,
                PermissionId = permission.Id,
                AssignedAt = SeedDate
            });
        }

        // QA Evaluator permissions
        var qaPermissions = permissions.Where(p =>
            p.SystemName.StartsWith("dashboard.") ||
            p.SystemName.StartsWith("qa.") ||
            p.SystemName.StartsWith("recordings.") ||
            p.SystemName == "analytics.view" ||
            p.SystemName == "agents.view" ||
            p.SystemName == "teams.view"
        ).ToList();

        foreach (var permission in qaPermissions)
        {
            rolePermissions.Add(new RolePermission
            {
                RoleId = QaEvaluatorRoleId,
                PermissionId = permission.Id,
                AssignedAt = SeedDate
            });
        }

        // Team Lead permissions
        var teamLeadPermissions = permissions.Where(p =>
            p.SystemName.StartsWith("dashboard.") ||
            p.SystemName.StartsWith("teams.") ||
            p.SystemName.StartsWith("wfm.") ||
            p.SystemName.StartsWith("tickets.") ||
            p.SystemName.StartsWith("customers.") ||
            p.SystemName == "agents.view" ||
            p.SystemName == "calls.view" ||
            p.SystemName == "reports.view" ||
            p.SystemName == "analytics.view" ||
            p.SystemName == "knowledge.view"
        ).ToList();

        foreach (var permission in teamLeadPermissions)
        {
            rolePermissions.Add(new RolePermission
            {
                RoleId = TeamLeadRoleId,
                PermissionId = permission.Id,
                AssignedAt = SeedDate
            });
        }

        // Agent permissions (basic operations)
        var agentPermissions = permissions.Where(p =>
            p.SystemName == "dashboard.view" ||
            p.SystemName == "calls.view" ||
            p.SystemName == "calls.make" ||
            p.SystemName == "calls.transfer" ||
            p.SystemName == "tickets.view" ||
            p.SystemName == "tickets.create" ||
            p.SystemName == "tickets.edit" ||
            p.SystemName == "customers.view" ||
            p.SystemName == "customers.create" ||
            p.SystemName == "customers.edit" ||
            p.SystemName == "knowledge.view"
        ).ToList();

        foreach (var permission in agentPermissions)
        {
            rolePermissions.Add(new RolePermission
            {
                RoleId = AgentRoleId,
                PermissionId = permission.Id,
                AssignedAt = SeedDate
            });
        }

        modelBuilder.Entity<RolePermission>().HasData(rolePermissions);
    }

    private static void SeedDefaultAdminRoleAssignment(ModelBuilder modelBuilder)
    {
        // Assign Super Admin role to the default admin user and OmarZahra
        modelBuilder.Entity<AgentRoleAssignment>().HasData(
            new AgentRoleAssignment
            {
                AgentId = AdminUserId,
                RoleId = SuperAdminRoleId,
                AssignedAt = SeedDate
            },
            new AgentRoleAssignment
            {
                AgentId = OmarZahraUserId,
                RoleId = SuperAdminRoleId,
                AssignedAt = new DateTime(2025, 12, 7, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }

    private static List<Permission> GetAllPermissions()
    {
        var permissions = new List<Permission>();
        int order = 0;

        // Dashboard
        permissions.Add(CreatePermission("dashboard.view", "View Dashboard", "Dashboard", "Access the main dashboard", ++order));

        // Agents
        permissions.Add(CreatePermission("agents.view", "View Agents", "Agents", "View agent list and details", ++order));
        permissions.Add(CreatePermission("agents.create", "Create Agents", "Agents", "Create new agents", ++order));
        permissions.Add(CreatePermission("agents.edit", "Edit Agents", "Agents", "Edit agent information", ++order));
        permissions.Add(CreatePermission("agents.delete", "Delete Agents", "Agents", "Delete agents", ++order));
        permissions.Add(CreatePermission("agents.assign_roles", "Assign Roles", "Agents", "Assign roles to agents", ++order));

        // Teams
        permissions.Add(CreatePermission("teams.view", "View Teams", "Teams", "View team list and details", ++order));
        permissions.Add(CreatePermission("teams.create", "Create Teams", "Teams", "Create new teams", ++order));
        permissions.Add(CreatePermission("teams.edit", "Edit Teams", "Teams", "Edit team information", ++order));
        permissions.Add(CreatePermission("teams.delete", "Delete Teams", "Teams", "Delete teams", ++order));
        permissions.Add(CreatePermission("teams.manage_members", "Manage Members", "Teams", "Add/remove team members", ++order));

        // Calls
        permissions.Add(CreatePermission("calls.view", "View Calls", "Calls", "View call logs and history", ++order));
        permissions.Add(CreatePermission("calls.make", "Make Calls", "Calls", "Initiate outbound calls", ++order));
        permissions.Add(CreatePermission("calls.transfer", "Transfer Calls", "Calls", "Transfer calls to other agents/queues", ++order));
        permissions.Add(CreatePermission("calls.monitor", "Monitor Calls", "Calls", "Listen to live calls (silent)", ++order));
        permissions.Add(CreatePermission("calls.barge", "Barge Calls", "Calls", "Join live calls", ++order));
        permissions.Add(CreatePermission("calls.whisper", "Whisper Calls", "Calls", "Coach agents during calls", ++order));

        // Recordings
        permissions.Add(CreatePermission("recordings.view", "View Recordings", "Recordings", "View recording list", ++order));
        permissions.Add(CreatePermission("recordings.play", "Play Recordings", "Recordings", "Play call recordings", ++order));
        permissions.Add(CreatePermission("recordings.download", "Download Recordings", "Recordings", "Download recording files", ++order));
        permissions.Add(CreatePermission("recordings.delete", "Delete Recordings", "Recordings", "Delete recordings", ++order));

        // QA
        permissions.Add(CreatePermission("qa.view", "View QA", "QA", "View QA scorecards and evaluations", ++order));
        permissions.Add(CreatePermission("qa.evaluate", "Evaluate Calls", "QA", "Create QA evaluations", ++order));
        permissions.Add(CreatePermission("qa.create_forms", "Create Forms", "QA", "Create evaluation forms", ++order));
        permissions.Add(CreatePermission("qa.manage_forms", "Manage Forms", "QA", "Edit and delete evaluation forms", ++order));
        permissions.Add(CreatePermission("qa.view_all_scores", "View All Scores", "QA", "View all agents' QA scores", ++order));

        // Dialer
        permissions.Add(CreatePermission("dialer.view", "View Dialer", "Dialer", "View dialer campaigns and lists", ++order));
        permissions.Add(CreatePermission("dialer.campaigns_manage", "Manage Campaigns", "Dialer", "Create, edit, start/stop campaigns", ++order));
        permissions.Add(CreatePermission("dialer.lists_manage", "Manage Lists", "Dialer", "Create, edit, import dialer lists", ++order));
        permissions.Add(CreatePermission("dialer.dnc_manage", "Manage DNC", "Dialer", "Manage Do Not Call list", ++order));

        // WFM (Workforce Management)
        permissions.Add(CreatePermission("wfm.view", "View WFM", "WFM", "View schedules and time-off requests", ++order));
        permissions.Add(CreatePermission("wfm.schedules_manage", "Manage Schedules", "WFM", "Create and edit agent schedules", ++order));
        permissions.Add(CreatePermission("wfm.timeoff_approve", "Approve Time-Off", "WFM", "Approve/reject time-off requests", ++order));
        permissions.Add(CreatePermission("wfm.adherence_view", "View Adherence", "WFM", "View schedule adherence reports", ++order));

        // Tickets
        permissions.Add(CreatePermission("tickets.view", "View Tickets", "Tickets", "View ticket list and details", ++order));
        permissions.Add(CreatePermission("tickets.create", "Create Tickets", "Tickets", "Create new tickets", ++order));
        permissions.Add(CreatePermission("tickets.edit", "Edit Tickets", "Tickets", "Edit ticket information", ++order));
        permissions.Add(CreatePermission("tickets.delete", "Delete Tickets", "Tickets", "Delete tickets", ++order));
        permissions.Add(CreatePermission("tickets.assign", "Assign Tickets", "Tickets", "Assign tickets to agents", ++order));

        // Customers
        permissions.Add(CreatePermission("customers.view", "View Customers", "Customers", "View customer list and details", ++order));
        permissions.Add(CreatePermission("customers.create", "Create Customers", "Customers", "Create new customers", ++order));
        permissions.Add(CreatePermission("customers.edit", "Edit Customers", "Customers", "Edit customer information", ++order));
        permissions.Add(CreatePermission("customers.delete", "Delete Customers", "Customers", "Delete customers", ++order));

        // Reports
        permissions.Add(CreatePermission("reports.view", "View Reports", "Reports", "View reports and dashboards", ++order));
        permissions.Add(CreatePermission("reports.export", "Export Reports", "Reports", "Export reports to files", ++order));

        // Analytics
        permissions.Add(CreatePermission("analytics.view", "View Analytics", "Analytics", "View analytics dashboards", ++order));
        permissions.Add(CreatePermission("analytics.agents", "Agent Analytics", "Analytics", "View agent performance analytics", ++order));
        permissions.Add(CreatePermission("analytics.teams", "Team Analytics", "Analytics", "View team performance analytics", ++order));
        permissions.Add(CreatePermission("analytics.queues", "Queue Analytics", "Analytics", "View queue performance analytics", ++order));

        // IVR
        permissions.Add(CreatePermission("ivr.view", "View IVR", "IVR", "View IVR flows", ++order));
        permissions.Add(CreatePermission("ivr.manage", "Manage IVR", "IVR", "Create, edit, delete IVR flows", ++order));

        // Knowledge
        permissions.Add(CreatePermission("knowledge.view", "View Knowledge Base", "Knowledge", "View knowledge base articles", ++order));
        permissions.Add(CreatePermission("knowledge.manage", "Manage Knowledge Base", "Knowledge", "Create, edit, delete knowledge base articles", ++order));

        // Admin
        permissions.Add(CreatePermission("admin.settings", "System Settings", "Admin", "Access and modify system settings", ++order));
        permissions.Add(CreatePermission("admin.audit_logs", "View Audit Logs", "Admin", "View system audit logs", ++order));
        permissions.Add(CreatePermission("admin.sla_rules", "Manage SLA Rules", "Admin", "Create and edit SLA rules", ++order));
        permissions.Add(CreatePermission("admin.queues", "Manage Queues", "Admin", "Create and edit call queues", ++order));
        permissions.Add(CreatePermission("admin.alerts", "Manage Alerts", "Admin", "Create and edit system alerts", ++order));
        permissions.Add(CreatePermission("admin.integrations", "Manage Integrations", "Admin", "Configure external integrations", ++order));

        // System (RBAC)
        permissions.Add(CreatePermission("system.roles_manage", "Manage Roles", "System", "Create, edit, delete roles and assign permissions", ++order));
        permissions.Add(CreatePermission("system.permissions_view", "View Permissions", "System", "View available permissions", ++order));
        permissions.Add(CreatePermission("system.settings_manage", "Manage Settings", "System", "View and modify system settings", ++order));

        return permissions;
    }

    private static Permission CreatePermission(string systemName, string name, string module, string description, int order)
    {
        return new Permission
        {
            Id = GeneratePermissionId(systemName),
            SystemName = systemName,
            Name = name,
            Module = module,
            Description = description,
            DisplayOrder = order,
            CreatedAt = SeedDate
        };
    }

    private static Guid GeneratePermissionId(string systemName)
    {
        // Generate a deterministic GUID based on the system name for consistency
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var hash = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes("permission_" + systemName));
        // Take first 16 bytes of SHA256 hash to form a GUID
        var guidBytes = new byte[16];
        Array.Copy(hash, guidBytes, 16);
        return new Guid(guidBytes);
    }
}
