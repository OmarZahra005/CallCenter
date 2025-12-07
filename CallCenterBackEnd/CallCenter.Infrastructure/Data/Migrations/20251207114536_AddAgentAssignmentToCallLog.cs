using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAgentAssignmentToCallLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "assigned_agent_id",
                table: "call_logs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "assigned_agent_identity",
                table: "call_logs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "i_x_call_logs_assigned_agent_id",
                table: "call_logs",
                column: "assigned_agent_id");

            migrationBuilder.AddForeignKey(
                name: "f_k_call_logs_agents_assigned_agent_id",
                table: "call_logs",
                column: "assigned_agent_id",
                principalTable: "agents",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "f_k_call_logs_agents_assigned_agent_id",
                table: "call_logs");

            migrationBuilder.DropIndex(
                name: "i_x_call_logs_assigned_agent_id",
                table: "call_logs");

            migrationBuilder.DropColumn(
                name: "assigned_agent_id",
                table: "call_logs");

            migrationBuilder.DropColumn(
                name: "assigned_agent_identity",
                table: "call_logs");
        }
    }
}
