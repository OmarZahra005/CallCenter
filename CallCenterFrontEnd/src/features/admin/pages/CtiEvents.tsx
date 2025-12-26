import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  PhoneOff,
  User,
  Clock,
  Search,
  Pause,
  Play,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button, Badge, Card, CardContent, Modal } from '../../../components/ui';
import apiClient from '../../../api/client';

interface CtiEvent {
  id: string;
  timestamp: string;
  eventType: string;
  callId?: string;
  agentId?: string;
  agentName?: string;
  queueId?: string;
  queueName?: string;
  callerNumber?: string;
  calledNumber?: string;
  direction?: 'inbound' | 'outbound';
  duration?: number;
  status?: string;
  metadata?: Record<string, unknown>;
  source: string;
}

const EVENT_TYPES = {
  CALL_INITIATED: { label: 'Call Initiated', icon: Phone, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  CALL_RINGING: { label: 'Ringing', icon: PhoneIncoming, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  CALL_ANSWERED: { label: 'Answered', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  CALL_ENDED: { label: 'Ended', icon: PhoneOff, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' },
  CALL_MISSED: { label: 'Missed', icon: PhoneMissed, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  CALL_TRANSFERRED: { label: 'Transferred', icon: ArrowRight, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  CALL_HELD: { label: 'On Hold', icon: Pause, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  CALL_RESUMED: { label: 'Resumed', icon: Play, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  AGENT_LOGIN: { label: 'Agent Login', icon: User, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  AGENT_LOGOUT: { label: 'Agent Logout', icon: User, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' },
  AGENT_READY: { label: 'Agent Ready', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  AGENT_NOT_READY: { label: 'Agent Not Ready', icon: XCircle, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  QUEUE_JOINED: { label: 'Joined Queue', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  QUEUE_LEFT: { label: 'Left Queue', icon: Activity, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' },
  DTMF_RECEIVED: { label: 'DTMF Input', icon: Activity, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  RECORDING_STARTED: { label: 'Recording Started', icon: Activity, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  RECORDING_STOPPED: { label: 'Recording Stopped', icon: Activity, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' },
  ERROR: { label: 'Error', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
};

// Response interface for CTI events API
interface CtiEventsResponse {
  items: CtiEvent[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const CtiEvents = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CtiEvent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const eventsContainerRef = useRef<HTMLDivElement>(null);

  // Fetch CTI events from real backend API
  const { data: eventsResponse, isLoading, refetch } = useQuery<CtiEventsResponse>({
    queryKey: ['cti-events'],
    queryFn: async () => {
      const response = await apiClient.get('/ctievents?pageSize=100&pageNumber=1');
      return response.data;
    },
    refetchInterval: isPaused ? false : 5000,
  });

  const events: CtiEvent[] = eventsResponse?.items || [];

  // Simulate connection status
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly toggle connection for demo (in real app, this would be from WebSocket)
      if (Math.random() > 0.95) {
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 2000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.agentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.callerNumber?.includes(searchTerm) ||
      event.queueName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.callId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || event.eventType === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEventInfo = (eventType: string) => {
    return EVENT_TYPES[eventType as keyof typeof EVENT_TYPES] || {
      label: eventType,
      icon: Activity,
      color: 'text-gray-500',
      bg: 'bg-gray-100 dark:bg-gray-700',
    };
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Event Type', 'Agent', 'Caller', 'Queue', 'Direction', 'Duration', 'Call ID'].join(','),
      ...filteredEvents.map((e) =>
        [
          e.timestamp,
          e.eventType,
          e.agentName || '',
          e.callerNumber || '',
          e.queueName || '',
          e.direction || '',
          e.duration || '',
          e.callId || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cti-events-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const eventTypeGroups = {
    call: ['CALL_INITIATED', 'CALL_RINGING', 'CALL_ANSWERED', 'CALL_ENDED', 'CALL_MISSED', 'CALL_TRANSFERRED', 'CALL_HELD', 'CALL_RESUMED'],
    agent: ['AGENT_LOGIN', 'AGENT_LOGOUT', 'AGENT_READY', 'AGENT_NOT_READY'],
    queue: ['QUEUE_JOINED', 'QUEUE_LEFT'],
    other: ['DTMF_RECEIVED', 'RECORDING_STARTED', 'RECORDING_STOPPED', 'ERROR'],
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Activity className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CTI Events Monitor</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real-time telephony event stream
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isConnected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-700 dark:text-red-400">Disconnected</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</p>
              </div>
              <Activity className="w-8 h-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Calls</p>
                <p className="text-2xl font-bold text-green-600">
                  {events.filter((e) => e.eventType === 'CALL_ANSWERED').length}
                </p>
              </div>
              <Phone className="w-8 h-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Queue</p>
                <p className="text-2xl font-bold text-blue-600">
                  {events.filter((e) => e.eventType === 'QUEUE_JOINED').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Agents Ready</p>
                <p className="text-2xl font-bold text-purple-600">
                  {events.filter((e) => e.eventType === 'AGENT_READY').length}
                </p>
              </div>
              <User className="w-8 h-8 text-purple-300" />
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {events.filter((e) => e.eventType === 'ERROR').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card variant="bordered">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by agent, caller, queue, or call ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            >
              <option value="all">All Event Types</option>
              <optgroup label="Call Events">
                {eventTypeGroups.call.map((type) => (
                  <option key={type} value={type}>
                    {EVENT_TYPES[type as keyof typeof EVENT_TYPES]?.label || type}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Agent Events">
                {eventTypeGroups.agent.map((type) => (
                  <option key={type} value={type}>
                    {EVENT_TYPES[type as keyof typeof EVENT_TYPES]?.label || type}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Queue Events">
                {eventTypeGroups.queue.map((type) => (
                  <option key={type} value={type}>
                    {EVENT_TYPES[type as keyof typeof EVENT_TYPES]?.label || type}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other">
                {eventTypeGroups.other.map((type) => (
                  <option key={type} value={type}>
                    {EVENT_TYPES[type as keyof typeof EVENT_TYPES]?.label || type}
                  </option>
                ))}
              </optgroup>
            </select>
            <div className="flex items-center gap-2">
              <Button
                variant={isPaused ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Stream */}
      <Card variant="bordered">
        <CardContent className="p-0">
          <div
            ref={eventsContainerRef}
            className="max-h-[600px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No events to display</p>
                <p className="text-sm text-gray-400">Events will appear here in real-time</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredEvents.map((event) => {
                  const eventInfo = getEventInfo(event.eventType);
                  const Icon = eventInfo.icon;
                  const isExpanded = expandedEvent === event.id;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Event Icon */}
                          <div className={`w-10 h-10 rounded-lg ${eventInfo.bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${eventInfo.color}`} />
                          </div>

                          {/* Event Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {eventInfo.label}
                              </span>
                              {event.direction && (
                                <Badge variant={event.direction === 'inbound' ? 'info' : 'default'} size="sm">
                                  {event.direction === 'inbound' ? (
                                    <PhoneIncoming className="w-3 h-3 mr-1" />
                                  ) : (
                                    <PhoneOutgoing className="w-3 h-3 mr-1" />
                                  )}
                                  {event.direction}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                              {event.agentName && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {event.agentName}
                                </span>
                              )}
                              {event.callerNumber && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {event.callerNumber}
                                </span>
                              )}
                              {event.queueName && (
                                <span className="flex items-center gap-1">
                                  <Activity className="w-3 h-3" />
                                  {event.queueName}
                                </span>
                              )}
                              {event.duration !== undefined && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(event.duration)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Timestamp & Expand */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-sm text-gray-400 font-mono">
                              {formatTimestamp(event.timestamp)}
                            </span>
                            <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 ml-14"
                            >
                              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">Event ID</span>
                                    <p className="font-mono text-gray-900 dark:text-white">{event.id}</p>
                                  </div>
                                  {event.callId && (
                                    <div>
                                      <span className="text-gray-500">Call ID</span>
                                      <p className="font-mono text-gray-900 dark:text-white">{event.callId}</p>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-gray-500">Source</span>
                                    <p className="text-gray-900 dark:text-white">{event.source}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Timestamp</span>
                                    <p className="text-gray-900 dark:text-white">
                                      {new Date(event.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                {event.metadata && Object.keys(event.metadata).length > 0 && (
                                  <div>
                                    <span className="text-sm text-gray-500">Metadata</span>
                                    <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                                      {JSON.stringify(event.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                <div className="flex justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEvent(event);
                                      setIsDetailModalOpen(true);
                                    }}
                                  >
                                    View Full Details
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEvent(null);
        }}
        title="Event Details"
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {(() => {
                const eventInfo = getEventInfo(selectedEvent.eventType);
                const Icon = eventInfo.icon;
                return (
                  <>
                    <div className={`w-12 h-12 rounded-lg ${eventInfo.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${eventInfo.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {eventInfo.label}
                      </h3>
                      <p className="text-sm text-gray-500">{selectedEvent.eventType}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Event ID</label>
                  <p className="font-mono text-gray-900 dark:text-white">{selectedEvent.id}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Timestamp</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedEvent.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Source</label>
                  <p className="text-gray-900 dark:text-white">{selectedEvent.source}</p>
                </div>
              </div>
              <div className="space-y-4">
                {selectedEvent.callId && (
                  <div>
                    <label className="text-sm text-gray-500">Call ID</label>
                    <p className="font-mono text-gray-900 dark:text-white">{selectedEvent.callId}</p>
                  </div>
                )}
                {selectedEvent.agentName && (
                  <div>
                    <label className="text-sm text-gray-500">Agent</label>
                    <p className="text-gray-900 dark:text-white">{selectedEvent.agentName}</p>
                  </div>
                )}
                {selectedEvent.queueName && (
                  <div>
                    <label className="text-sm text-gray-500">Queue</label>
                    <p className="text-gray-900 dark:text-white">{selectedEvent.queueName}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedEvent.callerNumber && (
              <div>
                <label className="text-sm text-gray-500">Caller Number</label>
                <p className="text-gray-900 dark:text-white">{selectedEvent.callerNumber}</p>
              </div>
            )}

            {selectedEvent.duration !== undefined && (
              <div>
                <label className="text-sm text-gray-500">Duration</label>
                <p className="text-gray-900 dark:text-white">{formatDuration(selectedEvent.duration)}</p>
              </div>
            )}

            {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
              <div>
                <label className="text-sm text-gray-500">Metadata</label>
                <pre className="mt-1 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CtiEvents;
