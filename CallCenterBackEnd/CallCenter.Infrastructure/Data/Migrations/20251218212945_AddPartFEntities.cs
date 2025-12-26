using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPartFEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "threshold",
                table: "alert_rules",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "category",
                table: "alert_rules",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "channels",
                table: "alert_rules",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "cooldown_minutes",
                table: "alert_rules",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_triggered_at",
                table: "alert_rules",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "metric",
                table: "alert_rules",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "operator",
                table: "alert_rules",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "severity",
                table: "alert_rules",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "trigger_count",
                table: "alert_rules",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "unit",
                table: "alert_rules",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "webhook_url",
                table: "alert_rules",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "acknowledged",
                table: "alert_logs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "metric_value",
                table: "alert_logs",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "resolved_at",
                table: "alert_logs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "threshold_value",
                table: "alert_logs",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "triggered_at",
                table: "alert_logs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "data_exports",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    type = table.Column<int>(type: "int", nullable: false),
                    data_source = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    format = table.Column<int>(type: "int", nullable: false),
                    filters = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<int>(type: "int", nullable: false),
                    progress = table.Column<int>(type: "int", nullable: true),
                    file_size = table.Column<long>(type: "bigint", nullable: true),
                    file_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    record_count = table.Column<int>(type: "int", nullable: true),
                    error_message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    completed_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    expires_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_by_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    created_by_name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_data_exports", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "notification_preferences",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    user_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    category_id = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    in_app = table.Column<bool>(type: "bit", nullable: false),
                    email = table.Column<bool>(type: "bit", nullable: false),
                    push = table.Column<bool>(type: "bit", nullable: false),
                    sound = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_notification_preferences", x => x.id);
                    table.ForeignKey(
                        name: "f_k_notification_preferences_agents_user_id",
                        column: x => x.user_id,
                        principalTable: "agents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "scheduled_exports",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    data_source = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    format = table.Column<int>(type: "int", nullable: false),
                    schedule = table.Column<int>(type: "int", nullable: false),
                    schedule_time = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    schedule_day_of_week = table.Column<int>(type: "int", nullable: true),
                    schedule_day_of_month = table.Column<int>(type: "int", nullable: true),
                    filters = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    recipients = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    last_run_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    next_run_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_by_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_scheduled_exports", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "surveys",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    trigger = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    thank_you_message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    expiration_days = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_surveys", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "whats_app_message_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    language = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    components = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    usage_count = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    last_used_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    meta_template_id = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_whats_app_message_templates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "survey_questions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    survey_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    question = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    required = table.Column<bool>(type: "bit", nullable: false),
                    options = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    min_value = table.Column<int>(type: "int", nullable: true),
                    max_value = table.Column<int>(type: "int", nullable: true),
                    order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_survey_questions", x => x.id);
                    table.ForeignKey(
                        name: "f_k_survey_questions_surveys_survey_id",
                        column: x => x.survey_id,
                        principalTable: "surveys",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "survey_responses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    survey_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    customer_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    agent_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    answers = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    overall_score = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    channel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    submitted_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_survey_responses", x => x.id);
                    table.ForeignKey(
                        name: "f_k_survey_responses_agents_agent_id",
                        column: x => x.agent_id,
                        principalTable: "agents",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_survey_responses_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_survey_responses_surveys_survey_id",
                        column: x => x.survey_id,
                        principalTable: "surveys",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "i_x_notification_preferences_user_id",
                table: "notification_preferences",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "i_x_survey_questions_survey_id",
                table: "survey_questions",
                column: "survey_id");

            migrationBuilder.CreateIndex(
                name: "i_x_survey_responses_agent_id",
                table: "survey_responses",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "i_x_survey_responses_customer_id",
                table: "survey_responses",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "i_x_survey_responses_survey_id",
                table: "survey_responses",
                column: "survey_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "data_exports");

            migrationBuilder.DropTable(
                name: "notification_preferences");

            migrationBuilder.DropTable(
                name: "scheduled_exports");

            migrationBuilder.DropTable(
                name: "survey_questions");

            migrationBuilder.DropTable(
                name: "survey_responses");

            migrationBuilder.DropTable(
                name: "whats_app_message_templates");

            migrationBuilder.DropTable(
                name: "surveys");

            migrationBuilder.DropColumn(
                name: "category",
                table: "alert_rules");

            migrationBuilder.DropColumn(
                name: "channels",
                table: "alert_rules");

            migrationBuilder.DropColumn(
                name: "cooldown_minutes",
                table: "alert_rules");

            migrationBuilder.DropColumn(
                name: "last_triggered_at",
                table: "alert_rules");

            migrationBuilder.DropColumn(
                name: "metric",
                table: "alert_rules");

            migrationBuilder.DropColumn(
                name: "operator",
                table: "alert_rules");

            migrationBuilder.DropColumn(
                name: "severity",
                table: "alert_rules");

            migrationBuilder.DropColumn(
                name: "trigger_count",
                table: "alert_rules");

            migrationBuilder.DropColumn(
                name: "unit",
                table: "alert_rules");

            migrationBuilder.DropColumn(
                name: "webhook_url",
                table: "alert_rules");

            migrationBuilder.DropColumn(
                name: "acknowledged",
                table: "alert_logs");

            migrationBuilder.DropColumn(
                name: "metric_value",
                table: "alert_logs");

            migrationBuilder.DropColumn(
                name: "resolved_at",
                table: "alert_logs");

            migrationBuilder.DropColumn(
                name: "threshold_value",
                table: "alert_logs");

            migrationBuilder.DropColumn(
                name: "triggered_at",
                table: "alert_logs");

            migrationBuilder.AlterColumn<string>(
                name: "threshold",
                table: "alert_rules",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");
        }
    }
}
