import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Modal, Input, Select } from '../../../components/ui';
import apiClient from '../../../api/client';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Settings,
  Phone,
  MessageSquare,
  Users,
  Hash,
  GitBranch,
  PhoneOff,
  Voicemail,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// Node types matching backend enum
const NodeTypes = {
  Menu: 0,
  PlayMessage: 1,
  TransferToQueue: 2,
  TransferToAgent: 3,
  TransferToNumber: 4,
  Voicemail: 5,
  Hangup: 6,
  CollectDigits: 7,
  HttpRequest: 8,
  Condition: 9,
  RequestCallback: 10,
  SetVariable: 11,
  SubFlow: 12,
};

const nodeTypeLabels: Record<number, string> = {
  0: 'Menu',
  1: 'Play Message',
  2: 'Transfer to Queue',
  3: 'Transfer to Agent',
  4: 'Transfer to Number',
  5: 'Voicemail',
  6: 'Hangup',
  7: 'Collect Digits',
  8: 'HTTP Request',
  9: 'Condition',
  10: 'Request Callback',
  11: 'Set Variable',
  12: 'Sub Flow',
};

const nodeTypeIcons: Record<number, React.ReactNode> = {
  0: <Hash className="h-4 w-4" />,
  1: <MessageSquare className="h-4 w-4" />,
  2: <Users className="h-4 w-4" />,
  3: <Users className="h-4 w-4" />,
  4: <Phone className="h-4 w-4" />,
  5: <Voicemail className="h-4 w-4" />,
  6: <PhoneOff className="h-4 w-4" />,
  7: <Hash className="h-4 w-4" />,
  8: <GitBranch className="h-4 w-4" />,
  9: <GitBranch className="h-4 w-4" />,
  10: <Phone className="h-4 w-4" />,
  11: <Settings className="h-4 w-4" />,
  12: <GitBranch className="h-4 w-4" />,
};

const nodeTypeColors: Record<number, string> = {
  0: 'bg-blue-500',
  1: 'bg-green-500',
  2: 'bg-purple-500',
  3: 'bg-purple-500',
  4: 'bg-indigo-500',
  5: 'bg-yellow-500',
  6: 'bg-red-500',
  7: 'bg-cyan-500',
  8: 'bg-orange-500',
  9: 'bg-pink-500',
  10: 'bg-teal-500',
  11: 'bg-gray-500',
  12: 'bg-violet-500',
};

interface IvrNode {
  id: string;
  flowId: string;
  name: string;
  nodeType: number;
  positionX: number;
  positionY: number;
  messageText?: string;
  audioUrl?: string;
  language?: string;
  voice?: string;
  repeatCount?: number;
  invalidInputMessage?: string;
  timeoutMessage?: string;
  fallbackNodeId?: string;
  transferQueueId?: string;
  transferAgentId?: string;
  transferPhoneNumber?: string;
  transferTimeout?: number;
  enableRecording?: boolean;
  numDigits?: number;
  finishOnKey?: string;
  digitsVariableName?: string;
  conditionVariable?: string;
  conditionOperator?: string;
  conditionValue?: string;
  conditionTrueNodeId?: string;
  conditionFalseNodeId?: string;
  httpUrl?: string;
  httpMethod?: string;
  nextNodeId?: string;
  maxRecordingLength?: number;
  transcribeVoicemail?: boolean;
  voicemailEmail?: string;
  menuOptions: IvrMenuOption[];
}

interface IvrMenuOption {
  id: string;
  nodeId: string;
  digit: string;
  label: string;
  description?: string;
  targetNodeId: string;
  displayOrder: number;
}

interface IvrFlow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  phoneNumbers?: string;
  entryNodeId?: string;
  defaultLanguage: string;
  defaultVoice: string;
  maxInvalidAttempts: number;
  inputTimeout: number;
  businessHoursStart?: string;
  businessHoursEnd?: string;
  businessDays?: string;
  afterHoursNodeId?: string;
  nodes: IvrNode[];
}

export function IvrFlowBuilder() {
  const { flowId } = useParams<{ flowId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedNode, setSelectedNode] = useState<IvrNode | null>(null);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMenuOptionModalOpen, setIsMenuOptionModalOpen] = useState(false);
  const [newNodeType, setNewNodeType] = useState<number>(NodeTypes.PlayMessage);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [editingNode, setEditingNode] = useState<Partial<IvrNode>>({});
  const [editingMenuOption, setEditingMenuOption] = useState<Partial<IvrMenuOption>>({});
  const [flowSettings, setFlowSettings] = useState<Partial<IvrFlow>>({});

  // Fetch flow data
  const { data: flow, isLoading } = useQuery({
    queryKey: ['ivr-flow', flowId],
    queryFn: async () => {
      const response = await apiClient.get(`/ivr/flows/${flowId}`);
      return response.data as IvrFlow;
    },
    enabled: !!flowId,
  });

  // Fetch queues for transfer node
  const { data: queues } = useQuery({
    queryKey: ['queues'],
    queryFn: async () => {
      const response = await apiClient.get('/queues');
      return response.data as Array<{ id: string; name: string }>;
    }
  });

  useEffect(() => {
    if (flow) {
      setFlowSettings({
        name: flow.name,
        description: flow.description,
        isActive: flow.isActive,
        isDefault: flow.isDefault,
        phoneNumbers: flow.phoneNumbers,
        entryNodeId: flow.entryNodeId,
        defaultLanguage: flow.defaultLanguage,
        defaultVoice: flow.defaultVoice,
        maxInvalidAttempts: flow.maxInvalidAttempts,
        inputTimeout: flow.inputTimeout,
        businessHoursStart: flow.businessHoursStart,
        businessHoursEnd: flow.businessHoursEnd,
        businessDays: flow.businessDays,
        afterHoursNodeId: flow.afterHoursNodeId,
      });
    }
  }, [flow]);

  // Mutations
  const updateFlowMutation = useMutation({
    mutationFn: async (data: Partial<IvrFlow>) => {
      return apiClient.put(`/ivr/flows/${flowId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ivr-flow', flowId] });
      setIsSettingsModalOpen(false);
    }
  });

  const createNodeMutation = useMutation({
    mutationFn: async (data: Partial<IvrNode>) => {
      return apiClient.post('/ivr/nodes', { ...data, flowId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ivr-flow', flowId] });
      setIsNodeModalOpen(false);
      setEditingNode({});
    }
  });

  const updateNodeMutation = useMutation({
    mutationFn: async ({ nodeId, data }: { nodeId: string; data: Partial<IvrNode> }) => {
      return apiClient.put(`/ivr/nodes/${nodeId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ivr-flow', flowId] });
      setSelectedNode(null);
    }
  });

  const deleteNodeMutation = useMutation({
    mutationFn: async (nodeId: string) => {
      return apiClient.delete(`/ivr/nodes/${nodeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ivr-flow', flowId] });
      setSelectedNode(null);
    }
  });

  const createMenuOptionMutation = useMutation({
    mutationFn: async (data: Partial<IvrMenuOption>) => {
      return apiClient.post('/ivr/menu-options', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ivr-flow', flowId] });
      setIsMenuOptionModalOpen(false);
      setEditingMenuOption({});
    }
  });

  const deleteMenuOptionMutation = useMutation({
    mutationFn: async (optionId: string) => {
      return apiClient.delete(`/ivr/menu-options/${optionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ivr-flow', flowId] });
    }
  });

  const validateFlowMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/ivr/flows/${flowId}/validate`);
      return response.data;
    }
  });

  // Event handlers
  const handleAddNode = () => {
    setEditingNode({
      name: `New ${nodeTypeLabels[newNodeType]}`,
      nodeType: newNodeType,
      positionX: 100 + (flow?.nodes?.length || 0) * 50,
      positionY: 100 + (flow?.nodes?.length || 0) * 50,
    });
    setIsNodeModalOpen(true);
  };

  const handleNodeClick = (node: IvrNode) => {
    setSelectedNode(node);
    setEditingNode({ ...node });
  };

  const handleSaveNode = () => {
    if (editingNode.id) {
      updateNodeMutation.mutate({ nodeId: editingNode.id, data: editingNode });
    } else {
      createNodeMutation.mutate(editingNode);
    }
  };

  const handleSaveFlow = () => {
    updateFlowMutation.mutate(flowSettings);
  };

  const handleAddMenuOption = () => {
    if (selectedNode) {
      setEditingMenuOption({
        nodeId: selectedNode.id,
        digit: '',
        label: '',
        description: '',
        targetNodeId: '',
        displayOrder: (selectedNode.menuOptions?.length || 0) + 1,
      });
      setIsMenuOptionModalOpen(true);
    }
  };

  const handleSaveMenuOption = () => {
    createMenuOptionMutation.mutate(editingMenuOption);
  };

  // Canvas drag handling
  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    const node = flow?.nodes.find(n => n.id === nodeId);
    if (node) {
      setDraggedNode(nodeId);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, [flow]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedNode && flow) {
      const canvas = e.currentTarget.getBoundingClientRect();
      const newX = Math.max(0, e.clientX - canvas.left - dragOffset.x);
      const newY = Math.max(0, e.clientY - canvas.top - dragOffset.y);

      const node = flow.nodes.find(n => n.id === draggedNode);
      if (node) {
        updateNodeMutation.mutate({
          nodeId: draggedNode,
          data: { ...node, positionX: newX, positionY: newY }
        });
      }
    }
  }, [draggedNode, dragOffset, flow, updateNodeMutation]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="p-6">
        <p className="text-red-500">{t('ivr.flowNotFound', 'IVR flow not found')}</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/ivr/flows')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{flow.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={flow.isActive ? 'success' : 'default'}>
                  {flow.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {flow.isDefault && <Badge variant="info">Default</Badge>}
                <span className="text-sm text-gray-500">{flow.nodes.length} nodes</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" onClick={() => setIsSettingsModalOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              {t('ivr.settings', 'Settings')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => validateFlowMutation.mutate()}
              disabled={validateFlowMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {t('ivr.validate', 'Validate')}
            </Button>
            <Button onClick={handleSaveFlow} disabled={updateFlowMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {t('common.save', 'Save')}
            </Button>
          </div>
        </div>

        {/* Validation Results */}
        {validateFlowMutation.data && (
          <div className={`mt-4 p-3 rounded-lg ${validateFlowMutation.data.isValid ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
            {validateFlowMutation.data.isValid ? (
              <div className="flex items-center text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5 mr-2" />
                {t('ivr.validationPassed', 'Flow validation passed!')}
              </div>
            ) : (
              <div>
                <div className="flex items-center text-red-700 dark:text-red-300 mb-2">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {t('ivr.validationFailed', 'Flow validation failed:')}
                </div>
                <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
                  {validateFlowMutation.data.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Toolbox */}
        <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('ivr.addNode', 'Add Node')}</h3>
          <Select
            label=""
            value={newNodeType.toString()}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewNodeType(parseInt(e.target.value))}
            options={Object.entries(nodeTypeLabels).map(([value, label]) => ({
              value,
              label
            }))}
          />
          <Button onClick={handleAddNode} className="w-full mt-2">
            <Plus className="h-4 w-4 mr-2" />
            {t('ivr.addNode', 'Add Node')}
          </Button>

          {/* Node palette */}
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('ivr.nodeTypes', 'Node Types')}</h4>
            {Object.entries(nodeTypeLabels).map(([type, label]) => (
              <div
                key={type}
                className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  setNewNodeType(parseInt(type));
                  handleAddNode();
                }}
              >
                <div className={`p-2 rounded-lg ${nodeTypeColors[parseInt(type)]} text-white mr-3`}>
                  {nodeTypeIcons[parseInt(type)]}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div
          className="flex-1 bg-gray-100 dark:bg-gray-950 overflow-auto relative"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, #ccc 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Nodes */}
          {flow.nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg cursor-pointer border-2 transition-all ${
                selectedNode?.id === node.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : flow.entryNodeId === node.id
                  ? 'border-green-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              style={{
                left: node.positionX,
                top: node.positionY,
                minWidth: '180px',
              }}
              onClick={() => handleNodeClick(node)}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
            >
              {/* Node Header */}
              <div className={`flex items-center p-3 rounded-t-lg ${nodeTypeColors[node.nodeType]} text-white`}>
                {nodeTypeIcons[node.nodeType]}
                <span className="ml-2 font-medium text-sm truncate">{node.name}</span>
              </div>

              {/* Node Body */}
              <div className="p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {nodeTypeLabels[node.nodeType]}
                </p>
                {node.messageText && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 truncate">
                    "{node.messageText.substring(0, 30)}..."
                  </p>
                )}
                {node.nodeType === NodeTypes.Menu && node.menuOptions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {node.menuOptions.map((option) => (
                      <div key={option.id} className="flex items-center text-xs">
                        <Badge variant="default" className="mr-1">{option.digit}</Badge>
                        <span className="text-gray-600 dark:text-gray-400 truncate">{option.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Entry indicator */}
              {flow.entryNodeId === node.id && (
                <div className="absolute -top-3 -left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Entry
                </div>
              )}
            </div>
          ))}

          {/* Connection lines would go here - simplified for now */}
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('ivr.nodeProperties', 'Node Properties')}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this node?')) {
                    deleteNodeMutation.mutate(selectedNode.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            <div className="space-y-4">
              <Input
                label={t('ivr.nodeName', 'Node Name')}
                value={editingNode.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingNode({ ...editingNode, name: e.target.value })}
              />

              {/* Message Text - for most node types */}
              {[NodeTypes.Menu, NodeTypes.PlayMessage, NodeTypes.Voicemail, NodeTypes.Hangup, NodeTypes.CollectDigits].includes(selectedNode.nodeType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('ivr.messageText', 'Message Text')}
                  </label>
                  <textarea
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    rows={3}
                    value={editingNode.messageText || ''}
                    onChange={(e) => setEditingNode({ ...editingNode, messageText: e.target.value })}
                  />
                </div>
              )}

              {/* Transfer to Queue */}
              {selectedNode.nodeType === NodeTypes.TransferToQueue && queues && (
                <Select
                  label={t('ivr.queue', 'Queue')}
                  value={editingNode.transferQueueId || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditingNode({ ...editingNode, transferQueueId: e.target.value })}
                  options={[
                    { value: '', label: 'Select a queue' },
                    ...queues.map(q => ({ value: q.id, label: q.name }))
                  ]}
                />
              )}

              {/* Transfer to Number */}
              {selectedNode.nodeType === NodeTypes.TransferToNumber && (
                <Input
                  label={t('ivr.phoneNumber', 'Phone Number')}
                  value={editingNode.transferPhoneNumber || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingNode({ ...editingNode, transferPhoneNumber: e.target.value })}
                  placeholder="+1234567890"
                />
              )}

              {/* Collect Digits */}
              {selectedNode.nodeType === NodeTypes.CollectDigits && (
                <>
                  <Input
                    label={t('ivr.numDigits', 'Number of Digits')}
                    type="number"
                    value={editingNode.numDigits?.toString() || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingNode({ ...editingNode, numDigits: parseInt(e.target.value) })}
                  />
                  <Input
                    label={t('ivr.finishOnKey', 'Finish On Key')}
                    value={editingNode.finishOnKey || '#'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingNode({ ...editingNode, finishOnKey: e.target.value })}
                  />
                  <Input
                    label={t('ivr.variableName', 'Variable Name')}
                    value={editingNode.digitsVariableName || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingNode({ ...editingNode, digitsVariableName: e.target.value })}
                  />
                </>
              )}

              {/* Next Node - for non-terminal nodes */}
              {![NodeTypes.Hangup, NodeTypes.Menu].includes(selectedNode.nodeType) && (
                <Select
                  label={t('ivr.nextNode', 'Next Node')}
                  value={editingNode.nextNodeId || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditingNode({ ...editingNode, nextNodeId: e.target.value })}
                  options={[
                    { value: '', label: 'None' },
                    ...flow.nodes
                      .filter(n => n.id !== selectedNode.id)
                      .map(n => ({ value: n.id, label: n.name }))
                  ]}
                />
              )}

              {/* Fallback Node */}
              {selectedNode.nodeType === NodeTypes.Menu && (
                <Select
                  label={t('ivr.fallbackNode', 'Fallback Node (Max Invalid)')}
                  value={editingNode.fallbackNodeId || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditingNode({ ...editingNode, fallbackNodeId: e.target.value })}
                  options={[
                    { value: '', label: 'None' },
                    ...flow.nodes
                      .filter(n => n.id !== selectedNode.id)
                      .map(n => ({ value: n.id, label: n.name }))
                  ]}
                />
              )}

              {/* Menu Options */}
              {selectedNode.nodeType === NodeTypes.Menu && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{t('ivr.menuOptions', 'Menu Options')}</h4>
                    <Button size="sm" onClick={handleAddMenuOption}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {selectedNode.menuOptions.map((option) => (
                      <div key={option.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <div className="flex items-center">
                          <Badge variant="default" className="mr-2">{option.digit}</Badge>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Delete this menu option?')) {
                              deleteMenuOptionMutation.mutate(option.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Set as Entry Node button */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <Button
                  variant={flow.entryNodeId === selectedNode.id ? 'secondary' : 'primary'}
                  className="w-full"
                  onClick={() => {
                    updateFlowMutation.mutate({ ...flowSettings, entryNodeId: selectedNode.id });
                  }}
                  disabled={flow.entryNodeId === selectedNode.id}
                >
                  {flow.entryNodeId === selectedNode.id
                    ? t('ivr.isEntryNode', 'This is the Entry Node')
                    : t('ivr.setAsEntryNode', 'Set as Entry Node')}
                </Button>
              </div>

              <Button onClick={handleSaveNode} className="w-full" disabled={updateNodeMutation.isPending}>
                {t('common.saveChanges', 'Save Changes')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Node Modal */}
      <Modal
        isOpen={isNodeModalOpen}
        onClose={() => setIsNodeModalOpen(false)}
        title={t('ivr.createNode', 'Create New Node')}
      >
        <div className="space-y-4">
          <Input
            label={t('ivr.nodeName', 'Node Name')}
            value={editingNode.name || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingNode({ ...editingNode, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('ivr.messageText', 'Message Text')}
            </label>
            <textarea
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              rows={3}
              value={editingNode.messageText || ''}
              onChange={(e) => setEditingNode({ ...editingNode, messageText: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsNodeModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSaveNode} disabled={!editingNode.name || createNodeMutation.isPending}>
              {createNodeMutation.isPending ? t('common.creating', 'Creating...') : t('common.create', 'Create')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Flow Settings Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title={t('ivr.flowSettings', 'Flow Settings')}
      >
        <div className="space-y-4">
          <Input
            label={t('ivr.flowName', 'Flow Name')}
            value={flowSettings.name || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFlowSettings({ ...flowSettings, name: e.target.value })}
          />
          <Input
            label={t('ivr.description', 'Description')}
            value={flowSettings.description || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFlowSettings({ ...flowSettings, description: e.target.value })}
          />
          <Input
            label={t('ivr.phoneNumbers', 'Phone Numbers (comma-separated)')}
            value={flowSettings.phoneNumbers || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFlowSettings({ ...flowSettings, phoneNumbers: e.target.value })}
            placeholder="+1234567890,+0987654321"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('ivr.defaultLanguage', 'Default Language')}
              value={flowSettings.defaultLanguage || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFlowSettings({ ...flowSettings, defaultLanguage: e.target.value })}
            />
            <Input
              label={t('ivr.defaultVoice', 'Default Voice')}
              value={flowSettings.defaultVoice || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFlowSettings({ ...flowSettings, defaultVoice: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('ivr.businessHoursStart', 'Business Hours Start')}
              type="time"
              value={flowSettings.businessHoursStart || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFlowSettings({ ...flowSettings, businessHoursStart: e.target.value })}
            />
            <Input
              label={t('ivr.businessHoursEnd', 'Business Hours End')}
              type="time"
              value={flowSettings.businessHoursEnd || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFlowSettings({ ...flowSettings, businessHoursEnd: e.target.value })}
            />
          </div>
          <Input
            label={t('ivr.businessDays', 'Business Days')}
            value={flowSettings.businessDays || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFlowSettings({ ...flowSettings, businessDays: e.target.value })}
          />
          {flow.nodes.length > 0 && (
            <Select
              label={t('ivr.afterHoursNode', 'After Hours Node')}
              value={flowSettings.afterHoursNodeId || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFlowSettings({ ...flowSettings, afterHoursNodeId: e.target.value })}
              options={[
                { value: '', label: 'None' },
                ...flow.nodes.map(n => ({ value: n.id, label: n.name }))
              ]}
            />
          )}
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={flowSettings.isActive || false}
                onChange={(e) => setFlowSettings({ ...flowSettings, isActive: e.target.checked })}
                className="mr-2"
              />
              {t('ivr.active', 'Active')}
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={flowSettings.isDefault || false}
                onChange={(e) => setFlowSettings({ ...flowSettings, isDefault: e.target.checked })}
                className="mr-2"
              />
              {t('ivr.default', 'Set as Default')}
            </label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsSettingsModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSaveFlow} disabled={updateFlowMutation.isPending}>
              {updateFlowMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Menu Option Modal */}
      <Modal
        isOpen={isMenuOptionModalOpen}
        onClose={() => setIsMenuOptionModalOpen(false)}
        title={t('ivr.addMenuOption', 'Add Menu Option')}
      >
        <div className="space-y-4">
          <Input
            label={t('ivr.digit', 'Digit (0-9, *, #)')}
            value={editingMenuOption.digit || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingMenuOption({ ...editingMenuOption, digit: e.target.value })}
            maxLength={1}
          />
          <Input
            label={t('ivr.label', 'Label')}
            value={editingMenuOption.label || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingMenuOption({ ...editingMenuOption, label: e.target.value })}
          />
          <Input
            label={t('ivr.description', 'Description (spoken)')}
            value={editingMenuOption.description || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingMenuOption({ ...editingMenuOption, description: e.target.value })}
            placeholder="Press 1 for sales"
          />
          <Select
            label={t('ivr.targetNode', 'Target Node')}
            value={editingMenuOption.targetNodeId || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditingMenuOption({ ...editingMenuOption, targetNodeId: e.target.value })}
            options={[
              { value: '', label: 'Select a node' },
              ...flow.nodes.map(n => ({ value: n.id, label: n.name }))
            ]}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsMenuOptionModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleSaveMenuOption}
              disabled={!editingMenuOption.digit || !editingMenuOption.targetNodeId || createMenuOptionMutation.isPending}
            >
              {createMenuOptionMutation.isPending ? t('common.adding', 'Adding...') : t('common.add', 'Add')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
