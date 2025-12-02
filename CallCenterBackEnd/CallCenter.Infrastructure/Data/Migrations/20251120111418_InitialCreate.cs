using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "alert_rules",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    alert_type = table.Column<int>(type: "int", nullable: false),
                    condition = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    threshold = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    recipients = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_alert_rules", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "call_dispositions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    category = table.Column<int>(type: "int", nullable: false),
                    requires_followup = table.Column<bool>(type: "bit", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_call_dispositions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "customers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    national_id = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    status = table.Column<int>(type: "int", nullable: false),
                    preferred_language = table.Column<int>(type: "int", nullable: false),
                    segment = table.Column<int>(type: "int", nullable: true),
                    address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_customers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    recipient_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    notification_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    localization_key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    localization_args = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    priority = table.Column<int>(type: "int", nullable: false),
                    related_entity_type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    related_entity_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    is_read = table.Column<bool>(type: "bit", nullable: false),
                    read_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    action_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    expires_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_notifications", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "qa_evaluation_forms",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    max_score = table.Column<int>(type: "int", nullable: false),
                    passing_score = table.Column<int>(type: "int", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_qa_evaluation_forms", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "sla_rules",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    priority = table.Column<int>(type: "int", nullable: false),
                    first_response_time_minutes = table.Column<int>(type: "int", nullable: false),
                    resolve_time_minutes = table.Column<int>(type: "int", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_sla_rules", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "customer_interactions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    customer_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    channel = table.Column<int>(type: "int", nullable: false),
                    last_contact_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    total_calls = table.Column<int>(type: "int", nullable: false),
                    total_tickets = table.Column<int>(type: "int", nullable: false),
                    total_messages = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_customer_interactions", x => x.id);
                    table.ForeignKey(
                        name: "f_k_customer_interactions_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "qa_form_criteria",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    form_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    criteria_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    max_points = table.Column<int>(type: "int", nullable: false),
                    weight = table.Column<float>(type: "real", nullable: false),
                    is_critical = table.Column<bool>(type: "bit", nullable: false),
                    display_order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_qa_form_criteria", x => x.id);
                    table.ForeignKey(
                        name: "f_k_qa_form_criteria_qa_evaluation_forms_form_id",
                        column: x => x.form_id,
                        principalTable: "qa_evaluation_forms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "agent_adherences",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    shift_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    expected_state = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    actual_state = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    is_adherent = table.Column<bool>(type: "bit", nullable: false),
                    variance_minutes = table.Column<int>(type: "int", nullable: true),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_agent_adherences", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "agent_kpis",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    total_calls = table.Column<int>(type: "int", nullable: false),
                    inbound_calls = table.Column<int>(type: "int", nullable: false),
                    outbound_calls = table.Column<int>(type: "int", nullable: false),
                    abandoned_calls = table.Column<int>(type: "int", nullable: false),
                    aht_seconds = table.Column<int>(type: "int", nullable: true),
                    asa_seconds = table.Column<int>(type: "int", nullable: true),
                    acw_seconds = table.Column<int>(type: "int", nullable: true),
                    total_talk_time_seconds = table.Column<int>(type: "int", nullable: false),
                    total_hold_time_seconds = table.Column<int>(type: "int", nullable: false),
                    resolved_tickets = table.Column<int>(type: "int", nullable: false),
                    created_tickets = table.Column<int>(type: "int", nullable: false),
                    fcr_rate = table.Column<float>(type: "real", nullable: true),
                    customer_satisfaction_score = table.Column<float>(type: "real", nullable: true),
                    adherence_percentage = table.Column<float>(type: "real", nullable: true),
                    utilization_percentage = table.Column<float>(type: "real", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_agent_kpis", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "agent_shifts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    shift_date = table.Column<DateOnly>(type: "date", nullable: false),
                    shift_start = table.Column<DateTime>(type: "datetime2", nullable: false),
                    shift_end = table.Column<DateTime>(type: "datetime2", nullable: false),
                    break_minutes = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<int>(type: "int", nullable: false),
                    actual_start = table.Column<DateTime>(type: "datetime2", nullable: true),
                    actual_end = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_agent_shifts", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "agent_skills",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    skill_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    proficiency_level = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_agent_skills", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "agent_states",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    state = table.Column<int>(type: "int", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    changed_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    duration_seconds = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_agent_states", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "agents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    employee_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    team_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    role = table.Column<int>(type: "int", nullable: false),
                    skill_level = table.Column<int>(type: "int", nullable: false),
                    languages = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    hire_date = table.Column<DateOnly>(type: "date", nullable: true),
                    status = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_agents", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "alert_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    alert_rule_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    alert_type = table.Column<int>(type: "int", nullable: false),
                    message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    severity = table.Column<int>(type: "int", nullable: false),
                    metadata = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    acknowledged_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    acknowledged_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    acknowledged_by_agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_alert_logs", x => x.id);
                    table.ForeignKey(
                        name: "f_k_alert_logs__alert_rules_alert_rule_id",
                        column: x => x.alert_rule_id,
                        principalTable: "alert_rules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_alert_logs_agents_acknowledged_by_agent_id",
                        column: x => x.acknowledged_by_agent_id,
                        principalTable: "agents",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "cti_events",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    call_id = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    event_type = table.Column<int>(type: "int", nullable: false),
                    direction = table.Column<int>(type: "int", nullable: false),
                    timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    metadata = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_cti_events", x => x.id);
                    table.ForeignKey(
                        name: "f_k_cti_events_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "customer_notes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    customer_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    is_important = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_customer_notes", x => x.id);
                    table.ForeignKey(
                        name: "f_k_customer_notes_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_customer_notes_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "data_export_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    exported_by = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    export_type = table.Column<int>(type: "int", nullable: false),
                    filters = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    record_count = table.Column<int>(type: "int", nullable: false),
                    file_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<int>(type: "int", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    completed_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    exported_by_agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_data_export_logs", x => x.id);
                    table.ForeignKey(
                        name: "f_k_data_export_logs_agents_exported_by_agent_id",
                        column: x => x.exported_by_agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "knowledge_base_articles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    subcategory = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    tags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    language = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<int>(type: "int", nullable: false),
                    views_count = table.Column<int>(type: "int", nullable: false),
                    helpful_count = table.Column<int>(type: "int", nullable: false),
                    not_helpful_count = table.Column<int>(type: "int", nullable: false),
                    author_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    published_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_knowledge_base_articles", x => x.id);
                    table.ForeignKey(
                        name: "f_k_knowledge_base_articles_agents_author_id",
                        column: x => x.author_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "system_settings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    data_type = table.Column<int>(type: "int", nullable: false),
                    category = table.Column<int>(type: "int", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_sensitive = table.Column<bool>(type: "bit", nullable: false),
                    updated_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_by_agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_system_settings", x => x.id);
                    table.ForeignKey(
                        name: "f_k_system_settings_agents_updated_by_agent_id",
                        column: x => x.updated_by_agent_id,
                        principalTable: "agents",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "teams",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    supervisor_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_teams", x => x.id);
                    table.ForeignKey(
                        name: "f_k_teams_agents_supervisor_id",
                        column: x => x.supervisor_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "time_off_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    request_type = table.Column<int>(type: "int", nullable: false),
                    start_date = table.Column<DateOnly>(type: "date", nullable: false),
                    end_date = table.Column<DateOnly>(type: "date", nullable: false),
                    status = table.Column<int>(type: "int", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    approved_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_time_off_requests", x => x.id);
                    table.ForeignKey(
                        name: "f_k_time_off_requests_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "f_k_time_off_requests_agents_approved_by",
                        column: x => x.approved_by,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "article_search_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    search_query = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    article_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    was_helpful = table.Column<bool>(type: "bit", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_article_search_logs", x => x.id);
                    table.ForeignKey(
                        name: "f_k_article_search_logs__knowledge_base_articles_article_id",
                        column: x => x.article_id,
                        principalTable: "knowledge_base_articles",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_article_search_logs_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "queues",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    priority = table.Column<int>(type: "int", nullable: false),
                    max_wait_time_seconds = table.Column<int>(type: "int", nullable: false),
                    team_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_queues", x => x.id);
                    table.ForeignKey(
                        name: "f_k_queues__teams_team_id",
                        column: x => x.team_id,
                        principalTable: "teams",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "team_kpis",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    team_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    total_calls = table.Column<int>(type: "int", nullable: false),
                    average_aht_seconds = table.Column<int>(type: "int", nullable: true),
                    average_asa_seconds = table.Column<int>(type: "int", nullable: true),
                    service_level_percentage = table.Column<float>(type: "real", nullable: true),
                    fcr_rate = table.Column<float>(type: "real", nullable: true),
                    customer_satisfaction_score = table.Column<float>(type: "real", nullable: true),
                    total_tickets_resolved = table.Column<int>(type: "int", nullable: false),
                    sla_compliance_percentage = table.Column<float>(type: "real", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_team_kpis", x => x.id);
                    table.ForeignKey(
                        name: "f_k_team_kpis_teams_team_id",
                        column: x => x.team_id,
                        principalTable: "teams",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "conversations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    customer_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    queue_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    channel = table.Column<int>(type: "int", nullable: false),
                    state = table.Column<int>(type: "int", nullable: false),
                    start_time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_time = table.Column<DateTime>(type: "datetime2", nullable: true),
                    wait_time_seconds = table.Column<int>(type: "int", nullable: true),
                    duration_seconds = table.Column<int>(type: "int", nullable: true),
                    last_message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_conversations", x => x.id);
                    table.ForeignKey(
                        name: "f_k_conversations__customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "f_k_conversations__queues_queue_id",
                        column: x => x.queue_id,
                        principalTable: "queues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "f_k_conversations_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "queue_metrics",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    queue_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    waiting_calls = table.Column<int>(type: "int", nullable: false),
                    active_calls = table.Column<int>(type: "int", nullable: false),
                    available_agents = table.Column<int>(type: "int", nullable: false),
                    busy_agents = table.Column<int>(type: "int", nullable: false),
                    average_wait_seconds = table.Column<int>(type: "int", nullable: true),
                    longest_wait_seconds = table.Column<int>(type: "int", nullable: true),
                    abandoned_count = table.Column<int>(type: "int", nullable: false),
                    service_level_percentage = table.Column<float>(type: "real", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_queue_metrics", x => x.id);
                    table.ForeignKey(
                        name: "f_k_queue_metrics_queues_queue_id",
                        column: x => x.queue_id,
                        principalTable: "queues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ai_suggestions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    conversation_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    suggestion_type = table.Column<int>(type: "int", nullable: false),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    confidence_score = table.Column<float>(type: "real", nullable: false),
                    was_used = table.Column<bool>(type: "bit", nullable: false),
                    feedback = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_ai_suggestions", x => x.id);
                    table.ForeignKey(
                        name: "f_k_ai_suggestions__conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_ai_suggestions_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "call_recordings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    call_id = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    conversation_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    duration_seconds = table.Column<int>(type: "int", nullable: false),
                    size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    format = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    is_encrypted = table.Column<bool>(type: "bit", nullable: false),
                    retention_until = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_call_recordings", x => x.id);
                    table.ForeignKey(
                        name: "f_k_call_recordings__conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "call_transcriptions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    call_id = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    conversation_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    transcript = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    language = table.Column<int>(type: "int", nullable: false),
                    sentiment = table.Column<int>(type: "int", nullable: false),
                    emotion_score = table.Column<float>(type: "real", nullable: true),
                    summary = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    keywords = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    confidence_score = table.Column<float>(type: "real", nullable: true),
                    processing_duration_ms = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_call_transcriptions", x => x.id);
                    table.ForeignKey(
                        name: "f_k_call_transcriptions__conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "conversation_dispositions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    conversation_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    disposition_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_conversation_dispositions", x => x.id);
                    table.ForeignKey(
                        name: "f_k_conversation_dispositions_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_conversation_dispositions_call_dispositions_disposition_id",
                        column: x => x.disposition_id,
                        principalTable: "call_dispositions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_conversation_dispositions_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "conversation_messages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    conversation_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    sender_type = table.Column<int>(type: "int", nullable: false),
                    sender_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    media_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    attachment_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_read = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_conversation_messages", x => x.id);
                    table.ForeignKey(
                        name: "f_k_conversation_messages_agents_sender_id",
                        column: x => x.sender_id,
                        principalTable: "agents",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_conversation_messages_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tickets",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ticket_number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    conversation_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    customer_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    team_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    status = table.Column<int>(type: "int", nullable: false),
                    priority = table.Column<int>(type: "int", nullable: false),
                    category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    subcategory = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    source = table.Column<int>(type: "int", nullable: false),
                    subject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    resolution = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    first_response_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    resolved_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    resolution_time_minutes = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    closed_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_tickets", x => x.id);
                    table.ForeignKey(
                        name: "f_k_tickets_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "f_k_tickets_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "f_k_tickets_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "f_k_tickets_teams_team_id",
                        column: x => x.team_id,
                        principalTable: "teams",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "customer_satisfaction_surveys",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ticket_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    conversation_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    customer_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    survey_type = table.Column<int>(type: "int", nullable: false),
                    score = table.Column<int>(type: "int", nullable: false),
                    feedback = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    sent_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    responded_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    channel = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_customer_satisfaction_surveys", x => x.id);
                    table.ForeignKey(
                        name: "f_k_customer_satisfaction_surveys__tickets_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "tickets",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_customer_satisfaction_surveys_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_customer_satisfaction_surveys_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_customer_satisfaction_surveys_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "qa_scorecards",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    form_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ticket_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    conversation_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    call_recording_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    evaluator_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    total_score = table.Column<int>(type: "int", nullable: false),
                    max_score = table.Column<int>(type: "int", nullable: false),
                    percentage = table.Column<float>(type: "real", nullable: false),
                    status = table.Column<int>(type: "int", nullable: false),
                    passed = table.Column<bool>(type: "bit", nullable: false),
                    comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    strengths = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    areas_for_improvement = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    evaluation_date = table.Column<DateOnly>(type: "date", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_qa_scorecards", x => x.id);
                    table.ForeignKey(
                        name: "f_k_qa_scorecards__tickets_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "tickets",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_qa_scorecards_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "f_k_qa_scorecards_agents_evaluator_id",
                        column: x => x.evaluator_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "f_k_qa_scorecards_call_recordings_call_recording_id",
                        column: x => x.call_recording_id,
                        principalTable: "call_recordings",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_qa_scorecards_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_qa_scorecards_qa_evaluation_forms_form_id",
                        column: x => x.form_id,
                        principalTable: "qa_evaluation_forms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ticket_attachments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ticket_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    uploaded_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    filename = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    file_url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    file_size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    mime_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    uploaded_by_agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_ticket_attachments", x => x.id);
                    table.ForeignKey(
                        name: "f_k_ticket_attachments_agents_uploaded_by_agent_id",
                        column: x => x.uploaded_by_agent_id,
                        principalTable: "agents",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_ticket_attachments_tickets_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "tickets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ticket_notes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ticket_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    is_internal = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_ticket_notes", x => x.id);
                    table.ForeignKey(
                        name: "f_k_ticket_notes_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_ticket_notes_tickets_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "tickets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ticket_sla_trackings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ticket_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    sla_rule_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    status = table.Column<int>(type: "int", nullable: false),
                    first_response_deadline = table.Column<DateTime>(type: "datetime2", nullable: false),
                    resolution_deadline = table.Column<DateTime>(type: "datetime2", nullable: false),
                    first_response_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    response_breached = table.Column<bool>(type: "bit", nullable: false),
                    resolution_breached = table.Column<bool>(type: "bit", nullable: false),
                    paused_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    pause_reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_ticket_sla_trackings", x => x.id);
                    table.ForeignKey(
                        name: "f_k_ticket_sla_trackings_sla_rules_sla_rule_id",
                        column: x => x.sla_rule_id,
                        principalTable: "sla_rules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_ticket_sla_trackings_tickets_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "tickets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ticket_status_histories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ticket_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    from_status = table.Column<int>(type: "int", nullable: true),
                    to_status = table.Column<int>(type: "int", nullable: false),
                    changed_by = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    changed_by_agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_ticket_status_histories", x => x.id);
                    table.ForeignKey(
                        name: "f_k_ticket_status_histories_agents_changed_by_agent_id",
                        column: x => x.changed_by_agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_ticket_status_histories_tickets_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "tickets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "coaching_sessions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    coach_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    scorecard_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    session_type = table.Column<int>(type: "int", nullable: false),
                    session_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    duration_minutes = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<int>(type: "int", nullable: false),
                    topics_covered = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    action_items = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_coaching_sessions", x => x.id);
                    table.ForeignKey(
                        name: "f_k_coaching_sessions__qa_scorecards_scorecard_id",
                        column: x => x.scorecard_id,
                        principalTable: "qa_scorecards",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "f_k_coaching_sessions_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "f_k_coaching_sessions_agents_coach_id",
                        column: x => x.coach_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "qa_scorecard_details",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    scorecard_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    criteria_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    points_earned = table.Column<int>(type: "int", nullable: false),
                    max_points = table.Column<int>(type: "int", nullable: false),
                    comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_qa_scorecard_details", x => x.id);
                    table.ForeignKey(
                        name: "f_k_qa_scorecard_details_qa_form_criteria_criteria_id",
                        column: x => x.criteria_id,
                        principalTable: "qa_form_criteria",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_qa_scorecard_details_qa_scorecards_scorecard_id",
                        column: x => x.scorecard_id,
                        principalTable: "qa_scorecards",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "i_x_agent_adherences_agent_id",
                table: "agent_adherences",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_agent_adherences_shift_id",
                table: "agent_adherences",
                column: "shift_id");

            migrationBuilder.CreateIndex(
                name: "i_x_agent_kpis_agent_id_date",
                table: "agent_kpis",
                columns: new[] { "agent_id", "date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_agent_shifts_agent_id",
                table: "agent_shifts",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_agent_skills_agent_id",
                table: "agent_skills",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_agent_states_agent_id",
                table: "agent_states",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_agents_email",
                table: "agents",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_agents_employee_id",
                table: "agents",
                column: "employee_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_agents_team_id",
                table: "agents",
                column: "team_id");

            migrationBuilder.CreateIndex(
                name: "i_x_ai_suggestions_agent_id",
                table: "ai_suggestions",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_ai_suggestions_conversation_id",
                table: "ai_suggestions",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "i_x_alert_logs_acknowledged_by_agent_id",
                table: "alert_logs",
                column: "acknowledged_by_agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_alert_logs_alert_rule_id",
                table: "alert_logs",
                column: "alert_rule_id");

            migrationBuilder.CreateIndex(
                name: "i_x_article_search_logs_agent_id",
                table: "article_search_logs",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_article_search_logs_article_id",
                table: "article_search_logs",
                column: "article_id");

            migrationBuilder.CreateIndex(
                name: "i_x_call_recordings_conversation_id",
                table: "call_recordings",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "i_x_call_transcriptions_conversation_id",
                table: "call_transcriptions",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "i_x_coaching_sessions_agent_id",
                table: "coaching_sessions",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_coaching_sessions_coach_id",
                table: "coaching_sessions",
                column: "coach_id");

            migrationBuilder.CreateIndex(
                name: "i_x_coaching_sessions_scorecard_id",
                table: "coaching_sessions",
                column: "scorecard_id");

            migrationBuilder.CreateIndex(
                name: "i_x_conversation_dispositions_agent_id",
                table: "conversation_dispositions",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_conversation_dispositions_conversation_id",
                table: "conversation_dispositions",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "i_x_conversation_dispositions_disposition_id",
                table: "conversation_dispositions",
                column: "disposition_id");

            migrationBuilder.CreateIndex(
                name: "i_x_conversation_messages_conversation_id",
                table: "conversation_messages",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "i_x_conversation_messages_sender_id",
                table: "conversation_messages",
                column: "sender_id");

            migrationBuilder.CreateIndex(
                name: "i_x_conversations_agent_id",
                table: "conversations",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_conversations_customer_id",
                table: "conversations",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "i_x_conversations_queue_id",
                table: "conversations",
                column: "queue_id");

            migrationBuilder.CreateIndex(
                name: "i_x_cti_events_agent_id",
                table: "cti_events",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_customer_interactions_customer_id",
                table: "customer_interactions",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "i_x_customer_notes_agent_id",
                table: "customer_notes",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_customer_notes_customer_id",
                table: "customer_notes",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "i_x_customer_satisfaction_surveys_agent_id",
                table: "customer_satisfaction_surveys",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_customer_satisfaction_surveys_conversation_id",
                table: "customer_satisfaction_surveys",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "i_x_customer_satisfaction_surveys_customer_id",
                table: "customer_satisfaction_surveys",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "i_x_customer_satisfaction_surveys_ticket_id",
                table: "customer_satisfaction_surveys",
                column: "ticket_id");

            migrationBuilder.CreateIndex(
                name: "i_x_customers_email",
                table: "customers",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "i_x_customers_national_id",
                table: "customers",
                column: "national_id",
                unique: true,
                filter: "[national_id] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "i_x_customers_phone",
                table: "customers",
                column: "phone");

            migrationBuilder.CreateIndex(
                name: "i_x_data_export_logs_exported_by_agent_id",
                table: "data_export_logs",
                column: "exported_by_agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_knowledge_base_articles_author_id",
                table: "knowledge_base_articles",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "i_x_qa_form_criteria_form_id",
                table: "qa_form_criteria",
                column: "form_id");

            migrationBuilder.CreateIndex(
                name: "i_x_qa_scorecard_details_criteria_id",
                table: "qa_scorecard_details",
                column: "criteria_id");

            migrationBuilder.CreateIndex(
                name: "i_x_qa_scorecard_details_scorecard_id",
                table: "qa_scorecard_details",
                column: "scorecard_id");

            migrationBuilder.CreateIndex(
                name: "i_x_qa_scorecards_agent_id",
                table: "qa_scorecards",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_qa_scorecards_call_recording_id",
                table: "qa_scorecards",
                column: "call_recording_id");

            migrationBuilder.CreateIndex(
                name: "i_x_qa_scorecards_conversation_id",
                table: "qa_scorecards",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "i_x_qa_scorecards_evaluator_id",
                table: "qa_scorecards",
                column: "evaluator_id");

            migrationBuilder.CreateIndex(
                name: "i_x_qa_scorecards_form_id",
                table: "qa_scorecards",
                column: "form_id");

            migrationBuilder.CreateIndex(
                name: "i_x_qa_scorecards_ticket_id",
                table: "qa_scorecards",
                column: "ticket_id");

            migrationBuilder.CreateIndex(
                name: "i_x_queue_metrics_queue_id",
                table: "queue_metrics",
                column: "queue_id");

            migrationBuilder.CreateIndex(
                name: "i_x_queues_team_id",
                table: "queues",
                column: "team_id");

            migrationBuilder.CreateIndex(
                name: "i_x_system_settings_updated_by_agent_id",
                table: "system_settings",
                column: "updated_by_agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_team_kpis_team_id",
                table: "team_kpis",
                column: "team_id");

            migrationBuilder.CreateIndex(
                name: "i_x_teams_supervisor_id",
                table: "teams",
                column: "supervisor_id");

            migrationBuilder.CreateIndex(
                name: "i_x_ticket_attachments_ticket_id",
                table: "ticket_attachments",
                column: "ticket_id");

            migrationBuilder.CreateIndex(
                name: "i_x_ticket_attachments_uploaded_by_agent_id",
                table: "ticket_attachments",
                column: "uploaded_by_agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_ticket_notes_agent_id",
                table: "ticket_notes",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_ticket_notes_ticket_id",
                table: "ticket_notes",
                column: "ticket_id");

            migrationBuilder.CreateIndex(
                name: "i_x_ticket_sla_trackings_sla_rule_id",
                table: "ticket_sla_trackings",
                column: "sla_rule_id");

            migrationBuilder.CreateIndex(
                name: "i_x_ticket_sla_trackings_ticket_id",
                table: "ticket_sla_trackings",
                column: "ticket_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_ticket_status_histories_changed_by_agent_id",
                table: "ticket_status_histories",
                column: "changed_by_agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_ticket_status_histories_ticket_id",
                table: "ticket_status_histories",
                column: "ticket_id");

            migrationBuilder.CreateIndex(
                name: "i_x_tickets_agent_id",
                table: "tickets",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_tickets_conversation_id",
                table: "tickets",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "i_x_tickets_customer_id",
                table: "tickets",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "i_x_tickets_team_id",
                table: "tickets",
                column: "team_id");

            migrationBuilder.CreateIndex(
                name: "i_x_tickets_ticket_number",
                table: "tickets",
                column: "ticket_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_time_off_requests_agent_id",
                table: "time_off_requests",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_time_off_requests_approved_by",
                table: "time_off_requests",
                column: "approved_by");

            migrationBuilder.AddForeignKey(
                name: "f_k_agent_adherences__agent_shifts_shift_id",
                table: "agent_adherences",
                column: "shift_id",
                principalTable: "agent_shifts",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "f_k_agent_adherences_agents_agent_id",
                table: "agent_adherences",
                column: "agent_id",
                principalTable: "agents",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "f_k_agent_kpis_agents_agent_id",
                table: "agent_kpis",
                column: "agent_id",
                principalTable: "agents",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "f_k_agent_shifts_agents_agent_id",
                table: "agent_shifts",
                column: "agent_id",
                principalTable: "agents",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "f_k_agent_skills_agents_agent_id",
                table: "agent_skills",
                column: "agent_id",
                principalTable: "agents",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_agent_states_agents_agent_id",
                table: "agent_states",
                column: "agent_id",
                principalTable: "agents",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "f_k_agents__teams_team_id",
                table: "agents",
                column: "team_id",
                principalTable: "teams",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "f_k_teams_agents_supervisor_id",
                table: "teams");

            migrationBuilder.DropTable(
                name: "agent_adherences");

            migrationBuilder.DropTable(
                name: "agent_kpis");

            migrationBuilder.DropTable(
                name: "agent_skills");

            migrationBuilder.DropTable(
                name: "agent_states");

            migrationBuilder.DropTable(
                name: "ai_suggestions");

            migrationBuilder.DropTable(
                name: "alert_logs");

            migrationBuilder.DropTable(
                name: "article_search_logs");

            migrationBuilder.DropTable(
                name: "call_transcriptions");

            migrationBuilder.DropTable(
                name: "coaching_sessions");

            migrationBuilder.DropTable(
                name: "conversation_dispositions");

            migrationBuilder.DropTable(
                name: "conversation_messages");

            migrationBuilder.DropTable(
                name: "cti_events");

            migrationBuilder.DropTable(
                name: "customer_interactions");

            migrationBuilder.DropTable(
                name: "customer_notes");

            migrationBuilder.DropTable(
                name: "customer_satisfaction_surveys");

            migrationBuilder.DropTable(
                name: "data_export_logs");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "qa_scorecard_details");

            migrationBuilder.DropTable(
                name: "queue_metrics");

            migrationBuilder.DropTable(
                name: "system_settings");

            migrationBuilder.DropTable(
                name: "team_kpis");

            migrationBuilder.DropTable(
                name: "ticket_attachments");

            migrationBuilder.DropTable(
                name: "ticket_notes");

            migrationBuilder.DropTable(
                name: "ticket_sla_trackings");

            migrationBuilder.DropTable(
                name: "ticket_status_histories");

            migrationBuilder.DropTable(
                name: "time_off_requests");

            migrationBuilder.DropTable(
                name: "agent_shifts");

            migrationBuilder.DropTable(
                name: "alert_rules");

            migrationBuilder.DropTable(
                name: "knowledge_base_articles");

            migrationBuilder.DropTable(
                name: "call_dispositions");

            migrationBuilder.DropTable(
                name: "qa_form_criteria");

            migrationBuilder.DropTable(
                name: "qa_scorecards");

            migrationBuilder.DropTable(
                name: "sla_rules");

            migrationBuilder.DropTable(
                name: "tickets");

            migrationBuilder.DropTable(
                name: "call_recordings");

            migrationBuilder.DropTable(
                name: "qa_evaluation_forms");

            migrationBuilder.DropTable(
                name: "conversations");

            migrationBuilder.DropTable(
                name: "customers");

            migrationBuilder.DropTable(
                name: "queues");

            migrationBuilder.DropTable(
                name: "agents");

            migrationBuilder.DropTable(
                name: "teams");
        }
    }
}
