using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddKnowledgePermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("57cfa772-d9d7-d285-77e0-231ae50cad1c"),
                column: "display_order",
                value: 62);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("884d0d86-67dc-5322-4601-9c532412a23c"),
                column: "display_order",
                value: 60);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("993cb8aa-8d1e-0484-eba4-5b3dc713eae7"),
                column: "display_order",
                value: 58);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("a0e76814-f452-de78-a582-27acd0793035"),
                column: "display_order",
                value: 56);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("a7b80797-6662-2714-c7db-fdd89a770200"),
                column: "display_order",
                value: 61);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("aa646765-6738-521c-20dc-df9df6f1daac"),
                column: "display_order",
                value: 54);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e2db533a-9ef9-e7d0-387a-ba8e394e49fa"),
                column: "display_order",
                value: 57);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e8330f06-3147-5980-b919-04aa547962c6"),
                column: "display_order",
                value: 55);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e8c12788-2cea-dac1-a0b9-eb9ed0f65ea8"),
                column: "display_order",
                value: 59);

            migrationBuilder.InsertData(
                table: "permissions",
                columns: new[] { "id", "created_at", "description", "display_order", "module", "name", "system_name" },
                values: new object[,]
                {
                    { new Guid("4e327cfe-d41d-c23d-54e4-9d5980c37848"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create, edit, delete knowledge base articles", 53, "Knowledge", "Manage Knowledge Base", "knowledge.manage" },
                    { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View knowledge base articles", 52, "Knowledge", "View Knowledge Base", "knowledge.view" }
                });

            migrationBuilder.InsertData(
                table: "role_permissions",
                columns: new[] { "permission_id", "role_id", "assigned_at", "assigned_by_id" },
                values: new object[,]
                {
                    { new Guid("4e327cfe-d41d-c23d-54e4-9d5980c37848"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("4e327cfe-d41d-c23d-54e4-9d5980c37848"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("4e327cfe-d41d-c23d-54e4-9d5980c37848"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("4e327cfe-d41d-c23d-54e4-9d5980c37848"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("4e327cfe-d41d-c23d-54e4-9d5980c37848"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"));

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("57cfa772-d9d7-d285-77e0-231ae50cad1c"),
                column: "display_order",
                value: 60);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("884d0d86-67dc-5322-4601-9c532412a23c"),
                column: "display_order",
                value: 58);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("993cb8aa-8d1e-0484-eba4-5b3dc713eae7"),
                column: "display_order",
                value: 56);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("a0e76814-f452-de78-a582-27acd0793035"),
                column: "display_order",
                value: 54);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("a7b80797-6662-2714-c7db-fdd89a770200"),
                column: "display_order",
                value: 59);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("aa646765-6738-521c-20dc-df9df6f1daac"),
                column: "display_order",
                value: 52);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e2db533a-9ef9-e7d0-387a-ba8e394e49fa"),
                column: "display_order",
                value: 55);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e8330f06-3147-5980-b919-04aa547962c6"),
                column: "display_order",
                value: 53);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e8c12788-2cea-dac1-a0b9-eb9ed0f65ea8"),
                column: "display_order",
                value: 57);
        }
    }
}
