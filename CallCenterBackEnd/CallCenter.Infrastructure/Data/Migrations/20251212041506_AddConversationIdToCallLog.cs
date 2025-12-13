using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddConversationIdToCallLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "conversation_id",
                table: "call_logs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "i_x_call_logs_conversation_id",
                table: "call_logs",
                column: "conversation_id");

            migrationBuilder.AddForeignKey(
                name: "f_k_call_logs__conversations_conversation_id",
                table: "call_logs",
                column: "conversation_id",
                principalTable: "conversations",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "f_k_call_logs__conversations_conversation_id",
                table: "call_logs");

            migrationBuilder.DropIndex(
                name: "i_x_call_logs_conversation_id",
                table: "call_logs");

            migrationBuilder.DropColumn(
                name: "conversation_id",
                table: "call_logs");
        }
    }
}
