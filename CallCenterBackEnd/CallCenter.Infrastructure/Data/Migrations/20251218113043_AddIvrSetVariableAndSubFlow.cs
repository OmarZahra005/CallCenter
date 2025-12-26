using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIvrSetVariableAndSubFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "sub_flow_id",
                table: "ivr_nodes",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "variable_name",
                table: "ivr_nodes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "variable_value",
                table: "ivr_nodes",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "sub_flow_id",
                table: "ivr_nodes");

            migrationBuilder.DropColumn(
                name: "variable_name",
                table: "ivr_nodes");

            migrationBuilder.DropColumn(
                name: "variable_value",
                table: "ivr_nodes");
        }
    }
}
