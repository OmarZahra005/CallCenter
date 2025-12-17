import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  User,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ChevronDown,
  ChevronRight,
  Calendar,
  Activity,
  Database,
  Settings,
  Users,
  Phone,
  MessageSquare,
  X,
} from 'lucide-react';
import { Card, CardContent, Button, Badge } from '../../../components/ui';
import { staggerContainer, staggerItem, fadeUp } from '../../../utils/animations';
import apiClient from '../../../api/client';

// Types
interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  userName?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  details?: string;
  timestamp: string;
}

// Mock data generator
const generateMockLogs = (): AuditLog[] => {
  const actions = ['Create', 'Update', 'Delete', 'View', 'Login', 'Logout', 'Export', 'Import'];
  const entityTypes = ['User', 'Customer', 'Ticket', 'Call', 'Agent', 'Queue', 'Setting', 'Report'];
  const users = [
    { id: 'user-1', name: 'John Admin', role: 'Admin' },
    { id: 'user-2', name: 'Sarah Supervisor', role: 'Supervisor' },
    { id: 'user-3', name: 'Mike Agent', role: 'Agent' },
    { id: 'user-4', name: 'Emily QA', role: 'QA Analyst' },
  ];

  const logs: AuditLog[] = [];
  for (let i = 0; i < 100; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
    const hoursAgo = Math.floor(Math.random() * 168); // Last 7 days
    const date = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    logs.push({
      id: `log-${i}`,
      entityType,
      entityId: `${entityType.toLowerCase()}-${Math.floor(Math.random() * 1000)}`,
      action,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      oldValues: action === 'Update' ? { status: 'Active' } : undefined,
      newValues: action === 'Update' ? { status: 'Inactive' } : undefined,
      details: `${action} performed on ${entityType}`,
      timestamp: date.toISOString(),
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const ACTION_COLORS: Record<string, string> = {
  Create: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Update: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  View: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  Login: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Logout: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Export: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Import: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
};

const ENTITY_ICONS: Record<string, React.ElementType> = {
  User: User,
  Customer: Users,
  Ticket: FileText,
  Call: Phone,
  Agent: User,
  Queue: Database,
  Setting: Settings,
  Report: Activity,
  Message: MessageSquare,
};

export const AuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7d');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Fetch audit logs
  const { data: logs = [], isLoading, refetch } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/audit-logs');
        return response.data.items || response.data || [];
      } catch {
        return generateMockLogs();
      }
    },
  });

  // Get unique values for filters
  const uniqueActions = useMemo(() => {
    return [...new Set(logs.map((l) => l.action))];
  }, [logs]);

  const uniqueEntities = useMemo(() => {
    return [...new Set(logs.map((l) => l.entityType))];
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.userName?.toLowerCase().includes(query) ||
          log.entityType.toLowerCase().includes(query) ||
          log.entityId.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.details?.toLowerCase().includes(query)
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    // Entity filter
    if (entityFilter !== 'all') {
      filtered = filtered.filter((log) => log.entityType === entityFilter);
    }

    // Date filter
    const now = new Date();
    if (dateFilter !== 'all') {
      const days = parseInt(dateFilter.replace('d', ''));
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((log) => new Date(log.timestamp) >= cutoff);
    }

    return filtered;
  }, [logs, searchQuery, actionFilter, entityFilter, dateFilter]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: logs.length,
      todayCount: logs.filter((l) => new Date(l.timestamp) >= today).length,
      createCount: logs.filter((l) => l.action === 'Create').length,
      updateCount: logs.filter((l) => l.action === 'Update').length,
      deleteCount: logs.filter((l) => l.action === 'Delete').length,
    };
  }, [logs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-5"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track all system activities and changes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Activity className="w-8 h-8 text-primary-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-2xl font-bold text-blue-600">{stats.todayCount}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Creates</p>
                <p className="text-2xl font-bold text-green-600">{stats.createCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Updates</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.updateCount}</p>
              </div>
              <Settings className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Deletes</p>
                <p className="text-2xl font-bold text-red-600">{stats.deleteCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={staggerItem}>
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>

            {/* Entity Filter */}
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Entities</option>
              {uniqueEntities.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Logs List */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No audit logs found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filteredLogs.slice(0, 50).map((log) => {
                  const EntityIcon = ENTITY_ICONS[log.entityType] || FileText;
                  const isExpanded = expandedLog === log.id;

                  return (
                    <div key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <EntityIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded ${
                                  ACTION_COLORS[log.action] || ACTION_COLORS.View
                                }`}
                              >
                                {log.action}
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {log.entityType}
                              </span>
                              <span className="text-sm text-gray-500">#{log.entityId}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {log.userName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(log.timestamp)}
                              </span>
                              {log.ipAddress && (
                                <span className="hidden sm:flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  {log.ipAddress}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLog(log);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pl-18 grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-800/30 ml-14">
                              {log.oldValues && (
                                <div>
                                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Previous Values
                                  </p>
                                  <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                                    {JSON.stringify(log.oldValues, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.newValues && (
                                <div>
                                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    New Values
                                  </p>
                                  <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                                    {JSON.stringify(log.newValues, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedLog(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Audit Log Details
                  </h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Action</p>
                      <Badge className={ACTION_COLORS[selectedLog.action] || ''}>
                        {selectedLog.action}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Entity</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedLog.entityType} #{selectedLog.entityId}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">User</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedLog.userName}
                      </p>
                      <p className="text-xs text-gray-500">{selectedLog.userRole}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatFullDate(selectedLog.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">IP Address</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {selectedLog.ipAddress || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">User Agent</p>
                      <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                        {selectedLog.userAgent || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {selectedLog.details && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Details</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedLog.details}</p>
                    </div>
                  )}

                  {(selectedLog.oldValues || selectedLog.newValues) && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 mb-2">Changes</p>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedLog.oldValues && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Before
                            </p>
                            <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800 overflow-x-auto">
                              {JSON.stringify(selectedLog.oldValues, null, 2)}
                            </pre>
                          </div>
                        )}
                        {selectedLog.newValues && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              After
                            </p>
                            <pre className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800 overflow-x-auto">
                              {JSON.stringify(selectedLog.newValues, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AuditLogs;
