using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDialerEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "dialer_campaigns",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    dialing_mode = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<int>(type: "int", nullable: false),
                    scheduled_start_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    scheduled_end_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    actual_start_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    actual_end_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    call_window_start = table.Column<TimeOnly>(type: "time", nullable: false),
                    call_window_end = table.Column<TimeOnly>(type: "time", nullable: false),
                    time_zone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    active_days = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    max_lines_per_agent = table.Column<int>(type: "int", nullable: false),
                    target_abandonment_rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    max_attempts = table.Column<int>(type: "int", nullable: false),
                    retry_delay_minutes = table.Column<int>(type: "int", nullable: false),
                    ring_duration_seconds = table.Column<int>(type: "int", nullable: false),
                    agent_wrap_up_seconds = table.Column<int>(type: "int", nullable: false),
                    caller_id = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    caller_id_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    team_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    queue_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    total_records = table.Column<int>(type: "int", nullable: false),
                    pending_records = table.Column<int>(type: "int", nullable: false),
                    completed_records = table.Column<int>(type: "int", nullable: false),
                    connected_calls = table.Column<int>(type: "int", nullable: false),
                    total_attempts = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updated_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_dialer_campaigns", x => x.id);
                    table.ForeignKey(
                        name: "f_k_dialer_campaigns__queues_queue_id",
                        column: x => x.queue_id,
                        principalTable: "queues",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_dialer_campaigns__teams_team_id",
                        column: x => x.team_id,
                        principalTable: "teams",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "do_not_call_entries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    phone_number = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    normalized_phone_number = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    type = table.Column<int>(type: "int", nullable: false),
                    source = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    added_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    expires_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    added_by_agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    customer_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updated_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_do_not_call_entries", x => x.id);
                    table.ForeignKey(
                        name: "f_k_do_not_call_entries_agents_added_by_agent_id",
                        column: x => x.added_by_agent_id,
                        principalTable: "agents",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_do_not_call_entries_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "dialer_lists",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<int>(type: "int", nullable: false),
                    campaign_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    source_file_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    imported_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    imported_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    total_records = table.Column<int>(type: "int", nullable: false),
                    valid_records = table.Column<int>(type: "int", nullable: false),
                    invalid_records = table.Column<int>(type: "int", nullable: false),
                    duplicate_records = table.Column<int>(type: "int", nullable: false),
                    dnc_records = table.Column<int>(type: "int", nullable: false),
                    imported_by_agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updated_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_dialer_lists", x => x.id);
                    table.ForeignKey(
                        name: "f_k_dialer_lists_agents_imported_by_agent_id",
                        column: x => x.imported_by_agent_id,
                        principalTable: "agents",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_dialer_lists_dialer_campaigns_campaign_id",
                        column: x => x.campaign_id,
                        principalTable: "dialer_campaigns",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "dialer_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    list_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    phone_number = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    phone_number2 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    phone_number3 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    first_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    last_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    company = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    custom_fields = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<int>(type: "int", nullable: false),
                    attempt_count = table.Column<int>(type: "int", nullable: false),
                    last_attempt_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    next_attempt_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    completed_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    last_disposition = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    assigned_agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    assigned_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    callback_scheduled_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    callback_agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    customer_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    priority = table.Column<int>(type: "int", nullable: false),
                    contact_time_zone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updated_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_dialer_records", x => x.id);
                    table.ForeignKey(
                        name: "f_k_dialer_records_agents_assigned_agent_id",
                        column: x => x.assigned_agent_id,
                        principalTable: "agents",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_dialer_records_agents_callback_agent_id",
                        column: x => x.callback_agent_id,
                        principalTable: "agents",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_dialer_records_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_dialer_records_dialer_lists_list_id",
                        column: x => x.list_id,
                        principalTable: "dialer_lists",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "dialer_attempts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    record_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    campaign_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    phone_number_dialed = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    attempt_number = table.Column<int>(type: "int", nullable: false),
                    started_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    connected_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ended_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ring_duration_seconds = table.Column<int>(type: "int", nullable: true),
                    talk_duration_seconds = table.Column<int>(type: "int", nullable: true),
                    wrap_up_duration_seconds = table.Column<int>(type: "int", nullable: true),
                    outcome = table.Column<int>(type: "int", nullable: false),
                    disposition_code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    disposition_notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    provider_call_id = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    recording_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    sentiment_score = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    is_conversion = table.Column<bool>(type: "bit", nullable: true),
                    callback_scheduled_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    callback_notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updated_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_dialer_attempts", x => x.id);
                    table.ForeignKey(
                        name: "f_k_dialer_attempts__dialer_campaigns_campaign_id",
                        column: x => x.campaign_id,
                        principalTable: "dialer_campaigns",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_dialer_attempts__dialer_records_record_id",
                        column: x => x.record_id,
                        principalTable: "dialer_records",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_dialer_attempts_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "dialer_campaign_agents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    campaign_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    logged_in_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    logged_out_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    last_call_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    current_record_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    record_assigned_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    is_on_call = table.Column<bool>(type: "bit", nullable: false),
                    is_in_wrap_up = table.Column<bool>(type: "bit", nullable: false),
                    wrap_up_ends_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    total_calls_handled = table.Column<int>(type: "int", nullable: false),
                    total_connected_calls = table.Column<int>(type: "int", nullable: false),
                    total_talk_time_seconds = table.Column<int>(type: "int", nullable: false),
                    total_wrap_up_time_seconds = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updated_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_dialer_campaign_agents", x => x.id);
                    table.ForeignKey(
                        name: "f_k_dialer_campaign_agents__dialer_records_current_record_id",
                        column: x => x.current_record_id,
                        principalTable: "dialer_records",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_dialer_campaign_agents_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_dialer_campaign_agents_dialer_campaigns_campaign_id",
                        column: x => x.campaign_id,
                        principalTable: "dialer_campaigns",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "i_x_dialer_attempts_agent_id",
                table: "dialer_attempts",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_dialer_attempts_campaign_id",
                table: "dialer_attempts",
                column: "campaign_id");

            migrationBuilder.CreateIndex(
                name: "i_x_dialer_attempts_record_id",
                table: "dialer_attempts",
                column: "record_id");

            migrationBuilder.CreateIndex(
                name: "i_x_dialer_campaign_agents_agent_id",
                table: "dialer_campaign_agents",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_dialer_campaign_agents_campaign_id",
                table: "dialer_campaign_agents",
                column: "campaign_id");

            migrationBuilder.CreateIndex(
                name: "i_x_dialer_campaign_agents_current_record_id",
                table: "dialer_campaign_agents",
                column: "current_record_id");

            migrationBuilder.CreateIndex(
                name: "i_x_dialer_campaigns_queue_id",
                table: "dialer_campaigns",
                column: "queue_id");

            migrationBuilder.CreateIndex(
                name: "i_x_dialer_campaigns_team_id",
                table: "dialer_campaigns",
                column: "team_id");

            migrationBuilder.CreateIndex(
                name: "i_x_dialer_lists_campaign_id",
                table: "dialer_lists",
                column: "campaign_id");

            migrationBuilder.CreateIndex(
                name: "i_x_dialer_lists_imported_by_agent_id",
                table: "dialer_lists",
                column: "imported_by_agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_dialer_records_assigned_agent_id",
                table: "dialer_records",
                column: "assigned_agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_dialer_records_callback_agent_id",
                table: "dialer_records",
                column: "callback_agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_dialer_records_customer_id",
                table: "dialer_records",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "i_x_dialer_records_list_id",
                table: "dialer_records",
                column: "list_id");

            migrationBuilder.CreateIndex(
                name: "i_x_do_not_call_entries_added_by_agent_id",
                table: "do_not_call_entries",
                column: "added_by_agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_do_not_call_entries_customer_id",
                table: "do_not_call_entries",
                column: "customer_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "dialer_attempts");

            migrationBuilder.DropTable(
                name: "dialer_campaign_agents");

            migrationBuilder.DropTable(
                name: "do_not_call_entries");

            migrationBuilder.DropTable(
                name: "dialer_records");

            migrationBuilder.DropTable(
                name: "dialer_lists");

            migrationBuilder.DropTable(
                name: "dialer_campaigns");
        }
    }
}
