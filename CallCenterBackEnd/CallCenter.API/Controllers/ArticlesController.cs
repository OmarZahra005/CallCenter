using CallCenter.Application.DTOs.Common;
using CallCenter.Application.DTOs.KnowledgeBase;
using CallCenter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CallCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController : ControllerBase
{
    private readonly IKnowledgeBaseService _knowledgeBaseService;

    public ArticlesController(IKnowledgeBaseService knowledgeBaseService)
    {
        _knowledgeBaseService = knowledgeBaseService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<ArticleDto>>> GetArticles([FromQuery] PagedRequest request, [FromQuery] string? category = null)
    {
        var result = await _knowledgeBaseService.GetArticlesAsync(request, category);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ArticleDto>> GetArticle(Guid id)
    {
        var result = await _knowledgeBaseService.GetArticleByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ArticleDto>> CreateArticle(CreateArticleRequest request)
    {
        var result = await _knowledgeBaseService.CreateArticleAsync(request);
        return CreatedAtAction(nameof(GetArticle), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ArticleDto>> UpdateArticle(Guid id, UpdateArticleRequest request)
    {
        var result = await _knowledgeBaseService.UpdateArticleAsync(id, request);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteArticle(Guid id)
    {
        var result = await _knowledgeBaseService.DeleteArticleAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("published")]
    public async Task<ActionResult<List<ArticleDto>>> GetPublishedArticles([FromQuery] string? category = null)
    {
        var result = await _knowledgeBaseService.GetPublishedArticlesAsync(category);
        return Ok(result);
    }

    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult<ArticleDto>> PublishArticle(Guid id)
    {
        var result = await _knowledgeBaseService.PublishArticleAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("{id:guid}/view")]
    public async Task<ActionResult> IncrementViewCount(Guid id)
    {
        var result = await _knowledgeBaseService.IncrementViewCountAsync(id);
        if (!result) return NotFound();
        return Ok();
    }

    [HttpPost("{id:guid}/feedback")]
    public async Task<ActionResult> MarkHelpful(Guid id, [FromQuery] bool helpful)
    {
        var result = await _knowledgeBaseService.MarkHelpfulAsync(id, helpful);
        if (!result) return NotFound();
        return Ok();
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<ArticleDto>>> SearchArticles([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q)) return BadRequest("Search term is required");
        var result = await _knowledgeBaseService.SearchArticlesAsync(q);
        return Ok(result);
    }
}
