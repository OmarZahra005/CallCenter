using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCallLogEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "call_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    provider_call_id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    from_number = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    to_number = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    direction = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    started_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ended_at_utc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    recording_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updated_by = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_call_logs", x => x.id);
                });

            migrationBuilder.UpdateData(
                table: "agents",
                keyColumn: "id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                column: "password_hash",
                value: "AQAAAAIAAYagAAAAEOJxuO92MLN7XE7EPQ3Bue31LffoINetW58iZIf3CjeP5alHxX5ikZGiDJ5qpAQpng==");

            migrationBuilder.CreateIndex(
                name: "i_x_call_logs_provider_call_id",
                table: "call_logs",
                column: "provider_call_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_call_logs_status_started_at_utc",
                table: "call_logs",
                columns: new[] { "status", "started_at_utc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "call_logs");

            migrationBuilder.UpdateData(
                table: "agents",
                keyColumn: "id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                column: "password_hash",
                value: "$2a$11$rBnfPfVhNrxZDGLQqL5Yqu5D5QZvQZvQZvQZvQZvQZvQZvQZvQZvS");
        }
    }
}
