using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAuthSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "password_hash",
                table: "agents",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    token = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    expires_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_by_ip = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    revoked_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    revoked_by_ip = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    replaced_by_token = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_refresh_tokens", x => x.id);
                    table.ForeignKey(
                        name: "f_k_refresh_tokens_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "i_x_refresh_tokens_agent_id",
                table: "refresh_tokens",
                column: "agent_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "refresh_tokens");

            migrationBuilder.DropColumn(
                name: "password_hash",
                table: "agents");
        }
    }
}
