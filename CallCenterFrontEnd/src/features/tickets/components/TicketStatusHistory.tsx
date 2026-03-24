import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  User,
  MessageSquare,
  Loader2,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';
import apiClient from '../../../api/client';

// Status types matching backend enum
type TicketStatus = 'New' | 'Open' | 'Pending' | 'Resolved' | 'Closed' | 'Reopened' | 'InProgress';

interface StatusHistoryEntry {
  id: string;
  ticketId: string;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus;
  changedBy: string;
  changedByAgentName?: string;
  reason?: string;
  createdAt: string;
}

interface TicketStatusHistoryProps {
  ticketId: string;
  currentStatus?: string;
}

// Status configuration with icons and colors
const STATUS_CONFIG: Record<string, {
  icon: typeof AlertCircle;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  New: {
    icon: AlertCircle,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-500',
  },
  Open: {
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-500',
  },
  InProgress: {
    icon: PlayCircle,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    borderColor: 'border-indigo-500',
  },
  Pending: {
    icon: PauseCircle,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-500',
  },
  Resolved: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-500',
  },
  Closed: {
    icon: XCircle,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    borderColor: 'border-gray-500',
  },
  Reopened: {
    icon: RefreshCw,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-500',
  },
};

// Get status config with fallback
const getStatusConfig = (status: string) => {
  return STATUS_CONFIG[status] || {
    icon: AlertCircle,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    borderColor: 'border-gray-500',
  };
};

export const TicketStatusHistory = ({
  ticketId,
  currentStatus,
}: TicketStatusHistoryProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      New: t('ticketsPage.statusNew'),
      Open: t('ticketsPage.statusOpen'),
      InProgress: t('ticketsPage.statusInProgress'),
      Pending: t('ticketsPage.statusPending'),
      Resolved: t('ticketsPage.statusResolved'),
      Closed: t('ticketsPage.statusClosed'),
      Reopened: t('ticketsPage.statusReopened'),
    };
    return labels[status] || status;
  };

  // Format date for display
  const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('ticketStatusHistory.justNow');
    if (diffMins < 60) return t('ticketStatusHistory.mAgo', { count: diffMins });
    if (diffHours < 24) return t('ticketStatusHistory.hAgo', { count: diffHours });
    if (diffDays < 7) return t('ticketStatusHistory.dAgo', { count: diffDays });
    return formatDateTime(dateStr);
  };

  // Calculate time between statuses
  const calculateDuration = (from: string, to: string): string => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffMs = toDate.getTime() - fromDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return t('ticketStatusHistory.minDuration', { count: diffMins });
    if (diffHours < 24) return t('ticketStatusHistory.hrDuration', { count: diffHours });
    return t('ticketStatusHistory.daysDuration', { count: diffDays });
  };

  // Fetch status history
  const { data: history = [], isLoading, error } = useQuery<StatusHistoryEntry[]>({
    queryKey: ['ticket-status-history', ticketId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/tickets/${ticketId}/history`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (err) {
        console.warn('Status history endpoint not available:', err);
        return [];
      }
    },
    enabled: !!ticketId,
    retry: false,
  });

  // Sort history by date (oldest first for timeline)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-gray-500" />
        <h4 className="font-medium text-gray-900 dark:text-white">
          {t('ticketStatusHistory.title')}
          {history.length > 0 && (
            <span className="ms-2 text-sm text-gray-500">({t('ticketStatusHistory.changes', { count: history.length })})</span>
          )}
        </h4>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-center py-6 text-gray-500">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t('ticketStatusHistory.unavailable')}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && history.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t('ticketStatusHistory.noChanges')}</p>
          {currentStatus && (
            <p className="text-xs mt-1">
              {t('ticketStatusHistory.currentStatusLabel')} <span className="font-medium">{getStatusLabel(currentStatus)}</span>
            </p>
          )}
        </div>
      )}

      {/* Timeline */}
      {!isLoading && sortedHistory.length > 0 && (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute start-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          {/* Timeline entries */}
          <div className="space-y-4">
            <AnimatePresence>
              {sortedHistory.map((entry, index) => {
                const toConfig = getStatusConfig(entry.toStatus);
                const fromConfig = entry.fromStatus ? getStatusConfig(entry.fromStatus) : null;
                const ToIcon = toConfig.icon;
                const isLatest = index === sortedHistory.length - 1;
                const nextEntry = sortedHistory[index + 1];
                const duration = nextEntry ? calculateDuration(entry.createdAt, nextEntry.createdAt) : null;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative ps-12"
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute start-3 w-5 h-5 rounded-full border-2 ${toConfig.bgColor} ${toConfig.borderColor} flex items-center justify-center ${
                        isLatest ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : ''
                      }`}
                      style={{ top: '4px' }}
                    >
                      <ToIcon className={`w-3 h-3 ${toConfig.color}`} />
                    </div>

                    {/* Content card */}
                    <div
                      className={`p-4 rounded-lg border ${
                        isLatest
                          ? `${toConfig.bgColor} border-s-4 ${toConfig.borderColor}`
                          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {/* Status change */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {entry.fromStatus ? (
                          <>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${fromConfig?.bgColor} ${fromConfig?.color}`}>
                              {getStatusLabel(entry.fromStatus)}
                            </span>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${toConfig.bgColor} ${toConfig.color}`}>
                              {getStatusLabel(entry.toStatus)}
                            </span>
                          </>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${toConfig.bgColor} ${toConfig.color}`}>
                            {getStatusLabel(entry.toStatus)}
                          </span>
                        )}
                        {isLatest && (
                          <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded text-xs font-medium">
                            {t('ticketStatusHistory.current')}
                          </span>
                        )}
                      </div>

                      {/* Reason */}
                      {entry.reason && (
                        <div className="mt-2 flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.reason}
                          </p>
                        </div>
                      )}

                      {/* Meta info */}
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          <span>{entry.changedByAgentName || t('ticketStatusHistory.system')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span title={formatDateTime(entry.createdAt)}>
                            {formatRelativeTime(entry.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Duration in this status */}
                      {duration && !isLatest && (
                        <div className="mt-2 text-xs text-gray-400">
                          {t('ticketStatusHistory.inStatusFor', { duration })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Total resolution time (if resolved/closed) */}
          {sortedHistory.length > 0 && (currentStatus === 'Resolved' || currentStatus === 'Closed') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: sortedHistory.length * 0.1 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('ticketStatusHistory.totalResolutionTime')}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {calculateDuration(sortedHistory[0].createdAt, sortedHistory[sortedHistory.length - 1].createdAt)}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketStatusHistory;
