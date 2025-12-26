using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCallbackRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "callback_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    phone_number = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    called_number = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    queue_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    priority = table.Column<int>(type: "int", nullable: false),
                    notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    session_variables = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    original_call_sid = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    requested_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    preferred_callback_time = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    attempted_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    completed_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    attempt_count = table.Column<int>(type: "int", nullable: false),
                    assigned_agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updated_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_callback_requests", x => x.id);
                    table.ForeignKey(
                        name: "f_k_callback_requests__queues_queue_id",
                        column: x => x.queue_id,
                        principalTable: "queues",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_callback_requests_agents_assigned_agent_id",
                        column: x => x.assigned_agent_id,
                        principalTable: "agents",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "i_x_callback_requests_assigned_agent_id",
                table: "callback_requests",
                column: "assigned_agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_callback_requests_queue_id",
                table: "callback_requests",
                column: "queue_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "callback_requests");
        }
    }
}
