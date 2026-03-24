import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Plus,
  ExternalLink,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Card, Badge, Button } from '../../../components/ui';
import apiClient from '../../../api/client';
import { useSignalR } from '../../../hooks/useSignalR';

interface TicketInfo {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  agentId?: string;
  agentName?: string;
  subject: string;
  category: string;
  status: number | string;
  priority: number | string;
  source: number | string;
  createdAt: string;
  resolvedAt?: string;
}

interface LinkedTicketsListProps {
  conversationId: string | null;
  customerId: string | null;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  onCreateTicket?: () => void;
  onViewTicket?: (ticketId: string) => void;
}

export const LinkedTicketsList = ({
  conversationId,
  customerId: _customerId, // Reserved for future use (e.g., fetching all tickets for customer)
  isCollapsible = true,
  defaultExpanded = true,
  onCreateTicket,
  onViewTicket,
}: LinkedTicketsListProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Map status codes to display values
  const getStatusInfo = (status: number | string) => {
    const statusMap: Record<string, { label: string; color: string; icon: typeof Circle }> = {
      '0': { label: t('agentDesktop.new'), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Circle },
      'New': { label: t('agentDesktop.new'), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Circle },
      '1': { label: t('agentDesktop.open'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: AlertCircle },
      'Open': { label: t('agentDesktop.open'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: AlertCircle },
      '2': { label: t('agentDesktop.inProgress'), color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: ArrowRight },
      'InProgress': { label: t('agentDesktop.inProgress'), color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: ArrowRight },
      '3': { label: t('agentDesktop.pending'), color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: Clock },
      'Pending': { label: t('agentDesktop.pending'), color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: Clock },
      '4': { label: t('agentDesktop.resolved'), color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
      'Resolved': { label: t('agentDesktop.resolved'), color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
      '5': { label: t('agentDesktop.closed'), color: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-400', icon: CheckCircle2 },
      'Closed': { label: t('agentDesktop.closed'), color: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-400', icon: CheckCircle2 },
    };
    return statusMap[String(status)] || { label: String(status), color: 'bg-gray-100 text-gray-800', icon: Circle };
  };

  // Map priority codes to display values
  const getPriorityInfo = (priority: number | string) => {
    const priorityMap: Record<string, { label: string; color: string }> = {
      '0': { label: t('priority.low'), color: 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400' },
      'Low': { label: t('priority.low'), color: 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400' },
      '1': { label: t('agentDesktop.normal'), color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
      'Normal': { label: t('agentDesktop.normal'), color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
      '2': { label: t('priority.high'), color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
      'High': { label: t('priority.high'), color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
      '3': { label: t('agentDesktop.urgent'), color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
      'Urgent': { label: t('agentDesktop.urgent'), color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
    };
    return priorityMap[String(priority)] || { label: String(priority), color: 'bg-gray-100 text-gray-600' };
  };

  // Format time ago
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('agentDesktop.justNow');
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  const queryClient = useQueryClient();

  // Fetch tickets for the conversation
  const { data: tickets = [], isLoading, error } = useQuery<TicketInfo[]>({
    queryKey: ['tickets', 'conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await apiClient.get(`/tickets/conversation/${conversationId}`);
      return response.data;
    },
    enabled: !!conversationId,
    refetchInterval: 30000, // Refetch every 30 seconds as backup
  });

  // Subscribe to SignalR ticket events
  const { connection } = useSignalR();

  useEffect(() => {
    if (!connection || !conversationId) return;

    const handleNewTicket = () => {
      // Refresh tickets list when a new ticket is created
      queryClient.invalidateQueries({ queryKey: ['tickets', 'conversation', conversationId] });
    };

    const handleTicketUpdated = () => {
      // Refresh tickets list when a ticket is updated
      queryClient.invalidateQueries({ queryKey: ['tickets', 'conversation', conversationId] });
    };

    connection.on('NewTicketCreated', handleNewTicket);
    connection.on('TicketUpdated', handleTicketUpdated);

    return () => {
      connection.off('NewTicketCreated', handleNewTicket);
      connection.off('TicketUpdated', handleTicketUpdated);
    };
  }, [connection, conversationId, queryClient]);

  const toggleExpanded = () => {
    if (isCollapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  // Count open tickets
  const openTickets = tickets.filter((t) => {
    const status = String(t.status);
    return status === '0' || status === '1' || status === '2' || status === '3' ||
           status === 'New' || status === 'Open' || status === 'InProgress' || status === 'Pending';
  });

  return (
    <Card variant="bordered" className="overflow-hidden">
      {/* Header */}
      <div
        className={`p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between ${
          isCollapsible ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''
        }`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('agentDesktop.linkedTickets')}</h3>
          <Badge variant="default" size="sm">
            {tickets.length} {tickets.length !== 1 ? t('agentDesktop.ticketsPlural') : t('agentDesktop.ticket')}
          </Badge>
          {openTickets.length > 0 && (
            <Badge variant="warning" size="sm">
              {openTickets.length} {t('agentDesktop.open')}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCreateTicket && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCreateTicket();
              }}
              className="p-1"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
          {isCollapsible && (
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <p>{t('agentDesktop.ticketsFailed')}</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Ticket className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="mb-4">{t('agentDesktop.noTicketsLinked')}</p>
                  {onCreateTicket && (
                    <Button variant="secondary" size="sm" onClick={onCreateTicket}>
                      <Plus className="w-4 h-4 mr-1" />
                      {t('agentDesktop.createTicket')}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket, index) => {
                    const statusInfo = getStatusInfo(ticket.status);
                    const priorityInfo = getPriorityInfo(ticket.priority);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        onClick={() => onViewTicket?.(ticket.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-gray-500">
                                {ticket.ticketNumber}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusInfo.color}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo.label}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityInfo.color}`}>
                                {priorityInfo.label}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {ticket.subject}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span>{ticket.category}</span>
                              <span>{formatTimeAgo(ticket.createdAt)}</span>
                              {ticket.agentName && (
                                <span>{t('agentDesktop.assigned')} {ticket.agentName}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewTicket?.(ticket.id);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default LinkedTicketsList;
