using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDecimalPrecisionAndOmarZahraRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("150df259-5ebf-bfea-035a-82ff7de4b85f"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("2318fa37-bbf1-82f3-cda1-9b8101244808"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("2660f3eb-d851-035a-bd9e-610ae59d867a"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("26727ed9-4ced-3837-240f-c17b950cbdd5"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("2851532c-8565-0683-0099-d4df8a16380c"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("2bc87b8a-5e13-0774-bb00-780bf3a09d8e"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("358f7969-35bf-20de-7727-a8002341d2f3"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("3a1e6ef8-898e-759e-0853-4da8267b98b9"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("40283c6a-fca2-b710-bd7f-cddf62aca1b9"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("4e327cfe-d41d-c23d-54e4-9d5980c37848"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("57cfa772-d9d7-d285-77e0-231ae50cad1c"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("5b50ebfc-6162-733a-327c-9190a969657b"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("5c55a758-1c14-0ada-f3a6-031e2c9006a4"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6068ae6f-8c24-10a8-2f90-a748db0e3931"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6bffb0a5-9486-bf30-5191-d16afcca3934"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6c7e8a5a-4c21-d805-289e-36f629c13f52"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("72cff6fe-4c5c-6cf0-26fc-ddac2e97d8a1"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("74da3950-424d-7b5f-a037-e7ff772ae950"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("782a2ea6-8120-c4fc-76b5-085f31843c9b"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("79f070a0-eb4c-e61e-8982-a485bf311e52"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("7a048e9a-986c-bd44-374f-db19f0209d82"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("7c48439a-4ae6-f9ac-3a75-0aa7640e69e3"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("83377373-98ee-7050-7962-cc454c69274d"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("8516b726-1622-fac7-7869-87a88179a833"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("87370f03-9a1b-ccbd-190f-c70e9e8b9453"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("87b43a70-c07b-a17d-ddb5-c567ce9b2361"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("884d0d86-67dc-5322-4601-9c532412a23c"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("886d0b0c-1f65-6fbc-ed99-c6c9dc4b6112"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("993cb8aa-8d1e-0484-eba4-5b3dc713eae7"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("9cbf5fe8-88a3-a716-9fe2-85d1d4d08a2c"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("a0e76814-f452-de78-a582-27acd0793035"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("a27dcfdc-af86-ce2c-6893-9dd600c58e8f"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("a516df2b-0c8e-ac69-4626-8951561ba3fb"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("a7b80797-6662-2714-c7db-fdd89a770200"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("aa646765-6738-521c-20dc-df9df6f1daac"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("abd509c9-e6cc-8087-1b5e-b3022e9695d6"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("afe62c2a-d8ee-1107-d73e-001c752777db"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("b55ae5bc-6877-12a9-6991-8107f1467eb0"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("c2675598-37f0-27bb-37bb-3804a480d7b6"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("c6a00de2-109a-4eab-0120-b3edb11434e9"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("cced7ee9-45a3-40d8-49f1-edc79b45790a"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("cd542d26-3b9f-bc98-3914-e8410672bd6b"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d04ef1fc-e6e0-ef4e-18ab-5ccb9bed2165"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d0d45e1d-45b5-8a53-d313-322d377e01c8"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d184b1c8-14dc-78ca-4b12-1b86e8a1247a"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d1ee3a22-99c3-307e-8112-9cd54a433363"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d42a9c93-73a6-14a9-1517-43df13632dcb"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d7ed0a74-9b46-6850-213d-1637c7d1c318"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("dce84885-dc98-47a9-98c8-bcce0c3d0537"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e2db533a-9ef9-e7d0-387a-ba8e394e49fa"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e381414f-e3aa-20ab-7238-ed2c947e51b6"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e5071018-88b2-b4c7-44ec-f1f4b114d372"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e8330f06-3147-5980-b919-04aa547962c6"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e8b9eabe-ba23-ea46-4352-a6068cfeb627"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e8c12788-2cea-dac1-a0b9-eb9ed0f65ea8"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e917205c-73cc-536f-eb11-f08f5dd8fc2f"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e9e023f4-429c-1245-434e-79ff9718ec10"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("ecff27d6-035f-6cfe-747b-ff1be9340247"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("eda0d27a-ee01-ba05-d993-04976f9c79b2"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("f84fc2ff-e68c-fb78-5a7a-53033eb7a606"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("150df259-5ebf-bfea-035a-82ff7de4b85f"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("2318fa37-bbf1-82f3-cda1-9b8101244808"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("2660f3eb-d851-035a-bd9e-610ae59d867a"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("26727ed9-4ced-3837-240f-c17b950cbdd5"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("2851532c-8565-0683-0099-d4df8a16380c"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("2bc87b8a-5e13-0774-bb00-780bf3a09d8e"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("358f7969-35bf-20de-7727-a8002341d2f3"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("3a1e6ef8-898e-759e-0853-4da8267b98b9"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("40283c6a-fca2-b710-bd7f-cddf62aca1b9"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("4e327cfe-d41d-c23d-54e4-9d5980c37848"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("5b50ebfc-6162-733a-327c-9190a969657b"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("5c55a758-1c14-0ada-f3a6-031e2c9006a4"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6bffb0a5-9486-bf30-5191-d16afcca3934"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6c7e8a5a-4c21-d805-289e-36f629c13f52"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("72cff6fe-4c5c-6cf0-26fc-ddac2e97d8a1"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("74da3950-424d-7b5f-a037-e7ff772ae950"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("782a2ea6-8120-c4fc-76b5-085f31843c9b"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("79f070a0-eb4c-e61e-8982-a485bf311e52"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("7a048e9a-986c-bd44-374f-db19f0209d82"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("7c48439a-4ae6-f9ac-3a75-0aa7640e69e3"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("83377373-98ee-7050-7962-cc454c69274d"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("8516b726-1622-fac7-7869-87a88179a833"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("87370f03-9a1b-ccbd-190f-c70e9e8b9453"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("87b43a70-c07b-a17d-ddb5-c567ce9b2361"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("886d0b0c-1f65-6fbc-ed99-c6c9dc4b6112"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("9cbf5fe8-88a3-a716-9fe2-85d1d4d08a2c"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("a27dcfdc-af86-ce2c-6893-9dd600c58e8f"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("a516df2b-0c8e-ac69-4626-8951561ba3fb"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("abd509c9-e6cc-8087-1b5e-b3022e9695d6"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("afe62c2a-d8ee-1107-d73e-001c752777db"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("b55ae5bc-6877-12a9-6991-8107f1467eb0"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("c2675598-37f0-27bb-37bb-3804a480d7b6"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("c6a00de2-109a-4eab-0120-b3edb11434e9"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("cced7ee9-45a3-40d8-49f1-edc79b45790a"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("cd542d26-3b9f-bc98-3914-e8410672bd6b"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d04ef1fc-e6e0-ef4e-18ab-5ccb9bed2165"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d0d45e1d-45b5-8a53-d313-322d377e01c8"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d184b1c8-14dc-78ca-4b12-1b86e8a1247a"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d42a9c93-73a6-14a9-1517-43df13632dcb"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d7ed0a74-9b46-6850-213d-1637c7d1c318"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("dce84885-dc98-47a9-98c8-bcce0c3d0537"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e381414f-e3aa-20ab-7238-ed2c947e51b6"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e5071018-88b2-b4c7-44ec-f1f4b114d372"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e8b9eabe-ba23-ea46-4352-a6068cfeb627"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e917205c-73cc-536f-eb11-f08f5dd8fc2f"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e9e023f4-429c-1245-434e-79ff9718ec10"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("ecff27d6-035f-6cfe-747b-ff1be9340247"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("eda0d27a-ee01-ba05-d993-04976f9c79b2"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("f84fc2ff-e68c-fb78-5a7a-53033eb7a606"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("3a1e6ef8-898e-759e-0853-4da8267b98b9"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6bffb0a5-9486-bf30-5191-d16afcca3934"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("72cff6fe-4c5c-6cf0-26fc-ddac2e97d8a1"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("8516b726-1622-fac7-7869-87a88179a833"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("886d0b0c-1f65-6fbc-ed99-c6c9dc4b6112"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("a516df2b-0c8e-ac69-4626-8951561ba3fb"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("b55ae5bc-6877-12a9-6991-8107f1467eb0"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("cd542d26-3b9f-bc98-3914-e8410672bd6b"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d04ef1fc-e6e0-ef4e-18ab-5ccb9bed2165"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d0d45e1d-45b5-8a53-d313-322d377e01c8"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d42a9c93-73a6-14a9-1517-43df13632dcb"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e5071018-88b2-b4c7-44ec-f1f4b114d372"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("26727ed9-4ced-3837-240f-c17b950cbdd5"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("2851532c-8565-0683-0099-d4df8a16380c"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("2bc87b8a-5e13-0774-bb00-780bf3a09d8e"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("358f7969-35bf-20de-7727-a8002341d2f3"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("5b50ebfc-6162-733a-327c-9190a969657b"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("74da3950-424d-7b5f-a037-e7ff772ae950"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("782a2ea6-8120-c4fc-76b5-085f31843c9b"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("83377373-98ee-7050-7962-cc454c69274d"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("8516b726-1622-fac7-7869-87a88179a833"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("afe62c2a-d8ee-1107-d73e-001c752777db"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("c2675598-37f0-27bb-37bb-3804a480d7b6"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("c6a00de2-109a-4eab-0120-b3edb11434e9"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("cced7ee9-45a3-40d8-49f1-edc79b45790a"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("cd542d26-3b9f-bc98-3914-e8410672bd6b"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d42a9c93-73a6-14a9-1517-43df13632dcb"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d7ed0a74-9b46-6850-213d-1637c7d1c318"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("dce84885-dc98-47a9-98c8-bcce0c3d0537"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e8b9eabe-ba23-ea46-4352-a6068cfeb627"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e917205c-73cc-536f-eb11-f08f5dd8fc2f"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e9e023f4-429c-1245-434e-79ff9718ec10"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("ecff27d6-035f-6cfe-747b-ff1be9340247"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("eda0d27a-ee01-ba05-d993-04976f9c79b2"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("150df259-5ebf-bfea-035a-82ff7de4b85f"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("2660f3eb-d851-035a-bd9e-610ae59d867a"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("26727ed9-4ced-3837-240f-c17b950cbdd5"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("358f7969-35bf-20de-7727-a8002341d2f3"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("83377373-98ee-7050-7962-cc454c69274d"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("c2675598-37f0-27bb-37bb-3804a480d7b6"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d7ed0a74-9b46-6850-213d-1637c7d1c318"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e8b9eabe-ba23-ea46-4352-a6068cfeb627"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e917205c-73cc-536f-eb11-f08f5dd8fc2f"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("0a16237e-bd53-306a-3023-e8b10c384e39"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("0ba8ffa6-5869-0ab9-9568-34c188c62d05"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("1a225051-9846-6a15-20fb-e65723b39ee7"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("26bdb9f4-bb6f-c417-00ad-590c8ff7e9e8"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("2b67338b-d5c3-9beb-6747-34fe3edfb88a"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("419af46c-4416-4b4f-a0c1-458f1a7211c7"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("45fe4ccc-c7d4-2c53-348e-b7001bc9b26c"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("543aed1f-e4b1-8b0f-2531-d203f5156523"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("54b34fdd-7486-4b39-6f96-e854cff05afd"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("58b17efc-2e16-65be-0d02-e9e417dde75c"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("5e07d8aa-a436-db91-67ab-3a7caddde828"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("60fb3617-3254-eb88-a2ec-12d2c6120678"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("719d035c-38ce-b35a-c0e8-f06b0d4ba47f"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("75e56a7b-0e42-ae59-176d-06e7a83351ed"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("75ec8d57-c85c-7fc9-4fc0-692b1acce9ee"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("786f1e23-f788-95cd-1c04-04bc97318939"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("78b8d820-5387-5d89-0516-67a5982d1d07"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("7b19673c-c4dd-6d7a-9c2e-f912519a0aaa"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("7bdfe3fa-ed06-e28f-34c8-b2f60c6a33a8"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("7eea0044-ace3-4d56-35b8-28e9dad2ed77"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("804effd6-0a2a-482f-8918-2e2d05896c58"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("827eeae5-7b6e-869f-1bc0-63f4475a293b"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("87306d03-33de-f412-799d-bff9bf146f4a"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("8764433b-07dd-2424-c48b-17da320e7898"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("8ef0f236-0631-52c5-af47-b7b98ccd6f9e"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("912978fe-e8ce-cbca-209d-44b1a0bc2876"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("91b64fd9-3a63-6ec1-570a-9584f121680b"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("98ffdf8b-56b2-1c6c-64da-3ff8d2b513c9"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("9b077893-81df-a269-2e3e-6b45c423d295"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("a1a4f29a-22c6-3434-2a80-e8c70000eb66"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("a3200bb2-eb1f-e929-b685-df03251b4856"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("aed3d52a-f986-df11-d80b-073acced45cb"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("b228da17-6c1f-2938-3027-20da5e64505e"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("ba459564-1ce8-8a6b-0745-3bc128afb897"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("bcc9a598-6bd5-d620-8862-24aec034d6e2"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("c089c4c3-b848-c14b-8d7e-6731047879ca"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("c70a9f0a-381a-b046-262d-2921ccd6bc24"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("ce4ecc43-b9c6-3a70-6b6b-5f0afdf69d3b"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("cf10a076-477a-409e-e109-4168c600670e"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("cf1f9f44-a322-3242-f392-43ab08e91975"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("d140fab4-e1ef-798c-2341-5d2179f4155a"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("d59a9380-854a-6266-5570-00194277c8b6"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("dcd6d551-ea0a-ba98-fb53-91ad9af4dba5"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("e3cee8f1-7667-49ff-33a9-5c86f3ab14aa"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("f58446a5-a377-57f2-c888-9e20b17d477d"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("f8c29e28-3221-6554-eddc-8128bcf999fe"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("fa7ccd8f-b9b9-aaa6-0768-15726b4f979a"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("150df259-5ebf-bfea-035a-82ff7de4b85f"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("2318fa37-bbf1-82f3-cda1-9b8101244808"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("2660f3eb-d851-035a-bd9e-610ae59d867a"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("26727ed9-4ced-3837-240f-c17b950cbdd5"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("2851532c-8565-0683-0099-d4df8a16380c"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("2bc87b8a-5e13-0774-bb00-780bf3a09d8e"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("358f7969-35bf-20de-7727-a8002341d2f3"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("3a1e6ef8-898e-759e-0853-4da8267b98b9"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("40283c6a-fca2-b710-bd7f-cddf62aca1b9"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("4e327cfe-d41d-c23d-54e4-9d5980c37848"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("57cfa772-d9d7-d285-77e0-231ae50cad1c"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("5b50ebfc-6162-733a-327c-9190a969657b"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("5c55a758-1c14-0ada-f3a6-031e2c9006a4"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("6068ae6f-8c24-10a8-2f90-a748db0e3931"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("6bffb0a5-9486-bf30-5191-d16afcca3934"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("6c7e8a5a-4c21-d805-289e-36f629c13f52"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("72cff6fe-4c5c-6cf0-26fc-ddac2e97d8a1"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("74da3950-424d-7b5f-a037-e7ff772ae950"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("782a2ea6-8120-c4fc-76b5-085f31843c9b"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("79f070a0-eb4c-e61e-8982-a485bf311e52"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("7a048e9a-986c-bd44-374f-db19f0209d82"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("7c48439a-4ae6-f9ac-3a75-0aa7640e69e3"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("83377373-98ee-7050-7962-cc454c69274d"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("8516b726-1622-fac7-7869-87a88179a833"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("87370f03-9a1b-ccbd-190f-c70e9e8b9453"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("87b43a70-c07b-a17d-ddb5-c567ce9b2361"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("884d0d86-67dc-5322-4601-9c532412a23c"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("886d0b0c-1f65-6fbc-ed99-c6c9dc4b6112"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("993cb8aa-8d1e-0484-eba4-5b3dc713eae7"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("9cbf5fe8-88a3-a716-9fe2-85d1d4d08a2c"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("a0e76814-f452-de78-a582-27acd0793035"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("a27dcfdc-af86-ce2c-6893-9dd600c58e8f"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("a516df2b-0c8e-ac69-4626-8951561ba3fb"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("a7b80797-6662-2714-c7db-fdd89a770200"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("aa646765-6738-521c-20dc-df9df6f1daac"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("abd509c9-e6cc-8087-1b5e-b3022e9695d6"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("afe62c2a-d8ee-1107-d73e-001c752777db"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("b55ae5bc-6877-12a9-6991-8107f1467eb0"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("c2675598-37f0-27bb-37bb-3804a480d7b6"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("c6a00de2-109a-4eab-0120-b3edb11434e9"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("cced7ee9-45a3-40d8-49f1-edc79b45790a"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("cd542d26-3b9f-bc98-3914-e8410672bd6b"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("d04ef1fc-e6e0-ef4e-18ab-5ccb9bed2165"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("d0d45e1d-45b5-8a53-d313-322d377e01c8"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("d184b1c8-14dc-78ca-4b12-1b86e8a1247a"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("d1ee3a22-99c3-307e-8112-9cd54a433363"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("d42a9c93-73a6-14a9-1517-43df13632dcb"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("d7ed0a74-9b46-6850-213d-1637c7d1c318"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("dce84885-dc98-47a9-98c8-bcce0c3d0537"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e2db533a-9ef9-e7d0-387a-ba8e394e49fa"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e381414f-e3aa-20ab-7238-ed2c947e51b6"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e5071018-88b2-b4c7-44ec-f1f4b114d372"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e8330f06-3147-5980-b919-04aa547962c6"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e8b9eabe-ba23-ea46-4352-a6068cfeb627"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e8c12788-2cea-dac1-a0b9-eb9ed0f65ea8"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e917205c-73cc-536f-eb11-f08f5dd8fc2f"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e9e023f4-429c-1245-434e-79ff9718ec10"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("ecff27d6-035f-6cfe-747b-ff1be9340247"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("eda0d27a-ee01-ba05-d993-04976f9c79b2"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("f84fc2ff-e68c-fb78-5a7a-53033eb7a606"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"));

            migrationBuilder.AlterColumn<decimal>(
                name: "overall_score",
                table: "survey_responses",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "target_abandonment_rate",
                table: "dialer_campaigns",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "sentiment_score",
                table: "dialer_attempts",
                type: "decimal(5,4)",
                precision: 5,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.InsertData(
                table: "agent_role_assignments",
                columns: new[] { "agent_id", "role_id", "assigned_at", "assigned_by_id" },
                values: new object[] { new Guid("11111111-1111-1111-1111-111111111111"), new Guid("10000000-0000-0000-0000-000000000001"), new DateTime(2025, 12, 7, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.InsertData(
                table: "agent_states",
                columns: new[] { "id", "agent_id", "changed_at", "duration_seconds", "reason", "state" },
                values: new object[] { new Guid("00000000-0000-0000-0000-000000000002"), new Guid("00000000-0000-0000-0000-000000000001"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Initial state - system seeded", 0 });

            migrationBuilder.InsertData(
                table: "permissions",
                columns: new[] { "id", "created_at", "description", "display_order", "module", "name", "system_name" },
                values: new object[,]
                {
                    { new Guid("00f1044b-d701-084a-6f1b-ca5c47eed8db"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View reports and dashboards", 44, "Reports", "View Reports", "reports.view" },
                    { new Guid("0c551b25-d37d-5b7f-ddc1-2e9df6f2fbb9"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View knowledge base articles", 52, "Knowledge", "View Knowledge Base", "knowledge.view" },
                    { new Guid("16f94f2c-229b-578a-03f6-3c6ea012fda7"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create new customers", 41, "Customers", "Create Customers", "customers.create" },
                    { new Guid("1984f296-5875-cc60-fb27-2450364d6f52"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Approve/reject time-off requests", 33, "WFM", "Approve Time-Off", "wfm.timeoff_approve" },
                    { new Guid("2045a716-d785-a484-8ea3-fbf24cb6bcba"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View agent list and details", 2, "Agents", "View Agents", "agents.view" },
                    { new Guid("288e9d0f-0cc9-454d-2d87-a2be6f1d6cd0"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create QA evaluations", 23, "QA", "Evaluate Calls", "qa.evaluate" },
                    { new Guid("303fed8f-87e6-7650-84f5-fa0969bd276f"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View and modify system settings", 62, "System", "Manage Settings", "system.settings_manage" },
                    { new Guid("32678698-416d-5c13-5aa6-92f090f4a5d4"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create, edit, import dialer lists", 29, "Dialer", "Manage Lists", "dialer.lists_manage" },
                    { new Guid("37daeb7a-90c4-322a-a094-daf6ed89eb5c"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View QA scorecards and evaluations", 22, "QA", "View QA", "qa.view" },
                    { new Guid("39c31e07-ee93-5a4b-e4d9-762c50ba44f9"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View available permissions", 61, "System", "View Permissions", "system.permissions_view" },
                    { new Guid("3d849f0c-21f6-20e2-4460-5929738c87f8"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create new tickets", 36, "Tickets", "Create Tickets", "tickets.create" },
                    { new Guid("49b361ee-2d38-ce49-5b1e-12c9d75052ad"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View ticket list and details", 35, "Tickets", "View Tickets", "tickets.view" },
                    { new Guid("4b37b8b6-af85-09a0-1f0f-531305f4a14b"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View customer list and details", 40, "Customers", "View Customers", "customers.view" },
                    { new Guid("4d1003e7-3c68-38f5-f9cb-f263f6bdfeb3"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create, edit, delete IVR flows", 51, "IVR", "Manage IVR", "ivr.manage" },
                    { new Guid("4e26c093-3abd-7dc3-c832-b69b0b3ba7d4"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delete tickets", 38, "Tickets", "Delete Tickets", "tickets.delete" },
                    { new Guid("546abe2a-c5d0-3e59-8545-8f464a9289f7"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View schedule adherence reports", 34, "WFM", "View Adherence", "wfm.adherence_view" },
                    { new Guid("573ec325-e99f-fb18-cfe1-fb6b5ec1e92e"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Edit and delete evaluation forms", 25, "QA", "Manage Forms", "qa.manage_forms" },
                    { new Guid("57878c8a-231a-c0a3-2613-e91c0f898967"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create, edit, delete roles and assign permissions", 60, "System", "Manage Roles", "system.roles_manage" },
                    { new Guid("62f324fa-e608-7d35-3e4c-8d6366875dad"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View recording list", 18, "Recordings", "View Recordings", "recordings.view" },
                    { new Guid("6543f52c-d911-27e4-08e4-862858e1790f"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Play call recordings", 19, "Recordings", "Play Recordings", "recordings.play" },
                    { new Guid("65e40adc-3f93-fa0a-9f98-ac4cb318147d"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Coach agents during calls", 17, "Calls", "Whisper Calls", "calls.whisper" },
                    { new Guid("6e9822bd-5575-a7b2-7cae-c181d9d7cb76"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create new teams", 8, "Teams", "Create Teams", "teams.create" },
                    { new Guid("6f98df0a-18ee-e66b-7b99-946d480c47aa"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create and edit agent schedules", 32, "WFM", "Manage Schedules", "wfm.schedules_manage" },
                    { new Guid("6fbad1ba-b83a-d112-8674-327297176888"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Access and modify system settings", 54, "Admin", "System Settings", "admin.settings" },
                    { new Guid("72397524-d28b-9f9c-5395-7bf1654b072a"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View system audit logs", 55, "Admin", "View Audit Logs", "admin.audit_logs" },
                    { new Guid("72c4b56a-9d36-f57e-7aea-04525c48f2ee"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Edit team information", 9, "Teams", "Edit Teams", "teams.edit" },
                    { new Guid("755110df-805f-5e8b-cf89-fbdefe6c886c"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delete customers", 43, "Customers", "Delete Customers", "customers.delete" },
                    { new Guid("77700af4-58ee-b585-ee45-ed2f59db7f77"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Download recording files", 20, "Recordings", "Download Recordings", "recordings.download" },
                    { new Guid("8325b446-4b38-401d-5032-a0dd4f19dc40"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View dialer campaigns and lists", 27, "Dialer", "View Dialer", "dialer.view" },
                    { new Guid("8a093b69-597e-e197-cc81-97afc0525826"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Listen to live calls (silent)", 15, "Calls", "Monitor Calls", "calls.monitor" },
                    { new Guid("8e721462-74c4-6782-25b3-dd4984148af9"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Edit agent information", 4, "Agents", "Edit Agents", "agents.edit" },
                    { new Guid("8f3542ae-35ad-8d4c-469d-186fac138742"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Manage Do Not Call list", 30, "Dialer", "Manage DNC", "dialer.dnc_manage" },
                    { new Guid("953294cf-31a8-3ada-b397-1e8960676b3b"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View team performance analytics", 48, "Analytics", "Team Analytics", "analytics.teams" },
                    { new Guid("9895017a-d1fb-0dfb-dffb-bcf27712ee26"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create and edit system alerts", 58, "Admin", "Manage Alerts", "admin.alerts" },
                    { new Guid("9cd49f93-61e6-67ee-61ad-ae33c44e0363"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View agent performance analytics", 47, "Analytics", "Agent Analytics", "analytics.agents" },
                    { new Guid("9ddff5f7-334a-ff8a-404b-794f3e4b3daf"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View queue performance analytics", 49, "Analytics", "Queue Analytics", "analytics.queues" },
                    { new Guid("9f4dc699-83af-f0d9-e0d6-2778bda08332"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Assign tickets to agents", 39, "Tickets", "Assign Tickets", "tickets.assign" },
                    { new Guid("a03a2d77-4938-e8d9-fa86-d4aafc9fddaf"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View analytics dashboards", 46, "Analytics", "View Analytics", "analytics.view" },
                    { new Guid("a6e98efb-11e4-4dcf-dba5-45ee1fb02830"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Initiate outbound calls", 13, "Calls", "Make Calls", "calls.make" },
                    { new Guid("aa648871-0ad4-3e26-eb43-9d0b80110ccf"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Access the main dashboard", 1, "Dashboard", "View Dashboard", "dashboard.view" },
                    { new Guid("b304bb77-8549-2366-bfcf-1d4ba1d79733"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Join live calls", 16, "Calls", "Barge Calls", "calls.barge" },
                    { new Guid("b3beb9de-c06d-0621-e29e-82845abe7c4b"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delete recordings", 21, "Recordings", "Delete Recordings", "recordings.delete" },
                    { new Guid("b58d7cfa-2a40-5415-1202-76d7af5270cd"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Transfer calls to other agents/queues", 14, "Calls", "Transfer Calls", "calls.transfer" },
                    { new Guid("b5d12645-1912-dd8a-cd9d-48bf598d0041"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create new agents", 3, "Agents", "Create Agents", "agents.create" },
                    { new Guid("bbc3fbe9-1fb8-1b1b-f7ed-ede557e5dadf"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View all agents' QA scores", 26, "QA", "View All Scores", "qa.view_all_scores" },
                    { new Guid("be0b649c-aa87-17d7-380a-c9c0ab61cb40"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create evaluation forms", 24, "QA", "Create Forms", "qa.create_forms" },
                    { new Guid("c65bb9c8-1111-5317-0fa5-98502ee764fb"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View team list and details", 7, "Teams", "View Teams", "teams.view" },
                    { new Guid("cacc88ad-fbc5-c735-f2b9-ee88015602e1"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Edit ticket information", 37, "Tickets", "Edit Tickets", "tickets.edit" },
                    { new Guid("cbd8ae53-4d1b-fea5-2fa4-d592b6e61c88"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create and edit call queues", 57, "Admin", "Manage Queues", "admin.queues" },
                    { new Guid("cf1e8ed7-aafa-8161-7339-e6f5f8fdcdd4"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delete teams", 10, "Teams", "Delete Teams", "teams.delete" },
                    { new Guid("d04571f7-5ec1-90c6-6de7-5af80d3b08f0"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create and edit SLA rules", 56, "Admin", "Manage SLA Rules", "admin.sla_rules" },
                    { new Guid("df1d5d42-c6c7-aa44-22e4-2e4ddaf659d2"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Export reports to files", 45, "Reports", "Export Reports", "reports.export" },
                    { new Guid("dfdfe221-c9fd-d3d1-a295-34c050324941"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View call logs and history", 12, "Calls", "View Calls", "calls.view" },
                    { new Guid("e052eed4-179b-366c-6a6e-1350a772d3e1"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View IVR flows", 50, "IVR", "View IVR", "ivr.view" },
                    { new Guid("e1d6f831-29de-f379-7efa-a5e0e2837432"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create, edit, start/stop campaigns", 28, "Dialer", "Manage Campaigns", "dialer.campaigns_manage" },
                    { new Guid("e7cbac03-513c-d15e-d47a-1f7b02317938"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Edit customer information", 42, "Customers", "Edit Customers", "customers.edit" },
                    { new Guid("e8df8d15-f611-6d90-57e7-c9a642faa0a9"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Configure external integrations", 59, "Admin", "Manage Integrations", "admin.integrations" },
                    { new Guid("e8f5a306-d02b-7ea8-69a6-c47fca6e7ec9"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View schedules and time-off requests", 31, "WFM", "View WFM", "wfm.view" },
                    { new Guid("ee4240ce-c83b-ef35-e28b-3cccf30b0399"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create, edit, delete knowledge base articles", 53, "Knowledge", "Manage Knowledge Base", "knowledge.manage" },
                    { new Guid("f6785398-3c59-a7a6-2cf4-fe718bf6db6f"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Add/remove team members", 11, "Teams", "Manage Members", "teams.manage_members" },
                    { new Guid("f82a25f1-d6cb-9fd8-194d-12df1ef6b80b"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Assign roles to agents", 6, "Agents", "Assign Roles", "agents.assign_roles" },
                    { new Guid("fc64e679-3493-8d12-eddc-7ef3fa694f96"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delete agents", 5, "Agents", "Delete Agents", "agents.delete" }
                });

            migrationBuilder.InsertData(
                table: "system_settings",
                columns: new[] { "id", "category", "created_at", "data_type", "description", "is_sensitive", "key", "updated_at", "updated_by", "updated_by_agent_id", "value" },
                values: new object[,]
                {
                    { new Guid("031551e6-4294-f109-8189-f4d92a309cf9"), 9, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Enable In-App Notifications", false, "Notification:EnableInApp", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "true" },
                    { new Guid("108801d6-1eab-247f-b235-a526831b1b6e"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Base Webhook URL", false, "Twilio:BaseWebhookUrl", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("1b60d8af-19e5-3d3f-e1c3-42fb18e7dde0"), 6, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Recording Storage Path", false, "RecordingStorage:Path", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "./recordings" },
                    { new Guid("1ed0d6ae-1b9f-8cfe-16f3-1019991d4e67"), 7, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "JWT Issuer", false, "Jwt:Issuer", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "CallCenterAPI" },
                    { new Guid("20377d2d-0a6c-fc45-8fd7-0fe1b112cd69"), 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Default SMS From Number", false, "Sms:FromNumber", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("23e08fa5-7af7-4391-50ce-64f3c0bdcc9b"), 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Default From Name", false, "Email:FromName", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Call Center" },
                    { new Guid("2b644b44-6d05-6d03-291b-1aaeb9366ae9"), 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "SMTP Username", false, "Email:SmtpUsername", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("2e359bc8-e95b-78fe-1679-162df954a438"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Twilio API Key Secret", true, "Twilio:ApiKeySecret", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("323c34ba-04da-18c5-c315-aea4ec4a1987"), 5, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Transcription API Base URL", false, "Transcription:BaseUrl", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("349d03c3-d959-e1af-aa24-2f870da38685"), 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "WhatsApp Access Token", true, "WhatsApp:AccessToken", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("3c850d91-8ab8-3659-7d69-f51cbb726a3c"), 6, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Max File Size (MB)", false, "RecordingStorage:MaxFileSizeMB", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "100" },
                    { new Guid("3d7b2038-8718-8c23-0b21-a1090835f7cc"), 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Enable SMS messaging", false, "Sms:Enabled", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "false" },
                    { new Guid("3fd17700-9a6d-8e41-4730-15e01156ff70"), 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Default From Email", false, "Email:FromEmail", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("44723ad8-5c56-d010-ef3e-f41ba7ec269c"), 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "SMTP Server Hostname", false, "Email:SmtpHost", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("47feeaf4-7eb2-5e3f-474f-e41e19ad20fd"), 7, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "JWT Secret Key (min 32 chars)", true, "Jwt:Key", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("487c56f5-7161-d22f-338e-fda0ffd3f177"), 8, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Default Service Level (%)", false, "Sla:DefaultServiceLevel", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "80" },
                    { new Guid("4f42ad98-f2d4-17de-ce6d-da150d2a94fa"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Bypass Signature Validation (dev only)", false, "Twilio:BypassSignatureValidation", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "false" },
                    { new Guid("53b0fea6-6453-52db-f729-3a600eec9ef0"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Twilio API Key SID", true, "Twilio:ApiKeySid", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("5ddb2e0f-3f61-5bea-cafd-75478c437858"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Twilio Auth Token", true, "Twilio:AuthToken", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("69c32346-2b99-d49e-a5e6-ddfd5c8d571f"), 8, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Warning Threshold (seconds before breach)", false, "Sla:WarningThreshold", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "20" },
                    { new Guid("71d9e9cb-e11d-0121-5f2e-5680e95bf5d7"), 0, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Date Display Format", false, "General:DateFormat", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "MM/dd/yyyy" },
                    { new Guid("7beedf84-33e7-043f-c563-7796e964f494"), 7, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "JWT Audience", false, "Jwt:Audience", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "CallCenterClient" },
                    { new Guid("7c0a5242-900c-2cca-57a3-14f1e9f25253"), 0, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Default Language", false, "General:Language", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "en" },
                    { new Guid("7c340f2c-3f90-4508-f770-608ec710bb7f"), 8, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Default Response Time (seconds)", false, "Sla:DefaultResponseTime", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "30" },
                    { new Guid("84ff9853-2145-99aa-d4bd-1b5cf9856e0b"), 5, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "API Timeout (seconds)", false, "Transcription:TimeoutSeconds", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "300" },
                    { new Guid("8683d6b8-9153-539c-5f40-3ab18916b0e1"), 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Use mock data for WhatsApp (development)", false, "WhatsApp:UseMockData", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "true" },
                    { new Guid("894cafac-fd55-edc6-e68b-32bb9d127ef6"), 0, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Company Name", false, "General:CompanyName", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Call Center" },
                    { new Guid("917a45a3-a62c-336c-5c99-d652f2ec96f2"), 0, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Default Timezone", false, "General:Timezone", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "UTC" },
                    { new Guid("94292d4d-b4cb-1670-093c-b5363ba27c76"), 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "SMTP Password", true, "Email:SmtpPassword", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("95f556bc-de27-d128-1ce5-8364498621b6"), 6, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Retention Period (days)", false, "RecordingStorage:RetentionDays", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "90" },
                    { new Guid("a1f835b4-ec90-1473-0a69-171b37c1e3a8"), 9, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Enable Sound Alerts", false, "Notification:EnableSound", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "true" },
                    { new Guid("b1ac239e-6884-2009-7258-896d784fb883"), 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Use SSL/TLS", false, "Email:UseSsl", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "true" },
                    { new Guid("bd2ad5f2-ac50-42e2-2be1-07f7433a8152"), 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Webhook Verify Token", true, "WhatsApp:WebhookVerifyToken", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("c295f378-ab12-ffe5-475c-7f2bb664b250"), 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "WhatsApp API Version", false, "WhatsApp:ApiVersion", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "v17.0" },
                    { new Guid("d4a0bd82-ddea-a57a-0b68-4af4eed539b4"), 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "WhatsApp Business Account ID", true, "WhatsApp:BusinessAccountId", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("d7f3f418-cd8a-dd64-8413-ad7e254b25ca"), 5, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Transcription Endpoint", false, "Transcription:Endpoint", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "/api/Transcription" },
                    { new Guid("d8b1e10d-59de-53aa-9638-531fb19fe20a"), 7, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Token Expiration (minutes)", false, "Jwt:ExpirationMinutes", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "60" },
                    { new Guid("da60c4b1-1e84-11bf-0d31-61eee183a555"), 9, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Enable Push Notifications", false, "Notification:EnablePush", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "true" },
                    { new Guid("dcfc1d09-52c4-e77d-3753-ecbed511cdc2"), 9, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Enable Email Notifications", false, "Notification:EnableEmail", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "true" },
                    { new Guid("e901e2bc-736a-7cf7-bbd1-53e15ca67f82"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Voice TwiML App SID", true, "Twilio:VoiceTwimlAppSid", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("f07a47f3-bba9-f610-6178-e7e0aeb768fe"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Webhook Auth Token", true, "Twilio:WebhookAuthToken", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("f247dc6a-bede-4279-911d-7e7d5c663db9"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Twilio Account SID", true, "Twilio:AccountSid", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("f55629f6-50bd-58cb-777d-168893b635c3"), 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "SMS Provider (twilio, vonage, etc.)", false, "Sms:Provider", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "twilio" },
                    { new Guid("f5b04d70-0350-a148-dcdd-e9b8e18c2ec9"), 0, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Time Display Format", false, "General:TimeFormat", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "HH:mm:ss" },
                    { new Guid("f8be3d09-dce3-62dd-3bad-4af871c367ab"), 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "WhatsApp Phone Number ID", true, "WhatsApp:PhoneNumberId", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("fc1774af-6441-d919-1eb9-981ca5184daa"), 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "SMTP Port", false, "Email:SmtpPort", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "587" },
                    { new Guid("fc86a6f2-c688-df13-95e1-e5ca4943838a"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Default Caller ID", false, "Twilio:CallerId", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" }
                });

            migrationBuilder.InsertData(
                table: "role_permissions",
                columns: new[] { "permission_id", "role_id", "assigned_at", "assigned_by_id" },
                values: new object[,]
                {
                    { new Guid("00f1044b-d701-084a-6f1b-ca5c47eed8db"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("0c551b25-d37d-5b7f-ddc1-2e9df6f2fbb9"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("16f94f2c-229b-578a-03f6-3c6ea012fda7"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("1984f296-5875-cc60-fb27-2450364d6f52"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2045a716-d785-a484-8ea3-fbf24cb6bcba"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("288e9d0f-0cc9-454d-2d87-a2be6f1d6cd0"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("303fed8f-87e6-7650-84f5-fa0969bd276f"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("32678698-416d-5c13-5aa6-92f090f4a5d4"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("37daeb7a-90c4-322a-a094-daf6ed89eb5c"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("39c31e07-ee93-5a4b-e4d9-762c50ba44f9"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3d849f0c-21f6-20e2-4460-5929738c87f8"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("49b361ee-2d38-ce49-5b1e-12c9d75052ad"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("4b37b8b6-af85-09a0-1f0f-531305f4a14b"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("4d1003e7-3c68-38f5-f9cb-f263f6bdfeb3"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("4e26c093-3abd-7dc3-c832-b69b0b3ba7d4"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("546abe2a-c5d0-3e59-8545-8f464a9289f7"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("573ec325-e99f-fb18-cfe1-fb6b5ec1e92e"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("57878c8a-231a-c0a3-2613-e91c0f898967"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("62f324fa-e608-7d35-3e4c-8d6366875dad"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6543f52c-d911-27e4-08e4-862858e1790f"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("65e40adc-3f93-fa0a-9f98-ac4cb318147d"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6e9822bd-5575-a7b2-7cae-c181d9d7cb76"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6f98df0a-18ee-e66b-7b99-946d480c47aa"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6fbad1ba-b83a-d112-8674-327297176888"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("72397524-d28b-9f9c-5395-7bf1654b072a"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("72c4b56a-9d36-f57e-7aea-04525c48f2ee"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("755110df-805f-5e8b-cf89-fbdefe6c886c"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("77700af4-58ee-b585-ee45-ed2f59db7f77"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8325b446-4b38-401d-5032-a0dd4f19dc40"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8a093b69-597e-e197-cc81-97afc0525826"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8e721462-74c4-6782-25b3-dd4984148af9"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8f3542ae-35ad-8d4c-469d-186fac138742"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("953294cf-31a8-3ada-b397-1e8960676b3b"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("9895017a-d1fb-0dfb-dffb-bcf27712ee26"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("9cd49f93-61e6-67ee-61ad-ae33c44e0363"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("9ddff5f7-334a-ff8a-404b-794f3e4b3daf"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("9f4dc699-83af-f0d9-e0d6-2778bda08332"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a03a2d77-4938-e8d9-fa86-d4aafc9fddaf"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a6e98efb-11e4-4dcf-dba5-45ee1fb02830"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("aa648871-0ad4-3e26-eb43-9d0b80110ccf"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b304bb77-8549-2366-bfcf-1d4ba1d79733"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b3beb9de-c06d-0621-e29e-82845abe7c4b"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b58d7cfa-2a40-5415-1202-76d7af5270cd"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b5d12645-1912-dd8a-cd9d-48bf598d0041"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("bbc3fbe9-1fb8-1b1b-f7ed-ede557e5dadf"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("be0b649c-aa87-17d7-380a-c9c0ab61cb40"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c65bb9c8-1111-5317-0fa5-98502ee764fb"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cacc88ad-fbc5-c735-f2b9-ee88015602e1"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cbd8ae53-4d1b-fea5-2fa4-d592b6e61c88"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cf1e8ed7-aafa-8161-7339-e6f5f8fdcdd4"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d04571f7-5ec1-90c6-6de7-5af80d3b08f0"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("df1d5d42-c6c7-aa44-22e4-2e4ddaf659d2"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("dfdfe221-c9fd-d3d1-a295-34c050324941"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e052eed4-179b-366c-6a6e-1350a772d3e1"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e1d6f831-29de-f379-7efa-a5e0e2837432"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e7cbac03-513c-d15e-d47a-1f7b02317938"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8df8d15-f611-6d90-57e7-c9a642faa0a9"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8f5a306-d02b-7ea8-69a6-c47fca6e7ec9"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("ee4240ce-c83b-ef35-e28b-3cccf30b0399"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("f6785398-3c59-a7a6-2cf4-fe718bf6db6f"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("f82a25f1-d6cb-9fd8-194d-12df1ef6b80b"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("fc64e679-3493-8d12-eddc-7ef3fa694f96"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("00f1044b-d701-084a-6f1b-ca5c47eed8db"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("0c551b25-d37d-5b7f-ddc1-2e9df6f2fbb9"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("16f94f2c-229b-578a-03f6-3c6ea012fda7"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("1984f296-5875-cc60-fb27-2450364d6f52"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2045a716-d785-a484-8ea3-fbf24cb6bcba"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("288e9d0f-0cc9-454d-2d87-a2be6f1d6cd0"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("32678698-416d-5c13-5aa6-92f090f4a5d4"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("37daeb7a-90c4-322a-a094-daf6ed89eb5c"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3d849f0c-21f6-20e2-4460-5929738c87f8"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("49b361ee-2d38-ce49-5b1e-12c9d75052ad"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("4b37b8b6-af85-09a0-1f0f-531305f4a14b"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("4e26c093-3abd-7dc3-c832-b69b0b3ba7d4"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("546abe2a-c5d0-3e59-8545-8f464a9289f7"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("573ec325-e99f-fb18-cfe1-fb6b5ec1e92e"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("62f324fa-e608-7d35-3e4c-8d6366875dad"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6543f52c-d911-27e4-08e4-862858e1790f"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("65e40adc-3f93-fa0a-9f98-ac4cb318147d"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6e9822bd-5575-a7b2-7cae-c181d9d7cb76"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6f98df0a-18ee-e66b-7b99-946d480c47aa"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("72c4b56a-9d36-f57e-7aea-04525c48f2ee"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("755110df-805f-5e8b-cf89-fbdefe6c886c"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("77700af4-58ee-b585-ee45-ed2f59db7f77"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8325b446-4b38-401d-5032-a0dd4f19dc40"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8a093b69-597e-e197-cc81-97afc0525826"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8e721462-74c4-6782-25b3-dd4984148af9"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8f3542ae-35ad-8d4c-469d-186fac138742"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("953294cf-31a8-3ada-b397-1e8960676b3b"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("9cd49f93-61e6-67ee-61ad-ae33c44e0363"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("9ddff5f7-334a-ff8a-404b-794f3e4b3daf"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("9f4dc699-83af-f0d9-e0d6-2778bda08332"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a03a2d77-4938-e8d9-fa86-d4aafc9fddaf"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a6e98efb-11e4-4dcf-dba5-45ee1fb02830"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("aa648871-0ad4-3e26-eb43-9d0b80110ccf"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b304bb77-8549-2366-bfcf-1d4ba1d79733"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b3beb9de-c06d-0621-e29e-82845abe7c4b"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b58d7cfa-2a40-5415-1202-76d7af5270cd"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b5d12645-1912-dd8a-cd9d-48bf598d0041"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("bbc3fbe9-1fb8-1b1b-f7ed-ede557e5dadf"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("be0b649c-aa87-17d7-380a-c9c0ab61cb40"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c65bb9c8-1111-5317-0fa5-98502ee764fb"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cacc88ad-fbc5-c735-f2b9-ee88015602e1"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cf1e8ed7-aafa-8161-7339-e6f5f8fdcdd4"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("df1d5d42-c6c7-aa44-22e4-2e4ddaf659d2"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("dfdfe221-c9fd-d3d1-a295-34c050324941"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e1d6f831-29de-f379-7efa-a5e0e2837432"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e7cbac03-513c-d15e-d47a-1f7b02317938"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8f5a306-d02b-7ea8-69a6-c47fca6e7ec9"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("ee4240ce-c83b-ef35-e28b-3cccf30b0399"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("f6785398-3c59-a7a6-2cf4-fe718bf6db6f"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("f82a25f1-d6cb-9fd8-194d-12df1ef6b80b"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("fc64e679-3493-8d12-eddc-7ef3fa694f96"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2045a716-d785-a484-8ea3-fbf24cb6bcba"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("288e9d0f-0cc9-454d-2d87-a2be6f1d6cd0"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("37daeb7a-90c4-322a-a094-daf6ed89eb5c"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("573ec325-e99f-fb18-cfe1-fb6b5ec1e92e"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("62f324fa-e608-7d35-3e4c-8d6366875dad"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6543f52c-d911-27e4-08e4-862858e1790f"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("77700af4-58ee-b585-ee45-ed2f59db7f77"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a03a2d77-4938-e8d9-fa86-d4aafc9fddaf"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("aa648871-0ad4-3e26-eb43-9d0b80110ccf"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b3beb9de-c06d-0621-e29e-82845abe7c4b"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("bbc3fbe9-1fb8-1b1b-f7ed-ede557e5dadf"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("be0b649c-aa87-17d7-380a-c9c0ab61cb40"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c65bb9c8-1111-5317-0fa5-98502ee764fb"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("00f1044b-d701-084a-6f1b-ca5c47eed8db"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("0c551b25-d37d-5b7f-ddc1-2e9df6f2fbb9"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("16f94f2c-229b-578a-03f6-3c6ea012fda7"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("1984f296-5875-cc60-fb27-2450364d6f52"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2045a716-d785-a484-8ea3-fbf24cb6bcba"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3d849f0c-21f6-20e2-4460-5929738c87f8"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("49b361ee-2d38-ce49-5b1e-12c9d75052ad"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("4b37b8b6-af85-09a0-1f0f-531305f4a14b"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("4e26c093-3abd-7dc3-c832-b69b0b3ba7d4"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("546abe2a-c5d0-3e59-8545-8f464a9289f7"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6e9822bd-5575-a7b2-7cae-c181d9d7cb76"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6f98df0a-18ee-e66b-7b99-946d480c47aa"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("72c4b56a-9d36-f57e-7aea-04525c48f2ee"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("755110df-805f-5e8b-cf89-fbdefe6c886c"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("9f4dc699-83af-f0d9-e0d6-2778bda08332"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a03a2d77-4938-e8d9-fa86-d4aafc9fddaf"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("aa648871-0ad4-3e26-eb43-9d0b80110ccf"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c65bb9c8-1111-5317-0fa5-98502ee764fb"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cacc88ad-fbc5-c735-f2b9-ee88015602e1"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cf1e8ed7-aafa-8161-7339-e6f5f8fdcdd4"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("dfdfe221-c9fd-d3d1-a295-34c050324941"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e7cbac03-513c-d15e-d47a-1f7b02317938"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8f5a306-d02b-7ea8-69a6-c47fca6e7ec9"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("f6785398-3c59-a7a6-2cf4-fe718bf6db6f"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("0c551b25-d37d-5b7f-ddc1-2e9df6f2fbb9"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("16f94f2c-229b-578a-03f6-3c6ea012fda7"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3d849f0c-21f6-20e2-4460-5929738c87f8"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("49b361ee-2d38-ce49-5b1e-12c9d75052ad"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("4b37b8b6-af85-09a0-1f0f-531305f4a14b"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a6e98efb-11e4-4dcf-dba5-45ee1fb02830"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("aa648871-0ad4-3e26-eb43-9d0b80110ccf"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b58d7cfa-2a40-5415-1202-76d7af5270cd"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cacc88ad-fbc5-c735-f2b9-ee88015602e1"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("dfdfe221-c9fd-d3d1-a295-34c050324941"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e7cbac03-513c-d15e-d47a-1f7b02317938"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "agent_role_assignments",
                keyColumns: new[] { "agent_id", "role_id" },
                keyValues: new object[] { new Guid("11111111-1111-1111-1111-111111111111"), new Guid("10000000-0000-0000-0000-000000000001") });

            migrationBuilder.DeleteData(
                table: "agent_states",
                keyColumn: "id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("00f1044b-d701-084a-6f1b-ca5c47eed8db"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("0c551b25-d37d-5b7f-ddc1-2e9df6f2fbb9"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("16f94f2c-229b-578a-03f6-3c6ea012fda7"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("1984f296-5875-cc60-fb27-2450364d6f52"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("2045a716-d785-a484-8ea3-fbf24cb6bcba"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("288e9d0f-0cc9-454d-2d87-a2be6f1d6cd0"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("303fed8f-87e6-7650-84f5-fa0969bd276f"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("32678698-416d-5c13-5aa6-92f090f4a5d4"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("37daeb7a-90c4-322a-a094-daf6ed89eb5c"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("39c31e07-ee93-5a4b-e4d9-762c50ba44f9"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("3d849f0c-21f6-20e2-4460-5929738c87f8"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("49b361ee-2d38-ce49-5b1e-12c9d75052ad"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("4b37b8b6-af85-09a0-1f0f-531305f4a14b"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("4d1003e7-3c68-38f5-f9cb-f263f6bdfeb3"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("4e26c093-3abd-7dc3-c832-b69b0b3ba7d4"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("546abe2a-c5d0-3e59-8545-8f464a9289f7"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("573ec325-e99f-fb18-cfe1-fb6b5ec1e92e"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("57878c8a-231a-c0a3-2613-e91c0f898967"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("62f324fa-e608-7d35-3e4c-8d6366875dad"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6543f52c-d911-27e4-08e4-862858e1790f"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("65e40adc-3f93-fa0a-9f98-ac4cb318147d"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6e9822bd-5575-a7b2-7cae-c181d9d7cb76"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6f98df0a-18ee-e66b-7b99-946d480c47aa"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6fbad1ba-b83a-d112-8674-327297176888"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("72397524-d28b-9f9c-5395-7bf1654b072a"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("72c4b56a-9d36-f57e-7aea-04525c48f2ee"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("755110df-805f-5e8b-cf89-fbdefe6c886c"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("77700af4-58ee-b585-ee45-ed2f59db7f77"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("8325b446-4b38-401d-5032-a0dd4f19dc40"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("8a093b69-597e-e197-cc81-97afc0525826"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("8e721462-74c4-6782-25b3-dd4984148af9"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("8f3542ae-35ad-8d4c-469d-186fac138742"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("953294cf-31a8-3ada-b397-1e8960676b3b"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("9895017a-d1fb-0dfb-dffb-bcf27712ee26"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("9cd49f93-61e6-67ee-61ad-ae33c44e0363"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("9ddff5f7-334a-ff8a-404b-794f3e4b3daf"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("9f4dc699-83af-f0d9-e0d6-2778bda08332"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("a03a2d77-4938-e8d9-fa86-d4aafc9fddaf"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("a6e98efb-11e4-4dcf-dba5-45ee1fb02830"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("aa648871-0ad4-3e26-eb43-9d0b80110ccf"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("b304bb77-8549-2366-bfcf-1d4ba1d79733"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("b3beb9de-c06d-0621-e29e-82845abe7c4b"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("b58d7cfa-2a40-5415-1202-76d7af5270cd"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("b5d12645-1912-dd8a-cd9d-48bf598d0041"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("bbc3fbe9-1fb8-1b1b-f7ed-ede557e5dadf"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("be0b649c-aa87-17d7-380a-c9c0ab61cb40"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("c65bb9c8-1111-5317-0fa5-98502ee764fb"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("cacc88ad-fbc5-c735-f2b9-ee88015602e1"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("cbd8ae53-4d1b-fea5-2fa4-d592b6e61c88"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("cf1e8ed7-aafa-8161-7339-e6f5f8fdcdd4"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("d04571f7-5ec1-90c6-6de7-5af80d3b08f0"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("df1d5d42-c6c7-aa44-22e4-2e4ddaf659d2"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("dfdfe221-c9fd-d3d1-a295-34c050324941"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e052eed4-179b-366c-6a6e-1350a772d3e1"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e1d6f831-29de-f379-7efa-a5e0e2837432"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e7cbac03-513c-d15e-d47a-1f7b02317938"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e8df8d15-f611-6d90-57e7-c9a642faa0a9"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e8f5a306-d02b-7ea8-69a6-c47fca6e7ec9"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("ee4240ce-c83b-ef35-e28b-3cccf30b0399"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("f6785398-3c59-a7a6-2cf4-fe718bf6db6f"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("f82a25f1-d6cb-9fd8-194d-12df1ef6b80b"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("fc64e679-3493-8d12-eddc-7ef3fa694f96"), new Guid("10000000-0000-0000-0000-000000000002") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("00f1044b-d701-084a-6f1b-ca5c47eed8db"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("0c551b25-d37d-5b7f-ddc1-2e9df6f2fbb9"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("16f94f2c-229b-578a-03f6-3c6ea012fda7"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("1984f296-5875-cc60-fb27-2450364d6f52"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("2045a716-d785-a484-8ea3-fbf24cb6bcba"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("288e9d0f-0cc9-454d-2d87-a2be6f1d6cd0"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("32678698-416d-5c13-5aa6-92f090f4a5d4"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("37daeb7a-90c4-322a-a094-daf6ed89eb5c"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("3d849f0c-21f6-20e2-4460-5929738c87f8"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("49b361ee-2d38-ce49-5b1e-12c9d75052ad"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("4b37b8b6-af85-09a0-1f0f-531305f4a14b"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("4e26c093-3abd-7dc3-c832-b69b0b3ba7d4"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("546abe2a-c5d0-3e59-8545-8f464a9289f7"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("573ec325-e99f-fb18-cfe1-fb6b5ec1e92e"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("62f324fa-e608-7d35-3e4c-8d6366875dad"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6543f52c-d911-27e4-08e4-862858e1790f"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("65e40adc-3f93-fa0a-9f98-ac4cb318147d"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6e9822bd-5575-a7b2-7cae-c181d9d7cb76"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6f98df0a-18ee-e66b-7b99-946d480c47aa"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("72c4b56a-9d36-f57e-7aea-04525c48f2ee"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("755110df-805f-5e8b-cf89-fbdefe6c886c"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("77700af4-58ee-b585-ee45-ed2f59db7f77"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("8325b446-4b38-401d-5032-a0dd4f19dc40"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("8a093b69-597e-e197-cc81-97afc0525826"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("8e721462-74c4-6782-25b3-dd4984148af9"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("8f3542ae-35ad-8d4c-469d-186fac138742"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("953294cf-31a8-3ada-b397-1e8960676b3b"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("9cd49f93-61e6-67ee-61ad-ae33c44e0363"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("9ddff5f7-334a-ff8a-404b-794f3e4b3daf"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("9f4dc699-83af-f0d9-e0d6-2778bda08332"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("a03a2d77-4938-e8d9-fa86-d4aafc9fddaf"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("a6e98efb-11e4-4dcf-dba5-45ee1fb02830"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("aa648871-0ad4-3e26-eb43-9d0b80110ccf"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("b304bb77-8549-2366-bfcf-1d4ba1d79733"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("b3beb9de-c06d-0621-e29e-82845abe7c4b"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("b58d7cfa-2a40-5415-1202-76d7af5270cd"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("b5d12645-1912-dd8a-cd9d-48bf598d0041"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("bbc3fbe9-1fb8-1b1b-f7ed-ede557e5dadf"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("be0b649c-aa87-17d7-380a-c9c0ab61cb40"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("c65bb9c8-1111-5317-0fa5-98502ee764fb"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("cacc88ad-fbc5-c735-f2b9-ee88015602e1"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("cf1e8ed7-aafa-8161-7339-e6f5f8fdcdd4"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("df1d5d42-c6c7-aa44-22e4-2e4ddaf659d2"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("dfdfe221-c9fd-d3d1-a295-34c050324941"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e1d6f831-29de-f379-7efa-a5e0e2837432"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e7cbac03-513c-d15e-d47a-1f7b02317938"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e8f5a306-d02b-7ea8-69a6-c47fca6e7ec9"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("ee4240ce-c83b-ef35-e28b-3cccf30b0399"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("f6785398-3c59-a7a6-2cf4-fe718bf6db6f"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("f82a25f1-d6cb-9fd8-194d-12df1ef6b80b"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("fc64e679-3493-8d12-eddc-7ef3fa694f96"), new Guid("10000000-0000-0000-0000-000000000003") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("2045a716-d785-a484-8ea3-fbf24cb6bcba"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("288e9d0f-0cc9-454d-2d87-a2be6f1d6cd0"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("37daeb7a-90c4-322a-a094-daf6ed89eb5c"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("573ec325-e99f-fb18-cfe1-fb6b5ec1e92e"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("62f324fa-e608-7d35-3e4c-8d6366875dad"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6543f52c-d911-27e4-08e4-862858e1790f"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("77700af4-58ee-b585-ee45-ed2f59db7f77"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("a03a2d77-4938-e8d9-fa86-d4aafc9fddaf"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("aa648871-0ad4-3e26-eb43-9d0b80110ccf"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("b3beb9de-c06d-0621-e29e-82845abe7c4b"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("bbc3fbe9-1fb8-1b1b-f7ed-ede557e5dadf"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("be0b649c-aa87-17d7-380a-c9c0ab61cb40"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("c65bb9c8-1111-5317-0fa5-98502ee764fb"), new Guid("10000000-0000-0000-0000-000000000004") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("00f1044b-d701-084a-6f1b-ca5c47eed8db"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("0c551b25-d37d-5b7f-ddc1-2e9df6f2fbb9"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("16f94f2c-229b-578a-03f6-3c6ea012fda7"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("1984f296-5875-cc60-fb27-2450364d6f52"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("2045a716-d785-a484-8ea3-fbf24cb6bcba"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("3d849f0c-21f6-20e2-4460-5929738c87f8"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("49b361ee-2d38-ce49-5b1e-12c9d75052ad"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("4b37b8b6-af85-09a0-1f0f-531305f4a14b"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("4e26c093-3abd-7dc3-c832-b69b0b3ba7d4"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("546abe2a-c5d0-3e59-8545-8f464a9289f7"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6e9822bd-5575-a7b2-7cae-c181d9d7cb76"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("6f98df0a-18ee-e66b-7b99-946d480c47aa"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("72c4b56a-9d36-f57e-7aea-04525c48f2ee"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("755110df-805f-5e8b-cf89-fbdefe6c886c"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("9f4dc699-83af-f0d9-e0d6-2778bda08332"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("a03a2d77-4938-e8d9-fa86-d4aafc9fddaf"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("aa648871-0ad4-3e26-eb43-9d0b80110ccf"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("c65bb9c8-1111-5317-0fa5-98502ee764fb"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("cacc88ad-fbc5-c735-f2b9-ee88015602e1"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("cf1e8ed7-aafa-8161-7339-e6f5f8fdcdd4"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("dfdfe221-c9fd-d3d1-a295-34c050324941"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e7cbac03-513c-d15e-d47a-1f7b02317938"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e8f5a306-d02b-7ea8-69a6-c47fca6e7ec9"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("f6785398-3c59-a7a6-2cf4-fe718bf6db6f"), new Guid("10000000-0000-0000-0000-000000000005") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("0c551b25-d37d-5b7f-ddc1-2e9df6f2fbb9"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("16f94f2c-229b-578a-03f6-3c6ea012fda7"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("3d849f0c-21f6-20e2-4460-5929738c87f8"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("49b361ee-2d38-ce49-5b1e-12c9d75052ad"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("4b37b8b6-af85-09a0-1f0f-531305f4a14b"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("a6e98efb-11e4-4dcf-dba5-45ee1fb02830"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("aa648871-0ad4-3e26-eb43-9d0b80110ccf"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("b58d7cfa-2a40-5415-1202-76d7af5270cd"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("cacc88ad-fbc5-c735-f2b9-ee88015602e1"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("dfdfe221-c9fd-d3d1-a295-34c050324941"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("e7cbac03-513c-d15e-d47a-1f7b02317938"), new Guid("10000000-0000-0000-0000-000000000006") });

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("031551e6-4294-f109-8189-f4d92a309cf9"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("108801d6-1eab-247f-b235-a526831b1b6e"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("1b60d8af-19e5-3d3f-e1c3-42fb18e7dde0"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("1ed0d6ae-1b9f-8cfe-16f3-1019991d4e67"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("20377d2d-0a6c-fc45-8fd7-0fe1b112cd69"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("23e08fa5-7af7-4391-50ce-64f3c0bdcc9b"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("2b644b44-6d05-6d03-291b-1aaeb9366ae9"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("2e359bc8-e95b-78fe-1679-162df954a438"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("323c34ba-04da-18c5-c315-aea4ec4a1987"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("349d03c3-d959-e1af-aa24-2f870da38685"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("3c850d91-8ab8-3659-7d69-f51cbb726a3c"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("3d7b2038-8718-8c23-0b21-a1090835f7cc"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("3fd17700-9a6d-8e41-4730-15e01156ff70"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("44723ad8-5c56-d010-ef3e-f41ba7ec269c"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("47feeaf4-7eb2-5e3f-474f-e41e19ad20fd"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("487c56f5-7161-d22f-338e-fda0ffd3f177"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("4f42ad98-f2d4-17de-ce6d-da150d2a94fa"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("53b0fea6-6453-52db-f729-3a600eec9ef0"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("5ddb2e0f-3f61-5bea-cafd-75478c437858"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("69c32346-2b99-d49e-a5e6-ddfd5c8d571f"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("71d9e9cb-e11d-0121-5f2e-5680e95bf5d7"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("7beedf84-33e7-043f-c563-7796e964f494"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("7c0a5242-900c-2cca-57a3-14f1e9f25253"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("7c340f2c-3f90-4508-f770-608ec710bb7f"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("84ff9853-2145-99aa-d4bd-1b5cf9856e0b"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("8683d6b8-9153-539c-5f40-3ab18916b0e1"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("894cafac-fd55-edc6-e68b-32bb9d127ef6"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("917a45a3-a62c-336c-5c99-d652f2ec96f2"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("94292d4d-b4cb-1670-093c-b5363ba27c76"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("95f556bc-de27-d128-1ce5-8364498621b6"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("a1f835b4-ec90-1473-0a69-171b37c1e3a8"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("b1ac239e-6884-2009-7258-896d784fb883"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("bd2ad5f2-ac50-42e2-2be1-07f7433a8152"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("c295f378-ab12-ffe5-475c-7f2bb664b250"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("d4a0bd82-ddea-a57a-0b68-4af4eed539b4"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("d7f3f418-cd8a-dd64-8413-ad7e254b25ca"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("d8b1e10d-59de-53aa-9638-531fb19fe20a"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("da60c4b1-1e84-11bf-0d31-61eee183a555"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("dcfc1d09-52c4-e77d-3753-ecbed511cdc2"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("e901e2bc-736a-7cf7-bbd1-53e15ca67f82"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("f07a47f3-bba9-f610-6178-e7e0aeb768fe"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("f247dc6a-bede-4279-911d-7e7d5c663db9"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("f55629f6-50bd-58cb-777d-168893b635c3"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("f5b04d70-0350-a148-dcdd-e9b8e18c2ec9"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("f8be3d09-dce3-62dd-3bad-4af871c367ab"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("fc1774af-6441-d919-1eb9-981ca5184daa"));

            migrationBuilder.DeleteData(
                table: "system_settings",
                keyColumn: "id",
                keyValue: new Guid("fc86a6f2-c688-df13-95e1-e5ca4943838a"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("00f1044b-d701-084a-6f1b-ca5c47eed8db"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("0c551b25-d37d-5b7f-ddc1-2e9df6f2fbb9"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("16f94f2c-229b-578a-03f6-3c6ea012fda7"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("1984f296-5875-cc60-fb27-2450364d6f52"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("2045a716-d785-a484-8ea3-fbf24cb6bcba"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("288e9d0f-0cc9-454d-2d87-a2be6f1d6cd0"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("303fed8f-87e6-7650-84f5-fa0969bd276f"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("32678698-416d-5c13-5aa6-92f090f4a5d4"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("37daeb7a-90c4-322a-a094-daf6ed89eb5c"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("39c31e07-ee93-5a4b-e4d9-762c50ba44f9"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("3d849f0c-21f6-20e2-4460-5929738c87f8"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("49b361ee-2d38-ce49-5b1e-12c9d75052ad"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("4b37b8b6-af85-09a0-1f0f-531305f4a14b"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("4d1003e7-3c68-38f5-f9cb-f263f6bdfeb3"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("4e26c093-3abd-7dc3-c832-b69b0b3ba7d4"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("546abe2a-c5d0-3e59-8545-8f464a9289f7"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("573ec325-e99f-fb18-cfe1-fb6b5ec1e92e"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("57878c8a-231a-c0a3-2613-e91c0f898967"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("62f324fa-e608-7d35-3e4c-8d6366875dad"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("6543f52c-d911-27e4-08e4-862858e1790f"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("65e40adc-3f93-fa0a-9f98-ac4cb318147d"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("6e9822bd-5575-a7b2-7cae-c181d9d7cb76"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("6f98df0a-18ee-e66b-7b99-946d480c47aa"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("6fbad1ba-b83a-d112-8674-327297176888"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("72397524-d28b-9f9c-5395-7bf1654b072a"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("72c4b56a-9d36-f57e-7aea-04525c48f2ee"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("755110df-805f-5e8b-cf89-fbdefe6c886c"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("77700af4-58ee-b585-ee45-ed2f59db7f77"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("8325b446-4b38-401d-5032-a0dd4f19dc40"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("8a093b69-597e-e197-cc81-97afc0525826"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("8e721462-74c4-6782-25b3-dd4984148af9"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("8f3542ae-35ad-8d4c-469d-186fac138742"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("953294cf-31a8-3ada-b397-1e8960676b3b"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("9895017a-d1fb-0dfb-dffb-bcf27712ee26"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("9cd49f93-61e6-67ee-61ad-ae33c44e0363"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("9ddff5f7-334a-ff8a-404b-794f3e4b3daf"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("9f4dc699-83af-f0d9-e0d6-2778bda08332"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("a03a2d77-4938-e8d9-fa86-d4aafc9fddaf"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("a6e98efb-11e4-4dcf-dba5-45ee1fb02830"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("aa648871-0ad4-3e26-eb43-9d0b80110ccf"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("b304bb77-8549-2366-bfcf-1d4ba1d79733"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("b3beb9de-c06d-0621-e29e-82845abe7c4b"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("b58d7cfa-2a40-5415-1202-76d7af5270cd"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("b5d12645-1912-dd8a-cd9d-48bf598d0041"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("bbc3fbe9-1fb8-1b1b-f7ed-ede557e5dadf"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("be0b649c-aa87-17d7-380a-c9c0ab61cb40"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("c65bb9c8-1111-5317-0fa5-98502ee764fb"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("cacc88ad-fbc5-c735-f2b9-ee88015602e1"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("cbd8ae53-4d1b-fea5-2fa4-d592b6e61c88"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("cf1e8ed7-aafa-8161-7339-e6f5f8fdcdd4"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("d04571f7-5ec1-90c6-6de7-5af80d3b08f0"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("df1d5d42-c6c7-aa44-22e4-2e4ddaf659d2"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("dfdfe221-c9fd-d3d1-a295-34c050324941"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e052eed4-179b-366c-6a6e-1350a772d3e1"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e1d6f831-29de-f379-7efa-a5e0e2837432"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e7cbac03-513c-d15e-d47a-1f7b02317938"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e8df8d15-f611-6d90-57e7-c9a642faa0a9"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("e8f5a306-d02b-7ea8-69a6-c47fca6e7ec9"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("ee4240ce-c83b-ef35-e28b-3cccf30b0399"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("f6785398-3c59-a7a6-2cf4-fe718bf6db6f"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("f82a25f1-d6cb-9fd8-194d-12df1ef6b80b"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "id",
                keyValue: new Guid("fc64e679-3493-8d12-eddc-7ef3fa694f96"));

            migrationBuilder.AlterColumn<decimal>(
                name: "overall_score",
                table: "survey_responses",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)",
                oldPrecision: 5,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "target_abandonment_rate",
                table: "dialer_campaigns",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)",
                oldPrecision: 5,
                oldScale: 2);

            migrationBuilder.AlterColumn<decimal>(
                name: "sentiment_score",
                table: "dialer_attempts",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,4)",
                oldPrecision: 5,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.InsertData(
                table: "permissions",
                columns: new[] { "id", "created_at", "description", "display_order", "module", "name", "system_name" },
                values: new object[,]
                {
                    { new Guid("150df259-5ebf-bfea-035a-82ff7de4b85f"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Initiate outbound calls", 13, "Calls", "Make Calls", "calls.make" },
                    { new Guid("2318fa37-bbf1-82f3-cda1-9b8101244808"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Manage Do Not Call list", 30, "Dialer", "Manage DNC", "dialer.dnc_manage" },
                    { new Guid("2660f3eb-d851-035a-bd9e-610ae59d867a"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Transfer calls to other agents/queues", 14, "Calls", "Transfer Calls", "calls.transfer" },
                    { new Guid("26727ed9-4ced-3837-240f-c17b950cbdd5"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create new customers", 41, "Customers", "Create Customers", "customers.create" },
                    { new Guid("2851532c-8565-0683-0099-d4df8a16380c"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delete tickets", 38, "Tickets", "Delete Tickets", "tickets.delete" },
                    { new Guid("2bc87b8a-5e13-0774-bb00-780bf3a09d8e"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create new teams", 8, "Teams", "Create Teams", "teams.create" },
                    { new Guid("358f7969-35bf-20de-7727-a8002341d2f3"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View ticket list and details", 35, "Tickets", "View Tickets", "tickets.view" },
                    { new Guid("3a1e6ef8-898e-759e-0853-4da8267b98b9"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create evaluation forms", 24, "QA", "Create Forms", "qa.create_forms" },
                    { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Access the main dashboard", 1, "Dashboard", "View Dashboard", "dashboard.view" },
                    { new Guid("40283c6a-fca2-b710-bd7f-cddf62aca1b9"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Export reports to files", 45, "Reports", "Export Reports", "reports.export" },
                    { new Guid("4e327cfe-d41d-c23d-54e4-9d5980c37848"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create, edit, delete knowledge base articles", 53, "Knowledge", "Manage Knowledge Base", "knowledge.manage" },
                    { new Guid("57cfa772-d9d7-d285-77e0-231ae50cad1c"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View and modify system settings", 62, "System", "Manage Settings", "system.settings_manage" },
                    { new Guid("5b50ebfc-6162-733a-327c-9190a969657b"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delete customers", 43, "Customers", "Delete Customers", "customers.delete" },
                    { new Guid("5c55a758-1c14-0ada-f3a6-031e2c9006a4"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View agent performance analytics", 47, "Analytics", "Agent Analytics", "analytics.agents" },
                    { new Guid("6068ae6f-8c24-10a8-2f90-a748db0e3931"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View IVR flows", 50, "IVR", "View IVR", "ivr.view" },
                    { new Guid("6bffb0a5-9486-bf30-5191-d16afcca3934"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Play call recordings", 19, "Recordings", "Play Recordings", "recordings.play" },
                    { new Guid("6c7e8a5a-4c21-d805-289e-36f629c13f52"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create, edit, import dialer lists", 29, "Dialer", "Manage Lists", "dialer.lists_manage" },
                    { new Guid("72cff6fe-4c5c-6cf0-26fc-ddac2e97d8a1"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delete recordings", 21, "Recordings", "Delete Recordings", "recordings.delete" },
                    { new Guid("74da3950-424d-7b5f-a037-e7ff772ae950"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create and edit agent schedules", 32, "WFM", "Manage Schedules", "wfm.schedules_manage" },
                    { new Guid("782a2ea6-8120-c4fc-76b5-085f31843c9b"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Assign tickets to agents", 39, "Tickets", "Assign Tickets", "tickets.assign" },
                    { new Guid("79f070a0-eb4c-e61e-8982-a485bf311e52"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create, edit, start/stop campaigns", 28, "Dialer", "Manage Campaigns", "dialer.campaigns_manage" },
                    { new Guid("7a048e9a-986c-bd44-374f-db19f0209d82"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Listen to live calls (silent)", 15, "Calls", "Monitor Calls", "calls.monitor" },
                    { new Guid("7c48439a-4ae6-f9ac-3a75-0aa7640e69e3"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create new agents", 3, "Agents", "Create Agents", "agents.create" },
                    { new Guid("83377373-98ee-7050-7962-cc454c69274d"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create new tickets", 36, "Tickets", "Create Tickets", "tickets.create" },
                    { new Guid("8516b726-1622-fac7-7869-87a88179a833"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View analytics dashboards", 46, "Analytics", "View Analytics", "analytics.view" },
                    { new Guid("87370f03-9a1b-ccbd-190f-c70e9e8b9453"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Assign roles to agents", 6, "Agents", "Assign Roles", "agents.assign_roles" },
                    { new Guid("87b43a70-c07b-a17d-ddb5-c567ce9b2361"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Coach agents during calls", 17, "Calls", "Whisper Calls", "calls.whisper" },
                    { new Guid("884d0d86-67dc-5322-4601-9c532412a23c"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create, edit, delete roles and assign permissions", 60, "System", "Manage Roles", "system.roles_manage" },
                    { new Guid("886d0b0c-1f65-6fbc-ed99-c6c9dc4b6112"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View QA scorecards and evaluations", 22, "QA", "View QA", "qa.view" },
                    { new Guid("993cb8aa-8d1e-0484-eba4-5b3dc713eae7"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create and edit system alerts", 58, "Admin", "Manage Alerts", "admin.alerts" },
                    { new Guid("9cbf5fe8-88a3-a716-9fe2-85d1d4d08a2c"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Edit agent information", 4, "Agents", "Edit Agents", "agents.edit" },
                    { new Guid("a0e76814-f452-de78-a582-27acd0793035"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create and edit SLA rules", 56, "Admin", "Manage SLA Rules", "admin.sla_rules" },
                    { new Guid("a27dcfdc-af86-ce2c-6893-9dd600c58e8f"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Join live calls", 16, "Calls", "Barge Calls", "calls.barge" },
                    { new Guid("a516df2b-0c8e-ac69-4626-8951561ba3fb"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Download recording files", 20, "Recordings", "Download Recordings", "recordings.download" },
                    { new Guid("a7b80797-6662-2714-c7db-fdd89a770200"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View available permissions", 61, "System", "View Permissions", "system.permissions_view" },
                    { new Guid("aa646765-6738-521c-20dc-df9df6f1daac"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Access and modify system settings", 54, "Admin", "System Settings", "admin.settings" },
                    { new Guid("abd509c9-e6cc-8087-1b5e-b3022e9695d6"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View team performance analytics", 48, "Analytics", "Team Analytics", "analytics.teams" },
                    { new Guid("afe62c2a-d8ee-1107-d73e-001c752777db"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Edit team information", 9, "Teams", "Edit Teams", "teams.edit" },
                    { new Guid("b55ae5bc-6877-12a9-6991-8107f1467eb0"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View recording list", 18, "Recordings", "View Recordings", "recordings.view" },
                    { new Guid("c2675598-37f0-27bb-37bb-3804a480d7b6"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Edit ticket information", 37, "Tickets", "Edit Tickets", "tickets.edit" },
                    { new Guid("c6a00de2-109a-4eab-0120-b3edb11434e9"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delete teams", 10, "Teams", "Delete Teams", "teams.delete" },
                    { new Guid("cced7ee9-45a3-40d8-49f1-edc79b45790a"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Add/remove team members", 11, "Teams", "Manage Members", "teams.manage_members" },
                    { new Guid("cd542d26-3b9f-bc98-3914-e8410672bd6b"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View agent list and details", 2, "Agents", "View Agents", "agents.view" },
                    { new Guid("d04ef1fc-e6e0-ef4e-18ab-5ccb9bed2165"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create QA evaluations", 23, "QA", "Evaluate Calls", "qa.evaluate" },
                    { new Guid("d0d45e1d-45b5-8a53-d313-322d377e01c8"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View all agents' QA scores", 26, "QA", "View All Scores", "qa.view_all_scores" },
                    { new Guid("d184b1c8-14dc-78ca-4b12-1b86e8a1247a"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View dialer campaigns and lists", 27, "Dialer", "View Dialer", "dialer.view" },
                    { new Guid("d1ee3a22-99c3-307e-8112-9cd54a433363"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create, edit, delete IVR flows", 51, "IVR", "Manage IVR", "ivr.manage" },
                    { new Guid("d42a9c93-73a6-14a9-1517-43df13632dcb"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View team list and details", 7, "Teams", "View Teams", "teams.view" },
                    { new Guid("d7ed0a74-9b46-6850-213d-1637c7d1c318"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View call logs and history", 12, "Calls", "View Calls", "calls.view" },
                    { new Guid("dce84885-dc98-47a9-98c8-bcce0c3d0537"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View schedules and time-off requests", 31, "WFM", "View WFM", "wfm.view" },
                    { new Guid("e2db533a-9ef9-e7d0-387a-ba8e394e49fa"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Create and edit call queues", 57, "Admin", "Manage Queues", "admin.queues" },
                    { new Guid("e381414f-e3aa-20ab-7238-ed2c947e51b6"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Delete agents", 5, "Agents", "Delete Agents", "agents.delete" },
                    { new Guid("e5071018-88b2-b4c7-44ec-f1f4b114d372"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Edit and delete evaluation forms", 25, "QA", "Manage Forms", "qa.manage_forms" },
                    { new Guid("e8330f06-3147-5980-b919-04aa547962c6"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View system audit logs", 55, "Admin", "View Audit Logs", "admin.audit_logs" },
                    { new Guid("e8b9eabe-ba23-ea46-4352-a6068cfeb627"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Edit customer information", 42, "Customers", "Edit Customers", "customers.edit" },
                    { new Guid("e8c12788-2cea-dac1-a0b9-eb9ed0f65ea8"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Configure external integrations", 59, "Admin", "Manage Integrations", "admin.integrations" },
                    { new Guid("e917205c-73cc-536f-eb11-f08f5dd8fc2f"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View customer list and details", 40, "Customers", "View Customers", "customers.view" },
                    { new Guid("e9e023f4-429c-1245-434e-79ff9718ec10"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View reports and dashboards", 44, "Reports", "View Reports", "reports.view" },
                    { new Guid("ecff27d6-035f-6cfe-747b-ff1be9340247"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View schedule adherence reports", 34, "WFM", "View Adherence", "wfm.adherence_view" },
                    { new Guid("eda0d27a-ee01-ba05-d993-04976f9c79b2"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Approve/reject time-off requests", 33, "WFM", "Approve Time-Off", "wfm.timeoff_approve" },
                    { new Guid("f84fc2ff-e68c-fb78-5a7a-53033eb7a606"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View queue performance analytics", 49, "Analytics", "Queue Analytics", "analytics.queues" },
                    { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View knowledge base articles", 52, "Knowledge", "View Knowledge Base", "knowledge.view" }
                });

            migrationBuilder.InsertData(
                table: "system_settings",
                columns: new[] { "id", "category", "created_at", "data_type", "description", "is_sensitive", "key", "updated_at", "updated_by", "updated_by_agent_id", "value" },
                values: new object[,]
                {
                    { new Guid("0a16237e-bd53-306a-3023-e8b10c384e39"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Twilio API Key SID", true, "Twilio:ApiKeySid", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("0ba8ffa6-5869-0ab9-9568-34c188c62d05"), 0, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Date Display Format", false, "General:DateFormat", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "MM/dd/yyyy" },
                    { new Guid("1a225051-9846-6a15-20fb-e65723b39ee7"), 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Default SMS From Number", false, "Sms:FromNumber", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("26bdb9f4-bb6f-c417-00ad-590c8ff7e9e8"), 8, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Warning Threshold (seconds before breach)", false, "Sla:WarningThreshold", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "20" },
                    { new Guid("2b67338b-d5c3-9beb-6747-34fe3edfb88a"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Base Webhook URL", false, "Twilio:BaseWebhookUrl", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("419af46c-4416-4b4f-a0c1-458f1a7211c7"), 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "WhatsApp Access Token", true, "WhatsApp:AccessToken", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("45fe4ccc-c7d4-2c53-348e-b7001bc9b26c"), 8, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Default Response Time (seconds)", false, "Sla:DefaultResponseTime", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "30" },
                    { new Guid("543aed1f-e4b1-8b0f-2531-d203f5156523"), 8, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Default Service Level (%)", false, "Sla:DefaultServiceLevel", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "80" },
                    { new Guid("54b34fdd-7486-4b39-6f96-e854cff05afd"), 5, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Transcription API Base URL", false, "Transcription:BaseUrl", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("58b17efc-2e16-65be-0d02-e9e417dde75c"), 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Webhook Verify Token", true, "WhatsApp:WebhookVerifyToken", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("5e07d8aa-a436-db91-67ab-3a7caddde828"), 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "SMTP Username", false, "Email:SmtpUsername", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("60fb3617-3254-eb88-a2ec-12d2c6120678"), 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "SMTP Password", true, "Email:SmtpPassword", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("719d035c-38ce-b35a-c0e8-f06b0d4ba47f"), 0, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Default Timezone", false, "General:Timezone", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "UTC" },
                    { new Guid("75e56a7b-0e42-ae59-176d-06e7a83351ed"), 6, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Recording Storage Path", false, "RecordingStorage:Path", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "C:\\CallCenterRecordings" },
                    { new Guid("75ec8d57-c85c-7fc9-4fc0-692b1acce9ee"), 9, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Enable Email Notifications", false, "Notification:EnableEmail", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "true" },
                    { new Guid("786f1e23-f788-95cd-1c04-04bc97318939"), 7, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "JWT Issuer", false, "Jwt:Issuer", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "CallCenterAPI" },
                    { new Guid("78b8d820-5387-5d89-0516-67a5982d1d07"), 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "WhatsApp Business Account ID", true, "WhatsApp:BusinessAccountId", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("7b19673c-c4dd-6d7a-9c2e-f912519a0aaa"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Bypass Signature Validation (dev only)", false, "Twilio:BypassSignatureValidation", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "false" },
                    { new Guid("7bdfe3fa-ed06-e28f-34c8-b2f60c6a33a8"), 9, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Enable In-App Notifications", false, "Notification:EnableInApp", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "true" },
                    { new Guid("7eea0044-ace3-4d56-35b8-28e9dad2ed77"), 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Default From Email", false, "Email:FromEmail", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("804effd6-0a2a-482f-8918-2e2d05896c58"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Default Caller ID", false, "Twilio:CallerId", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("827eeae5-7b6e-869f-1bc0-63f4475a293b"), 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "SMTP Port", false, "Email:SmtpPort", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "587" },
                    { new Guid("87306d03-33de-f412-799d-bff9bf146f4a"), 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Default From Name", false, "Email:FromName", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Call Center" },
                    { new Guid("8764433b-07dd-2424-c48b-17da320e7898"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Voice TwiML App SID", true, "Twilio:VoiceTwimlAppSid", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("8ef0f236-0631-52c5-af47-b7b98ccd6f9e"), 5, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "API Timeout (seconds)", false, "Transcription:TimeoutSeconds", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "300" },
                    { new Guid("912978fe-e8ce-cbca-209d-44b1a0bc2876"), 0, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Time Display Format", false, "General:TimeFormat", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "HH:mm:ss" },
                    { new Guid("91b64fd9-3a63-6ec1-570a-9584f121680b"), 7, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Token Expiration (minutes)", false, "Jwt:ExpirationMinutes", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "60" },
                    { new Guid("98ffdf8b-56b2-1c6c-64da-3ff8d2b513c9"), 5, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Transcription Endpoint", false, "Transcription:Endpoint", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "/api/Transcription" },
                    { new Guid("9b077893-81df-a269-2e3e-6b45c423d295"), 9, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Enable Push Notifications", false, "Notification:EnablePush", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "true" },
                    { new Guid("a1a4f29a-22c6-3434-2a80-e8c70000eb66"), 0, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Company Name", false, "General:CompanyName", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Call Center" },
                    { new Guid("a3200bb2-eb1f-e929-b685-df03251b4856"), 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "SMTP Server Hostname", false, "Email:SmtpHost", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("aed3d52a-f986-df11-d80b-073acced45cb"), 6, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Max File Size (MB)", false, "RecordingStorage:MaxFileSizeMB", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "100" },
                    { new Guid("b228da17-6c1f-2938-3027-20da5e64505e"), 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Use SSL/TLS", false, "Email:UseSsl", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "true" },
                    { new Guid("ba459564-1ce8-8a6b-0745-3bc128afb897"), 7, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "JWT Audience", false, "Jwt:Audience", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "CallCenterClient" },
                    { new Guid("bcc9a598-6bd5-d620-8862-24aec034d6e2"), 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "SMS Provider (twilio, vonage, etc.)", false, "Sms:Provider", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "twilio" },
                    { new Guid("c089c4c3-b848-c14b-8d7e-6731047879ca"), 0, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Default Language", false, "General:Language", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "en" },
                    { new Guid("c70a9f0a-381a-b046-262d-2921ccd6bc24"), 9, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Enable Sound Alerts", false, "Notification:EnableSound", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "true" },
                    { new Guid("ce4ecc43-b9c6-3a70-6b6b-5f0afdf69d3b"), 7, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "JWT Secret Key (min 32 chars)", true, "Jwt:Key", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("cf10a076-477a-409e-e109-4168c600670e"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Twilio Auth Token", true, "Twilio:AuthToken", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("cf1f9f44-a322-3242-f392-43ab08e91975"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Twilio API Key Secret", true, "Twilio:ApiKeySecret", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("d140fab4-e1ef-798c-2341-5d2179f4155a"), 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Enable SMS messaging", false, "Sms:Enabled", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "false" },
                    { new Guid("d59a9380-854a-6266-5570-00194277c8b6"), 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Use mock data for WhatsApp (development)", false, "WhatsApp:UseMockData", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "true" },
                    { new Guid("dcd6d551-ea0a-ba98-fb53-91ad9af4dba5"), 6, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Retention Period (days)", false, "RecordingStorage:RetentionDays", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "90" },
                    { new Guid("e3cee8f1-7667-49ff-33a9-5c86f3ab14aa"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Twilio Account SID", true, "Twilio:AccountSid", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("f58446a5-a377-57f2-c888-9e20b17d477d"), 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Webhook Auth Token", true, "Twilio:WebhookAuthToken", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" },
                    { new Guid("f8c29e28-3221-6554-eddc-8128bcf999fe"), 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "WhatsApp API Version", false, "WhatsApp:ApiVersion", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "v17.0" },
                    { new Guid("fa7ccd8f-b9b9-aaa6-0768-15726b4f979a"), 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "WhatsApp Phone Number ID", true, "WhatsApp:PhoneNumberId", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "" }
                });

            migrationBuilder.InsertData(
                table: "role_permissions",
                columns: new[] { "permission_id", "role_id", "assigned_at", "assigned_by_id" },
                values: new object[,]
                {
                    { new Guid("150df259-5ebf-bfea-035a-82ff7de4b85f"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2318fa37-bbf1-82f3-cda1-9b8101244808"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2660f3eb-d851-035a-bd9e-610ae59d867a"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("26727ed9-4ced-3837-240f-c17b950cbdd5"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2851532c-8565-0683-0099-d4df8a16380c"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2bc87b8a-5e13-0774-bb00-780bf3a09d8e"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("358f7969-35bf-20de-7727-a8002341d2f3"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3a1e6ef8-898e-759e-0853-4da8267b98b9"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("40283c6a-fca2-b710-bd7f-cddf62aca1b9"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("4e327cfe-d41d-c23d-54e4-9d5980c37848"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("57cfa772-d9d7-d285-77e0-231ae50cad1c"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("5b50ebfc-6162-733a-327c-9190a969657b"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("5c55a758-1c14-0ada-f3a6-031e2c9006a4"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6068ae6f-8c24-10a8-2f90-a748db0e3931"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6bffb0a5-9486-bf30-5191-d16afcca3934"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6c7e8a5a-4c21-d805-289e-36f629c13f52"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("72cff6fe-4c5c-6cf0-26fc-ddac2e97d8a1"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("74da3950-424d-7b5f-a037-e7ff772ae950"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("782a2ea6-8120-c4fc-76b5-085f31843c9b"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("79f070a0-eb4c-e61e-8982-a485bf311e52"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("7a048e9a-986c-bd44-374f-db19f0209d82"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("7c48439a-4ae6-f9ac-3a75-0aa7640e69e3"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("83377373-98ee-7050-7962-cc454c69274d"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8516b726-1622-fac7-7869-87a88179a833"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("87370f03-9a1b-ccbd-190f-c70e9e8b9453"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("87b43a70-c07b-a17d-ddb5-c567ce9b2361"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("884d0d86-67dc-5322-4601-9c532412a23c"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("886d0b0c-1f65-6fbc-ed99-c6c9dc4b6112"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("993cb8aa-8d1e-0484-eba4-5b3dc713eae7"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("9cbf5fe8-88a3-a716-9fe2-85d1d4d08a2c"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a0e76814-f452-de78-a582-27acd0793035"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a27dcfdc-af86-ce2c-6893-9dd600c58e8f"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a516df2b-0c8e-ac69-4626-8951561ba3fb"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a7b80797-6662-2714-c7db-fdd89a770200"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("aa646765-6738-521c-20dc-df9df6f1daac"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("abd509c9-e6cc-8087-1b5e-b3022e9695d6"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("afe62c2a-d8ee-1107-d73e-001c752777db"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b55ae5bc-6877-12a9-6991-8107f1467eb0"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c2675598-37f0-27bb-37bb-3804a480d7b6"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c6a00de2-109a-4eab-0120-b3edb11434e9"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cced7ee9-45a3-40d8-49f1-edc79b45790a"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cd542d26-3b9f-bc98-3914-e8410672bd6b"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d04ef1fc-e6e0-ef4e-18ab-5ccb9bed2165"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d0d45e1d-45b5-8a53-d313-322d377e01c8"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d184b1c8-14dc-78ca-4b12-1b86e8a1247a"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d1ee3a22-99c3-307e-8112-9cd54a433363"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d42a9c93-73a6-14a9-1517-43df13632dcb"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d7ed0a74-9b46-6850-213d-1637c7d1c318"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("dce84885-dc98-47a9-98c8-bcce0c3d0537"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e2db533a-9ef9-e7d0-387a-ba8e394e49fa"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e381414f-e3aa-20ab-7238-ed2c947e51b6"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e5071018-88b2-b4c7-44ec-f1f4b114d372"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8330f06-3147-5980-b919-04aa547962c6"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8b9eabe-ba23-ea46-4352-a6068cfeb627"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8c12788-2cea-dac1-a0b9-eb9ed0f65ea8"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e917205c-73cc-536f-eb11-f08f5dd8fc2f"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e9e023f4-429c-1245-434e-79ff9718ec10"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("ecff27d6-035f-6cfe-747b-ff1be9340247"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("eda0d27a-ee01-ba05-d993-04976f9c79b2"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("f84fc2ff-e68c-fb78-5a7a-53033eb7a606"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("150df259-5ebf-bfea-035a-82ff7de4b85f"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2318fa37-bbf1-82f3-cda1-9b8101244808"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2660f3eb-d851-035a-bd9e-610ae59d867a"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("26727ed9-4ced-3837-240f-c17b950cbdd5"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2851532c-8565-0683-0099-d4df8a16380c"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2bc87b8a-5e13-0774-bb00-780bf3a09d8e"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("358f7969-35bf-20de-7727-a8002341d2f3"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3a1e6ef8-898e-759e-0853-4da8267b98b9"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("40283c6a-fca2-b710-bd7f-cddf62aca1b9"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("4e327cfe-d41d-c23d-54e4-9d5980c37848"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("5b50ebfc-6162-733a-327c-9190a969657b"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("5c55a758-1c14-0ada-f3a6-031e2c9006a4"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6bffb0a5-9486-bf30-5191-d16afcca3934"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6c7e8a5a-4c21-d805-289e-36f629c13f52"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("72cff6fe-4c5c-6cf0-26fc-ddac2e97d8a1"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("74da3950-424d-7b5f-a037-e7ff772ae950"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("782a2ea6-8120-c4fc-76b5-085f31843c9b"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("79f070a0-eb4c-e61e-8982-a485bf311e52"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("7a048e9a-986c-bd44-374f-db19f0209d82"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("7c48439a-4ae6-f9ac-3a75-0aa7640e69e3"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("83377373-98ee-7050-7962-cc454c69274d"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8516b726-1622-fac7-7869-87a88179a833"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("87370f03-9a1b-ccbd-190f-c70e9e8b9453"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("87b43a70-c07b-a17d-ddb5-c567ce9b2361"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("886d0b0c-1f65-6fbc-ed99-c6c9dc4b6112"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("9cbf5fe8-88a3-a716-9fe2-85d1d4d08a2c"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a27dcfdc-af86-ce2c-6893-9dd600c58e8f"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a516df2b-0c8e-ac69-4626-8951561ba3fb"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("abd509c9-e6cc-8087-1b5e-b3022e9695d6"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("afe62c2a-d8ee-1107-d73e-001c752777db"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b55ae5bc-6877-12a9-6991-8107f1467eb0"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c2675598-37f0-27bb-37bb-3804a480d7b6"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c6a00de2-109a-4eab-0120-b3edb11434e9"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cced7ee9-45a3-40d8-49f1-edc79b45790a"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cd542d26-3b9f-bc98-3914-e8410672bd6b"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d04ef1fc-e6e0-ef4e-18ab-5ccb9bed2165"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d0d45e1d-45b5-8a53-d313-322d377e01c8"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d184b1c8-14dc-78ca-4b12-1b86e8a1247a"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d42a9c93-73a6-14a9-1517-43df13632dcb"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d7ed0a74-9b46-6850-213d-1637c7d1c318"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("dce84885-dc98-47a9-98c8-bcce0c3d0537"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e381414f-e3aa-20ab-7238-ed2c947e51b6"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e5071018-88b2-b4c7-44ec-f1f4b114d372"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8b9eabe-ba23-ea46-4352-a6068cfeb627"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e917205c-73cc-536f-eb11-f08f5dd8fc2f"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e9e023f4-429c-1245-434e-79ff9718ec10"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("ecff27d6-035f-6cfe-747b-ff1be9340247"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("eda0d27a-ee01-ba05-d993-04976f9c79b2"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("f84fc2ff-e68c-fb78-5a7a-53033eb7a606"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3a1e6ef8-898e-759e-0853-4da8267b98b9"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("6bffb0a5-9486-bf30-5191-d16afcca3934"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("72cff6fe-4c5c-6cf0-26fc-ddac2e97d8a1"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8516b726-1622-fac7-7869-87a88179a833"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("886d0b0c-1f65-6fbc-ed99-c6c9dc4b6112"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("a516df2b-0c8e-ac69-4626-8951561ba3fb"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("b55ae5bc-6877-12a9-6991-8107f1467eb0"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cd542d26-3b9f-bc98-3914-e8410672bd6b"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d04ef1fc-e6e0-ef4e-18ab-5ccb9bed2165"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d0d45e1d-45b5-8a53-d313-322d377e01c8"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d42a9c93-73a6-14a9-1517-43df13632dcb"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e5071018-88b2-b4c7-44ec-f1f4b114d372"), new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("26727ed9-4ced-3837-240f-c17b950cbdd5"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2851532c-8565-0683-0099-d4df8a16380c"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2bc87b8a-5e13-0774-bb00-780bf3a09d8e"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("358f7969-35bf-20de-7727-a8002341d2f3"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("5b50ebfc-6162-733a-327c-9190a969657b"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("74da3950-424d-7b5f-a037-e7ff772ae950"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("782a2ea6-8120-c4fc-76b5-085f31843c9b"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("83377373-98ee-7050-7962-cc454c69274d"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("8516b726-1622-fac7-7869-87a88179a833"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("afe62c2a-d8ee-1107-d73e-001c752777db"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c2675598-37f0-27bb-37bb-3804a480d7b6"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c6a00de2-109a-4eab-0120-b3edb11434e9"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cced7ee9-45a3-40d8-49f1-edc79b45790a"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("cd542d26-3b9f-bc98-3914-e8410672bd6b"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d42a9c93-73a6-14a9-1517-43df13632dcb"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d7ed0a74-9b46-6850-213d-1637c7d1c318"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("dce84885-dc98-47a9-98c8-bcce0c3d0537"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8b9eabe-ba23-ea46-4352-a6068cfeb627"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e917205c-73cc-536f-eb11-f08f5dd8fc2f"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e9e023f4-429c-1245-434e-79ff9718ec10"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("ecff27d6-035f-6cfe-747b-ff1be9340247"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("eda0d27a-ee01-ba05-d993-04976f9c79b2"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("150df259-5ebf-bfea-035a-82ff7de4b85f"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("2660f3eb-d851-035a-bd9e-610ae59d867a"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("26727ed9-4ced-3837-240f-c17b950cbdd5"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("358f7969-35bf-20de-7727-a8002341d2f3"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("3bf50508-edbc-3d48-5daf-6a7e581fd610"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("83377373-98ee-7050-7962-cc454c69274d"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("c2675598-37f0-27bb-37bb-3804a480d7b6"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("d7ed0a74-9b46-6850-213d-1637c7d1c318"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e8b9eabe-ba23-ea46-4352-a6068cfeb627"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("e917205c-73cc-536f-eb11-f08f5dd8fc2f"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("fd59c6f7-f4c9-0b8e-851a-40fb2e9d685d"), new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null }
                });
        }
    }
}
