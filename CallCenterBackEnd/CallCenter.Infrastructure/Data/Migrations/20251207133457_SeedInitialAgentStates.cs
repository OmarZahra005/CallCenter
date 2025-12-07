using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialAgentStates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Seed initial AgentState for OmarZahra
            migrationBuilder.InsertData(
                table: "agent_states",
                columns: new[] { "id", "agent_id", "state", "reason", "changed_at", "duration_seconds" },
                values: new object[] {
                    new Guid("22222222-2222-2222-2222-222222222222"),
                    new Guid("11111111-1111-1111-1111-111111111111"),  // OmarZahra's ID
                    0,  // AgentStateType.Available
                    "Initial state - system seeded",
                    new DateTime(2025, 12, 7, 13, 35, 0, 0, DateTimeKind.Utc),
                    null
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "agent_states",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));
        }
    }
}
