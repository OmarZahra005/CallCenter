using CallCenter.Application.Interfaces;
using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace CallCenter.Application.Services;

public interface IExportService
{
    byte[] ExportToExcel<T>(IEnumerable<T> data, string sheetName = "Sheet1") where T : class;
    byte[] ExportToExcel(ExportDefinition definition);
    byte[] ExportToPdf(PdfReportDefinition definition);
    byte[] ExportAgentPerformanceToPdf(AgentPerformanceReportData data);
    byte[] ExportQaScorecardToPdf(QaScorecardReportData data);
}

public class ExportService : IExportService
{
    public ExportService()
    {
        // Configure QuestPDF license (Community license for open source)
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] ExportToExcel<T>(IEnumerable<T> data, string sheetName = "Sheet1") where T : class
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(sheetName);

        var properties = typeof(T).GetProperties();

        // Header row
        for (int i = 0; i < properties.Length; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = properties[i].Name;
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.LightGray;
        }

        // Data rows
        int row = 2;
        foreach (var item in data)
        {
            for (int i = 0; i < properties.Length; i++)
            {
                var value = properties[i].GetValue(item);
                worksheet.Cell(row, i + 1).Value = value?.ToString() ?? string.Empty;
            }
            row++;
        }

        // Auto-fit columns
        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] ExportToExcel(ExportDefinition definition)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(definition.SheetName);

        // Header row
        for (int i = 0; i < definition.Columns.Count; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = definition.Columns[i].Header;
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.LightGray;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }

        // Data rows
        int row = 2;
        foreach (var dataRow in definition.Data)
        {
            for (int i = 0; i < definition.Columns.Count; i++)
            {
                var value = dataRow.GetValueOrDefault(definition.Columns[i].Field);
                var cell = worksheet.Cell(row, i + 1);

                if (value is decimal d)
                    cell.Value = d;
                else if (value is int num)
                    cell.Value = num;
                else if (value is double dbl)
                    cell.Value = dbl;
                else if (value is DateTime dt)
                    cell.Value = dt;
                else
                    cell.Value = value?.ToString() ?? string.Empty;
            }
            row++;
        }

        // Auto-fit columns
        worksheet.Columns().AdjustToContents();

        // Apply borders
        var range = worksheet.Range(1, 1, row - 1, definition.Columns.Count);
        range.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        range.Style.Border.InsideBorder = XLBorderStyleValues.Thin;

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] ExportToPdf(PdfReportDefinition definition)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10));

                // Header
                page.Header().Column(col =>
                {
                    col.Item().Text(definition.Title).Bold().FontSize(18).AlignCenter();
                    if (!string.IsNullOrEmpty(definition.Subtitle))
                    {
                        col.Item().Text(definition.Subtitle).FontSize(12).AlignCenter();
                    }
                    col.Item().PaddingBottom(10).Text($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm}").FontSize(8).AlignRight();
                    col.Item().LineHorizontal(1);
                });

                // Content
                page.Content().PaddingVertical(10).Table(table =>
                {
                    // Define columns
                    table.ColumnsDefinition(columns =>
                    {
                        foreach (var col in definition.Columns)
                        {
                            columns.RelativeColumn(col.Width);
                        }
                    });

                    // Header row
                    foreach (var col in definition.Columns)
                    {
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text(col.Header).Bold();
                    }

                    // Data rows
                    foreach (var dataRow in definition.Data)
                    {
                        foreach (var col in definition.Columns)
                        {
                            var value = dataRow.GetValueOrDefault(col.Field)?.ToString() ?? string.Empty;
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(value);
                        }
                    }
                });

                // Footer
                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] ExportAgentPerformanceToPdf(AgentPerformanceReportData data)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().Text("Agent Performance Report").Bold().FontSize(18).AlignCenter();
                    col.Item().Text($"Period: {data.StartDate:yyyy-MM-dd} to {data.EndDate:yyyy-MM-dd}").FontSize(12).AlignCenter();
                    col.Item().PaddingBottom(10).Text($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm}").FontSize(8).AlignRight();
                    col.Item().LineHorizontal(1);
                });

                page.Content().PaddingVertical(10).Column(col =>
                {
                    // Summary section
                    col.Item().Text("Summary").Bold().FontSize(14);
                    col.Item().PaddingBottom(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        AddSummaryRow(table, "Total Agents", data.TotalAgents.ToString());
                        AddSummaryRow(table, "Total Calls Handled", data.TotalCallsHandled.ToString());
                        AddSummaryRow(table, "Average Handle Time", $"{data.AverageHandleTime:F1} min");
                        AddSummaryRow(table, "Average QA Score", $"{data.AverageQaScore:F1}%");
                        AddSummaryRow(table, "Overall Adherence", $"{data.OverallAdherence:F1}%");
                    });

                    // Agent details table
                    col.Item().PaddingTop(20).Text("Agent Details").Bold().FontSize(14);
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                        });

                        // Header
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Agent Name").Bold();
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Calls").Bold();
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("AHT (min)").Bold();
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("QA Score").Bold();
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Adherence").Bold();

                        foreach (var agent in data.AgentDetails)
                        {
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(agent.AgentName);
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(agent.CallsHandled.ToString());
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text($"{agent.AverageHandleTime:F1}");
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text($"{agent.QaScore:F1}%");
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text($"{agent.Adherence:F1}%");
                        }
                    });
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] ExportQaScorecardToPdf(QaScorecardReportData data)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().Text("QA Evaluation Scorecard").Bold().FontSize(18).AlignCenter();
                    col.Item().Text($"Agent: {data.AgentName}").FontSize(12).AlignCenter();
                    col.Item().PaddingBottom(10).Text($"Evaluation Date: {data.EvaluationDate:yyyy-MM-dd}").FontSize(10).AlignCenter();
                    col.Item().LineHorizontal(1);
                });

                page.Content().PaddingVertical(10).Column(col =>
                {
                    // General Info
                    col.Item().Text("Evaluation Details").Bold().FontSize(14);
                    col.Item().PaddingBottom(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        AddSummaryRow(table, "Evaluator", data.EvaluatorName);
                        AddSummaryRow(table, "Call ID", data.CallId);
                        AddSummaryRow(table, "Call Duration", $"{data.CallDuration} minutes");
                        AddSummaryRow(table, "Overall Score", $"{data.OverallScore:F1}%");
                    });

                    // Criteria scores
                    col.Item().PaddingTop(20).Text("Evaluation Criteria").Bold().FontSize(14);
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(3);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                        });

                        table.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Criteria").Bold();
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Score").Bold();
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Max").Bold();
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("%").Bold();

                        foreach (var criteria in data.CriteriaScores)
                        {
                            var percentage = criteria.MaxScore > 0 ? (criteria.Score / criteria.MaxScore * 100) : 0;
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(criteria.CriteriaName);
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text($"{criteria.Score:F1}");
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text($"{criteria.MaxScore:F1}");
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text($"{percentage:F0}%");
                        }
                    });

                    // Comments
                    if (!string.IsNullOrEmpty(data.Comments))
                    {
                        col.Item().PaddingTop(20).Text("Comments").Bold().FontSize(14);
                        col.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Text(data.Comments);
                    }
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    private static void AddSummaryRow(TableDescriptor table, string label, string value)
    {
        table.Cell().Padding(3).Text(label).Bold();
        table.Cell().Padding(3).Text(value);
    }
}

// DTOs for export
public record ExportDefinition
{
    public string SheetName { get; init; } = "Sheet1";
    public List<ExportColumn> Columns { get; init; } = new();
    public List<Dictionary<string, object?>> Data { get; init; } = new();
}

public record ExportColumn
{
    public string Field { get; init; } = string.Empty;
    public string Header { get; init; } = string.Empty;
    public float Width { get; init; } = 1;
}

public record PdfReportDefinition
{
    public string Title { get; init; } = string.Empty;
    public string? Subtitle { get; init; }
    public List<ExportColumn> Columns { get; init; } = new();
    public List<Dictionary<string, object?>> Data { get; init; } = new();
}

public record AgentPerformanceReportData
{
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public int TotalAgents { get; init; }
    public int TotalCallsHandled { get; init; }
    public decimal AverageHandleTime { get; init; }
    public decimal AverageQaScore { get; init; }
    public decimal OverallAdherence { get; init; }
    public List<AgentPerformanceDetail> AgentDetails { get; init; } = new();
}

public record AgentPerformanceDetail
{
    public string AgentName { get; init; } = string.Empty;
    public int CallsHandled { get; init; }
    public decimal AverageHandleTime { get; init; }
    public decimal QaScore { get; init; }
    public decimal Adherence { get; init; }
}

public record QaScorecardReportData
{
    public string AgentName { get; init; } = string.Empty;
    public string EvaluatorName { get; init; } = string.Empty;
    public string CallId { get; init; } = string.Empty;
    public DateTime EvaluationDate { get; init; }
    public int CallDuration { get; init; }
    public decimal OverallScore { get; init; }
    public List<CriteriaScore> CriteriaScores { get; init; } = new();
    public string? Comments { get; init; }
}

public record CriteriaScore
{
    public string CriteriaName { get; init; } = string.Empty;
    public decimal Score { get; init; }
    public decimal MaxScore { get; init; }
}
