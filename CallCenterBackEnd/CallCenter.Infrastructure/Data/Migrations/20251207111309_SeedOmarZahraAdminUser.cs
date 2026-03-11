using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedOmarZahraAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "agents",
                columns: new[] { "id", "created_at", "email", "employee_id", "hire_date", "languages", "name", "password_hash", "phone", "role", "skill_level", "status", "team_id", "updated_at" },
                values: new object[] {
                    new Guid("11111111-1111-1111-1111-111111111111"),
                    new DateTime(2025, 12, 7, 0, 0, 0, 0, DateTimeKind.Utc),
                    "omar.zahra@callcenter.com",
                    "EMP000002",
                    new DateOnly(2025, 12, 7),
                    null,
                    "OmarZahra",
                    "AQAAAAIAAYagAAAAEOJxuO92MLN7XE7EPQ3Bue31LffoINetW58iZIf3CjeP5alHxX5ikZGiDJ5qpAQpng==", // Uses ASP.NET Identity PasswordHasher (same as admin seed)
                    null,
                    0, // AgentRole.Agent
                    1,
                    0, // AgentStatus.Active
                    new Guid("00000000-0000-0000-0000-000000000001"),
                    new DateTime(2025, 12, 7, 0, 0, 0, 0, DateTimeKind.Utc)
                });

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "agents",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));
        }
    }
}
