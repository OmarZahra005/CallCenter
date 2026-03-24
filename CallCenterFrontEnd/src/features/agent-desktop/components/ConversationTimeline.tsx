import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  PhoneIncoming,
  PhoneMissed,
  User,
  MessageSquare,
  Ticket,
  Pause,
  Play,
  Volume2,
  VolumeX,
  ArrowRightLeft,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Card, Badge } from '../../../components/ui';
import apiClient from '../../../api/client';
import { useSignalR } from '../../../hooks/useSignalR';

interface TimelineEvent {
  id: string;
  eventType: string;
  description: string;
  timestamp: string;
  agentId?: string;
  agentName?: string;
  metadata?: Record<string, unknown>;
}

interface ConversationTimelineProps {
  conversationId: string | null;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

// Event type to icon mapping
const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'CallStarted':
      return PhoneIncoming;
    case 'CallAnswered':
      return Phone;
    case 'CallEnded':
      return PhoneOff;
    case 'CallFailed':
    case 'CallAbandoned':
      return PhoneMissed;
    case 'OnHold':
      return Pause;
    case 'Resumed':
      return Play;
    case 'Muted':
      return VolumeX;
    case 'Unmuted':
      return Volume2;
    case 'Transferred':
      return ArrowRightLeft;
    case 'NoteAdded':
      return FileText;
    case 'TicketCreated':
    case 'TicketUpdated':
      return Ticket;
    case 'MessageSent':
      return MessageSquare;
    case 'AgentAssigned':
      return User;
    case 'DispositionSet':
      return AlertCircle;
    default:
      return Clock;
  }
};

// Event type to color mapping
const getEventColor = (eventType: string) => {
  switch (eventType) {
    case 'CallStarted':
    case 'CallAnswered':
      return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    case 'CallEnded':
      return 'text-gray-600 bg-gray-100 dark:bg-gray-700/50';
    case 'CallFailed':
    case 'CallAbandoned':
      return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    case 'OnHold':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    case 'Resumed':
    case 'Unmuted':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    case 'Muted':
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
    case 'Transferred':
      return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
    case 'NoteAdded':
      return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30';
    case 'TicketCreated':
    case 'TicketUpdated':
      return 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30';
    case 'MessageSent':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    case 'AgentAssigned':
      return 'text-teal-600 bg-teal-100 dark:bg-teal-900/30';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-700/50';
  }
};

export const ConversationTimeline = ({
  conversationId,
  isCollapsible = true,
  defaultExpanded = true,
}: ConversationTimelineProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return t('agentDesktop.justNow');
    }

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const queryClient = useQueryClient();

  // Fetch timeline events
  const { data: events = [], isLoading, error } = useQuery<TimelineEvent[]>({
    queryKey: ['timeline', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await apiClient.get(`/timeline/conversation/${conversationId}`);
      return response.data;
    },
    enabled: !!conversationId,
    refetchInterval: 30000, // Refetch every 30 seconds as backup
  });

  // Subscribe to SignalR timeline events
  const { connection } = useSignalR();

  useEffect(() => {
    if (!connection || !conversationId) return;

    const handleTimelineEvent = (data: { conversationId: string; timelineEvent: TimelineEvent }) => {
      if (data.conversationId === conversationId) {
        // Invalidate and refetch timeline
        queryClient.invalidateQueries({ queryKey: ['timeline', conversationId] });
      }
    };

    connection.on('TimelineEvent', handleTimelineEvent);

    return () => {
      connection.off('TimelineEvent', handleTimelineEvent);
    };
  }, [connection, conversationId, queryClient]);

  if (!conversationId) {
    return null;
  }

  const toggleExpanded = () => {
    if (isCollapsible) {
      setIsExpanded(!isExpanded);
    }
  };

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
          <Clock className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('agentDesktop.timeline')}</h3>
          <Badge variant="default" size="sm">
            {events.length} {t('agentDesktop.events')}
          </Badge>
        </div>
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
            <div className="p-4 max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>{t('agentDesktop.timelineFailed')}</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>{t('agentDesktop.noEvents')}</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                  {/* Events */}
                  <div className="space-y-4">
                    {events.map((event, index) => {
                      const Icon = getEventIcon(event.eventType);
                      const colorClass = getEventColor(event.eventType);

                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative flex items-start gap-3 pl-8"
                        >
                          {/* Icon */}
                          <div
                            className={`absolute left-0 flex items-center justify-center w-8 h-8 rounded-full ${colorClass}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {event.description}
                              </p>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatTimestamp(event.timestamp)}
                              </span>
                            </div>
                            {event.agentName && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {t('agentDesktop.byAgent')} {event.agentName}
                              </p>
                            )}
                            {/* Show metadata if available */}
                            {event.metadata?.durationSeconds != null && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {t('agentDesktop.durationLabel')} {Math.floor(Number(event.metadata.durationSeconds) / 60)}m{' '}
                                {Number(event.metadata.durationSeconds) % 60}s
                              </p>
                            )}
                            {event.eventType === 'TicketCreated' && event.metadata?.ticketNumber != null && (
                              <p className="text-xs text-cyan-600 mt-0.5">
                                #{String(event.metadata.ticketNumber)}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ConversationTimeline;
