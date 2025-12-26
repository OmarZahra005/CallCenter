using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedSystemSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "permissions",
                columns: new[] { "id", "created_at", "description", "display_order", "module", "name", "system_name" },
                values: new object[] { new Guid("57cfa772-d9d7-d285-77e0-231ae50cad1c"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "View and modify system settings", 60, "System", "Manage Settings", "system.settings_manage" });

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
                values: new object[] { new Guid("57cfa772-d9d7-d285-77e0-231ae50cad1c"), new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "permission_id", "role_id" },
                keyValues: new object[] { new Guid("57cfa772-d9d7-d285-77e0-231ae50cad1c"), new Guid("10000000-0000-0000-0000-000000000002") });

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
                keyValue: new Guid("57cfa772-d9d7-d285-77e0-231ae50cad1c"));
        }
    }
}
