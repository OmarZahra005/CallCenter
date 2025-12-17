using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRbacSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "permissions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    system_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    module = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    display_order = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_permissions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    system_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    is_system_role = table.Column<bool>(type: "bit", nullable: false),
                    is_super_admin = table.Column<bool>(type: "bit", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_by_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_roles", x => x.id);
                    table.ForeignKey(
                        name: "f_k_roles_agents_created_by_id",
                        column: x => x.created_by_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "agent_role_assignments",
                columns: table => new
                {
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    role_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    assigned_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    assigned_by_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_agent_role_assignments", x => new { x.agent_id, x.role_id });
                    table.ForeignKey(
                        name: "f_k_agent_role_assignments__roles_role_id",
                        column: x => x.role_id,
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_agent_role_assignments_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_agent_role_assignments_agents_assigned_by_id",
                        column: x => x.assigned_by_id,
                        principalTable: "agents",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "role_permissions",
                columns: table => new
                {
                    role_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    permission_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    assigned_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    assigned_by_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_role_permissions", x => new { x.role_id, x.permission_id });
                    table.ForeignKey(
                        name: "f_k_role_permissions_agents_assigned_by_id",
                        column: x => x.assigned_by_id,
                        principalTable: "agents",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_role_permissions_permissions_permission_id",
                        column: x => x.permission_id,
                        principalTable: "permissions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_role_permissions_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "permissions",
                columns: new[] { "id", "created_at", "description", "display_order", "module", "name", "system_name" },
                values: new object[,]
                {
                    { new Guid("150df259-5ebf-bfea-035a-82ff7de4b85f"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Initiate outbound calls", 13, "Calls", "Make Calls", "calls.make" },
                    { new Guid("2318fa37-bbf1-82f3-cda1-9b8101244808"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Manage Do Not Call list", 30, "Dialer", "Manage DNC", "dialer.dnc_manage" },
                    { new Guid("2660f3eb-d851-035a-bd9e-610ae59d867a"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Transfer calls to other agents/queues", 14, "Calls", "Transfer Calls", "calls.transfer" },
                    { new Guid("26727ed9-4ced-3837-240f-c17b950cbdd5"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create new customers", 41, "Customers", "Create Customers", "customers.create" },
                    { new Guid("2851532c-8565-0683-0099-d4df8a16380c"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delete tickets", 38, "Tickets", "Delete Tickets", "tickets.delete" },
                    { new Guid("2bc87b8a-5e13-0774-bb00-780bf3a09d8e"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create new teams", 8, "Teams", "Create Teams", "teams.create" },
                    { new Guid("358f7969-35bf-20de-7727-a8002341d2f3"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View ticket list and details", 35, "Tickets", "View Tickets", "tickets.view" },
                    { new Guid("3a1e6ef8-898e-759e-0853-4da8267b98b9"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create evaluation forms", 24, "QA", "Create Forms", "qa.create_forms" },
                    { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Access the main dashboard", 1, "Dashboard", "View Dashboard", "dashboard.view" },
                    { new Guid("40283c6a-fca2-b710-bd7f-cddf62aca1b9"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Export reports to files", 45, "Reports", "Export Reports", "reports.export" },
                    { new Guid("5b50ebfc-6162-733a-327c-9190a969657b"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delete customers", 43, "Customers", "Delete Customers", "customers.delete" },
                    { new Guid("5c55a758-1c14-0ada-f3a6-031e2c9006a4"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View agent performance analytics", 47, "Analytics", "Agent Analytics", "analytics.agents" },
                    { new Guid("6068ae6f-8c24-10a8-2f90-a748db0e3931"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View IVR flows", 50, "IVR", "View IVR", "ivr.view" },
                    { new Guid("6bffb0a5-9486-bf30-5191-d16afcca3934"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Play call recordings", 19, "Recordings", "Play Recordings", "recordings.play" },
                    { new Guid("6c7e8a5a-4c21-d805-289e-36f629c13f52"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create, edit, import dialer lists", 29, "Dialer", "Manage Lists", "dialer.lists_manage" },
                    { new Guid("72cff6fe-4c5c-6cf0-26fc-ddac2e97d8a1"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delete recordings", 21, "Recordings", "Delete Recordings", "recordings.delete" },
                    { new Guid("74da3950-424d-7b5f-a037-e7ff772ae950"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create and edit agent schedules", 32, "WFM", "Manage Schedules", "wfm.schedules_manage" },
                    { new Guid("782a2ea6-8120-c4fc-76b5-085f31843c9b"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Assign tickets to agents", 39, "Tickets", "Assign Tickets", "tickets.assign" },
                    { new Guid("79f070a0-eb4c-e61e-8982-a485bf311e52"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create, edit, start/stop campaigns", 28, "Dialer", "Manage Campaigns", "dialer.campaigns_manage" },
                    { new Guid("7a048e9a-986c-bd44-374f-db19f0209d82"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Listen to live calls (silent)", 15, "Calls", "Monitor Calls", "calls.monitor" },
                    { new Guid("7c48439a-4ae6-f9ac-3a75-0aa7640e69e3"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create new agents", 3, "Agents", "Create Agents", "agents.create" },
                    { new Guid("83377373-98ee-7050-7962-cc454c69274d"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create new tickets", 36, "Tickets", "Create Tickets", "tickets.create" },
                    { new Guid("8516b726-1622-fac7-7869-87a88179a833"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View analytics dashboards", 46, "Analytics", "View Analytics", "analytics.view" },
                    { new Guid("87370f03-9a1b-ccbd-190f-c70e9e8b9453"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Assign roles to agents", 6, "Agents", "Assign Roles", "agents.assign_roles" },
                    { new Guid("87b43a70-c07b-a17d-ddb5-c567ce9b2361"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Coach agents during calls", 17, "Calls", "Whisper Calls", "calls.whisper" },
                    { new Guid("884d0d86-67dc-5322-4601-9c532412a23c"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create, edit, delete roles and assign permissions", 58, "System", "Manage Roles", "system.roles_manage" },
                    { new Guid("886d0b0c-1f65-6fbc-ed99-c6c9dc4b6112"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View QA scorecards and evaluations", 22, "QA", "View QA", "qa.view" },
                    { new Guid("993cb8aa-8d1e-0484-eba4-5b3dc713eae7"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create and edit system alerts", 56, "Admin", "Manage Alerts", "admin.alerts" },
                    { new Guid("9cbf5fe8-88a3-a716-9fe2-85d1d4d08a2c"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Edit agent information", 4, "Agents", "Edit Agents", "agents.edit" },
                    { new Guid("a0e76814-f452-de78-a582-27acd0793035"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create and edit SLA rules", 54, "Admin", "Manage SLA Rules", "admin.sla_rules" },
                    { new Guid("a27dcfdc-af86-ce2c-6893-9dd600c58e8f"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Join live calls", 16, "Calls", "Barge Calls", "calls.barge" },
                    { new Guid("a516df2b-0c8e-ac69-4626-8951561ba3fb"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Download recording files", 20, "Recordings", "Download Recordings", "recordings.download" },
                    { new Guid("a7b80797-6662-2714-c7db-fdd89a770200"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View available permissions", 59, "System", "View Permissions", "system.permissions_view" },
                    { new Guid("aa646765-6738-521c-20dc-df9df6f1daac"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Access and modify system settings", 52, "Admin", "System Settings", "admin.settings" },
                    { new Guid("abd509c9-e6cc-8087-1b5e-b3022e9695d6"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View team performance analytics", 48, "Analytics", "Team Analytics", "analytics.teams" },
                    { new Guid("afe62c2a-d8ee-1107-d73e-001c752777db"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Edit team information", 9, "Teams", "Edit Teams", "teams.edit" },
                    { new Guid("b55ae5bc-6877-12a9-6991-8107f1467eb0"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View recording list", 18, "Recordings", "View Recordings", "recordings.view" },
                    { new Guid("c2675598-37f0-27bb-37bb-3804a480d7b6"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Edit ticket information", 37, "Tickets", "Edit Tickets", "tickets.edit" },
                    { new Guid("c6a00de2-109a-4eab-0120-b3edb11434e9"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delete teams", 10, "Teams", "Delete Teams", "teams.delete" },
                    { new Guid("cced7ee9-45a3-40d8-49f1-edc79b45790a"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Add/remove team members", 11, "Teams", "Manage Members", "teams.manage_members" },
                    { new Guid("cd542d26-3b9f-bc98-3914-e8410672bd6b"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View agent list and details", 2, "Agents", "View Agents", "agents.view" },
                    { new Guid("d04ef1fc-e6e0-ef4e-18ab-5ccb9bed2165"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create QA evaluations", 23, "QA", "Evaluate Calls", "qa.evaluate" },
                    { new Guid("d0d45e1d-45b5-8a53-d313-322d377e01c8"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View all agents' QA scores", 26, "QA", "View All Scores", "qa.view_all_scores" },
                    { new Guid("d184b1c8-14dc-78ca-4b12-1b86e8a1247a"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View dialer campaigns and lists", 27, "Dialer", "View Dialer", "dialer.view" },
                    { new Guid("d1ee3a22-99c3-307e-8112-9cd54a433363"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create, edit, delete IVR flows", 51, "IVR", "Manage IVR", "ivr.manage" },
                    { new Guid("d42a9c93-73a6-14a9-1517-43df13632dcb"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View team list and details", 7, "Teams", "View Teams", "teams.view" },
                    { new Guid("d7ed0a74-9b46-6850-213d-1637c7d1c318"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View call logs and history", 12, "Calls", "View Calls", "calls.view" },
                    { new Guid("dce84885-dc98-47a9-98c8-bcce0c3d0537"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View schedules and time-off requests", 31, "WFM", "View WFM", "wfm.view" },
                    { new Guid("e2db533a-9ef9-e7d0-387a-ba8e394e49fa"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create and edit call queues", 55, "Admin", "Manage Queues", "admin.queues" },
                    { new Guid("e381414f-e3aa-20ab-7238-ed2c947e51b6"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delete agents", 5, "Agents", "Delete Agents", "agents.delete" },
                    { new Guid("e5071018-88b2-b4c7-44ec-f1f4b114d372"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Edit and delete evaluation forms", 25, "QA", "Manage Forms", "qa.manage_forms" },
                    { new Guid("e8330f06-3147-5980-b919-04aa547962c6"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View system audit logs", 53, "Admin", "View Audit Logs", "admin.audit_logs" },
                    { new Guid("e8b9eabe-ba23-ea46-4352-a6068cfeb627"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Edit customer information", 42, "Customers", "Edit Customers", "customers.edit" },
                    { new Guid("e8c12788-2cea-dac1-a0b9-eb9ed0f65ea8"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Configure external integrations", 57, "Admin", "Manage Integrations", "admin.integrations" },
                    { new Guid("e917205c-73cc-536f-eb11-f08f5dd8fc2f"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View customer list and details", 40, "Customers", "View Customers", "customers.view" },
                    { new Guid("e9e023f4-429c-1245-434e-79ff9718ec10"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View reports and dashboards", 44, "Reports", "View Reports", "reports.view" },
                    { new Guid("ecff27d6-035f-6cfe-747b-ff1be9340247"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View schedule adherence reports", 34, "WFM", "View Adherence", "wfm.adherence_view" },
                    { new Guid("eda0d27a-ee01-ba05-d993-04976f9c79b2"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Approve/reject time-off requests", 33, "WFM", "Approve Time-Off", "wfm.timeoff_approve" },
                    { new Guid("f84fc2ff-e68c-fb78-5a7a-53033eb7a606"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View queue performance analytics", 49, "Analytics", "Queue Analytics", "analytics.queues" }
                });

            migrationBuilder.InsertData(
                table: "roles",
                columns: new[] { "id", "created_at", "created_by_id", "description", "is_active", "is_super_admin", "is_system_role", "name", "system_name", "updated_at" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Full system access, bypasses all permission checks", true, true, true, "Super Admin", "super_admin", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Full system access with explicit permissions", true, false, true, "Administrator", "administrator", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Team management, QA, WFM, and most operations", true, false, true, "Supervisor", "supervisor", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Quality assurance, recordings, and limited analytics", true, false, true, "QA Evaluator", "qa_evaluator", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Team management, WFM, and tickets", true, false, true, "Team Lead", "team_lead", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Basic call operations and ticket handling", true, false, true, "Agent", "agent", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "agent_role_assignments",
                columns: new[] { "agent_id", "role_id", "assigned_at", "assigned_by_id" },
                values: new object[] { new Guid("00000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.InsertData(
                table: "role_permissions",
                columns: new[] { "permission_id", "role_id", "assigned_at", "assigned_by_id" },
                values: new object[,]
                {
                    { new Guid("150df259-5ebf-bfea-035a-82ff7de4b85f"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2318fa37-bbf1-82f3-cda1-9b8101244808"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2660f3eb-d851-035a-bd9e-610ae59d867a"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("26727ed9-4ced-3837-240f-c17b950cbdd5"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2851532c-8565-0683-0099-d4df8a16380c"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2bc87b8a-5e13-0774-bb00-780bf3a09d8e"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("358f7969-35bf-20de-7727-a8002341d2f3"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3a1e6ef8-898e-759e-0853-4da8267b98b9"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("40283c6a-fca2-b710-bd7f-cddf62aca1b9"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("5b50ebfc-6162-733a-327c-9190a969657b"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("5c55a758-1c14-0ada-f3a6-031e2c9006a4"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6068ae6f-8c24-10a8-2f90-a748db0e3931"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6bffb0a5-9486-bf30-5191-d16afcca3934"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6c7e8a5a-4c21-d805-289e-36f629c13f52"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("72cff6fe-4c5c-6cf0-26fc-ddac2e97d8a1"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("74da3950-424d-7b5f-a037-e7ff772ae950"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("782a2ea6-8120-c4fc-76b5-085f31843c9b"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("79f070a0-eb4c-e61e-8982-a485bf311e52"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("7a048e9a-986c-bd44-374f-db19f0209d82"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("7c48439a-4ae6-f9ac-3a75-0aa7640e69e3"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("83377373-98ee-7050-7962-cc454c69274d"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8516b726-1622-fac7-7869-87a88179a833"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("87370f03-9a1b-ccbd-190f-c70e9e8b9453"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("87b43a70-c07b-a17d-ddb5-c567ce9b2361"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("884d0d86-67dc-5322-4601-9c532412a23c"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("886d0b0c-1f65-6fbc-ed99-c6c9dc4b6112"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("993cb8aa-8d1e-0484-eba4-5b3dc713eae7"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("9cbf5fe8-88a3-a716-9fe2-85d1d4d08a2c"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a0e76814-f452-de78-a582-27acd0793035"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a27dcfdc-af86-ce2c-6893-9dd600c58e8f"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a516df2b-0c8e-ac69-4626-8951561ba3fb"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a7b80797-6662-2714-c7db-fdd89a770200"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("aa646765-6738-521c-20dc-df9df6f1daac"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("abd509c9-e6cc-8087-1b5e-b3022e9695d6"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("afe62c2a-d8ee-1107-d73e-001c752777db"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b55ae5bc-6877-12a9-6991-8107f1467eb0"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c2675598-37f0-27bb-37bb-3804a480d7b6"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c6a00de2-109a-4eab-0120-b3edb11434e9"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cced7ee9-45a3-40d8-49f1-edc79b45790a"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cd542d26-3b9f-bc98-3914-e8410672bd6b"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d04ef1fc-e6e0-ef4e-18ab-5ccb9bed2165"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d0d45e1d-45b5-8a53-d313-322d377e01c8"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d184b1c8-14dc-78ca-4b12-1b86e8a1247a"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d1ee3a22-99c3-307e-8112-9cd54a433363"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d42a9c93-73a6-14a9-1517-43df13632dcb"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d7ed0a74-9b46-6850-213d-1637c7d1c318"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("dce84885-dc98-47a9-98c8-bcce0c3d0537"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e2db533a-9ef9-e7d0-387a-ba8e394e49fa"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e381414f-e3aa-20ab-7238-ed2c947e51b6"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e5071018-88b2-b4c7-44ec-f1f4b114d372"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8330f06-3147-5980-b919-04aa547962c6"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8b9eabe-ba23-ea46-4352-a6068cfeb627"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8c12788-2cea-dac1-a0b9-eb9ed0f65ea8"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e917205c-73cc-536f-eb11-f08f5dd8fc2f"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e9e023f4-429c-1245-434e-79ff9718ec10"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("ecff27d6-035f-6cfe-747b-ff1be9340247"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("eda0d27a-ee01-ba05-d993-04976f9c79b2"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("f84fc2ff-e68c-fb78-5a7a-53033eb7a606"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("150df259-5ebf-bfea-035a-82ff7de4b85f"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2318fa37-bbf1-82f3-cda1-9b8101244808"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2660f3eb-d851-035a-bd9e-610ae59d867a"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("26727ed9-4ced-3837-240f-c17b950cbdd5"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2851532c-8565-0683-0099-d4df8a16380c"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2bc87b8a-5e13-0774-bb00-780bf3a09d8e"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("358f7969-35bf-20de-7727-a8002341d2f3"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3a1e6ef8-898e-759e-0853-4da8267b98b9"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("40283c6a-fca2-b710-bd7f-cddf62aca1b9"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("5b50ebfc-6162-733a-327c-9190a969657b"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("5c55a758-1c14-0ada-f3a6-031e2c9006a4"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6bffb0a5-9486-bf30-5191-d16afcca3934"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6c7e8a5a-4c21-d805-289e-36f629c13f52"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("72cff6fe-4c5c-6cf0-26fc-ddac2e97d8a1"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("74da3950-424d-7b5f-a037-e7ff772ae950"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("782a2ea6-8120-c4fc-76b5-085f31843c9b"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("79f070a0-eb4c-e61e-8982-a485bf311e52"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("7a048e9a-986c-bd44-374f-db19f0209d82"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("7c48439a-4ae6-f9ac-3a75-0aa7640e69e3"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("83377373-98ee-7050-7962-cc454c69274d"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8516b726-1622-fac7-7869-87a88179a833"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("87370f03-9a1b-ccbd-190f-c70e9e8b9453"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("87b43a70-c07b-a17d-ddb5-c567ce9b2361"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("886d0b0c-1f65-6fbc-ed99-c6c9dc4b6112"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("9cbf5fe8-88a3-a716-9fe2-85d1d4d08a2c"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a27dcfdc-af86-ce2c-6893-9dd600c58e8f"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a516df2b-0c8e-ac69-4626-8951561ba3fb"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("abd509c9-e6cc-8087-1b5e-b3022e9695d6"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("afe62c2a-d8ee-1107-d73e-001c752777db"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b55ae5bc-6877-12a9-6991-8107f1467eb0"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c2675598-37f0-27bb-37bb-3804a480d7b6"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c6a00de2-109a-4eab-0120-b3edb11434e9"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cced7ee9-45a3-40d8-49f1-edc79b45790a"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cd542d26-3b9f-bc98-3914-e8410672bd6b"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d04ef1fc-e6e0-ef4e-18ab-5ccb9bed2165"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d0d45e1d-45b5-8a53-d313-322d377e01c8"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d184b1c8-14dc-78ca-4b12-1b86e8a1247a"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d42a9c93-73a6-14a9-1517-43df13632dcb"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d7ed0a74-9b46-6850-213d-1637c7d1c318"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("dce84885-dc98-47a9-98c8-bcce0c3d0537"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e381414f-e3aa-20ab-7238-ed2c947e51b6"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e5071018-88b2-b4c7-44ec-f1f4b114d372"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8b9eabe-ba23-ea46-4352-a6068cfeb627"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e917205c-73cc-536f-eb11-f08f5dd8fc2f"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e9e023f4-429c-1245-434e-79ff9718ec10"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("ecff27d6-035f-6cfe-747b-ff1be9340247"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("eda0d27a-ee01-ba05-d993-04976f9c79b2"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("f84fc2ff-e68c-fb78-5a7a-53033eb7a606"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3a1e6ef8-898e-759e-0853-4da8267b98b9"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6bffb0a5-9486-bf30-5191-d16afcca3934"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("72cff6fe-4c5c-6cf0-26fc-ddac2e97d8a1"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8516b726-1622-fac7-7869-87a88179a833"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("886d0b0c-1f65-6fbc-ed99-c6c9dc4b6112"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a516df2b-0c8e-ac69-4626-8951561ba3fb"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b55ae5bc-6877-12a9-6991-8107f1467eb0"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cd542d26-3b9f-bc98-3914-e8410672bd6b"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d04ef1fc-e6e0-ef4e-18ab-5ccb9bed2165"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d0d45e1d-45b5-8a53-d313-322d377e01c8"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d42a9c93-73a6-14a9-1517-43df13632dcb"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e5071018-88b2-b4c7-44ec-f1f4b114d372"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("26727ed9-4ced-3837-240f-c17b950cbdd5"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2851532c-8565-0683-0099-d4df8a16380c"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2bc87b8a-5e13-0774-bb00-780bf3a09d8e"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("358f7969-35bf-20de-7727-a8002341d2f3"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("5b50ebfc-6162-733a-327c-9190a969657b"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("74da3950-424d-7b5f-a037-e7ff772ae950"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("782a2ea6-8120-c4fc-76b5-085f31843c9b"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("83377373-98ee-7050-7962-cc454c69274d"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8516b726-1622-fac7-7869-87a88179a833"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("afe62c2a-d8ee-1107-d73e-001c752777db"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c2675598-37f0-27bb-37bb-3804a480d7b6"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c6a00de2-109a-4eab-0120-b3edb11434e9"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cced7ee9-45a3-40d8-49f1-edc79b45790a"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cd542d26-3b9f-bc98-3914-e8410672bd6b"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d42a9c93-73a6-14a9-1517-43df13632dcb"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d7ed0a74-9b46-6850-213d-1637c7d1c318"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("dce84885-dc98-47a9-98c8-bcce0c3d0537"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8b9eabe-ba23-ea46-4352-a6068cfeb627"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e917205c-73cc-536f-eb11-f08f5dd8fc2f"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e9e023f4-429c-1245-434e-79ff9718ec10"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("ecff27d6-035f-6cfe-747b-ff1be9340247"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("eda0d27a-ee01-ba05-d993-04976f9c79b2"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("150df259-5ebf-bfea-035a-82ff7de4b85f"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2660f3eb-d851-035a-bd9e-610ae59d867a"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("26727ed9-4ced-3837-240f-c17b950cbdd5"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("358f7969-35bf-20de-7727-a8002341d2f3"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("83377373-98ee-7050-7962-cc454c69274d"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c2675598-37f0-27bb-37bb-3804a480d7b6"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d7ed0a74-9b46-6850-213d-1637c7d1c318"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8b9eabe-ba23-ea46-4352-a6068cfeb627"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e917205c-73cc-536f-eb11-f08f5dd8fc2f"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null }
                });

            migrationBuilder.CreateIndex(
                name: "i_x_agent_role_assignments_assigned_by_id",
                table: "agent_role_assignments",
                column: "assigned_by_id");

            migrationBuilder.CreateIndex(
                name: "i_x_agent_role_assignments_role_id",
                table: "agent_role_assignments",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "i_x_permissions_module",
                table: "permissions",
                column: "module");

            migrationBuilder.CreateIndex(
                name: "i_x_permissions_system_name",
                table: "permissions",
                column: "system_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_role_permissions_assigned_by_id",
                table: "role_permissions",
                column: "assigned_by_id");

            migrationBuilder.CreateIndex(
                name: "i_x_role_permissions_permission_id",
                table: "role_permissions",
                column: "permission_id");

            migrationBuilder.CreateIndex(
                name: "i_x_roles_created_by_id",
                table: "roles",
                column: "created_by_id");

            migrationBuilder.CreateIndex(
                name: "i_x_roles_system_name",
                table: "roles",
                column: "system_name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "agent_role_assignments");

            migrationBuilder.DropTable(
                name: "role_permissions");

            migrationBuilder.DropTable(
                name: "permissions");

            migrationBuilder.DropTable(
                name: "roles");
        }
    }
}
