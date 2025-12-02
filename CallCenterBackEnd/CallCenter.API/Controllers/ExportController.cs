using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExportController : ControllerBase
{
    private readonly IExportService _exportService;

    public ExportController(IExportService exportService)
    {
        _exportService = exportService;
    }

    [HttpPost("excel")]
    public IActionResult ExportToExcel([FromBody] ExportDefinition definition)
    {
        var bytes = _exportService.ExportToExcel(definition);
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{definition.SheetName}.xlsx");
    }

    [HttpPost("pdf")]
    public IActionResult ExportToPdf([FromBody] PdfReportDefinition definition)
    {
        var bytes = _exportService.ExportToPdf(definition);
        return File(bytes, "application/pdf", $"{definition.Title}.pdf");
    }

    [HttpPost("agent-performance/pdf")]
    public IActionResult ExportAgentPerformanceToPdf([FromBody] AgentPerformanceReportData data)
    {
        var bytes = _exportService.ExportAgentPerformanceToPdf(data);
        var filename = $"Agent_Performance_{data.StartDate:yyyyMMdd}_{data.EndDate:yyyyMMdd}.pdf";
        return File(bytes, "application/pdf", filename);
    }

    [HttpPost("qa-scorecard/pdf")]
    public IActionResult ExportQaScorecardToPdf([FromBody] QaScorecardReportData data)
    {
        var bytes = _exportService.ExportQaScorecardToPdf(data);
        var filename = $"QA_Scorecard_{data.AgentName}_{data.EvaluationDate:yyyyMMdd}.pdf";
        return File(bytes, "application/pdf", filename);
    }
}
