using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSurveyEncryptedContact : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "customer_contact_encrypted",
                table: "call_surveys",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "customer_contact_encrypted",
                table: "call_surveys");
        }
    }
}
