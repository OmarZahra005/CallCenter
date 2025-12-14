using System.Text.Json;
using CallCenter.Application.DTOs.Ivr;
using CallCenter.Domain.Models;
using CallCenter.Application.Services;
using CallCenter.Domain.Entities;
using CallCenter.Domain.Enums;
using CallCenter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Twilio.TwiML;
using Twilio.TwiML.Voice;

namespace CallCenter.Infrastructure.Services;

public class IvrService : IIvrService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<IvrService> _logger;
    private readonly string _baseWebhookUrl;

    public IvrService(
        ApplicationDbContext dbContext,
        ILogger<IvrService> logger,
        Microsoft.Extensions.Options.IOptions<Application.DTOs.Twilio.TwilioOptions> twilioOptions)
    {
        _dbContext = dbContext;
        _logger = logger;
        _baseWebhookUrl = twilioOptions.Value.BaseWebhookUrl ?? "";
    }

    // ==================== Flow Management ====================

    public async Task<PagedResult<IvrFlowDto>> GetFlowsAsync(int pageNumber = 1, int pageSize = 20, bool? isActive = null)
    {
        var query = _dbContext.IvrFlows.AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(f => f.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync();

        var flows = await query
            .OrderByDescending(f => f.CreatedAtUtc)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(f => new IvrFlowDto
            {
                Id = f.Id,
                Name = f.Name,
                Description = f.Description,
                IsActive = f.IsActive,
                IsDefault = f.IsDefault,
                PhoneNumbers = f.PhoneNumbers,
                EntryNodeId = f.EntryNodeId,
                DefaultLanguage = f.DefaultLanguage,
                DefaultVoice = f.DefaultVoice,
                MaxInvalidAttempts = f.MaxInvalidAttempts,
                InputTimeout = f.InputTimeout,
                BusinessHoursStart = f.BusinessHoursStart,
                BusinessHoursEnd = f.BusinessHoursEnd,
                BusinessDays = f.BusinessDays,
                AfterHoursNodeId = f.AfterHoursNodeId,
                CreatedAtUtc = f.CreatedAtUtc,
                UpdatedAtUtc = f.UpdatedAtUtc,
                NodeCount = f.Nodes.Count
            })
            .ToListAsync();

        return new PagedResult<IvrFlowDto>
        {
            Items = flows,
            TotalCount = totalCount,
            CurrentPage = pageNumber,
            PageSize = pageSize,
            PageCount = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public async Task<IvrFlowDetailDto?> GetFlowByIdAsync(Guid flowId)
    {
        var flow = await _dbContext.IvrFlows
            .Include(f => f.Nodes)
                .ThenInclude(n => n.MenuOptions)
            .FirstOrDefaultAsync(f => f.Id == flowId);

        if (flow == null) return null;

        return MapToFlowDetailDto(flow);
    }

    public async Task<IvrFlowDetailDto?> GetFlowForPhoneNumberAsync(string phoneNumber)
    {
        // Normalize phone number
        var normalizedNumber = phoneNumber.Replace(" ", "").Replace("-", "");

        var flow = await _dbContext.IvrFlows
            .Include(f => f.Nodes)
                .ThenInclude(n => n.MenuOptions)
            .Where(f => f.IsActive && f.PhoneNumbers != null && f.PhoneNumbers.Contains(normalizedNumber))
            .FirstOrDefaultAsync();

        if (flow == null)
        {
            // Return default flow if no specific flow found
            return await GetDefaultFlowAsync();
        }

        return MapToFlowDetailDto(flow);
    }

    public async Task<IvrFlowDetailDto?> GetDefaultFlowAsync()
    {
        var flow = await _dbContext.IvrFlows
            .Include(f => f.Nodes)
                .ThenInclude(n => n.MenuOptions)
            .Where(f => f.IsActive && f.IsDefault)
            .FirstOrDefaultAsync();

        if (flow == null) return null;

        return MapToFlowDetailDto(flow);
    }

    public async Task<IvrFlowDto> CreateFlowAsync(CreateIvrFlowRequest request)
    {
        // If this is set as default, unset other defaults
        if (request.IsDefault)
        {
            await _dbContext.IvrFlows
                .Where(f => f.IsDefault)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.IsDefault, false));
        }

        var flow = new IvrFlow
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            IsActive = request.IsActive,
            IsDefault = request.IsDefault,
            PhoneNumbers = request.PhoneNumbers,
            DefaultLanguage = request.DefaultLanguage,
            DefaultVoice = request.DefaultVoice,
            MaxInvalidAttempts = request.MaxInvalidAttempts,
            InputTimeout = request.InputTimeout,
            BusinessHoursStart = request.BusinessHoursStart,
            BusinessHoursEnd = request.BusinessHoursEnd,
            BusinessDays = request.BusinessDays,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };

        _dbContext.IvrFlows.Add(flow);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Created IVR flow {FlowId}: {Name}", flow.Id, flow.Name);

        return MapToFlowDto(flow);
    }

    public async Task<IvrFlowDto?> UpdateFlowAsync(Guid flowId, UpdateIvrFlowRequest request)
    {
        var flow = await _dbContext.IvrFlows.FindAsync(flowId);
        if (flow == null) return null;

        // If this is set as default, unset other defaults
        if (request.IsDefault && !flow.IsDefault)
        {
            await _dbContext.IvrFlows
                .Where(f => f.IsDefault && f.Id != flowId)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.IsDefault, false));
        }

        flow.Name = request.Name;
        flow.Description = request.Description;
        flow.IsActive = request.IsActive;
        flow.IsDefault = request.IsDefault;
        flow.PhoneNumbers = request.PhoneNumbers;
        flow.EntryNodeId = request.EntryNodeId;
        flow.DefaultLanguage = request.DefaultLanguage;
        flow.DefaultVoice = request.DefaultVoice;
        flow.MaxInvalidAttempts = request.MaxInvalidAttempts;
        flow.InputTimeout = request.InputTimeout;
        flow.BusinessHoursStart = request.BusinessHoursStart;
        flow.BusinessHoursEnd = request.BusinessHoursEnd;
        flow.BusinessDays = request.BusinessDays;
        flow.AfterHoursNodeId = request.AfterHoursNodeId;
        flow.UpdatedAtUtc = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Updated IVR flow {FlowId}", flowId);

        return MapToFlowDto(flow);
    }

    public async Task<bool> DeleteFlowAsync(Guid flowId)
    {
        var flow = await _dbContext.IvrFlows.FindAsync(flowId);
        if (flow == null) return false;

        // Check for active sessions
        var hasActiveSessions = await _dbContext.IvrCallSessions
            .AnyAsync(s => s.FlowId == flowId && s.IsActive);

        if (hasActiveSessions)
        {
            _logger.LogWarning("Cannot delete IVR flow {FlowId} - has active sessions", flowId);
            return false;
        }

        _dbContext.IvrFlows.Remove(flow);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Deleted IVR flow {FlowId}", flowId);
        return true;
    }

    public async Task<IvrFlowDto?> DuplicateFlowAsync(Guid flowId, string newName)
    {
        var sourceFlow = await _dbContext.IvrFlows
            .Include(f => f.Nodes)
                .ThenInclude(n => n.MenuOptions)
            .FirstOrDefaultAsync(f => f.Id == flowId);

        if (sourceFlow == null) return null;

        // Create new flow
        var newFlow = new IvrFlow
        {
            Id = Guid.NewGuid(),
            Name = newName,
            Description = sourceFlow.Description,
            IsActive = false, // Start as inactive
            IsDefault = false,
            PhoneNumbers = null, // Clear phone numbers
            DefaultLanguage = sourceFlow.DefaultLanguage,
            DefaultVoice = sourceFlow.DefaultVoice,
            MaxInvalidAttempts = sourceFlow.MaxInvalidAttempts,
            InputTimeout = sourceFlow.InputTimeout,
            BusinessHoursStart = sourceFlow.BusinessHoursStart,
            BusinessHoursEnd = sourceFlow.BusinessHoursEnd,
            BusinessDays = sourceFlow.BusinessDays,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };

        // Map old node IDs to new node IDs
        var nodeIdMap = new Dictionary<Guid, Guid>();

        // Create nodes
        foreach (var sourceNode in sourceFlow.Nodes)
        {
            var newNode = new IvrNode
            {
                Id = Guid.NewGuid(),
                FlowId = newFlow.Id,
                Name = sourceNode.Name,
                NodeType = sourceNode.NodeType,
                PositionX = sourceNode.PositionX,
                PositionY = sourceNode.PositionY,
                MessageText = sourceNode.MessageText,
                AudioUrl = sourceNode.AudioUrl,
                Language = sourceNode.Language,
                Voice = sourceNode.Voice,
                RepeatCount = sourceNode.RepeatCount,
                InvalidInputMessage = sourceNode.InvalidInputMessage,
                TimeoutMessage = sourceNode.TimeoutMessage,
                TransferQueueId = sourceNode.TransferQueueId,
                TransferAgentId = sourceNode.TransferAgentId,
                TransferPhoneNumber = sourceNode.TransferPhoneNumber,
                TransferTimeout = sourceNode.TransferTimeout,
                EnableRecording = sourceNode.EnableRecording,
                NumDigits = sourceNode.NumDigits,
                FinishOnKey = sourceNode.FinishOnKey,
                DigitsVariableName = sourceNode.DigitsVariableName,
                ConditionVariable = sourceNode.ConditionVariable,
                ConditionOperator = sourceNode.ConditionOperator,
                ConditionValue = sourceNode.ConditionValue,
                HttpUrl = sourceNode.HttpUrl,
                HttpMethod = sourceNode.HttpMethod,
                MaxRecordingLength = sourceNode.MaxRecordingLength,
                TranscribeVoicemail = sourceNode.TranscribeVoicemail,
                VoicemailEmail = sourceNode.VoicemailEmail,
                CreatedAtUtc = DateTimeOffset.UtcNow
            };

            nodeIdMap[sourceNode.Id] = newNode.Id;
            newFlow.Nodes.Add(newNode);
        }

        // Update node references
        foreach (var node in newFlow.Nodes)
        {
            var sourceNode = sourceFlow.Nodes.First(n => nodeIdMap[n.Id] == node.Id);

            if (sourceNode.FallbackNodeId.HasValue && nodeIdMap.ContainsKey(sourceNode.FallbackNodeId.Value))
                node.FallbackNodeId = nodeIdMap[sourceNode.FallbackNodeId.Value];

            if (sourceNode.ConditionTrueNodeId.HasValue && nodeIdMap.ContainsKey(sourceNode.ConditionTrueNodeId.Value))
                node.ConditionTrueNodeId = nodeIdMap[sourceNode.ConditionTrueNodeId.Value];

            if (sourceNode.ConditionFalseNodeId.HasValue && nodeIdMap.ContainsKey(sourceNode.ConditionFalseNodeId.Value))
                node.ConditionFalseNodeId = nodeIdMap[sourceNode.ConditionFalseNodeId.Value];

            if (sourceNode.NextNodeId.HasValue && nodeIdMap.ContainsKey(sourceNode.NextNodeId.Value))
                node.NextNodeId = nodeIdMap[sourceNode.NextNodeId.Value];

            // Copy menu options
            foreach (var sourceOption in sourceNode.MenuOptions)
            {
                if (nodeIdMap.ContainsKey(sourceOption.TargetNodeId))
                {
                    node.MenuOptions.Add(new IvrMenuOption
                    {
                        Id = Guid.NewGuid(),
                        NodeId = node.Id,
                        Digit = sourceOption.Digit,
                        Label = sourceOption.Label,
                        Description = sourceOption.Description,
                        TargetNodeId = nodeIdMap[sourceOption.TargetNodeId],
                        DisplayOrder = sourceOption.DisplayOrder
                    });
                }
            }
        }

        // Update entry and after-hours node references
        if (sourceFlow.EntryNodeId.HasValue && nodeIdMap.ContainsKey(sourceFlow.EntryNodeId.Value))
            newFlow.EntryNodeId = nodeIdMap[sourceFlow.EntryNodeId.Value];

        if (sourceFlow.AfterHoursNodeId.HasValue && nodeIdMap.ContainsKey(sourceFlow.AfterHoursNodeId.Value))
            newFlow.AfterHoursNodeId = nodeIdMap[sourceFlow.AfterHoursNodeId.Value];

        _dbContext.IvrFlows.Add(newFlow);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Duplicated IVR flow {SourceFlowId} to {NewFlowId}", flowId, newFlow.Id);

        return MapToFlowDto(newFlow);
    }

    // ==================== Node Management ====================

    public async Task<IvrNodeDto?> GetNodeByIdAsync(Guid nodeId)
    {
        var node = await _dbContext.IvrNodes
            .Include(n => n.MenuOptions)
            .FirstOrDefaultAsync(n => n.Id == nodeId);

        if (node == null) return null;

        return MapToNodeDto(node);
    }

    public async Task<IvrNodeDto> CreateNodeAsync(CreateIvrNodeRequest request)
    {
        var node = new IvrNode
        {
            Id = Guid.NewGuid(),
            FlowId = request.FlowId,
            Name = request.Name,
            NodeType = request.NodeType,
            PositionX = request.PositionX,
            PositionY = request.PositionY,
            MessageText = request.MessageText,
            AudioUrl = request.AudioUrl,
            Language = request.Language,
            Voice = request.Voice,
            RepeatCount = request.RepeatCount,
            InvalidInputMessage = request.InvalidInputMessage,
            TimeoutMessage = request.TimeoutMessage,
            FallbackNodeId = request.FallbackNodeId,
            TransferQueueId = request.TransferQueueId,
            TransferAgentId = request.TransferAgentId,
            TransferPhoneNumber = request.TransferPhoneNumber,
            TransferTimeout = request.TransferTimeout,
            EnableRecording = request.EnableRecording,
            NumDigits = request.NumDigits,
            FinishOnKey = request.FinishOnKey,
            DigitsVariableName = request.DigitsVariableName,
            ConditionVariable = request.ConditionVariable,
            ConditionOperator = request.ConditionOperator,
            ConditionValue = request.ConditionValue,
            ConditionTrueNodeId = request.ConditionTrueNodeId,
            ConditionFalseNodeId = request.ConditionFalseNodeId,
            HttpUrl = request.HttpUrl,
            HttpMethod = request.HttpMethod,
            NextNodeId = request.NextNodeId,
            MaxRecordingLength = request.MaxRecordingLength,
            TranscribeVoicemail = request.TranscribeVoicemail,
            VoicemailEmail = request.VoicemailEmail,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };

        _dbContext.IvrNodes.Add(node);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Created IVR node {NodeId} in flow {FlowId}", node.Id, request.FlowId);

        return MapToNodeDto(node);
    }

    public async Task<IvrNodeDto?> UpdateNodeAsync(Guid nodeId, UpdateIvrNodeRequest request)
    {
        var node = await _dbContext.IvrNodes.FindAsync(nodeId);
        if (node == null) return null;

        node.Name = request.Name;
        node.NodeType = request.NodeType;
        node.PositionX = request.PositionX;
        node.PositionY = request.PositionY;
        node.MessageText = request.MessageText;
        node.AudioUrl = request.AudioUrl;
        node.Language = request.Language;
        node.Voice = request.Voice;
        node.RepeatCount = request.RepeatCount;
        node.InvalidInputMessage = request.InvalidInputMessage;
        node.TimeoutMessage = request.TimeoutMessage;
        node.FallbackNodeId = request.FallbackNodeId;
        node.TransferQueueId = request.TransferQueueId;
        node.TransferAgentId = request.TransferAgentId;
        node.TransferPhoneNumber = request.TransferPhoneNumber;
        node.TransferTimeout = request.TransferTimeout;
        node.EnableRecording = request.EnableRecording;
        node.NumDigits = request.NumDigits;
        node.FinishOnKey = request.FinishOnKey;
        node.DigitsVariableName = request.DigitsVariableName;
        node.ConditionVariable = request.ConditionVariable;
        node.ConditionOperator = request.ConditionOperator;
        node.ConditionValue = request.ConditionValue;
        node.ConditionTrueNodeId = request.ConditionTrueNodeId;
        node.ConditionFalseNodeId = request.ConditionFalseNodeId;
        node.HttpUrl = request.HttpUrl;
        node.HttpMethod = request.HttpMethod;
        node.NextNodeId = request.NextNodeId;
        node.MaxRecordingLength = request.MaxRecordingLength;
        node.TranscribeVoicemail = request.TranscribeVoicemail;
        node.VoicemailEmail = request.VoicemailEmail;
        node.UpdatedAtUtc = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Updated IVR node {NodeId}", nodeId);

        return MapToNodeDto(node);
    }

    public async Task<bool> DeleteNodeAsync(Guid nodeId)
    {
        var node = await _dbContext.IvrNodes.FindAsync(nodeId);
        if (node == null) return false;

        // Check if this node is referenced by other nodes
        var isReferenced = await _dbContext.IvrNodes
            .AnyAsync(n => n.FallbackNodeId == nodeId ||
                          n.ConditionTrueNodeId == nodeId ||
                          n.ConditionFalseNodeId == nodeId ||
                          n.NextNodeId == nodeId);

        if (isReferenced)
        {
            _logger.LogWarning("Cannot delete IVR node {NodeId} - referenced by other nodes", nodeId);
            return false;
        }

        // Check if this node is referenced by menu options
        var isMenuTarget = await _dbContext.IvrMenuOptions
            .AnyAsync(o => o.TargetNodeId == nodeId);

        if (isMenuTarget)
        {
            _logger.LogWarning("Cannot delete IVR node {NodeId} - referenced by menu options", nodeId);
            return false;
        }

        // Check if this is the entry node
        var isEntryNode = await _dbContext.IvrFlows
            .AnyAsync(f => f.EntryNodeId == nodeId || f.AfterHoursNodeId == nodeId);

        if (isEntryNode)
        {
            _logger.LogWarning("Cannot delete IVR node {NodeId} - is entry or after-hours node", nodeId);
            return false;
        }

        _dbContext.IvrNodes.Remove(node);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Deleted IVR node {NodeId}", nodeId);
        return true;
    }

    // ==================== Menu Option Management ====================

    public async Task<IvrMenuOptionDto> CreateMenuOptionAsync(CreateMenuOptionRequest request)
    {
        var option = new IvrMenuOption
        {
            Id = Guid.NewGuid(),
            NodeId = request.NodeId,
            Digit = request.Digit,
            Label = request.Label,
            Description = request.Description,
            TargetNodeId = request.TargetNodeId,
            DisplayOrder = request.DisplayOrder
        };

        _dbContext.IvrMenuOptions.Add(option);
        await _dbContext.SaveChangesAsync();

        return MapToMenuOptionDto(option);
    }

    public async Task<IvrMenuOptionDto?> UpdateMenuOptionAsync(Guid optionId, UpdateMenuOptionRequest request)
    {
        var option = await _dbContext.IvrMenuOptions.FindAsync(optionId);
        if (option == null) return null;

        option.Digit = request.Digit;
        option.Label = request.Label;
        option.Description = request.Description;
        option.TargetNodeId = request.TargetNodeId;
        option.DisplayOrder = request.DisplayOrder;

        await _dbContext.SaveChangesAsync();

        return MapToMenuOptionDto(option);
    }

    public async Task<bool> DeleteMenuOptionAsync(Guid optionId)
    {
        var option = await _dbContext.IvrMenuOptions.FindAsync(optionId);
        if (option == null) return false;

        _dbContext.IvrMenuOptions.Remove(option);
        await _dbContext.SaveChangesAsync();

        return true;
    }

    // ==================== TwiML Generation ====================

    public async Task<IvrTwimlResponse> GenerateEntryTwimlAsync(IvrTwimlRequest request)
    {
        // Find the appropriate flow
        var flow = await GetFlowForPhoneNumberAsync(request.To);

        if (flow == null || !flow.EntryNodeId.HasValue)
        {
            _logger.LogWarning("No IVR flow found for {PhoneNumber}, returning empty response", request.To);
            return GenerateNoIvrResponse();
        }

        // Check business hours
        var nodeId = flow.EntryNodeId.Value;
        if (!IsWithinBusinessHours(flow) && flow.AfterHoursNodeId.HasValue)
        {
            nodeId = flow.AfterHoursNodeId.Value;
        }

        var entryNode = flow.Nodes.FirstOrDefault(n => n.Id == nodeId);
        if (entryNode == null)
        {
            return GenerateNoIvrResponse();
        }

        // Create or get session
        var session = await GetOrCreateSessionAsync(request.CallSid, flow.Id, nodeId, request.From, request.To);

        // Generate TwiML for the entry node
        return await GenerateTwimlForNodeAsync(entryNode, flow, session);
    }

    public async Task<IvrTwimlResponse> ProcessDtmfInputAsync(IvrTwimlRequest request)
    {
        var session = await _dbContext.IvrCallSessions
            .Include(s => s.Flow)
                .ThenInclude(f => f.Nodes)
                    .ThenInclude(n => n.MenuOptions)
            .Include(s => s.CurrentNode)
                .ThenInclude(n => n.MenuOptions)
            .FirstOrDefaultAsync(s => s.CallSid == request.CallSid && s.IsActive);

        if (session == null)
        {
            _logger.LogWarning("No active IVR session found for CallSid {CallSid}", request.CallSid);
            return GenerateNoIvrResponse();
        }

        var currentNode = session.CurrentNode;
        var flow = session.Flow;
        var digits = request.Digits ?? "";

        // Update session with last digits
        session.LastDigits = digits;

        // Handle based on node type
        IvrNode? nextNode = null;

        switch (currentNode.NodeType)
        {
            case IvrNodeType.Menu:
                // Find matching menu option
                var option = currentNode.MenuOptions.FirstOrDefault(o => o.Digit == digits);
                if (option != null)
                {
                    nextNode = flow.Nodes.FirstOrDefault(n => n.Id == option.TargetNodeId);
                    session.InvalidAttempts = 0;
                }
                else
                {
                    // Invalid input
                    session.InvalidAttempts++;
                    if (session.InvalidAttempts >= flow.MaxInvalidAttempts)
                    {
                        // Go to fallback
                        if (currentNode.FallbackNodeId.HasValue)
                        {
                            nextNode = flow.Nodes.FirstOrDefault(n => n.Id == currentNode.FallbackNodeId.Value);
                        }
                    }
                    else
                    {
                        // Replay menu with invalid input message
                        var response = GenerateMenuTwiml(MapToNodeDto(currentNode), MapToFlowDetailDto(flow), session.Id, true);
                        await _dbContext.SaveChangesAsync();
                        return response;
                    }
                }
                break;

            case IvrNodeType.CollectDigits:
                // Store collected digits in session variables
                var variables = string.IsNullOrEmpty(session.Variables)
                    ? new Dictionary<string, string>()
                    : JsonSerializer.Deserialize<Dictionary<string, string>>(session.Variables) ?? new Dictionary<string, string>();

                if (!string.IsNullOrEmpty(currentNode.DigitsVariableName))
                {
                    variables[currentNode.DigitsVariableName] = digits;
                    session.Variables = JsonSerializer.Serialize(variables);
                }

                // Move to next node
                if (currentNode.NextNodeId.HasValue)
                {
                    nextNode = flow.Nodes.FirstOrDefault(n => n.Id == currentNode.NextNodeId.Value);
                }
                break;

            default:
                // For other node types, just use NextNodeId if available
                if (currentNode.NextNodeId.HasValue)
                {
                    nextNode = flow.Nodes.FirstOrDefault(n => n.Id == currentNode.NextNodeId.Value);
                }
                break;
        }

        if (nextNode != null)
        {
            // Update session
            session.CurrentNodeId = nextNode.Id;
            var path = string.IsNullOrEmpty(session.NodePath)
                ? new List<Guid>()
                : JsonSerializer.Deserialize<List<Guid>>(session.NodePath) ?? new List<Guid>();
            path.Add(nextNode.Id);
            session.NodePath = JsonSerializer.Serialize(path);

            await _dbContext.SaveChangesAsync();

            // Generate TwiML for next node
            return await GenerateTwimlForNodeAsync(MapToNodeDto(nextNode), MapToFlowDetailDto(flow), session);
        }

        // No valid next node - end session
        session.IsActive = false;
        session.EndedAtUtc = DateTimeOffset.UtcNow;
        session.Outcome = "no_valid_path";
        await _dbContext.SaveChangesAsync();

        return GenerateHangupResponse("We're sorry, we couldn't process your request. Goodbye.");
    }

    // ==================== Session Management ====================

    public async Task<IvrCallSessionDto?> GetSessionByCallSidAsync(string callSid)
    {
        var session = await _dbContext.IvrCallSessions
            .Include(s => s.Flow)
            .Include(s => s.CurrentNode)
            .FirstOrDefaultAsync(s => s.CallSid == callSid);

        if (session == null) return null;

        return MapToSessionDto(session);
    }

    public async Task<IvrCallSessionDto?> GetSessionByIdAsync(Guid sessionId)
    {
        var session = await _dbContext.IvrCallSessions
            .Include(s => s.Flow)
            .Include(s => s.CurrentNode)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session == null) return null;

        return MapToSessionDto(session);
    }

    public async System.Threading.Tasks.Task EndSessionAsync(string callSid, string outcome)
    {
        var session = await _dbContext.IvrCallSessions
            .FirstOrDefaultAsync(s => s.CallSid == callSid && s.IsActive);

        if (session != null)
        {
            session.IsActive = false;
            session.EndedAtUtc = DateTimeOffset.UtcNow;
            session.Outcome = outcome;
            await _dbContext.SaveChangesAsync();
        }
    }

    // ==================== Import/Export ====================

    public async Task<IvrFlowExportDto> ExportFlowAsync(Guid flowId)
    {
        var flow = await _dbContext.IvrFlows
            .Include(f => f.Nodes)
                .ThenInclude(n => n.MenuOptions)
            .FirstOrDefaultAsync(f => f.Id == flowId);

        if (flow == null)
        {
            throw new InvalidOperationException($"Flow {flowId} not found");
        }

        var nodeNameMap = flow.Nodes.ToDictionary(n => n.Id, n => n.Name);

        return new IvrFlowExportDto
        {
            Name = flow.Name,
            Description = flow.Description,
            DefaultLanguage = flow.DefaultLanguage,
            DefaultVoice = flow.DefaultVoice,
            MaxInvalidAttempts = flow.MaxInvalidAttempts,
            InputTimeout = flow.InputTimeout,
            BusinessHoursStart = flow.BusinessHoursStart,
            BusinessHoursEnd = flow.BusinessHoursEnd,
            BusinessDays = flow.BusinessDays,
            EntryNodeName = flow.EntryNodeId.HasValue && nodeNameMap.ContainsKey(flow.EntryNodeId.Value)
                ? nodeNameMap[flow.EntryNodeId.Value] : null,
            AfterHoursNodeName = flow.AfterHoursNodeId.HasValue && nodeNameMap.ContainsKey(flow.AfterHoursNodeId.Value)
                ? nodeNameMap[flow.AfterHoursNodeId.Value] : null,
            Nodes = flow.Nodes.Select(n => new IvrNodeExportDto
            {
                Name = n.Name,
                NodeType = n.NodeType,
                PositionX = n.PositionX,
                PositionY = n.PositionY,
                MessageText = n.MessageText,
                AudioUrl = n.AudioUrl,
                Language = n.Language,
                Voice = n.Voice,
                RepeatCount = n.RepeatCount,
                InvalidInputMessage = n.InvalidInputMessage,
                TimeoutMessage = n.TimeoutMessage,
                FallbackNodeName = n.FallbackNodeId.HasValue && nodeNameMap.ContainsKey(n.FallbackNodeId.Value)
                    ? nodeNameMap[n.FallbackNodeId.Value] : null,
                TransferPhoneNumber = n.TransferPhoneNumber,
                TransferTimeout = n.TransferTimeout,
                EnableRecording = n.EnableRecording,
                NumDigits = n.NumDigits,
                FinishOnKey = n.FinishOnKey,
                DigitsVariableName = n.DigitsVariableName,
                ConditionVariable = n.ConditionVariable,
                ConditionOperator = n.ConditionOperator,
                ConditionValue = n.ConditionValue,
                ConditionTrueNodeName = n.ConditionTrueNodeId.HasValue && nodeNameMap.ContainsKey(n.ConditionTrueNodeId.Value)
                    ? nodeNameMap[n.ConditionTrueNodeId.Value] : null,
                ConditionFalseNodeName = n.ConditionFalseNodeId.HasValue && nodeNameMap.ContainsKey(n.ConditionFalseNodeId.Value)
                    ? nodeNameMap[n.ConditionFalseNodeId.Value] : null,
                HttpUrl = n.HttpUrl,
                HttpMethod = n.HttpMethod,
                NextNodeName = n.NextNodeId.HasValue && nodeNameMap.ContainsKey(n.NextNodeId.Value)
                    ? nodeNameMap[n.NextNodeId.Value] : null,
                MaxRecordingLength = n.MaxRecordingLength,
                TranscribeVoicemail = n.TranscribeVoicemail,
                VoicemailEmail = n.VoicemailEmail,
                MenuOptions = n.MenuOptions.Select(o => new IvrMenuOptionExportDto
                {
                    Digit = o.Digit,
                    Label = o.Label,
                    Description = o.Description,
                    TargetNodeName = nodeNameMap.ContainsKey(o.TargetNodeId) ? nodeNameMap[o.TargetNodeId] : "",
                    DisplayOrder = o.DisplayOrder
                }).ToList()
            }).ToList()
        };
    }

    public async Task<IvrFlowDto> ImportFlowAsync(IvrFlowExportDto importData, string? newName = null)
    {
        // Create the flow
        var flow = new IvrFlow
        {
            Id = Guid.NewGuid(),
            Name = newName ?? importData.Name,
            Description = importData.Description,
            IsActive = false,
            IsDefault = false,
            DefaultLanguage = importData.DefaultLanguage,
            DefaultVoice = importData.DefaultVoice,
            MaxInvalidAttempts = importData.MaxInvalidAttempts,
            InputTimeout = importData.InputTimeout,
            BusinessHoursStart = importData.BusinessHoursStart,
            BusinessHoursEnd = importData.BusinessHoursEnd,
            BusinessDays = importData.BusinessDays,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };

        // Create nodes and build name-to-id map
        var nodeNameMap = new Dictionary<string, Guid>();
        foreach (var nodeData in importData.Nodes)
        {
            var node = new IvrNode
            {
                Id = Guid.NewGuid(),
                FlowId = flow.Id,
                Name = nodeData.Name,
                NodeType = nodeData.NodeType,
                PositionX = nodeData.PositionX,
                PositionY = nodeData.PositionY,
                MessageText = nodeData.MessageText,
                AudioUrl = nodeData.AudioUrl,
                Language = nodeData.Language,
                Voice = nodeData.Voice,
                RepeatCount = nodeData.RepeatCount,
                InvalidInputMessage = nodeData.InvalidInputMessage,
                TimeoutMessage = nodeData.TimeoutMessage,
                TransferPhoneNumber = nodeData.TransferPhoneNumber,
                TransferTimeout = nodeData.TransferTimeout,
                EnableRecording = nodeData.EnableRecording,
                NumDigits = nodeData.NumDigits,
                FinishOnKey = nodeData.FinishOnKey,
                DigitsVariableName = nodeData.DigitsVariableName,
                ConditionVariable = nodeData.ConditionVariable,
                ConditionOperator = nodeData.ConditionOperator,
                ConditionValue = nodeData.ConditionValue,
                HttpUrl = nodeData.HttpUrl,
                HttpMethod = nodeData.HttpMethod,
                MaxRecordingLength = nodeData.MaxRecordingLength,
                TranscribeVoicemail = nodeData.TranscribeVoicemail,
                VoicemailEmail = nodeData.VoicemailEmail,
                CreatedAtUtc = DateTimeOffset.UtcNow
            };

            nodeNameMap[nodeData.Name] = node.Id;
            flow.Nodes.Add(node);
        }

        // Update node references
        foreach (var node in flow.Nodes)
        {
            var nodeData = importData.Nodes.First(n => n.Name == node.Name);

            if (!string.IsNullOrEmpty(nodeData.FallbackNodeName) && nodeNameMap.ContainsKey(nodeData.FallbackNodeName))
                node.FallbackNodeId = nodeNameMap[nodeData.FallbackNodeName];

            if (!string.IsNullOrEmpty(nodeData.ConditionTrueNodeName) && nodeNameMap.ContainsKey(nodeData.ConditionTrueNodeName))
                node.ConditionTrueNodeId = nodeNameMap[nodeData.ConditionTrueNodeName];

            if (!string.IsNullOrEmpty(nodeData.ConditionFalseNodeName) && nodeNameMap.ContainsKey(nodeData.ConditionFalseNodeName))
                node.ConditionFalseNodeId = nodeNameMap[nodeData.ConditionFalseNodeName];

            if (!string.IsNullOrEmpty(nodeData.NextNodeName) && nodeNameMap.ContainsKey(nodeData.NextNodeName))
                node.NextNodeId = nodeNameMap[nodeData.NextNodeName];

            // Add menu options
            foreach (var optionData in nodeData.MenuOptions)
            {
                if (nodeNameMap.ContainsKey(optionData.TargetNodeName))
                {
                    node.MenuOptions.Add(new IvrMenuOption
                    {
                        Id = Guid.NewGuid(),
                        NodeId = node.Id,
                        Digit = optionData.Digit,
                        Label = optionData.Label,
                        Description = optionData.Description,
                        TargetNodeId = nodeNameMap[optionData.TargetNodeName],
                        DisplayOrder = optionData.DisplayOrder
                    });
                }
            }
        }

        // Set entry and after-hours nodes
        if (!string.IsNullOrEmpty(importData.EntryNodeName) && nodeNameMap.ContainsKey(importData.EntryNodeName))
            flow.EntryNodeId = nodeNameMap[importData.EntryNodeName];

        if (!string.IsNullOrEmpty(importData.AfterHoursNodeName) && nodeNameMap.ContainsKey(importData.AfterHoursNodeName))
            flow.AfterHoursNodeId = nodeNameMap[importData.AfterHoursNodeName];

        _dbContext.IvrFlows.Add(flow);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Imported IVR flow {FlowId}: {Name}", flow.Id, flow.Name);

        return MapToFlowDto(flow);
    }

    // ==================== Validation ====================

    public async Task<List<string>> ValidateFlowAsync(Guid flowId)
    {
        var errors = new List<string>();

        var flow = await _dbContext.IvrFlows
            .Include(f => f.Nodes)
                .ThenInclude(n => n.MenuOptions)
            .FirstOrDefaultAsync(f => f.Id == flowId);

        if (flow == null)
        {
            errors.Add("Flow not found");
            return errors;
        }

        // Check entry node
        if (!flow.EntryNodeId.HasValue)
        {
            errors.Add("No entry node configured");
        }
        else if (!flow.Nodes.Any(n => n.Id == flow.EntryNodeId.Value))
        {
            errors.Add("Entry node reference is invalid");
        }

        // Check after-hours node if business hours are set
        if (!string.IsNullOrEmpty(flow.BusinessHoursStart) && !string.IsNullOrEmpty(flow.BusinessHoursEnd))
        {
            if (!flow.AfterHoursNodeId.HasValue)
            {
                errors.Add("Business hours configured but no after-hours node set");
            }
            else if (!flow.Nodes.Any(n => n.Id == flow.AfterHoursNodeId.Value))
            {
                errors.Add("After-hours node reference is invalid");
            }
        }

        // Validate each node
        foreach (var node in flow.Nodes)
        {
            var nodeErrors = ValidateNode(node, flow.Nodes.ToList());
            errors.AddRange(nodeErrors.Select(e => $"Node '{node.Name}': {e}"));
        }

        return errors;
    }

    // ==================== Private Helper Methods ====================

    private List<string> ValidateNode(IvrNode node, List<IvrNode> allNodes)
    {
        var errors = new List<string>();

        switch (node.NodeType)
        {
            case IvrNodeType.Menu:
                if (!node.MenuOptions.Any())
                {
                    errors.Add("Menu has no options");
                }
                foreach (var option in node.MenuOptions)
                {
                    if (!allNodes.Any(n => n.Id == option.TargetNodeId))
                    {
                        errors.Add($"Menu option '{option.Digit}' has invalid target node");
                    }
                }
                break;

            case IvrNodeType.TransferToQueue:
                if (!node.TransferQueueId.HasValue)
                {
                    errors.Add("Transfer to queue node has no queue configured");
                }
                break;

            case IvrNodeType.TransferToNumber:
                if (string.IsNullOrEmpty(node.TransferPhoneNumber))
                {
                    errors.Add("Transfer to number node has no phone number configured");
                }
                break;

            case IvrNodeType.CollectDigits:
                if (!node.NumDigits.HasValue && string.IsNullOrEmpty(node.FinishOnKey))
                {
                    errors.Add("Collect digits node needs either NumDigits or FinishOnKey configured");
                }
                break;

            case IvrNodeType.Condition:
                if (string.IsNullOrEmpty(node.ConditionVariable))
                {
                    errors.Add("Condition node has no variable configured");
                }
                if (!node.ConditionTrueNodeId.HasValue)
                {
                    errors.Add("Condition node has no true path configured");
                }
                if (!node.ConditionFalseNodeId.HasValue)
                {
                    errors.Add("Condition node has no false path configured");
                }
                break;
        }

        return errors;
    }

    private async Task<IvrCallSession> GetOrCreateSessionAsync(string callSid, Guid flowId, Guid entryNodeId, string callerNumber, string calledNumber)
    {
        var session = await _dbContext.IvrCallSessions
            .FirstOrDefaultAsync(s => s.CallSid == callSid);

        if (session == null)
        {
            session = new IvrCallSession
            {
                Id = Guid.NewGuid(),
                CallSid = callSid,
                FlowId = flowId,
                CurrentNodeId = entryNodeId,
                CallerNumber = callerNumber,
                CalledNumber = calledNumber,
                NodePath = JsonSerializer.Serialize(new List<Guid> { entryNodeId }),
                IsActive = true,
                StartedAtUtc = DateTimeOffset.UtcNow
            };

            _dbContext.IvrCallSessions.Add(session);
            await _dbContext.SaveChangesAsync();
        }

        return session;
    }

    private async Task<IvrTwimlResponse> GenerateTwimlForNodeAsync(IvrNodeDto node, IvrFlowDetailDto flow, IvrCallSession session)
    {
        var response = new VoiceResponse();
        var language = node.Language ?? flow.DefaultLanguage;
        var voice = node.Voice ?? flow.DefaultVoice;

        switch (node.NodeType)
        {
            case IvrNodeType.Menu:
                return GenerateMenuTwiml(node, flow, session.Id, false);

            case IvrNodeType.PlayMessage:
                if (!string.IsNullOrEmpty(node.AudioUrl))
                {
                    response.Play(new Uri(node.AudioUrl));
                }
                else if (!string.IsNullOrEmpty(node.MessageText))
                {
                    response.Say(node.MessageText, language: language, voice: voice);
                }
                if (node.NextNodeId.HasValue)
                {
                    response.Redirect(new Uri($"{_baseWebhookUrl}/api/ivr/webhook/next?sessionId={session.Id}&nodeId={node.NextNodeId}"));
                }
                break;

            case IvrNodeType.TransferToQueue:
                // End IVR session before transfer
                session.IsActive = false;
                session.EndedAtUtc = DateTimeOffset.UtcNow;
                session.Outcome = "transfer_queue";
                await _dbContext.SaveChangesAsync();

                // Redirect to main call handling
                response.Redirect(new Uri($"{_baseWebhookUrl}/api/twilio/voice/incoming?fromIvr=true&queueId={node.TransferQueueId}"));
                break;

            case IvrNodeType.TransferToAgent:
                session.IsActive = false;
                session.EndedAtUtc = DateTimeOffset.UtcNow;
                session.Outcome = "transfer_agent";
                await _dbContext.SaveChangesAsync();

                response.Redirect(new Uri($"{_baseWebhookUrl}/api/twilio/voice/incoming?fromIvr=true&agentId={node.TransferAgentId}"));
                break;

            case IvrNodeType.TransferToNumber:
                session.IsActive = false;
                session.EndedAtUtc = DateTimeOffset.UtcNow;
                session.Outcome = "transfer_external";
                await _dbContext.SaveChangesAsync();

                var dial = new Dial(timeout: node.TransferTimeout);
                dial.Number(node.TransferPhoneNumber!);
                response.Append(dial);
                break;

            case IvrNodeType.Voicemail:
                if (!string.IsNullOrEmpty(node.MessageText))
                {
                    response.Say(node.MessageText, language: language, voice: voice);
                }
                else
                {
                    response.Say("Please leave a message after the tone.", language: language, voice: voice);
                }

                var record = new Record
                {
                    MaxLength = node.MaxRecordingLength,
                    Action = new Uri($"{_baseWebhookUrl}/api/twilio/voice/voicemail"),
                    Transcribe = node.TranscribeVoicemail,
                    PlayBeep = true
                };
                response.Append(record);

                session.IsActive = false;
                session.EndedAtUtc = DateTimeOffset.UtcNow;
                session.Outcome = "voicemail";
                await _dbContext.SaveChangesAsync();
                break;

            case IvrNodeType.Hangup:
                if (!string.IsNullOrEmpty(node.MessageText))
                {
                    response.Say(node.MessageText, language: language, voice: voice);
                }
                response.Hangup();

                session.IsActive = false;
                session.EndedAtUtc = DateTimeOffset.UtcNow;
                session.Outcome = "hangup";
                await _dbContext.SaveChangesAsync();
                break;

            case IvrNodeType.CollectDigits:
                var gather = new Gather(
                    numDigits: node.NumDigits,
                    finishOnKey: node.FinishOnKey ?? "#",
                    timeout: flow.InputTimeout,
                    action: new Uri($"{_baseWebhookUrl}/api/ivr/webhook/dtmf?sessionId={session.Id}")
                );
                if (!string.IsNullOrEmpty(node.MessageText))
                {
                    gather.Say(node.MessageText, language: language, voice: voice);
                }
                response.Append(gather);
                break;

            default:
                response.Say("We're sorry, an error occurred. Goodbye.", language: language, voice: voice);
                response.Hangup();
                break;
        }

        return new IvrTwimlResponse
        {
            Twiml = response.ToString(),
            SessionId = session.Id,
            CurrentNodeId = node.Id,
            Outcome = session.Outcome
        };
    }

    private IvrTwimlResponse GenerateMenuTwiml(IvrNodeDto node, IvrFlowDetailDto flow, Guid sessionId, bool showInvalidMessage)
    {
        var response = new VoiceResponse();
        var language = node.Language ?? flow.DefaultLanguage;
        var voice = node.Voice ?? flow.DefaultVoice;

        var gather = new Gather(
            numDigits: 1,
            timeout: flow.InputTimeout,
            action: new Uri($"{_baseWebhookUrl}/api/ivr/webhook/dtmf?sessionId={sessionId}")
        );

        // Invalid input message
        if (showInvalidMessage && !string.IsNullOrEmpty(node.InvalidInputMessage))
        {
            gather.Say(node.InvalidInputMessage, language: language, voice: voice);
        }

        // Main menu message
        if (!string.IsNullOrEmpty(node.AudioUrl))
        {
            gather.Play(new Uri(node.AudioUrl));
        }
        else if (!string.IsNullOrEmpty(node.MessageText))
        {
            gather.Say(node.MessageText, language: language, voice: voice);
        }

        // Menu options
        foreach (var option in node.MenuOptions.OrderBy(o => o.DisplayOrder))
        {
            if (!string.IsNullOrEmpty(option.Description))
            {
                gather.Say(option.Description, language: language, voice: voice);
            }
        }

        response.Append(gather);

        // Timeout handling
        if (!string.IsNullOrEmpty(node.TimeoutMessage))
        {
            response.Say(node.TimeoutMessage, language: language, voice: voice);
        }
        response.Redirect(new Uri($"{_baseWebhookUrl}/api/ivr/webhook/timeout?sessionId={sessionId}"));

        return new IvrTwimlResponse
        {
            Twiml = response.ToString(),
            SessionId = sessionId,
            CurrentNodeId = node.Id
        };
    }

    private IvrTwimlResponse GenerateNoIvrResponse()
    {
        var response = new VoiceResponse();
        // Just redirect to normal call handling
        response.Redirect(new Uri($"{_baseWebhookUrl}/api/twilio/voice/incoming?fromIvr=false"));

        return new IvrTwimlResponse
        {
            Twiml = response.ToString()
        };
    }

    private IvrTwimlResponse GenerateHangupResponse(string message)
    {
        var response = new VoiceResponse();
        response.Say(message);
        response.Hangup();

        return new IvrTwimlResponse
        {
            Twiml = response.ToString(),
            Outcome = "error"
        };
    }

    private bool IsWithinBusinessHours(IvrFlowDetailDto flow)
    {
        if (string.IsNullOrEmpty(flow.BusinessHoursStart) || string.IsNullOrEmpty(flow.BusinessHoursEnd))
        {
            return true; // No business hours configured = always open
        }

        var now = DateTime.Now; // Use local time for business hours

        // Check day of week
        if (!string.IsNullOrEmpty(flow.BusinessDays))
        {
            var days = flow.BusinessDays.Split(',').Select(d => d.Trim());
            if (!days.Contains(now.DayOfWeek.ToString()))
            {
                return false;
            }
        }

        // Check time
        if (TimeSpan.TryParse(flow.BusinessHoursStart, out var start) &&
            TimeSpan.TryParse(flow.BusinessHoursEnd, out var end))
        {
            var currentTime = now.TimeOfDay;
            return currentTime >= start && currentTime <= end;
        }

        return true;
    }

    // ==================== Mapping Methods ====================

    private IvrFlowDto MapToFlowDto(IvrFlow flow)
    {
        return new IvrFlowDto
        {
            Id = flow.Id,
            Name = flow.Name,
            Description = flow.Description,
            IsActive = flow.IsActive,
            IsDefault = flow.IsDefault,
            PhoneNumbers = flow.PhoneNumbers,
            EntryNodeId = flow.EntryNodeId,
            DefaultLanguage = flow.DefaultLanguage,
            DefaultVoice = flow.DefaultVoice,
            MaxInvalidAttempts = flow.MaxInvalidAttempts,
            InputTimeout = flow.InputTimeout,
            BusinessHoursStart = flow.BusinessHoursStart,
            BusinessHoursEnd = flow.BusinessHoursEnd,
            BusinessDays = flow.BusinessDays,
            AfterHoursNodeId = flow.AfterHoursNodeId,
            CreatedAtUtc = flow.CreatedAtUtc,
            UpdatedAtUtc = flow.UpdatedAtUtc,
            NodeCount = flow.Nodes?.Count ?? 0
        };
    }

    private IvrFlowDetailDto MapToFlowDetailDto(IvrFlow flow)
    {
        return new IvrFlowDetailDto
        {
            Id = flow.Id,
            Name = flow.Name,
            Description = flow.Description,
            IsActive = flow.IsActive,
            IsDefault = flow.IsDefault,
            PhoneNumbers = flow.PhoneNumbers,
            EntryNodeId = flow.EntryNodeId,
            DefaultLanguage = flow.DefaultLanguage,
            DefaultVoice = flow.DefaultVoice,
            MaxInvalidAttempts = flow.MaxInvalidAttempts,
            InputTimeout = flow.InputTimeout,
            BusinessHoursStart = flow.BusinessHoursStart,
            BusinessHoursEnd = flow.BusinessHoursEnd,
            BusinessDays = flow.BusinessDays,
            AfterHoursNodeId = flow.AfterHoursNodeId,
            CreatedAtUtc = flow.CreatedAtUtc,
            UpdatedAtUtc = flow.UpdatedAtUtc,
            NodeCount = flow.Nodes?.Count ?? 0,
            Nodes = flow.Nodes?.Select(MapToNodeDto).ToList() ?? new List<IvrNodeDto>()
        };
    }

    private IvrNodeDto MapToNodeDto(IvrNode node)
    {
        return new IvrNodeDto
        {
            Id = node.Id,
            FlowId = node.FlowId,
            Name = node.Name,
            NodeType = node.NodeType,
            PositionX = node.PositionX,
            PositionY = node.PositionY,
            MessageText = node.MessageText,
            AudioUrl = node.AudioUrl,
            Language = node.Language,
            Voice = node.Voice,
            RepeatCount = node.RepeatCount,
            InvalidInputMessage = node.InvalidInputMessage,
            TimeoutMessage = node.TimeoutMessage,
            FallbackNodeId = node.FallbackNodeId,
            TransferQueueId = node.TransferQueueId,
            TransferAgentId = node.TransferAgentId,
            TransferPhoneNumber = node.TransferPhoneNumber,
            TransferTimeout = node.TransferTimeout,
            EnableRecording = node.EnableRecording,
            NumDigits = node.NumDigits,
            FinishOnKey = node.FinishOnKey,
            DigitsVariableName = node.DigitsVariableName,
            ConditionVariable = node.ConditionVariable,
            ConditionOperator = node.ConditionOperator,
            ConditionValue = node.ConditionValue,
            ConditionTrueNodeId = node.ConditionTrueNodeId,
            ConditionFalseNodeId = node.ConditionFalseNodeId,
            HttpUrl = node.HttpUrl,
            HttpMethod = node.HttpMethod,
            NextNodeId = node.NextNodeId,
            MaxRecordingLength = node.MaxRecordingLength,
            TranscribeVoicemail = node.TranscribeVoicemail,
            VoicemailEmail = node.VoicemailEmail,
            MenuOptions = node.MenuOptions?.Select(MapToMenuOptionDto).ToList() ?? new List<IvrMenuOptionDto>()
        };
    }

    private IvrMenuOptionDto MapToMenuOptionDto(IvrMenuOption option)
    {
        return new IvrMenuOptionDto
        {
            Id = option.Id,
            NodeId = option.NodeId,
            Digit = option.Digit,
            Label = option.Label,
            Description = option.Description,
            TargetNodeId = option.TargetNodeId,
            DisplayOrder = option.DisplayOrder
        };
    }

    private IvrCallSessionDto MapToSessionDto(IvrCallSession session)
    {
        return new IvrCallSessionDto
        {
            Id = session.Id,
            CallSid = session.CallSid,
            FlowId = session.FlowId,
            FlowName = session.Flow?.Name ?? "",
            CurrentNodeId = session.CurrentNodeId,
            CurrentNodeName = session.CurrentNode?.Name ?? "",
            CallerNumber = session.CallerNumber,
            CalledNumber = session.CalledNumber,
            Variables = string.IsNullOrEmpty(session.Variables)
                ? null
                : JsonSerializer.Deserialize<Dictionary<string, string>>(session.Variables),
            NodePath = string.IsNullOrEmpty(session.NodePath)
                ? null
                : JsonSerializer.Deserialize<List<Guid>>(session.NodePath),
            InvalidAttempts = session.InvalidAttempts,
            LastDigits = session.LastDigits,
            IsActive = session.IsActive,
            Outcome = session.Outcome,
            StartedAtUtc = session.StartedAtUtc,
            EndedAtUtc = session.EndedAtUtc
        };
    }
}
