using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSmartBotEscalations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "smart_bot_escalations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    smart_bot_conversation_id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    smart_bot_session_id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    smart_bot_chatbot_id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ticket_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    conversation_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    customer_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    status = table.Column<int>(type: "int", nullable: false),
                    reason = table.Column<int>(type: "int", nullable: false),
                    mode = table.Column<int>(type: "int", nullable: false),
                    priority = table.Column<int>(type: "int", nullable: false),
                    topic = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    sentiment = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    customer_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    customer_email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    customer_phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    preferred_language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    assigned_agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    assigned_agent_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    assigned_queue_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    queue_position = table.Column<int>(type: "int", nullable: true),
                    estimated_wait_time_seconds = table.Column<int>(type: "int", nullable: true),
                    transcript_json = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    context_variables_json = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    escalated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    agent_assigned_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    resolved_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    resolution = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    resolution_notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_smart_bot_escalations", x => x.id);
                    table.ForeignKey(
                        name: "f_k_smart_bot_escalations__tickets_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "tickets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "f_k_smart_bot_escalations_agents_assigned_agent_id",
                        column: x => x.assigned_agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "f_k_smart_bot_escalations_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "f_k_smart_bot_escalations_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "f_k_smart_bot_escalations_queues_assigned_queue_id",
                        column: x => x.assigned_queue_id,
                        principalTable: "queues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "smart_bot_escalation_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    escalation_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    event_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    action = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    details = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    actor_id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    actor_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    source = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_smart_bot_escalation_logs", x => x.id);
                    table.ForeignKey(
                        name: "f_k_smart_bot_escalation_logs_smart_bot_escalations_escalation_id",
                        column: x => x.escalation_id,
                        principalTable: "smart_bot_escalations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "i_x_smart_bot_escalation_logs_escalation_id",
                table: "smart_bot_escalation_logs",
                column: "escalation_id");

            migrationBuilder.CreateIndex(
                name: "i_x_smart_bot_escalation_logs_timestamp",
                table: "smart_bot_escalation_logs",
                column: "timestamp");

            migrationBuilder.CreateIndex(
                name: "i_x_smart_bot_escalations_assigned_agent_id",
                table: "smart_bot_escalations",
                column: "assigned_agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_smart_bot_escalations_assigned_queue_id",
                table: "smart_bot_escalations",
                column: "assigned_queue_id");

            migrationBuilder.CreateIndex(
                name: "i_x_smart_bot_escalations_conversation_id",
                table: "smart_bot_escalations",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "i_x_smart_bot_escalations_customer_id",
                table: "smart_bot_escalations",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "i_x_smart_bot_escalations_escalated_at",
                table: "smart_bot_escalations",
                column: "escalated_at");

            migrationBuilder.CreateIndex(
                name: "i_x_smart_bot_escalations_smart_bot_conversation_id",
                table: "smart_bot_escalations",
                column: "smart_bot_conversation_id");

            migrationBuilder.CreateIndex(
                name: "i_x_smart_bot_escalations_status",
                table: "smart_bot_escalations",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "i_x_smart_bot_escalations_ticket_id",
                table: "smart_bot_escalations",
                column: "ticket_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "smart_bot_escalation_logs");

            migrationBuilder.DropTable(
                name: "smart_bot_escalations");
        }
    }
}
