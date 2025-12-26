using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddConversationHandoffStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "i_x_smart_bot_escalations_conversation_id",
                table: "smart_bot_escalations");

            migrationBuilder.AddColumn<DateTime>(
                name: "handoff_accepted_at",
                table: "conversations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "handoff_ended_at",
                table: "conversations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "handoff_ended_by",
                table: "conversations",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "handoff_requested_at",
                table: "conversations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "handoff_status",
                table: "conversations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "smart_bot_session_id",
                table: "conversations",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "i_x_smart_bot_escalations_conversation_id",
                table: "smart_bot_escalations",
                column: "conversation_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_conversations_handoff_status",
                table: "conversations",
                column: "handoff_status");

            migrationBuilder.CreateIndex(
                name: "i_x_conversations_smart_bot_session_id",
                table: "conversations",
                column: "smart_bot_session_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "i_x_smart_bot_escalations_conversation_id",
                table: "smart_bot_escalations");

            migrationBuilder.DropIndex(
                name: "i_x_conversations_handoff_status",
                table: "conversations");

            migrationBuilder.DropIndex(
                name: "i_x_conversations_smart_bot_session_id",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "handoff_accepted_at",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "handoff_ended_at",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "handoff_ended_by",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "handoff_requested_at",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "handoff_status",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "smart_bot_session_id",
                table: "conversations");

            migrationBuilder.CreateIndex(
                name: "i_x_smart_bot_escalations_conversation_id",
                table: "smart_bot_escalations",
                column: "conversation_id");
        }
    }
}
