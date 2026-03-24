import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
  X,
  Save,
  Loader2,
  Activity,
  CheckCircle,
  XCircle,
  Play,
} from 'lucide-react';
import { Button, Badge, Card, CardContent, Modal, Input, Textarea } from '../../../components/ui';
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
  const { t, i18n } = useTranslation();

  const METRIC_OPTIONS = {
    queue: [
      { value: 'queue_wait_time', label: t('alertRulesPage.queueWaitTime'), unit: 's' },
      { value: 'queue_size', label: t('alertRulesPage.queueSize'), unit: '' },
      { value: 'abandoned_calls', label: t('alertRulesPage.abandonedCalls'), unit: '/hr' },
      { value: 'service_level', label: t('alertRulesPage.serviceLevel'), unit: '%' },
    ],
    agent: [
      { value: 'agent_utilization', label: t('alertRulesPage.agentUtilization'), unit: '%' },
      { value: 'agents_available', label: t('alertRulesPage.availableAgents'), unit: '' },
      { value: 'agents_on_break', label: t('alertRulesPage.agentsOnBreak'), unit: '' },
      { value: 'avg_handle_time', label: t('alertRulesPage.avgHandleTime'), unit: 's' },
    ],
    system: [
      { value: 'api_response_time', label: t('alertRulesPage.apiResponseTime'), unit: 'ms' },
      { value: 'error_rate', label: t('alertRulesPage.errorRate'), unit: '%' },
      { value: 'cpu_usage', label: t('alertRulesPage.cpuUsage'), unit: '%' },
      { value: 'memory_usage', label: t('alertRulesPage.memoryUsage'), unit: '%' },
    ],
    quality: [
      { value: 'qa_score', label: t('alertRulesPage.qaScore'), unit: '%' },
      { value: 'csat_score', label: t('alertRulesPage.csatScore'), unit: '' },
      { value: 'nps_score', label: t('alertRulesPage.npsScore'), unit: '' },
      { value: 'first_call_resolution', label: t('alertRulesPage.firstCallResolution'), unit: '%' },
    ],
    sla: [
      { value: 'sla_breach_rate', label: t('alertRulesPage.slaBreachRate'), unit: '%' },
      { value: 'tickets_nearing_sla', label: t('alertRulesPage.ticketsNearingSla'), unit: '' },
      { value: 'avg_resolution_time', label: t('alertRulesPage.avgResolutionTime'), unit: 'h' },
    ],
  };

  const OPERATOR_OPTIONS = [
    { value: 'gt', label: t('alertRulesPage.operatorGt') },
    { value: 'gte', label: t('alertRulesPage.operatorGte') },
    { value: 'lt', label: t('alertRulesPage.operatorLt') },
    { value: 'lte', label: t('alertRulesPage.operatorLte') },
    { value: 'eq', label: t('alertRulesPage.operatorEq') },
  ];

  const CATEGORY_INFO = {
    queue: { label: t('alertRulesPage.categoryQueue'), icon: Phone, color: 'bg-blue-500' },
    agent: { label: t('alertRulesPage.categoryAgent'), icon: Users, color: 'bg-green-500' },
    system: { label: t('alertRulesPage.categorySystem'), icon: Activity, color: 'bg-purple-500' },
    quality: { label: t('alertRulesPage.categoryQuality'), icon: TrendingUp, color: 'bg-yellow-500' },
    sla: { label: t('alertRulesPage.categorySla'), icon: Clock, color: 'bg-red-500' },
  };

  const channelLabels: Record<string, string> = {
    inApp: t('alertRulesPage.inApp'),
    email: t('alertRulesPage.email'),
    sms: t('alertRulesPage.sms'),
    webhook: t('alertRulesPage.webhook'),
    slack: t('alertRulesPage.slack'),
  };

  const severityLabels: Record<string, string> = {
    info: t('alertRulesPage.info'),
    warning: t('alertRulesPage.warning'),
    critical: t('alertRulesPage.critical'),
  };

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
      const response = await apiClient.get('/admin/alert-rules');
      return response.data.items || response.data || [];
    },
  });

  // Fetch alert history
  const { data: history = [], isLoading: historyLoading } = useQuery<AlertHistory[]>({
    queryKey: ['alert-history'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/alert-history');
      return response.data.items || response.data || [];
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
        {severityLabels[severity] || severity}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
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
    <div className="space-y-6" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('alertRulesPage.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('alertRulesPage.subtitle')}
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          {t('alertRulesPage.createAlertRule')}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('alertRulesPage.totalRules')}</p>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('alertRulesPage.activeRules')}</p>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('alertRulesPage.criticalAlerts24h')}</p>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('alertRulesPage.unacknowledged')}</p>
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
            {t('alertRulesPage.alertRulesTab')} ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('alertRulesPage.alertHistoryTab')} ({history.length})
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
                  placeholder={activeTab === 'rules' ? t('alertRulesPage.searchRules') : t('alertRulesPage.searchAlerts')}
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
                <option value="all">{t('alertRulesPage.allCategories')}</option>
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
              <option value="all">{t('alertRulesPage.allSeverities')}</option>
              <option value="info">{t('alertRulesPage.info')}</option>
              <option value="warning">{t('alertRulesPage.warning')}</option>
              <option value="critical">{t('alertRulesPage.critical')}</option>
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
                <p className="text-gray-500">{t('alertRulesPage.noRulesFound')}</p>
                <Button className="mt-4" onClick={handleOpenCreate}>
                  {t('alertRulesPage.createFirstRule')}
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
                                <Badge variant="default" size="sm">
                                  {t('alertRulesPage.paused')}
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
                              <span>{t('alertRulesPage.cooldown')}: {rule.cooldownMinutes}{t('alertRulesPage.cooldownMinSuffix')}</span>
                              <span className="text-gray-400">|</span>
                              <span>{t('alertRulesPage.triggered')}: {rule.triggerCount} {t('alertRulesPage.timesSuffix')}</span>
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
                                    <span>{channelLabels[channel] || channel}</span>
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
                            title={rule.isActive ? t('alertRulesPage.pauseRule') : t('alertRulesPage.activateRule')}
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
                <p className="text-gray-500">{t('alertRulesPage.noHistoryFound')}</p>
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
                                {t('alertRulesPage.resolved')}
                              </Badge>
                            ) : (
                              <Badge variant="danger" size="sm">
                                <XCircle className="w-3 h-3 mr-1" />
                                {t('alertRulesPage.active')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{t('alertRulesPage.triggeredAt')}: {formatDate(alert.triggeredAt)}</span>
                            {alert.resolvedAt && <span>{t('alertRulesPage.resolvedAt')}: {formatDate(alert.resolvedAt)}</span>}
                            {alert.acknowledged && alert.acknowledgedBy && (
                              <span>{t('alertRulesPage.acknowledgedBy')}: {alert.acknowledgedBy}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button variant="outline" size="sm">
                          {t('alertRulesPage.acknowledge')}
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
        title={selectedRule ? t('alertRulesPage.editAlertRule') : t('alertRulesPage.createAlertRule')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <Input
              label={t('alertRulesPage.ruleName')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('alertRulesPage.ruleNamePlaceholder')}
              required
            />
            <Textarea
              label={t('alertRulesPage.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('alertRulesPage.descriptionPlaceholder')}
              rows={2}
            />
          </div>

          {/* Condition */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">{t('alertRulesPage.alertCondition')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('alertRulesPage.category')}
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
                  {t('alertRulesPage.metric')}
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
                  {t('alertRulesPage.operator')}
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
                label={t('alertRulesPage.threshold')}
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('alertRulesPage.severity')}
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as AlertRule['severity'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="info">{t('alertRulesPage.info')}</option>
                  <option value="warning">{t('alertRulesPage.warning')}</option>
                  <option value="critical">{t('alertRulesPage.critical')}</option>
                </select>
              </div>
              <Input
                label={t('alertRulesPage.cooldownMinutes')}
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
            <h4 className="font-medium text-gray-900 dark:text-white">{t('alertRulesPage.notificationChannels')}</h4>
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
                    <span>{channelLabels[channel] || channel}</span>
                  </button>
                );
              })}
            </div>

            {/* Webhook URL */}
            {formData.channels?.includes('webhook') && (
              <Input
                label={t('alertRulesPage.webhookUrl')}
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                placeholder="https://hooks.slack.com/services/..."
              />
            )}

            {/* Email Recipients */}
            {formData.channels?.includes('email') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('alertRulesPage.emailRecipients')}
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
                    {t('alertRulesPage.add')}
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
              <p className="font-medium text-gray-900 dark:text-white">{t('alertRulesPage.enableAlertRule')}</p>
              <p className="text-sm text-gray-500">{t('alertRulesPage.enableAlertRuleDesc')}</p>
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
              {t('common.cancel')}
            </Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {selectedRule ? t('alertRulesPage.updateRule') : t('alertRulesPage.createRule')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('alertRulesPage.deleteAlertRule')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: t('alertRulesPage.deleteConfirm', { name: selectedRule?.name }) }} />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => selectedRule && deleteMutation.mutate(selectedRule.id)}
              isLoading={deleteMutation.isPending}
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AlertRules;
