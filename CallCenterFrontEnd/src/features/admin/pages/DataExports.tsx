import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Plus,
  Search,
  FileText,
  FileSpreadsheet,
  File,
  Calendar,
  Clock,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  Play,
  Pause,
  MoreVertical,
  Settings,
  AlertCircle,
  Archive,
} from 'lucide-react';
import { Button, Badge, Card, CardContent, Modal, Input, Select } from '../../../components/ui';
import apiClient from '../../../api/client';

interface DataExport {
  id: string;
  name: string;
  type: 'manual' | 'scheduled';
  dataSource: string;
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  filters?: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  fileSize?: number;
  fileUrl?: string;
  recordCount?: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  expiresAt?: string;
  createdBy: string;
}

interface ScheduledExport {
  id: string;
  name: string;
  dataSource: string;
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  schedule: 'daily' | 'weekly' | 'monthly';
  scheduleTime: string;
  scheduleDayOfWeek?: number;
  scheduleDayOfMonth?: number;
  filters?: Record<string, unknown>;
  recipients: string[];
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
}

const DATA_SOURCES = [
  { value: 'calls', label: 'Call Records', icon: 'phone' },
  { value: 'tickets', label: 'Support Tickets', icon: 'ticket' },
  { value: 'agents', label: 'Agent Data', icon: 'users' },
  { value: 'customers', label: 'Customer Data', icon: 'user' },
  { value: 'qa_scores', label: 'QA Scores', icon: 'checkmark' },
  { value: 'recordings', label: 'Recording Metadata', icon: 'mic' },
  { value: 'surveys', label: 'Survey Responses', icon: 'clipboard' },
  { value: 'audit_logs', label: 'Audit Logs', icon: 'shield' },
];

const FORMAT_INFO = {
  csv: { label: 'CSV', icon: FileText, color: 'text-green-500' },
  xlsx: { label: 'Excel', icon: FileSpreadsheet, color: 'text-blue-500' },
  json: { label: 'JSON', icon: File, color: 'text-yellow-500' },
  pdf: { label: 'PDF', icon: FileText, color: 'text-red-500' },
};

const mockExports: DataExport[] = [
  {
    id: 'export-1',
    name: 'Monthly Call Report',
    type: 'manual',
    dataSource: 'calls',
    format: 'xlsx',
    status: 'completed',
    fileSize: 2456789,
    fileUrl: '/exports/monthly-call-report.xlsx',
    recordCount: 15420,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'John Smith',
  },
  {
    id: 'export-2',
    name: 'Customer Database Export',
    type: 'manual',
    dataSource: 'customers',
    format: 'csv',
    status: 'processing',
    progress: 65,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdBy: 'Emily Davis',
  },
  {
    id: 'export-3',
    name: 'QA Scores - Q4 2024',
    type: 'manual',
    dataSource: 'qa_scores',
    format: 'xlsx',
    status: 'completed',
    fileSize: 1234567,
    fileUrl: '/exports/qa-scores-q4.xlsx',
    recordCount: 3240,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'John Smith',
  },
  {
    id: 'export-4',
    name: 'Ticket Export Attempt',
    type: 'manual',
    dataSource: 'tickets',
    format: 'json',
    status: 'failed',
    errorMessage: 'Connection timeout while fetching data',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    createdBy: 'Admin User',
  },
];

const mockScheduled: ScheduledExport[] = [
  {
    id: 'sched-1',
    name: 'Daily Call Summary',
    dataSource: 'calls',
    format: 'xlsx',
    schedule: 'daily',
    scheduleTime: '06:00',
    recipients: ['reports@company.com', 'manager@company.com'],
    isActive: true,
    lastRunAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    nextRunAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sched-2',
    name: 'Weekly Agent Performance',
    dataSource: 'agents',
    format: 'xlsx',
    schedule: 'weekly',
    scheduleTime: '08:00',
    scheduleDayOfWeek: 1,
    recipients: ['hr@company.com'],
    isActive: true,
    lastRunAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    nextRunAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sched-3',
    name: 'Monthly Customer Report',
    dataSource: 'customers',
    format: 'csv',
    schedule: 'monthly',
    scheduleTime: '00:00',
    scheduleDayOfMonth: 1,
    recipients: ['analytics@company.com'],
    isActive: false,
    lastRunAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

interface ExportFormData {
  name: string;
  dataSource: string;
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  dateFrom?: string;
  dateTo?: string;
}

interface ScheduleFormData {
  name: string;
  dataSource: string;
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  schedule: 'daily' | 'weekly' | 'monthly';
  scheduleTime: string;
  scheduleDayOfWeek?: number;
  scheduleDayOfMonth?: number;
  recipients: string[];
  isActive: boolean;
}

export const DataExports = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'exports' | 'scheduled'>('exports');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledExport | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [recipientInput, setRecipientInput] = useState('');

  const [exportForm, setExportForm] = useState<ExportFormData>({
    name: '',
    dataSource: 'calls',
    format: 'xlsx',
    dateFrom: '',
    dateTo: '',
  });

  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>({
    name: '',
    dataSource: 'calls',
    format: 'xlsx',
    schedule: 'daily',
    scheduleTime: '06:00',
    recipients: [],
    isActive: true,
  });

  // Fetch exports
  const { data: exports = [], isLoading: exportsLoading } = useQuery<DataExport[]>({
    queryKey: ['data-exports'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/admin/exports');
        return response.data.items || response.data || [];
      } catch {
        return mockExports;
      }
    },
    refetchInterval: 5000, // Poll for processing status
  });

  // Fetch scheduled exports
  const { data: scheduled = [], isLoading: scheduledLoading } = useQuery<ScheduledExport[]>({
    queryKey: ['scheduled-exports'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/admin/exports/scheduled');
        return response.data.items || response.data || [];
      } catch {
        return mockScheduled;
      }
    },
  });

  // Create export mutation
  const createExportMutation = useMutation({
    mutationFn: (data: ExportFormData) => apiClient.post('/admin/exports', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-exports'] });
      setIsExportModalOpen(false);
      setExportForm({
        name: '',
        dataSource: 'calls',
        format: 'xlsx',
        dateFrom: '',
        dateTo: '',
      });
    },
  });

  // Create/update scheduled export mutation
  const saveScheduleMutation = useMutation({
    mutationFn: (data: ScheduleFormData & { id?: string }) =>
      data.id
        ? apiClient.put(`/admin/exports/scheduled/${data.id}`, data)
        : apiClient.post('/admin/exports/scheduled', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-exports'] });
      setIsScheduleModalOpen(false);
      setSelectedSchedule(null);
      resetScheduleForm();
    },
  });

  // Toggle scheduled export active status
  const toggleScheduleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch(`/admin/exports/scheduled/${id}/toggle`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-exports'] });
    },
  });

  // Delete export mutation
  const deleteExportMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/exports/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-exports'] });
    },
  });

  // Delete scheduled export mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/exports/scheduled/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-exports'] });
    },
  });

  const resetScheduleForm = () => {
    setScheduleForm({
      name: '',
      dataSource: 'calls',
      format: 'xlsx',
      schedule: 'daily',
      scheduleTime: '06:00',
      recipients: [],
      isActive: true,
    });
    setRecipientInput('');
  };

  const handleOpenScheduleEdit = (schedule: ScheduledExport) => {
    setSelectedSchedule(schedule);
    setScheduleForm({
      name: schedule.name,
      dataSource: schedule.dataSource,
      format: schedule.format,
      schedule: schedule.schedule,
      scheduleTime: schedule.scheduleTime,
      scheduleDayOfWeek: schedule.scheduleDayOfWeek,
      scheduleDayOfMonth: schedule.scheduleDayOfMonth,
      recipients: schedule.recipients,
      isActive: schedule.isActive,
    });
    setIsScheduleModalOpen(true);
    setActiveMenu(null);
  };

  const handleAddRecipient = () => {
    if (recipientInput.trim() && !scheduleForm.recipients.includes(recipientInput.trim())) {
      setScheduleForm({
        ...scheduleForm,
        recipients: [...scheduleForm.recipients, recipientInput.trim()],
      });
      setRecipientInput('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setScheduleForm({
      ...scheduleForm,
      recipients: scheduleForm.recipients.filter((r) => r !== email),
    });
  };

  const handleExportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createExportMutation.mutate(exportForm);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveScheduleMutation.mutate({
      ...scheduleForm,
      id: selectedSchedule?.id,
    });
  };

  const filteredExports = exports.filter((exp) => {
    const matchesSearch = exp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredScheduled = scheduled.filter((sch) =>
    sch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: DataExport['status']) => {
    const config = {
      pending: { variant: 'default' as const, icon: Clock, text: 'Pending' },
      processing: { variant: 'info' as const, icon: Loader2, text: 'Processing' },
      completed: { variant: 'success' as const, icon: CheckCircle, text: 'Completed' },
      failed: { variant: 'danger' as const, icon: XCircle, text: 'Failed' },
    };
    const { variant, icon: Icon, text } = config[status];
    return (
      <Badge variant={variant} size="sm">
        <Icon className={`w-3 h-3 mr-1 ${status === 'processing' ? 'animate-spin' : ''}`} />
        {text}
      </Badge>
    );
  };

  const getScheduleText = (schedule: ScheduledExport) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    switch (schedule.schedule) {
      case 'daily':
        return `Daily at ${schedule.scheduleTime}`;
      case 'weekly':
        return `Every ${dayNames[schedule.scheduleDayOfWeek || 0]} at ${schedule.scheduleTime}`;
      case 'monthly':
        return `Day ${schedule.scheduleDayOfMonth} of month at ${schedule.scheduleTime}`;
      default:
        return schedule.schedule;
    }
  };

  const getDataSourceLabel = (source: string) => {
    return DATA_SOURCES.find((s) => s.value === source)?.label || source;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Exports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Export data and manage scheduled exports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsScheduleModalOpen(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Export
          </Button>
          <Button onClick={() => setIsExportModalOpen(true)}>
            <Download className="w-4 h-4 mr-2" />
            New Export
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Archive className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Exports</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{exports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Processing</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {exports.filter((e) => e.status === 'processing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Schedules</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {scheduled.filter((s) => s.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Available Downloads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {exports.filter((e) => e.status === 'completed').length}
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
            onClick={() => setActiveTab('exports')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'exports'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Export History ({exports.length})
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'scheduled'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Scheduled Exports ({scheduled.length})
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
                  placeholder="Search exports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            {activeTab === 'exports' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeTab === 'exports' ? (
        <div className="space-y-4">
          {exportsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : filteredExports.length === 0 ? (
            <Card variant="bordered">
              <CardContent className="py-12 text-center">
                <Download className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No exports found</p>
                <Button className="mt-4" onClick={() => setIsExportModalOpen(true)}>
                  Create First Export
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredExports.map((exp) => {
              const FormatIcon = FORMAT_INFO[exp.format].icon;
              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card variant="bordered">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <FormatIcon className={`w-6 h-6 ${FORMAT_INFO[exp.format].color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{exp.name}</h3>
                              {getStatusBadge(exp.status)}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span>{getDataSourceLabel(exp.dataSource)}</span>
                              <span className="text-gray-300">|</span>
                              <span>{FORMAT_INFO[exp.format].label}</span>
                              {exp.recordCount && (
                                <>
                                  <span className="text-gray-300">|</span>
                                  <span>{exp.recordCount.toLocaleString()} records</span>
                                </>
                              )}
                              {exp.fileSize && (
                                <>
                                  <span className="text-gray-300">|</span>
                                  <span>{formatFileSize(exp.fileSize)}</span>
                                </>
                              )}
                            </div>
                            {exp.status === 'processing' && exp.progress !== undefined && (
                              <div className="mt-2 w-48">
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-primary-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${exp.progress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{exp.progress}% complete</p>
                              </div>
                            )}
                            {exp.status === 'failed' && exp.errorMessage && (
                              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {exp.errorMessage}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                              <span>Created: {formatDate(exp.createdAt)}</span>
                              <span>By: {exp.createdBy}</span>
                              {exp.expiresAt && (
                                <span>Expires: {formatDate(exp.expiresAt)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {exp.status === 'completed' && exp.fileUrl && (
                            <Button size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          )}
                          {exp.status === 'failed' && (
                            <Button size="sm" variant="outline">
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Retry
                            </Button>
                          )}
                          <button
                            onClick={() => deleteExportMutation.mutate(exp.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
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
          {scheduledLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : filteredScheduled.length === 0 ? (
            <Card variant="bordered">
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No scheduled exports found</p>
                <Button className="mt-4" onClick={() => setIsScheduleModalOpen(true)}>
                  Create First Schedule
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredScheduled.map((sch) => {
              const FormatIcon = FORMAT_INFO[sch.format].icon;
              return (
                <motion.div
                  key={sch.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card variant="bordered" className={!sch.isActive ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-primary-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{sch.name}</h3>
                              <Badge variant={sch.isActive ? 'success' : 'default'} size="sm">
                                {sch.isActive ? 'Active' : 'Paused'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span>{getDataSourceLabel(sch.dataSource)}</span>
                              <span className="text-gray-300">|</span>
                              <span className="flex items-center gap-1">
                                <FormatIcon className={`w-3 h-3 ${FORMAT_INFO[sch.format].color}`} />
                                {FORMAT_INFO[sch.format].label}
                              </span>
                              <span className="text-gray-300">|</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {getScheduleText(sch)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                              {sch.lastRunAt && <span>Last run: {formatDate(sch.lastRunAt)}</span>}
                              {sch.nextRunAt && sch.isActive && (
                                <span>Next run: {formatDate(sch.nextRunAt)}</span>
                              )}
                              <span>Recipients: {sch.recipients.length}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleScheduleMutation.mutate({ id: sch.id, isActive: !sch.isActive })}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            title={sch.isActive ? 'Pause schedule' : 'Activate schedule'}
                          >
                            {sch.isActive ? (
                              <Pause className="w-5 h-5 text-yellow-500" />
                            ) : (
                              <Play className="w-5 h-5 text-green-500" />
                            )}
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenu(activeMenu === sch.id ? null : sch.id)}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                            <AnimatePresence>
                              {activeMenu === sch.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                                >
                                  <button
                                    onClick={() => handleOpenScheduleEdit(sch)}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                  >
                                    <Settings className="w-3 h-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      deleteScheduleMutation.mutate(sch.id);
                                      setActiveMenu(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* New Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Create New Export"
        size="md"
      >
        <form onSubmit={handleExportSubmit} className="space-y-4">
          <Input
            label="Export Name"
            value={exportForm.name}
            onChange={(e) => setExportForm({ ...exportForm, name: e.target.value })}
            placeholder="e.g., Monthly Call Report"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Source
            </label>
            <select
              value={exportForm.dataSource}
              onChange={(e) => setExportForm({ ...exportForm, dataSource: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              {DATA_SOURCES.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Format
            </label>
            <div className="flex gap-3">
              {Object.entries(FORMAT_INFO).map(([key, info]) => {
                const Icon = info.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setExportForm({ ...exportForm, format: key as ExportFormData['format'] })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      exportForm.format === key
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${info.color}`} />
                    {info.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="From Date (optional)"
              type="date"
              value={exportForm.dateFrom}
              onChange={(e) => setExportForm({ ...exportForm, dateFrom: e.target.value })}
            />
            <Input
              label="To Date (optional)"
              type="date"
              value={exportForm.dateTo}
              onChange={(e) => setExportForm({ ...exportForm, dateTo: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setIsExportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createExportMutation.isPending}>
              <Download className="w-4 h-4 mr-2" />
              Start Export
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Export Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedSchedule(null);
          resetScheduleForm();
        }}
        title={selectedSchedule ? 'Edit Scheduled Export' : 'Create Scheduled Export'}
        size="lg"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <Input
            label="Schedule Name"
            value={scheduleForm.name}
            onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
            placeholder="e.g., Daily Call Summary"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Source
              </label>
              <select
                value={scheduleForm.dataSource}
                onChange={(e) => setScheduleForm({ ...scheduleForm, dataSource: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                {DATA_SOURCES.map((source) => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Format
              </label>
              <select
                value={scheduleForm.format}
                onChange={(e) => setScheduleForm({ ...scheduleForm, format: e.target.value as ScheduleFormData['format'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                {Object.entries(FORMAT_INFO).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frequency
              </label>
              <select
                value={scheduleForm.schedule}
                onChange={(e) => setScheduleForm({ ...scheduleForm, schedule: e.target.value as ScheduleFormData['schedule'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <Input
              label="Time"
              type="time"
              value={scheduleForm.scheduleTime}
              onChange={(e) => setScheduleForm({ ...scheduleForm, scheduleTime: e.target.value })}
              required
            />
          </div>

          {scheduleForm.schedule === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Day of Week
              </label>
              <select
                value={scheduleForm.scheduleDayOfWeek}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduleDayOfWeek: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                  <option key={day} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}

          {scheduleForm.schedule === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Day of Month
              </label>
              <select
                value={scheduleForm.scheduleDayOfMonth}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduleDayOfMonth: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            {scheduleForm.recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {scheduleForm.recipients.map((email) => (
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
                      <XCircle className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Enable Schedule</p>
              <p className="text-sm text-gray-500">Start running exports on schedule</p>
            </div>
            <button
              type="button"
              onClick={() => setScheduleForm({ ...scheduleForm, isActive: !scheduleForm.isActive })}
            >
              {scheduleForm.isActive ? (
                <Play className="w-8 h-8 text-green-500" />
              ) : (
                <Pause className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsScheduleModalOpen(false);
                setSelectedSchedule(null);
                resetScheduleForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saveScheduleMutation.isPending}>
              <Calendar className="w-4 h-4 mr-2" />
              {selectedSchedule ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DataExports;
