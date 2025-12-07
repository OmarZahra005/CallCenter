using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateOmarZahraRoleToAgent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update OmarZahra's role from Admin (3) to Agent (0)
            migrationBuilder.Sql(@"
                UPDATE agents
                SET role = 0
                WHERE id = '11111111-1111-1111-1111-111111111111'
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert OmarZahra's role back to Admin (3)
            migrationBuilder.Sql(@"
                UPDATE agents
                SET role = 3
                WHERE id = '11111111-1111-1111-1111-111111111111'
            ");
        }
    }
}
