import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Clock,
  Phone,
  Users,
  TrendingUp,
  Mail,
  MessageSquare,
  Webhook,
  ChevronDown,
  X,
  Save,
  Loader2,
  Filter,
  Activity,
  CheckCircle,
  XCircle,
  Play,
  Pause,
} from 'lucide-react';
import { Button, Badge, Card, CardContent, Modal, Input, Select, Textarea } from '../../../components/ui';
import apiClient from '../../../api/client';

interface AlertRule {
  id: string;
  name: string;
  description?: string;
  category: 'queue' | 'agent' | 'system' | 'quality' | 'sla';
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  unit?: string;
  severity: 'info' | 'warning' | 'critical';
  channels: ('email' | 'sms' | 'webhook' | 'slack' | 'inApp')[];
  recipients?: string[];
  webhookUrl?: string;
  isActive: boolean;
  cooldownMinutes: number;
  lastTriggeredAt?: string;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AlertHistory {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  metricValue: number;
  threshold: number;
  triggeredAt: string;
  resolvedAt?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

const METRIC_OPTIONS = {
  queue: [
    { value: 'queue_wait_time', label: 'Queue Wait Time (seconds)', unit: 's' },
    { value: 'queue_size', label: 'Queue Size', unit: '' },
    { value: 'abandoned_calls', label: 'Abandoned Calls (per hour)', unit: '/hr' },
    { value: 'service_level', label: 'Service Level (%)', unit: '%' },
  ],
  agent: [
    { value: 'agent_utilization', label: 'Agent Utilization (%)', unit: '%' },
    { value: 'agents_available', label: 'Available Agents', unit: '' },
    { value: 'agents_on_break', label: 'Agents on Break', unit: '' },
    { value: 'avg_handle_time', label: 'Avg Handle Time (seconds)', unit: 's' },
  ],
  system: [
    { value: 'api_response_time', label: 'API Response Time (ms)', unit: 'ms' },
    { value: 'error_rate', label: 'Error Rate (%)', unit: '%' },
    { value: 'cpu_usage', label: 'CPU Usage (%)', unit: '%' },
    { value: 'memory_usage', label: 'Memory Usage (%)', unit: '%' },
  ],
  quality: [
    { value: 'qa_score', label: 'QA Score (%)', unit: '%' },
    { value: 'csat_score', label: 'CSAT Score', unit: '' },
    { value: 'nps_score', label: 'NPS Score', unit: '' },
    { value: 'first_call_resolution', label: 'First Call Resolution (%)', unit: '%' },
  ],
  sla: [
    { value: 'sla_breach_rate', label: 'SLA Breach Rate (%)', unit: '%' },
    { value: 'tickets_nearing_sla', label: 'Tickets Nearing SLA', unit: '' },
    { value: 'avg_resolution_time', label: 'Avg Resolution Time (hours)', unit: 'h' },
  ],
};

const OPERATOR_OPTIONS = [
  { value: 'gt', label: 'Greater than (>)' },
  { value: 'gte', label: 'Greater than or equal (>=)' },
  { value: 'lt', label: 'Less than (<)' },
  { value: 'lte', label: 'Less than or equal (<=)' },
  { value: 'eq', label: 'Equals (=)' },
];

const CATEGORY_INFO = {
  queue: { label: 'Queue', icon: Phone, color: 'bg-blue-500' },
  agent: { label: 'Agent', icon: Users, color: 'bg-green-500' },
  system: { label: 'System', icon: Activity, color: 'bg-purple-500' },
  quality: { label: 'Quality', icon: TrendingUp, color: 'bg-yellow-500' },
  sla: { label: 'SLA', icon: Clock, color: 'bg-red-500' },
};

const mockRules: AlertRule[] = [
  {
    id: 'rule-1',
    name: 'High Queue Wait Time',
    description: 'Alert when customers wait more than 5 minutes',
    category: 'queue',
    metric: 'queue_wait_time',
    operator: 'gt',
    threshold: 300,
    unit: 's',
    severity: 'critical',
    channels: ['email', 'inApp', 'slack'],
    recipients: ['supervisor@company.com'],
    isActive: true,
    cooldownMinutes: 15,
    lastTriggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    triggerCount: 12,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rule-2',
    name: 'Low Agent Availability',
    description: 'Alert when available agents drop below 3',
    category: 'agent',
    metric: 'agents_available',
    operator: 'lt',
    threshold: 3,
    severity: 'warning',
    channels: ['email', 'inApp'],
    recipients: ['manager@company.com'],
    isActive: true,
    cooldownMinutes: 10,
    triggerCount: 8,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rule-3',
    name: 'SLA Breach Warning',
    description: 'Alert when SLA breach rate exceeds 10%',
    category: 'sla',
    metric: 'sla_breach_rate',
    operator: 'gt',
    threshold: 10,
    unit: '%',
    severity: 'critical',
    channels: ['email', 'webhook', 'inApp'],
    webhookUrl: 'https://hooks.slack.com/services/xxx',
    isActive: true,
    cooldownMinutes: 30,
    lastTriggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    triggerCount: 3,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rule-4',
    name: 'Low QA Score Alert',
    description: 'Alert when QA score drops below 70%',
    category: 'quality',
    metric: 'qa_score',
    operator: 'lt',
    threshold: 70,
    unit: '%',
    severity: 'warning',
    channels: ['email'],
    recipients: ['qa-team@company.com'],
    isActive: false,
    cooldownMinutes: 60,
    triggerCount: 0,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockHistory: AlertHistory[] = [
  {
    id: 'alert-1',
    ruleId: 'rule-1',
    ruleName: 'High Queue Wait Time',
    severity: 'critical',
    message: 'Queue wait time exceeded 300s threshold (actual: 342s)',
    metricValue: 342,
    threshold: 300,
    triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    acknowledged: true,
    acknowledgedBy: 'John Smith',
  },
  {
    id: 'alert-2',
    ruleId: 'rule-2',
    ruleName: 'Low Agent Availability',
    severity: 'warning',
    message: 'Available agents dropped below 3 (actual: 2)',
    metricValue: 2,
    threshold: 3,
    triggeredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    acknowledged: false,
  },
  {
    id: 'alert-3',
    ruleId: 'rule-3',
    ruleName: 'SLA Breach Warning',
    severity: 'critical',
    message: 'SLA breach rate exceeded 10% threshold (actual: 12.5%)',
    metricValue: 12.5,
    threshold: 10,
    triggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    acknowledged: true,
    acknowledgedBy: 'Emily Davis',
  },
];

const initialFormData: Partial<AlertRule> = {
  name: '',
  description: '',
  category: 'queue',
  metric: 'queue_wait_time',
  operator: 'gt',
  threshold: 0,
  severity: 'warning',
  channels: ['inApp'],
  recipients: [],
  webhookUrl: '',
  isActive: true,
  cooldownMinutes: 15,
};

export const AlertRules = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'rules' | 'history'>('rules');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [formData, setFormData] = useState<Partial<AlertRule>>(initialFormData);
  const [recipientInput, setRecipientInput] = useState('');

  // Fetch alert rules
  const { data: rules = [], isLoading: rulesLoading } = useQuery<AlertRule[]>({
    queryKey: ['alert-rules'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/admin/alert-rules');
        return response.data.items || response.data || [];
      } catch {
        return mockRules;
      }
    },
  });

  // Fetch alert history
  const { data: history = [], isLoading: historyLoading } = useQuery<AlertHistory[]>({
    queryKey: ['alert-history'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/admin/alert-history');
        return response.data.items || response.data || [];
      } catch {
        return mockHistory;
      }
    },
  });

  // Create rule mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<AlertRule>) => apiClient.post('/admin/alert-rules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
      handleCloseModal();
    },
  });

  // Update rule mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AlertRule> }) =>
      apiClient.put(`/admin/alert-rules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
      handleCloseModal();
    },
  });

  // Delete rule mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/alert-rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
      setIsDeleteModalOpen(false);
      setSelectedRule(null);
    },
  });

  // Toggle rule active status
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch(`/admin/alert-rules/${id}/toggle`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
    },
  });

  const handleOpenCreate = () => {
    setSelectedRule(null);
    setFormData(initialFormData);
    setRecipientInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: AlertRule) => {
    setSelectedRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      category: rule.category,
      metric: rule.metric,
      operator: rule.operator,
      threshold: rule.threshold,
      severity: rule.severity,
      channels: rule.channels,
      recipients: rule.recipients,
      webhookUrl: rule.webhookUrl,
      isActive: rule.isActive,
      cooldownMinutes: rule.cooldownMinutes,
    });
    setRecipientInput('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRule(null);
    setFormData(initialFormData);
    setRecipientInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRule) {
      updateMutation.mutate({ id: selectedRule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleAddRecipient = () => {
    if (recipientInput.trim() && !formData.recipients?.includes(recipientInput.trim())) {
      setFormData({
        ...formData,
        recipients: [...(formData.recipients || []), recipientInput.trim()],
      });
      setRecipientInput('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setFormData({
      ...formData,
      recipients: formData.recipients?.filter((r) => r !== email),
    });
  };

  const handleCategoryChange = (category: string) => {
    const metrics = METRIC_OPTIONS[category as keyof typeof METRIC_OPTIONS] || [];
    const firstMetric = metrics[0];
    setFormData({
      ...formData,
      category: category as AlertRule['category'],
      metric: firstMetric?.value || '',
    });
  };

  const toggleChannel = (channel: AlertRule['channels'][number]) => {
    const channels = formData.channels || [];
    if (channels.includes(channel)) {
      setFormData({ ...formData, channels: channels.filter((c) => c !== channel) });
    } else {
      setFormData({ ...formData, channels: [...channels, channel] });
    }
  };

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || rule.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || rule.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const filteredHistory = history.filter((alert) => {
    const matchesSearch =
      alert.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[severity as keyof typeof colors]}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOperatorSymbol = (operator: string) => {
    const symbols: Record<string, string> = {
      gt: '>',
      gte: '>=',
      lt: '<',
      lte: '<=',
      eq: '=',
    };
    return symbols[operator] || operator;
  };

  const getMetricLabel = (category: string, metric: string) => {
    const metrics = METRIC_OPTIONS[category as keyof typeof METRIC_OPTIONS] || [];
    return metrics.find((m) => m.value === metric)?.label || metric;
  };

  const currentMetrics = METRIC_OPTIONS[formData.category as keyof typeof METRIC_OPTIONS] || [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alert Rules</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure alerts for queue, agent, and system metrics
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Alert Rule
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Rules</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{rules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Play className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Rules</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {rules.filter((r) => r.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Critical Alerts (24h)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {history.filter((h) => h.severity === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unacknowledged</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {history.filter((h) => !h.acknowledged).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Alert Rules ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Alert History ({history.length})
          </button>
        </nav>
      </div>

      {/* Filters */}
      <Card variant="bordered">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={activeTab === 'rules' ? 'Search rules...' : 'Search alerts...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            {activeTab === 'rules' && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>
            )}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeTab === 'rules' ? (
        <div className="space-y-4">
          {rulesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : filteredRules.length === 0 ? (
            <Card variant="bordered">
              <CardContent className="py-12 text-center">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No alert rules found</p>
                <Button className="mt-4" onClick={handleOpenCreate}>
                  Create First Rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredRules.map((rule) => {
              const CategoryIcon = CATEGORY_INFO[rule.category].icon;
              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card variant="bordered" className={!rule.isActive ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-lg ${CATEGORY_INFO[rule.category].color} flex items-center justify-center`}
                          >
                            <CategoryIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{rule.name}</h3>
                              {getSeverityBadge(rule.severity)}
                              {!rule.isActive && (
                                <Badge variant="outline" size="sm">
                                  Paused
                                </Badge>
                              )}
                            </div>
                            {rule.description && (
                              <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <span>
                                <strong>{getMetricLabel(rule.category, rule.metric)}</strong>{' '}
                                {getOperatorSymbol(rule.operator)} {rule.threshold}
                                {rule.unit}
                              </span>
                              <span className="text-gray-400">|</span>
                              <span>Cooldown: {rule.cooldownMinutes}m</span>
                              <span className="text-gray-400">|</span>
                              <span>Triggered: {rule.triggerCount} times</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {rule.channels.map((channel) => {
                                const icons: Record<string, React.ElementType> = {
                                  email: Mail,
                                  sms: MessageSquare,
                                  webhook: Webhook,
                                  slack: MessageSquare,
                                  inApp: Bell,
                                };
                                const Icon = icons[channel] || Bell;
                                return (
                                  <div
                                    key={channel}
                                    className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                                  >
                                    <Icon className="w-3 h-3" />
                                    <span className="capitalize">{channel}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleMutation.mutate({ id: rule.id, isActive: !rule.isActive })}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            title={rule.isActive ? 'Pause rule' : 'Activate rule'}
                          >
                            {rule.isActive ? (
                              <ToggleRight className="w-5 h-5 text-green-500" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(rule)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Edit2 className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRule(rule);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <Card variant="bordered">
              <CardContent className="py-12 text-center">
                <Activity className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No alert history found</p>
              </CardContent>
            </Card>
          ) : (
            filteredHistory.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card variant="bordered">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            alert.severity === 'critical'
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : alert.severity === 'warning'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                                : 'bg-blue-100 dark:bg-blue-900/30'
                          }`}
                        >
                          <AlertTriangle
                            className={`w-5 h-5 ${
                              alert.severity === 'critical'
                                ? 'text-red-600'
                                : alert.severity === 'warning'
                                  ? 'text-yellow-600'
                                  : 'text-blue-600'
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{alert.ruleName}</h3>
                            {getSeverityBadge(alert.severity)}
                            {alert.resolvedAt ? (
                              <Badge variant="success" size="sm">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Resolved
                              </Badge>
                            ) : (
                              <Badge variant="danger" size="sm">
                                <XCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Triggered: {formatDate(alert.triggeredAt)}</span>
                            {alert.resolvedAt && <span>Resolved: {formatDate(alert.resolvedAt)}</span>}
                            {alert.acknowledged && alert.acknowledgedBy && (
                              <span>Acknowledged by: {alert.acknowledgedBy}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button variant="outline" size="sm">
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedRule ? 'Edit Alert Rule' : 'Create Alert Rule'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <Input
              label="Rule Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., High Queue Wait Time"
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this alert monitors..."
              rows={2}
            />
          </div>

          {/* Condition */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Alert Condition</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Metric
                </label>
                <select
                  value={formData.metric}
                  onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  {currentMetrics.map((metric) => (
                    <option key={metric.value} value={metric.value}>
                      {metric.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Operator
                </label>
                <select
                  value={formData.operator}
                  onChange={(e) => setFormData({ ...formData, operator: e.target.value as AlertRule['operator'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  {OPERATOR_OPTIONS.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Threshold"
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Severity
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as AlertRule['severity'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <Input
                label="Cooldown (minutes)"
                type="number"
                value={formData.cooldownMinutes}
                onChange={(e) => setFormData({ ...formData, cooldownMinutes: Number(e.target.value) })}
                min={1}
                required
              />
            </div>
          </div>

          {/* Notification Channels */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Notification Channels</h4>
            <div className="flex flex-wrap gap-3">
              {(['inApp', 'email', 'sms', 'webhook', 'slack'] as const).map((channel) => {
                const icons: Record<string, React.ElementType> = {
                  email: Mail,
                  sms: MessageSquare,
                  webhook: Webhook,
                  slack: MessageSquare,
                  inApp: Bell,
                };
                const Icon = icons[channel];
                const isSelected = formData.channels?.includes(channel);
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleChannel(channel)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="capitalize">{channel === 'inApp' ? 'In-App' : channel}</span>
                  </button>
                );
              })}
            </div>

            {/* Webhook URL */}
            {formData.channels?.includes('webhook') && (
              <Input
                label="Webhook URL"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                placeholder="https://hooks.slack.com/services/..."
              />
            )}

            {/* Email Recipients */}
            {formData.channels?.includes('email') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Recipients
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRecipient();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddRecipient}>
                    Add
                  </Button>
                </div>
                {formData.recipients && formData.recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.recipients.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipient(email)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Enable Alert Rule</p>
              <p className="text-sm text-gray-500">Start monitoring immediately after creation</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className="text-2xl"
            >
              {formData.isActive ? (
                <ToggleRight className="w-8 h-8 text-green-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {selectedRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Alert Rule"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong>{selectedRule?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => selectedRule && deleteMutation.mutate(selectedRule.id)}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AlertRules;
