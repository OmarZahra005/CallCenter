import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
  PhoneOutgoing,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  Ticket,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Star,
  TrendingUp,
  History,
  Filter,
  MessageCircle,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { Card, Badge, Avatar } from '../../../components/ui';
import apiClient from '../../../api/client';
import { initiateOutboundCall } from '../../../api/callApi';
import { useCallCenter } from '../../../context/CallCenterContext';

interface CustomerData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  nationalId?: string;
  address?: string;
  notes?: string;
  status?: string;
  segment?: string;
  preferredLanguage?: string;
  createdAt?: string;
  type?: string;
  tags?: string[];
}

interface CustomerStats {
  totalCalls: number;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  lastInteractionDate: string | null;
  totalConversations: number;
  avgCallDurationSeconds: number | null;
  totalMessages: number;
}

interface RecentInteraction {
  id: string;
  type: 'Call' | 'Ticket' | 'Email' | 'Chat';
  summary: string;
  date: string;
  status?: string;
}

// Detailed interaction types
type InteractionType = 'all' | 'calls' | 'tickets' | 'conversations';

interface DetailedConversation {
  id: string;
  channel: string | number;
  state: string | number;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  agentId?: string;
  agentName?: string;
  lastMessage?: string;
  direction?: string;
  sentiment?: string;
  disposition?: string;
}

interface DetailedTicket {
  id: string;
  ticketNumber?: string;
  subject: string;
  description?: string;
  status: string;
  priority: string;
  category?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

interface Customer360CardProps {
  customerId: string | null;
  customer: CustomerData | null;
  callerNumber?: string;
  isLoading?: boolean;
  recentInteractions?: RecentInteraction[];
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  onViewCustomer?: (customerId: string) => void;
}

// Format duration in seconds to human readable
const formatDuration = (seconds: number | null): string => {
  if (seconds === null || seconds === 0) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

// Format date to relative time
const formatRelativeTime = (dateStr: string | null): string => {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Copy to clipboard helper
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

// Get segment badge variant
const getSegmentBadge = (segment?: string): { variant: 'success' | 'warning' | 'default' | 'info'; label: string } => {
  const segmentLower = (segment || '').toLowerCase();
  switch (segmentLower) {
    case 'vip':
    case 'premium':
      return { variant: 'success', label: segment || 'VIP' };
    case 'enterprise':
    case 'business':
      return { variant: 'info', label: segment || 'Business' };
    case 'retail':
    case 'standard':
      return { variant: 'default', label: segment || 'Standard' };
    default:
      return { variant: 'default', label: segment || 'Standard' };
  }
};

export const Customer360Card = ({
  customerId,
  customer,
  callerNumber,
  isLoading = false,
  recentInteractions = [],
  isCollapsible = false,
  defaultExpanded = true,
  onViewCustomer,
}: Customer360CardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [interactionFilter, setInteractionFilter] = useState<InteractionType>('all');
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Fetch customer stats from API
  const { data: stats, isLoading: statsLoading } = useQuery<CustomerStats>({
    queryKey: ['customer-stats', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const response = await apiClient.get(`/customers/${customerId}/stats`);
      return response.data;
    },
    enabled: !!customerId,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Fetch customer conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<DetailedConversation[]>({
    queryKey: ['customer-conversations-detailed', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const response = await apiClient.get(`/conversations/customer/${customerId}`);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!customerId && (activeTab === 'history' || interactionFilter === 'conversations'),
    staleTime: 30000,
  });

  // Fetch customer tickets
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<DetailedTicket[]>({
    queryKey: ['customer-tickets-detailed', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const response = await apiClient.get(`/tickets/customer/${customerId}`);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!customerId && (activeTab === 'history' || interactionFilter === 'tickets'),
    staleTime: 30000,
  });

  // Get call center state for click-to-call
  const { activeCall, twilioReady } = useCallCenter();

  // Mutation for initiating outbound calls
  const initiateOutboundMutation = useMutation({
    mutationFn: initiateOutboundCall,
    onSuccess: (data) => {
      console.log('Outbound call initiated:', data);
      // The Twilio Device will receive the incoming call
    },
    onError: (error: Error) => {
      console.error('Failed to initiate outbound call:', error.message);
      // Could add toast notification here
    },
  });

  // Handler for click-to-call
  const handleClickToCall = () => {
    if (customerPhone && twilioReady && !activeCall) {
      // Generate unique idempotency key to prevent duplicate calls from rapid clicks
      const idempotencyKey = crypto.randomUUID();
      initiateOutboundMutation.mutate({
        customerNumber: customerPhone,
        customerId: customerId || undefined,
        idempotencyKey,
      });
    }
  };

  // Combine and sort interactions for timeline
  const allInteractions = [
    ...conversations.map((conv) => ({
      id: conv.id,
      type: 'conversation' as const,
      date: new Date(conv.startedAt),
      data: conv,
    })),
    ...tickets.map((ticket) => ({
      id: ticket.id,
      type: 'ticket' as const,
      date: new Date(ticket.createdAt),
      data: ticket,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Filter interactions based on selected filter
  const filteredInteractions = allInteractions.filter((item) => {
    if (interactionFilter === 'all') return true;
    if (interactionFilter === 'calls' || interactionFilter === 'conversations') {
      return item.type === 'conversation';
    }
    if (interactionFilter === 'tickets') {
      return item.type === 'ticket';
    }
    return true;
  });

  // Limit displayed interactions unless "show all" is enabled
  const displayedInteractions = showAllHistory ? filteredInteractions : filteredInteractions.slice(0, 5);

  const handleCopy = async (text: string, field: string) => {
    await copyToClipboard(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleExpanded = () => {
    if (isCollapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  // Helper to get channel display name
  const getChannelDisplay = (channel: string | number): { name: string; icon: typeof PhoneCall } => {
    const channelMap: Record<string | number, { name: string; icon: typeof PhoneCall }> = {
      'Voice': { name: 'Voice Call', icon: PhoneCall },
      'voice': { name: 'Voice Call', icon: PhoneCall },
      0: { name: 'Voice Call', icon: PhoneCall },
      'Email': { name: 'Email', icon: Mail },
      'email': { name: 'Email', icon: Mail },
      1: { name: 'Email', icon: Mail },
      'Whatsapp': { name: 'WhatsApp', icon: MessageCircle },
      'whatsapp': { name: 'WhatsApp', icon: MessageCircle },
      2: { name: 'WhatsApp', icon: MessageCircle },
      'Webchat': { name: 'Web Chat', icon: MessageSquare },
      'Chat': { name: 'Web Chat', icon: MessageSquare },
      3: { name: 'Web Chat', icon: MessageSquare },
      'Sms': { name: 'SMS', icon: MessageCircle },
      4: { name: 'SMS', icon: MessageCircle },
    };
    return channelMap[channel] || { name: 'Unknown', icon: MessageSquare };
  };

  // Helper to get conversation state display
  const getStateDisplay = (state: string | number): { label: string; color: string } => {
    const stateMap: Record<string | number, { label: string; color: string }> = {
      'Waiting': { label: 'Waiting', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
      0: { label: 'Waiting', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
      'Active': { label: 'Active', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
      1: { label: 'Active', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
      'WrapUp': { label: 'Wrap Up', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
      2: { label: 'Wrap Up', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
      'Closed': { label: 'Closed', color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30' },
      3: { label: 'Closed', color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30' },
      'Abandoned': { label: 'Abandoned', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
      4: { label: 'Abandoned', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
    };
    return stateMap[state] || { label: String(state), color: 'text-gray-600 bg-gray-100' };
  };

  // Helper to get ticket priority color
  const getPriorityColor = (priority: string): string => {
    const priorityMap: Record<string, string> = {
      'Critical': 'text-red-600 bg-red-100 dark:bg-red-900/30',
      'High': 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
      'Medium': 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
      'Low': 'text-green-600 bg-green-100 dark:bg-green-900/30',
    };
    return priorityMap[priority] || 'text-gray-600 bg-gray-100';
  };

  // Helper to get ticket status color
  const getTicketStatusColor = (status: string): string => {
    const statusMap: Record<string, string> = {
      'New': 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      'Open': 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
      'InProgress': 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
      'Resolved': 'text-green-600 bg-green-100 dark:bg-green-900/30',
      'Closed': 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
    };
    return statusMap[status] || 'text-gray-600 bg-gray-100';
  };

  // Display values
  const customerName = customer?.name || callerNumber || 'Unknown Caller';
  const customerPhone = customer?.phone || callerNumber || '';
  const customerEmail = customer?.email || '';
  const segmentBadge = getSegmentBadge(customer?.segment || customer?.type);
  const historyLoading = conversationsLoading || ticketsLoading;

  return (
    <Card variant="bordered" className="overflow-hidden">
      {/* Header */}
      <div
        className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
          isCollapsible ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''
        }`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Customer 360</h3>
          </div>
          <div className="flex items-center gap-2">
            {customerId && onViewCustomer && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewCustomer(customerId);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-gray-700"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
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
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : !customer && !callerNumber ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No customer data available</p>
                  <p className="text-sm mt-1">Customer info will appear during a call</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Profile Section */}
                  <div className="flex items-start gap-4">
                    <Avatar name={customerName} size="xl" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                          {customerName}
                        </h4>
                        <Badge variant={segmentBadge.variant}>
                          {segmentBadge.label}
                        </Badge>
                        {customer?.segment?.toLowerCase() === 'vip' && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      {customer?.status && (
                        <p className="text-sm text-gray-500 mt-1">
                          Status: <span className={customer.status === 'Active' ? 'text-green-600' : 'text-gray-600'}>{customer.status}</span>
                        </p>
                      )}
                      {customer?.preferredLanguage && (
                        <p className="text-sm text-gray-500">
                          Language: {customer.preferredLanguage}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Info Section */}
                  <div className="space-y-2">
                    {customerPhone && (
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Click-to-Call Button */}
                          {twilioReady && !activeCall && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClickToCall();
                              }}
                              disabled={initiateOutboundMutation.isPending}
                              className="p-1.5 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Call customer"
                            >
                              {initiateOutboundMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <PhoneOutgoing className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {/* Copy Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(customerPhone, 'phone');
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-opacity"
                          >
                            {copiedField === 'phone' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {customerEmail && (
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300 truncate">{customerEmail}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(customerEmail, 'email')}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-opacity"
                        >
                          {copiedField === 'email' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    )}
                    {customer?.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300 truncate">{customer.address}</span>
                      </div>
                    )}
                    {customer?.createdAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">
                          Customer since {new Date(customer.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* KPIs Section */}
                  {customerId && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Statistics
                      </h5>
                      {statsLoading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg animate-pulse">
                              <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex items-center gap-2">
                              <PhoneCall className="w-4 h-4 text-blue-500" />
                              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {stats?.totalCalls || 0}
                              </p>
                            </div>
                            <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Total Calls</p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
                            <div className="flex items-center gap-2">
                              <Ticket className="w-4 h-4 text-purple-500" />
                              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {stats?.totalTickets || 0}
                              </p>
                            </div>
                            <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Total Tickets</p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-100 dark:border-orange-800">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {stats?.openTickets || 0}
                              </p>
                            </div>
                            <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">Open Tickets</p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-green-500" />
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {formatDuration(stats?.avgCallDurationSeconds || null)}
                              </p>
                            </div>
                            <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Avg Call</p>
                          </div>
                        </div>
                      )}

                      {/* Additional Stats Row */}
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-center">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {stats?.totalConversations || 0}
                          </p>
                          <p className="text-xs text-gray-500">Conversations</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-center">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {stats?.totalMessages || 0}
                          </p>
                          <p className="text-xs text-gray-500">Messages</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-center">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatRelativeTime(stats?.lastInteractionDate || null)}
                          </p>
                          <p className="text-xs text-gray-500">Last Contact</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tabs for Overview/History */}
                  {customerId && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => setActiveTab('overview')}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === 'overview'
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <TrendingUp className="w-4 h-4 inline mr-1" />
                          Overview
                        </button>
                        <button
                          onClick={() => setActiveTab('history')}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === 'history'
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <History className="w-4 h-4 inline mr-1" />
                          History
                          {allInteractions.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded-full">
                              {allInteractions.length}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Overview Tab - Recent Interactions */}
                      {activeTab === 'overview' && recentInteractions.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Recent Interactions
                          </h5>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {recentInteractions.slice(0, 5).map((interaction) => (
                              <div
                                key={interaction.id}
                                className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {interaction.type === 'Call' && <PhoneCall className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                                  {interaction.type === 'Ticket' && <Ticket className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                                  {interaction.type === 'Email' && <Mail className="w-4 h-4 text-green-500 flex-shrink-0" />}
                                  {interaction.type === 'Chat' && <MessageSquare className="w-4 h-4 text-orange-500 flex-shrink-0" />}
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {interaction.type}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                      {interaction.summary}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-end flex-shrink-0 ml-2">
                                  <span className="text-xs text-gray-400">{interaction.date}</span>
                                  {interaction.status && (
                                    <p className="text-xs text-gray-500">{interaction.status}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* History Tab - Full Timeline */}
                      {activeTab === 'history' && (
                        <div>
                          {/* Filter Buttons */}
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Filter className="w-4 h-4 text-gray-400" />
                            {(['all', 'calls', 'tickets'] as InteractionType[]).map((filter) => (
                              <button
                                key={filter}
                                onClick={() => setInteractionFilter(filter)}
                                className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                                  interactionFilter === filter
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {filter === 'all' ? 'All' : filter === 'calls' ? 'Calls' : 'Tickets'}
                              </button>
                            ))}
                          </div>

                          {/* Timeline */}
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {historyLoading ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                              </div>
                            ) : displayedInteractions.length === 0 ? (
                              <div className="text-center py-4 text-gray-500 text-sm">
                                No interactions found
                              </div>
                            ) : (
                              <>
                                {displayedInteractions.map((item, index) => (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative pl-6 pb-3 border-l-2 border-gray-200 dark:border-gray-700 last:border-l-0"
                                  >
                                    {/* Timeline dot */}
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                                      item.type === 'conversation' ? 'bg-blue-500' : 'bg-purple-500'
                                    }`} />

                                    {/* Interaction Card */}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                      {item.type === 'conversation' ? (
                                        // Conversation Card
                                        <>
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                              {(() => {
                                                const channelInfo = getChannelDisplay((item.data as DetailedConversation).channel);
                                                const ChannelIcon = channelInfo.icon;
                                                return (
                                                  <>
                                                    <ChannelIcon className="w-4 h-4 text-blue-500" />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                      {channelInfo.name}
                                                    </span>
                                                  </>
                                                );
                                              })()}
                                              {(item.data as DetailedConversation).direction && (
                                                (item.data as DetailedConversation).direction === 'Inbound' ? (
                                                  <ArrowDownLeft className="w-3 h-3 text-green-500" />
                                                ) : (
                                                  <ArrowUpRight className="w-3 h-3 text-orange-500" />
                                                )
                                              )}
                                            </div>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${getStateDisplay((item.data as DetailedConversation).state).color}`}>
                                              {getStateDisplay((item.data as DetailedConversation).state).label}
                                            </span>
                                          </div>
                                          <div className="text-xs text-gray-500 space-y-1">
                                            <div className="flex items-center gap-2">
                                              <Clock className="w-3 h-3" />
                                              <span>{item.date.toLocaleString()}</span>
                                              {(item.data as DetailedConversation).durationSeconds && (
                                                <span className="text-gray-400">
                                                  ({formatDuration((item.data as DetailedConversation).durationSeconds!)})
                                                </span>
                                              )}
                                            </div>
                                            {(item.data as DetailedConversation).agentName && (
                                              <div className="flex items-center gap-2">
                                                <User className="w-3 h-3" />
                                                <span>Agent: {(item.data as DetailedConversation).agentName}</span>
                                              </div>
                                            )}
                                            {(item.data as DetailedConversation).disposition && (
                                              <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span>Disposition: {(item.data as DetailedConversation).disposition}</span>
                                              </div>
                                            )}
                                          </div>
                                        </>
                                      ) : (
                                        // Ticket Card
                                        <>
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                              <Ticket className="w-4 h-4 text-purple-500" />
                                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                                                {(item.data as DetailedTicket).subject}
                                              </span>
                                            </div>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${getTicketStatusColor((item.data as DetailedTicket).status)}`}>
                                              {(item.data as DetailedTicket).status}
                                            </span>
                                          </div>
                                          <div className="text-xs text-gray-500 space-y-1">
                                            <div className="flex items-center gap-2">
                                              <Clock className="w-3 h-3" />
                                              <span>{item.date.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                              <span className={`px-1.5 py-0.5 rounded text-xs ${getPriorityColor((item.data as DetailedTicket).priority)}`}>
                                                {(item.data as DetailedTicket).priority}
                                              </span>
                                              {(item.data as DetailedTicket).category && (
                                                <span className="text-gray-400">{(item.data as DetailedTicket).category}</span>
                                              )}
                                            </div>
                                            {(item.data as DetailedTicket).ticketNumber && (
                                              <div className="text-gray-400">
                                                #{(item.data as DetailedTicket).ticketNumber}
                                              </div>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}

                                {/* Show More/Less Button */}
                                {filteredInteractions.length > 5 && (
                                  <button
                                    onClick={() => setShowAllHistory(!showAllHistory)}
                                    className="w-full py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center gap-1"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                    {showAllHistory ? 'Show Less' : `Show All (${filteredInteractions.length})`}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes Section */}
                  {customer?.notes && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        {customer.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default Customer360Card;
