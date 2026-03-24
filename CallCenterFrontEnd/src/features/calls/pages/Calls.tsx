import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useCallCenter } from '../../../context/CallCenterContext';
import { Card, Badge, Button } from '../../../components/ui';
import { cn } from '../../../utils/cn';
import {
  pageVariants,
  pageTransition,
} from '../../../utils/animations';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Search,
  X,
  RefreshCw,
  Clock,
  User,
  Inbox,
  Zap,
  CheckCircle,
  PhoneMissed,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import type { CallSummary } from '../../../types/callTypes';

// ─── Filters ────────────────────────────────────────────

type StatusFilter = 'all' | 'active' | 'completed' | 'missed';
type DirectionFilter = 'all' | 'inbound' | 'outbound';

const STATUS_TAB_CONFIG: { id: StatusFilter; key: string; icon: typeof Inbox }[] = [
  { id: 'all', key: 'calls.all', icon: Inbox },
  { id: 'active', key: 'calls.activeTab', icon: Zap },
  { id: 'completed', key: 'calls.completed', icon: CheckCircle },
  { id: 'missed', key: 'calls.missed', icon: PhoneMissed },
];

const DIRECTION_TAB_CONFIG: { id: DirectionFilter; key: string; icon: typeof ArrowDownLeft }[] = [
  { id: 'all', key: 'calls.all', icon: Phone },
  { id: 'inbound', key: 'calls.inbound', icon: ArrowDownLeft },
  { id: 'outbound', key: 'calls.outbound', icon: ArrowUpRight },
];

// ─── Helpers ────────────────────────────────────────────

const STATUS_PRIORITY: Record<string, number> = {
  InProgress: 1,
  Ringing: 2,
  Queued: 3,
};

const formatDuration = (call: CallSummary): string => {
  if (!call.endedAtUtc) return '--:--';
  const start = new Date(call.startedAtUtc).getTime();
  const end = new Date(call.endedAtUtc).getTime();
  const durationSeconds = Math.floor((end - start) / 1000);
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const isActiveStatus = (status: string) =>
  ['InProgress', 'Ringing', 'Queued'].includes(status);

const isMissedStatus = (status: string) =>
  ['Failed', 'Busy', 'NoAnswer'].includes(status);

const getDirectionIcon = (direction: string) => {
  const isInbound = direction?.toLowerCase() === 'inbound';
  return isInbound
    ? <PhoneIncoming className="w-4 h-4 text-green-500" />
    : <PhoneOutgoing className="w-4 h-4 text-blue-500" />;
};

// ─── Component ──────────────────────────────────────────

const Calls = () => {
  const { t } = useTranslation();
  const { activeCalls, history, selectedCall, setSelectedCall, refreshActive, refreshHistory } = useCallCenter();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatRelativeTime = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('calls.justNow');
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  }, [t]);

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'Ringing':
        return <Badge variant="warning" dot pulse size="sm">{t('calls.statusRinging')}</Badge>;
      case 'InProgress':
        return <Badge variant="success" dot pulse size="sm">{t('calls.statusInProgress')}</Badge>;
      case 'Queued':
        return <Badge variant="info" dot size="sm">{t('calls.statusQueued')}</Badge>;
      case 'Completed':
        return <Badge variant="success" size="sm">{t('calls.statusCompleted')}</Badge>;
      case 'Failed':
        return <Badge variant="danger" size="sm">{t('calls.statusFailed')}</Badge>;
      case 'Busy':
        return <Badge variant="warning" size="sm">{t('calls.statusBusy')}</Badge>;
      case 'NoAnswer':
        return <Badge variant="default" size="sm">{t('calls.statusNoAnswer')}</Badge>;
      default:
        return <Badge variant="default" size="sm">{status || t('calls.unknown')}</Badge>;
    }
  }, [t]);

  // Merge active + history, deduplicate by id
  const allCalls = useMemo(() => {
    const map = new Map<string, CallSummary>();
    for (const call of activeCalls) map.set(call.id, call);
    for (const call of history) {
      if (!map.has(call.id)) map.set(call.id, call);
    }
    // Sort: active first (by priority), then by startedAtUtc desc
    return [...map.values()].sort((a, b) => {
      const aActive = isActiveStatus(a.status);
      const bActive = isActiveStatus(b.status);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      if (aActive && bActive) {
        return (STATUS_PRIORITY[a.status] || 99) - (STATUS_PRIORITY[b.status] || 99);
      }
      return new Date(b.startedAtUtc).getTime() - new Date(a.startedAtUtc).getTime();
    });
  }, [activeCalls, history]);

  // Filter calls
  const filteredCalls = useMemo(() => {
    return allCalls.filter((call) => {
      // Status filter
      if (statusFilter === 'active' && !isActiveStatus(call.status)) return false;
      if (statusFilter === 'completed' && call.status !== 'Completed') return false;
      if (statusFilter === 'missed' && !isMissedStatus(call.status)) return false;

      // Direction filter
      if (directionFilter === 'inbound' && call.direction?.toLowerCase() !== 'inbound') return false;
      if (directionFilter === 'outbound' && call.direction?.toLowerCase() !== 'outbound') return false;

      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesFrom = call.fromNumber?.toLowerCase().includes(term);
        const matchesTo = call.toNumber?.toLowerCase().includes(term);
        const matchesStatus = call.status?.toLowerCase().includes(term);
        if (!matchesFrom && !matchesTo && !matchesStatus) return false;
      }

      return true;
    });
  }, [allCalls, statusFilter, directionFilter, searchTerm]);

  // Counts for filter badges
  const statusCounts = useMemo(() => ({
    all: allCalls.length,
    active: allCalls.filter((c) => isActiveStatus(c.status)).length,
    completed: allCalls.filter((c) => c.status === 'Completed').length,
    missed: allCalls.filter((c) => isMissedStatus(c.status)).length,
  }), [allCalls]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshActive(), refreshHistory()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshActive, refreshHistory]);

  const handleSelectCall = useCallback((call: CallSummary) => {
    setSelectedCall(call);
  }, [setSelectedCall]);

  return (
    <motion.div
      className="h-[calc(100vh-6.5rem)] flex flex-col gap-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('calls.title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('calls.subtitle', { filtered: filteredCalls.length, total: allCalls.length })}
              {statusCounts.active > 0 && (
                <span className="ms-2 text-green-600 dark:text-green-400 font-medium">
                  {statusCounts.active} {t('calls.active')}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleRefresh}
            isLoading={isRefreshing}
          >
            <RefreshCw className="w-4 h-4" />
            {t('calls.refresh')}
          </Button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-4">
        {/* Status tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {STATUS_TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                statusFilter === tab.id
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {t(tab.key)}
              {statusCounts[tab.id] > 0 && (
                <span className={cn(
                  'ms-1 px-1.5 py-0.5 text-xs rounded-full',
                  statusFilter === tab.id
                    ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                )}>
                  {statusCounts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />

        {/* Direction filters */}
        <div className="flex gap-2">
          {DIRECTION_TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDirectionFilter(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border',
                directionFilter === tab.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {t(tab.key)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main 3-Panel Layout ── */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Panel — Call List */}
        <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col shadow-sm">
          {/* Search */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('calls.searchPlaceholder')}
                className="w-full ps-10 pe-10 py-2.5 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Call list */}
          <div className="flex-1 overflow-y-auto">
            {filteredCalls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                  <Phone className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('calls.noCallsFound')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {searchTerm ? t('calls.noCallsSearch') : t('calls.noCallsEmpty')}
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {filteredCalls.map((call, index) => (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.2 }}
                    onClick={() => handleSelectCall(call)}
                    className={cn(
                      'p-3 rounded-xl border cursor-pointer transition-all duration-200',
                      'hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700',
                      selectedCall?.id === call.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500'
                        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50'
                    )}
                  >
                    {/* Top row: status + direction + time */}
                    <div className="flex items-center justify-between mb-2">
                      {getStatusBadge(call.status)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(call.startedAtUtc)}
                      </span>
                    </div>

                    {/* Phone numbers */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate" dir="ltr">
                          {call.fromNumber || '--'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate" dir="ltr">
                          {call.toNumber || '--'}
                        </p>
                      </div>
                    </div>

                    {/* Bottom row: direction + duration */}
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        {getDirectionIcon(call.direction)}
                        <span className="capitalize">
                          {call.direction?.toLowerCase() === 'inbound' ? t('calls.inbound') : call.direction?.toLowerCase() === 'outbound' ? t('calls.outbound') : t('calls.unknown')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span className="font-mono">{formatDuration(call)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Panel — Call Detail (placeholder for Task 2) */}
        <Card variant="bordered" className="flex-1 flex items-center justify-center">
          {selectedCall ? (
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('calls.callDetails')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedCall.fromNumber} → {selectedCall.toNumber}
              </p>
              <div className="mt-3">
                {getStatusBadge(selectedCall.status)}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('calls.selectCall')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('calls.selectCallHint')}
              </p>
            </div>
          )}
        </Card>

        {/* Right Panel — Customer Info (placeholder for Task 4) */}
      </div>
    </motion.div>
  );
};

export default Calls;
