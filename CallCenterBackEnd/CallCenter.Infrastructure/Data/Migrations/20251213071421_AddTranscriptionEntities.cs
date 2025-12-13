using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CallCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTranscriptionEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "transcriptions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    call_recording_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    language = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    confidence = table.Column<float>(type: "real", nullable: true),
                    status = table.Column<int>(type: "int", nullable: false),
                    word_count = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    completed_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    summary = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    sentiment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    detected_issues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    action_items = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_transcriptions", x => x.id);
                    table.ForeignKey(
                        name: "f_k_transcriptions_call_recordings_call_recording_id",
                        column: x => x.call_recording_id,
                        principalTable: "call_recordings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "transcription_segments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    transcription_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    speaker = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    start_time = table.Column<TimeSpan>(type: "time", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "time", nullable: false),
                    text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    confidence = table.Column<float>(type: "real", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_transcription_segments", x => x.id);
                    table.ForeignKey(
                        name: "f_k_transcription_segments_transcriptions_transcription_id",
                        column: x => x.transcription_id,
                        principalTable: "transcriptions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "i_x_transcription_segments_transcription_id",
                table: "transcription_segments",
                column: "transcription_id");

            migrationBuilder.CreateIndex(
                name: "i_x_transcriptions_call_recording_id",
                table: "transcriptions",
                column: "call_recording_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "transcription_segments");

            migrationBuilder.DropTable(
                name: "transcriptions");
        }
    }
}
