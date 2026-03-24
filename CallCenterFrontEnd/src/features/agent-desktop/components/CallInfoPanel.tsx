import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Pause,
  Play,
  ArrowRightLeft,
  Clock,
  Calendar,
  MessageSquare,
  Ticket,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Mail,
  FileText,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '../../../components/ui';
import { CallDurationTimer, LiveIndicator } from '../../../components/ui';
import type { CallInfo, CustomerInfo } from '../hooks/useAgentDesktop';

type CallState = 'active' | 'onhold';

interface Interaction {
  id: string;
  type: 'Call' | 'Ticket' | 'Email' | 'Chat';
  summary: string;
  date: string;
  status?: string;
}

interface LinkedTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface CallInfoPanelProps {
  callInfo: CallInfo;
  customer: CustomerInfo | null;
  callState: CallState;
  callStartTime: Date;
  isMuted: boolean;
  isOnHold: boolean;
  onMute: () => void;
  onHold: () => void;
  onResume: () => void;
  onTransfer: () => void;
  onHangup: () => void;
  recentInteractions?: Interaction[];
  linkedTickets?: LinkedTicket[];
}

// Get priority badge color
const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'critical': return 'danger';
    case 'high': return 'warning';
    case 'medium': return 'info';
    default: return 'default';
  }
};

// Get status badge color
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'open': return 'info';
    case 'in progress': return 'warning';
    case 'resolved': return 'success';
    case 'closed': return 'default';
    default: return 'default';
  }
};

// Get interaction icon
const getInteractionIcon = (type: string) => {
  switch (type) {
    case 'Call': return PhoneCall;
    case 'Ticket': return Ticket;
    case 'Email': return Mail;
    case 'Chat': return MessageSquare;
    default: return FileText;
  }
};

export const CallInfoPanel = ({
  callInfo,
  customer,
  callState,
  callStartTime,
  isMuted,
  isOnHold,
  onMute,
  onHold,
  onResume,
  onTransfer,
  onHangup,
  recentInteractions = [],
  linkedTickets = [],
}: CallInfoPanelProps) => {
  const { t } = useTranslation();
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);
  const [isInteractionsExpanded, setIsInteractionsExpanded] = useState(true);
  const [isTicketsExpanded, setIsTicketsExpanded] = useState(true);

  // Derived values
  const customerName = customer?.name || callInfo.callerName || t('agentDesktop.unknownCaller');
  const customerPhone = customer?.phone || callInfo.callerNumber;
  const customerType = customer?.type || 'Standard';

  // Call script suggestions based on call type
  const getCallScriptSuggestions = (_direction: string, _customerType: string) => {
    const suggestions = [
      {
        id: '1',
        title: t('agentDesktop.scriptGreeting'),
        script: t('agentDesktop.scriptGreetingText'),
        icon: MessageSquare,
      },
      {
        id: '2',
        title: t('agentDesktop.scriptVerifyIdentity'),
        script: t('agentDesktop.scriptVerifyIdentityText'),
        icon: AlertCircle,
      },
      {
        id: '3',
        title: t('agentDesktop.scriptIssueResolution'),
        script: t('agentDesktop.scriptIssueResolutionText'),
        icon: Lightbulb,
      },
      {
        id: '4',
        title: t('agentDesktop.scriptClosing'),
        script: t('agentDesktop.scriptClosingText'),
        icon: Phone,
      },
    ];

    if (_customerType === 'VIP' || _customerType === 'Premium') {
      suggestions.unshift({
        id: '0',
        title: t('agentDesktop.scriptVipGreeting'),
        script: t('agentDesktop.scriptVipGreetingText', { customerType: _customerType }),
        icon: MessageSquare,
      });
    }

    return suggestions;
  };

  // Status configuration
  const statusConfig = {
    active: { variant: 'live' as const, label: t('agentDesktop.live') },
    onhold: { variant: 'paused' as const, label: t('agentDesktop.onHold') },
  };

  const currentStatus = statusConfig[callState];
  const callScripts = getCallScriptSuggestions(callInfo.direction, customerType);

  // Format start time
  const formatStartTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <Card variant="bordered" className="flex-shrink-0">
      <CardContent className="p-0">
        {/* Main Call Info Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          {/* Header: Status + Customer Badge */}
          <div className="flex items-start justify-between mb-4">
            <LiveIndicator variant={currentStatus.variant} label={currentStatus.label} />
            <Badge variant={customerType === 'VIP' || customerType === 'Premium' ? 'success' : 'default'}>
              {customerType}
            </Badge>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
              {customerName}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400">{customerPhone}</p>
          </div>

          {/* Call Time Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Call Start Time */}
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">{t('agentDesktop.startedAt')}</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatStartTime(callStartTime)}
              </p>
            </div>

            {/* Call Duration */}
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">{t('agentDesktop.duration')}</span>
              </div>
              <CallDurationTimer
                startTime={callStartTime}
                size="lg"
                className="text-lg font-mono font-semibold text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Call Metadata */}
          <div className="flex items-center gap-3 mb-6 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <Badge variant="info" size="sm">
              {callInfo.direction}
            </Badge>
            {callInfo.queueName && <span>{t('agentDesktop.queueLabel')} {callInfo.queueName}</span>}
            {callInfo.callId && <span className="text-xs">ID: {callInfo.callId.slice(0, 8)}</span>}
            {/* Recording indicator */}
            <span className="flex items-center gap-1">
              <motion.span
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
              {t('agentDesktop.recording')}
            </span>
          </div>

          {/* Call Controls */}
          <div className="grid grid-cols-4 gap-3">
            {/* Mute Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onMute}
                variant={isMuted ? 'primary' : 'secondary'}
                size="md"
                className={`w-full flex flex-col items-center gap-1.5 h-auto py-3 ${
                  isMuted ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800' : ''
                }`}
                title={isMuted ? t('agentDesktop.unmuteTooltip') : t('agentDesktop.muteTooltip')}
              >
                {isMuted ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
                <span className="text-xs font-medium">{isMuted ? t('agentDesktop.unmute') : t('agentDesktop.mute')}</span>
                {isMuted && (
                  <span className="text-[10px] text-red-400 font-medium">{t('agentDesktop.muted')}</span>
                )}
              </Button>
            </motion.div>

            {/* Hold/Resume Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={isOnHold ? onResume : onHold}
                variant={isOnHold ? 'warning' : 'secondary'}
                size="md"
                className={`w-full flex flex-col items-center gap-1.5 h-auto py-3 ${
                  isOnHold ? 'ring-2 ring-yellow-500 ring-offset-2 dark:ring-offset-gray-800' : ''
                }`}
                title={isOnHold ? t('agentDesktop.resumeTooltip') : t('agentDesktop.holdTooltip')}
              >
                {isOnHold ? (
                  <Play className="w-5 h-5" />
                ) : (
                  <Pause className="w-5 h-5" />
                )}
                <span className="text-xs font-medium">{isOnHold ? t('agentDesktop.resume') : t('agentDesktop.hold')}</span>
                {isOnHold && (
                  <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-medium">{t('agentDesktop.onHold')}</span>
                )}
              </Button>
            </motion.div>

            {/* Transfer Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onTransfer}
                variant="secondary"
                size="md"
                className="w-full flex flex-col items-center gap-1.5 h-auto py-3"
                title={t('agentDesktop.transferTooltip')}
              >
                <ArrowRightLeft className="w-5 h-5" />
                <span className="text-xs font-medium">{t('agentDesktop.transfer')}</span>
              </Button>
            </motion.div>

            {/* End Call Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onHangup}
                variant="danger"
                size="md"
                className="w-full flex flex-col items-center gap-1.5 h-auto py-3"
                title={t('agentDesktop.endCallTooltip')}
              >
                <PhoneOff className="w-5 h-5" />
                <span className="text-xs font-medium">{t('agentDesktop.endCall')}</span>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Expandable Sections */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Call Script / Suggested Actions */}
          <div>
            <button
              onClick={() => setIsScriptExpanded(!isScriptExpanded)}
              className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('agentDesktop.callScripts')}
                </span>
              </div>
              {isScriptExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <AnimatePresence>
              {isScriptExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 space-y-3">
                    {callScripts.map((script) => {
                      const Icon = script.icon;
                      return (
                        <div
                          key={script.id}
                          className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                              {script.title}
                            </span>
                          </div>
                          <p className="text-sm text-amber-700 dark:text-amber-400 italic">
                            "{script.script}"
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Customer Last Interactions */}
          <div>
            <button
              onClick={() => setIsInteractionsExpanded(!isInteractionsExpanded)}
              className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('agentDesktop.recentInteractions')}
                </span>
                {recentInteractions.length > 0 && (
                  <Badge variant="info" size="sm">{recentInteractions.length}</Badge>
                )}
              </div>
              {isInteractionsExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <AnimatePresence>
              {isInteractionsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4">
                    {recentInteractions.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                        {t('agentDesktop.noInteractionsFound')}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {recentInteractions.slice(0, 5).map((interaction) => {
                          const Icon = getInteractionIcon(interaction.type);
                          return (
                            <div
                              key={interaction.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                interaction.type === 'Call' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                interaction.type === 'Ticket' ? 'bg-orange-100 dark:bg-orange-900/30' :
                                interaction.type === 'Email' ? 'bg-purple-100 dark:bg-purple-900/30' :
                                'bg-green-100 dark:bg-green-900/30'
                              }`}>
                                <Icon className={`w-4 h-4 ${
                                  interaction.type === 'Call' ? 'text-blue-600 dark:text-blue-400' :
                                  interaction.type === 'Ticket' ? 'text-orange-600 dark:text-orange-400' :
                                  interaction.type === 'Email' ? 'text-purple-600 dark:text-purple-400' :
                                  'text-green-600 dark:text-green-400'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {interaction.summary}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {interaction.type} • {interaction.date}
                                </p>
                              </div>
                              {interaction.status && (
                                <Badge variant={getStatusColor(interaction.status)} size="sm">
                                  {interaction.status}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Linked Tickets */}
          <div>
            <button
              onClick={() => setIsTicketsExpanded(!isTicketsExpanded)}
              className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('agentDesktop.linkedTickets')}
                </span>
                {linkedTickets.length > 0 && (
                  <Badge variant="warning" size="sm">{linkedTickets.length}</Badge>
                )}
              </div>
              {isTicketsExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <AnimatePresence>
              {isTicketsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4">
                    {linkedTickets.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                        {t('agentDesktop.noLinkedTickets')}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {linkedTickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {ticket.subject}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {t('agentDesktop.created')} {ticket.createdAt}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge variant={getStatusColor(ticket.status)} size="sm">
                                  {ticket.status}
                                </Badge>
                                <Badge variant={getPriorityColor(ticket.priority)} size="sm">
                                  {ticket.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
