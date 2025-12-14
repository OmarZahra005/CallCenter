using CallCenter.Application.DTOs.Ivr;
using CallCenter.Domain.Models;

namespace CallCenter.Application.Services;

public interface IIvrService
{
    // ==================== Flow Management ====================
    Task<PagedResult<IvrFlowDto>> GetFlowsAsync(int pageNumber = 1, int pageSize = 20, bool? isActive = null);
    Task<IvrFlowDetailDto?> GetFlowByIdAsync(Guid flowId);
    Task<IvrFlowDetailDto?> GetFlowForPhoneNumberAsync(string phoneNumber);
    Task<IvrFlowDetailDto?> GetDefaultFlowAsync();
    Task<IvrFlowDto> CreateFlowAsync(CreateIvrFlowRequest request);
    Task<IvrFlowDto?> UpdateFlowAsync(Guid flowId, UpdateIvrFlowRequest request);
    Task<bool> DeleteFlowAsync(Guid flowId);
    Task<IvrFlowDto?> DuplicateFlowAsync(Guid flowId, string newName);

    // ==================== Node Management ====================
    Task<IvrNodeDto?> GetNodeByIdAsync(Guid nodeId);
    Task<IvrNodeDto> CreateNodeAsync(CreateIvrNodeRequest request);
    Task<IvrNodeDto?> UpdateNodeAsync(Guid nodeId, UpdateIvrNodeRequest request);
    Task<bool> DeleteNodeAsync(Guid nodeId);

    // ==================== Menu Option Management ====================
    Task<IvrMenuOptionDto> CreateMenuOptionAsync(CreateMenuOptionRequest request);
    Task<IvrMenuOptionDto?> UpdateMenuOptionAsync(Guid optionId, UpdateMenuOptionRequest request);
    Task<bool> DeleteMenuOptionAsync(Guid optionId);

    // ==================== TwiML Generation ====================
    Task<IvrTwimlResponse> GenerateEntryTwimlAsync(IvrTwimlRequest request);
    Task<IvrTwimlResponse> ProcessDtmfInputAsync(IvrTwimlRequest request);

    // ==================== Session Management ====================
    Task<IvrCallSessionDto?> GetSessionByCallSidAsync(string callSid);
    Task<IvrCallSessionDto?> GetSessionByIdAsync(Guid sessionId);
    System.Threading.Tasks.Task EndSessionAsync(string callSid, string outcome);

    // ==================== Import/Export ====================
    Task<IvrFlowExportDto> ExportFlowAsync(Guid flowId);
    Task<IvrFlowDto> ImportFlowAsync(IvrFlowExportDto importData, string? newName = null);

    // ==================== Validation ====================
    Task<List<string>> ValidateFlowAsync(Guid flowId);
}
