using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIvrSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ivr_flows",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    is_default = table.Column<bool>(type: "bit", nullable: false),
                    phone_numbers = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    entry_node_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    default_language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false, defaultValue: "en-US"),
                    default_voice = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Polly.Joanna"),
                    max_invalid_attempts = table.Column<int>(type: "int", nullable: false),
                    input_timeout = table.Column<int>(type: "int", nullable: false),
                    business_hours_start = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    business_hours_end = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    business_days = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    after_hours_node_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updated_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_ivr_flows", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ivr_nodes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    flow_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    node_type = table.Column<int>(type: "int", nullable: false),
                    position_x = table.Column<int>(type: "int", nullable: false),
                    position_y = table.Column<int>(type: "int", nullable: false),
                    message_text = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    audio_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    voice = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    repeat_count = table.Column<int>(type: "int", nullable: false),
                    invalid_input_message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    timeout_message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    fallback_node_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    transfer_queue_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    transfer_agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    transfer_phone_number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    transfer_timeout = table.Column<int>(type: "int", nullable: false),
                    enable_recording = table.Column<bool>(type: "bit", nullable: false),
                    num_digits = table.Column<int>(type: "int", nullable: true),
                    finish_on_key = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: true),
                    digits_variable_name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    condition_variable = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    condition_operator = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    condition_value = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    condition_true_node_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    condition_false_node_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    http_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    http_method = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    next_node_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    max_recording_length = table.Column<int>(type: "int", nullable: false),
                    transcribe_voicemail = table.Column<bool>(type: "bit", nullable: false),
                    voicemail_email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updated_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_ivr_nodes", x => x.id);
                    table.ForeignKey(
                        name: "f_k_ivr_nodes_ivr_flows_flow_id",
                        column: x => x.flow_id,
                        principalTable: "ivr_flows",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ivr_call_sessions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    call_sid = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    flow_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    current_node_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    caller_number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    called_number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    variables = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    node_path = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    invalid_attempts = table.Column<int>(type: "int", nullable: false),
                    last_digits = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    outcome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    started_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ended_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updated_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_ivr_call_sessions", x => x.id);
                    table.ForeignKey(
                        name: "f_k_ivr_call_sessions__ivr_flows_flow_id",
                        column: x => x.flow_id,
                        principalTable: "ivr_flows",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "f_k_ivr_call_sessions__ivr_nodes_current_node_id",
                        column: x => x.current_node_id,
                        principalTable: "ivr_nodes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ivr_menu_options",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    node_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    digit = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    label = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    target_node_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    display_order = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updated_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_ivr_menu_options", x => x.id);
                    table.ForeignKey(
                        name: "f_k_ivr_menu_options__ivr_nodes_node_id",
                        column: x => x.node_id,
                        principalTable: "ivr_nodes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_ivr_menu_options__ivr_nodes_target_node_id",
                        column: x => x.target_node_id,
                        principalTable: "ivr_nodes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "i_x_ivr_call_sessions_call_sid",
                table: "ivr_call_sessions",
                column: "call_sid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_ivr_call_sessions_current_node_id",
                table: "ivr_call_sessions",
                column: "current_node_id");

            migrationBuilder.CreateIndex(
                name: "i_x_ivr_call_sessions_flow_id",
                table: "ivr_call_sessions",
                column: "flow_id");

            migrationBuilder.CreateIndex(
                name: "i_x_ivr_call_sessions_is_active",
                table: "ivr_call_sessions",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "i_x_ivr_call_sessions_started_at_utc",
                table: "ivr_call_sessions",
                column: "started_at_utc");

            migrationBuilder.CreateIndex(
                name: "i_x_ivr_flows_is_active",
                table: "ivr_flows",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "i_x_ivr_flows_is_default",
                table: "ivr_flows",
                column: "is_default");

            migrationBuilder.CreateIndex(
                name: "i_x_ivr_menu_options_node_id",
                table: "ivr_menu_options",
                column: "node_id");

            migrationBuilder.CreateIndex(
                name: "i_x_ivr_menu_options_node_id_digit",
                table: "ivr_menu_options",
                columns: new[] { "node_id", "digit" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_ivr_menu_options_target_node_id",
                table: "ivr_menu_options",
                column: "target_node_id");

            migrationBuilder.CreateIndex(
                name: "i_x_ivr_nodes_flow_id",
                table: "ivr_nodes",
                column: "flow_id");

            migrationBuilder.CreateIndex(
                name: "i_x_ivr_nodes_node_type",
                table: "ivr_nodes",
                column: "node_type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ivr_call_sessions");

            migrationBuilder.DropTable(
                name: "ivr_menu_options");

            migrationBuilder.DropTable(
                name: "ivr_nodes");

            migrationBuilder.DropTable(
                name: "ivr_flows");
        }
    }
}
