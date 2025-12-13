import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
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
} from 'lucide-react';
import { useState } from 'react';
import { Card, Badge, Avatar } from '../../../components/ui';
import apiClient from '../../../api/client';

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

  // Display values
  const customerName = customer?.name || callerNumber || 'Unknown Caller';
  const customerPhone = customer?.phone || callerNumber || '';
  const customerEmail = customer?.email || '';
  const segmentBadge = getSegmentBadge(customer?.segment || customer?.type);

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
                        <button
                          onClick={() => handleCopy(customerPhone, 'phone')}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-opacity"
                        >
                          {copiedField === 'phone' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
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

                  {/* Recent Interactions Section */}
                  {recentInteractions.length > 0 && (
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
