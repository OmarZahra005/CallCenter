using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCallSurveyTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "call_surveys",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    call_id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    queue_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    direction = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    customer_contact_masked = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    channel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    question_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    rating = table.Column<byte>(type: "tinyint", nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    token = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    sent_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    responded_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    expires_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    provider_message_id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    retry_count = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    last_error = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_call_surveys", x => x.id);
                    table.CheckConstraint("ck_call_surveys_rating", "rating IS NULL OR (rating >= 1 AND rating <= 5)");
                    table.ForeignKey(
                        name: "f_k_call_surveys_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "ix_call_surveys_agent_id",
                table: "call_surveys",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "ix_call_surveys_call_id",
                table: "call_surveys",
                column: "call_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_call_surveys_status",
                table: "call_surveys",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_call_surveys_status_created",
                table: "call_surveys",
                columns: new[] { "status", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_call_surveys_token",
                table: "call_surveys",
                column: "token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "call_surveys");
        }
    }
}
