using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "teams",
                columns: new[] { "id", "created_at", "description", "is_active", "name", "supervisor_id", "updated_at" },
                values: new object[] { new Guid("00000000-0000-0000-0000-000000000001"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Default team for administrators", true, "Default Team", null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.InsertData(
                table: "agents",
                columns: new[] { "id", "created_at", "email", "employee_id", "hire_date", "languages", "name", "password_hash", "phone", "role", "skill_level", "status", "team_id", "updated_at" },
                values: new object[] { new Guid("00000000-0000-0000-0000-000000000001"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@callcenter.com", "EMP000001", new DateOnly(2024, 1, 1), null, "Admin User", "$2a$11$rBnfPfVhNrxZDGLQqL5Yqu5D5QZvQZvQZvQZvQZvQZvQZvQZvQZvS", "+1234567890", 1, 1, 0, new Guid("00000000-0000-0000-0000-000000000001"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "agents",
                keyColumn: "id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "teams",
                keyColumn: "id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));
        }
    }
}
