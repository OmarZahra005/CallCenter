using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAcwFieldsToConversation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "acw_notes",
                table: "conversations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "disposition",
                table: "conversations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "follow_up_date",
                table: "conversations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "follow_up_required",
                table: "conversations",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "acw_notes",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "disposition",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "follow_up_date",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "follow_up_required",
                table: "conversations");
        }
    }
}
