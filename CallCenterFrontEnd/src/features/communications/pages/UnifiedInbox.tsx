import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Badge, Avatar, Tooltip, Skeleton, SkeletonAvatar, Modal } from '../../../components/ui';
import { MessageBubble, LiveIndicator, DateSeparator, groupMessagesByDate } from '../../../components/ui';
import apiClient from '../../../api/client';
import { useAuthStore } from '../../../store/authStore';
import { createNotificationHubConnection } from '../../../realtime/notificationHubClient';
import * as signalR from '@microsoft/signalr';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  MessageSquare,
  Smartphone,
  Mail,
  Phone,
  Send,
  Search,
  Paperclip,
  X,
  RefreshCw,
  Inbox,
  Clock,
  CheckCircle,
  Loader2,
  Bot,
  Zap,
  User,
  History,
  Ticket,
  MoreVertical,
  Smile,
  FileText,
  ExternalLink,
  Star,
  Copy,
  Check,
  ArrowDown,
  Reply,
  Sparkles,
  UserCheck,
  Headphones,
} from 'lucide-react';

type Channel = 'all' | 'Voice' | 'Whatsapp' | 'Email' | 'Sms' | 'Webchat' | 'SmartBot';
type StatusFilter = 'all' | 'Active' | 'Waiting' | 'Closed';

interface ConversationMessage {
  id: string;
  senderType: 'Customer' | 'Agent' | 'System' | 'Bot';
  senderId?: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  agentId?: string;
  agentName?: string;
  channel: 'Voice' | 'Whatsapp' | 'Email' | 'Sms' | 'Webchat' | 'SmartBot';
  state: 'Waiting' | 'Active' | 'WrapUp' | 'Closed' | 'Abandoned';
  startTime: string;
  endTime?: string;
  messageCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  priority?: 'low' | 'medium' | 'high';
  messages?: ConversationMessage[];
  // SmartBot Handoff fields
  handoffStatus?: 'None' | 'WaitingForAgent' | 'Connected' | 'Ended';
  smartBotSessionId?: string;
  handoffRequestedAt?: string;
  handoffAcceptedAt?: string;
  handoffEndedAt?: string;
  handoffEndedBy?: string;
  isSmartBotHandoff?: boolean;
}

const UnifiedInbox = () => {
  const { t: _t } = useTranslation();
  void _t; // Translation hook available for future use
  const queryClient = useQueryClient();
  const { user, accessToken } = useAuthStore();
  const [selectedChannel, setSelectedChannel] = useState<Channel>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketFormData, setTicketFormData] = useState({
    subject: '',
    description: '',
    priority: 1, // 0=Low, 1=Normal, 2=High, 3=Urgent
    category: 'Support',
    customerId: '',
    conversationId: '',
    source: 0, // 0=Call, 1=Email, 2=Whatsapp, 3=Sms, 4=Webchat, 5=WalkIn, 6=SmartBot
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hubConnectionRef = useRef<signalR.HubConnection | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const selectedConversationIdRef = useRef<string | null>(null);

  // Keep ref in sync with state for use in SignalR handlers
  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  // Format relative time
  const formatRelativeTime = useCallback((dateString: string): string => {
    const date = new Date(dateString);
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
  }, []);

  // Get channel icon
  const getChannelIcon = useCallback((channel: string | undefined | null) => {
    const channelStr = typeof channel === 'string' ? channel.toLowerCase() : '';
    switch (channelStr) {
      case 'whatsapp': return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'sms': return <Smartphone className="w-4 h-4 text-blue-500" />;
      case 'email': return <Mail className="w-4 h-4 text-orange-500" />;
      case 'voice': return <Phone className="w-4 h-4 text-purple-500" />;
      case 'webchat': return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'smartbot': return <Bot className="w-4 h-4 text-cyan-500" />;
      default: return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  // Get state badge
  const getStateBadge = useCallback((state: string | undefined | null) => {
    const stateStr = state || '';
    switch (stateStr) {
      case 'Active': return <Badge variant="success" dot pulse size="sm">Active</Badge>;
      case 'Waiting': return <Badge variant="warning" dot size="sm">Waiting</Badge>;
      case 'WrapUp': return <Badge variant="info" size="sm">Wrap Up</Badge>;
      case 'Closed': return <Badge variant="default" size="sm">Closed</Badge>;
      case 'Abandoned': return <Badge variant="danger" size="sm">Abandoned</Badge>;
      default: return <Badge variant="default" size="sm">{stateStr || 'Unknown'}</Badge>;
    }
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Map channel number to string name
  const mapChannelToString = (channel: number | string): string => {
    if (typeof channel === 'string') return channel;
    const channelMap: Record<number, string> = {
      0: 'Voice',
      1: 'Whatsapp',
      2: 'Email',
      3: 'Sms',
      4: 'Webchat',
      5: 'SmartBot',
    };
    return channelMap[channel] || 'Voice';
  };

  // Map state number to string name
  const mapStateToString = (state: number | string): string => {
    if (typeof state === 'string') return state;
    const stateMap: Record<number, string> = {
      0: 'Waiting',
      1: 'Active',
      2: 'WrapUp',
      3: 'Closed',
      4: 'Abandoned',
    };
    return stateMap[state] || 'Waiting';
  };

  // Map handoff status number to string
  const mapHandoffStatusToString = (status: number | string): string => {
    if (typeof status === 'string') return status;
    const statusMap: Record<number, string> = {
      0: 'None',
      1: 'WaitingForAgent',
      2: 'Connected',
      3: 'Ended',
    };
    return statusMap[status] || 'None';
  };

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await apiClient.get('/conversations');
      const data = response.data;
      const items = Array.isArray(data) ? data : (data?.items || []);
      // Transform channel, state, and handoff status from numbers to strings
      return items.map((conv: any) => ({
        ...conv,
        channel: mapChannelToString(conv.channel),
        state: mapStateToString(conv.state),
        handoffStatus: mapHandoffStatusToString(conv.handoffStatus),
        isSmartBotHandoff: conv.handoffStatus !== 0 && conv.handoffStatus !== 'None',
      }));
    },
    refetchInterval: 30000,
  });

  // Fetch selected conversation details
  const { data: conversationDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['conversation', selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return null;
      const response = await apiClient.get(`/conversations/${selectedConversationId}`);
      return response.data;
    },
    enabled: !!selectedConversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const response = await apiClient.post(`/conversations/${conversationId}/messages`, {
        senderType: 1, // Agent = 1 (enum value)
        senderId: user?.id,
        content,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setNewMessage('');
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await apiClient.put(`/conversations/${conversationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Close conversation mutation
  const closeConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await apiClient.put(`/conversations/${conversationId}/close`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversationId] });
      setSelectedConversationId(null);
    },
  });

  // Accept SmartBot chat mutation
  const acceptChatMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await apiClient.post(`/conversations/${conversationId}/accept`, {
        agentId: user?.id,
        agentName: user?.name || 'Agent',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversationId] });
    },
  });

  // Transfer/Leave SmartBot chat mutation (agent disconnect)
  const transferChatMutation = useMutation({
    mutationFn: async ({ conversationId, requeue }: { conversationId: string; requeue: boolean }) => {
      const response = await apiClient.post(`/conversations/${conversationId}/agent-disconnect`, {
        agentId: user?.id,
        reason: requeue ? 'Agent transferred to queue' : 'Agent left chat',
        requeue,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversationId] });
      setSelectedConversationId(null);
    },
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: typeof ticketFormData) => {
      const response = await apiClient.post('/tickets', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setIsTicketModalOpen(false);
      setTicketFormData({
        subject: '',
        description: '',
        priority: 1,
        category: 'Support',
        customerId: '',
        conversationId: '',
        source: 0,
      });
    },
  });

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversationId && conversationDetail) {
      const hasUnread = conversationDetail.messages?.some((m: ConversationMessage) => !m.isRead && m.senderType === 'Customer');
      if (hasUnread) {
        markAsReadMutation.mutate(selectedConversationId);
      }
    }
  }, [selectedConversationId, conversationDetail]);

  // SignalR connection for real-time updates
  useEffect(() => {
    if (!accessToken) return;

    const connection = createNotificationHubConnection(() => accessToken);
    hubConnectionRef.current = connection;

    connection.on('ReceiveMessage', (message: ConversationMessage & { conversationId: string }) => {
      console.log('Received message via SignalR:', message);
      // Refresh the conversation detail if it's the current one (use ref for current value)
      const currentSelection = selectedConversationIdRef.current;
      if (currentSelection === message.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['conversation', currentSelection] });
      }
      // Always refresh the conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    connection.on('ConversationUpdated', (conversation: Conversation) => {
      console.log('Conversation updated via SignalR:', conversation);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      const currentSelection = selectedConversationIdRef.current;
      if (currentSelection === conversation.id) {
        queryClient.invalidateQueries({ queryKey: ['conversation', currentSelection] });
      }
    });

    connection.on('NewConversation', (conversation: Conversation) => {
      console.log('New conversation via SignalR:', conversation);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    // SmartBot escalation events
    connection.on('SmartBotEscalation', (data: { escalationId: string; eventType: string }) => {
      console.log('SmartBot escalation via SignalR:', data);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    connection.on('SmartBotMessage', (data: { escalationId: string; conversationId: string; message: string; senderType: string }) => {
      console.log('>>> SmartBot message via SignalR:', data);
      console.log('>>> data.conversationId:', data.conversationId);
      console.log('>>> Current selectedConversationId:', selectedConversationIdRef.current);
      console.log('>>> Match:', data.conversationId === selectedConversationIdRef.current);

      // Map sender type to the format used in the UI
      const mapSenderTypeFromSignalR = (type: string): 'Customer' | 'Agent' | 'Bot' | 'System' => {
        switch (type.toLowerCase()) {
          case 'customer': return 'Customer';
          case 'agent': return 'Agent';
          case 'bot': return 'Bot';
          default: return 'System';
        }
      };

      const newMessage = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderType: mapSenderTypeFromSignalR(data.senderType),
        message: data.message,
        createdAt: new Date().toISOString(),
        isRead: false
      };

      console.log('>>> New message object:', newMessage);

      // Add message directly to cache for instant display
      queryClient.setQueryData(['conversation', data.conversationId], (oldData: any) => {
        console.log('>>> Cache update - oldData exists:', !!oldData);
        if (!oldData) {
          console.log('>>> Cache miss - no existing data for conversation:', data.conversationId);
          return oldData;
        }

        console.log('>>> Adding message to cache for conversation:', data.conversationId);

        return {
          ...oldData,
          messages: [...(oldData.messages || []), newMessage],
          messageCount: (oldData.messageCount || 0) + 1
        };
      });

      // Always invalidate to get the authoritative data from server (with proper IDs)
      console.log('>>> Invalidating queries for conversation:', data.conversationId);
      queryClient.invalidateQueries({ queryKey: ['conversation', data.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    connection.on('ConversationCreated', (conversation: Conversation) => {
      console.log('Conversation created via SignalR:', conversation);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    connection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      console.log('SignalR reconnected');
      setIsConnected(true);
    });

    connection.onclose(() => {
      console.log('SignalR connection closed');
      setIsConnected(false);
    });

    connection.start()
      .then(() => {
        console.log('SignalR connected to callcenter hub');
        setIsConnected(true);
      })
      .catch((err) => {
        console.error('SignalR connection error:', err);
        setIsConnected(false);
      });

    return () => {
      connection.stop();
    };
  }, [accessToken, queryClient]); // Removed selectedConversationId - using ref instead to avoid reconnections

  // Join conversation room when selected
  useEffect(() => {
    if (selectedConversationId && hubConnectionRef.current?.state === signalR.HubConnectionState.Connected) {
      hubConnectionRef.current.invoke('JoinConversation', selectedConversationId)
        .catch((err) => console.error('Error joining conversation:', err));
    }
  }, [selectedConversationId]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [conversationDetail?.messages, scrollToBottom]);

  // Handle scroll position for scroll-to-bottom button
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  }, []);

  // Simulate typing indicator (in real app, this would come from SignalR)
  // Note: This is moved after selectedConversation declaration below

  // Copy message to clipboard
  const handleCopyMessage = useCallback(async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const conversations: Conversation[] = conversationsData || [];

  // Filter conversations by channel, status, and search
  const filteredConversations = conversations
    .filter(c => selectedChannel === 'all' || c.channel === selectedChannel)
    .filter(c => {
      if (selectedStatus === 'all') return true;
      if (selectedStatus === 'Active') return c.state === 'Active';
      if (selectedStatus === 'Waiting') return c.state === 'Waiting';
      if (selectedStatus === 'Closed') return c.state === 'Closed' || c.state === 'Abandoned';
      return true;
    })
    .filter(c =>
      !searchTerm ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by state priority: Active > Waiting > others
      const statePriority: Record<string, number> = { Active: 0, Waiting: 1, WrapUp: 2, Closed: 3, Abandoned: 4 };
      const priorityDiff = (statePriority[a.state] || 3) - (statePriority[b.state] || 3);
      if (priorityDiff !== 0) return priorityDiff;
      // Then by time (most recent first)
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });

  // Status counts for filter badges
  const statusCounts = useMemo(() => ({
    all: conversations.length,
    Active: conversations.filter(c => c.state === 'Active').length,
    Waiting: conversations.filter(c => c.state === 'Waiting').length,
    Closed: conversations.filter(c => c.state === 'Closed' || c.state === 'Abandoned').length,
  }), [conversations]);

  // Quick reply templates
  const quickReplies = [
    { id: '1', text: 'Thank you for contacting us. How can I help you today?', label: 'Greeting' },
    { id: '2', text: 'Please hold while I look into this for you.', label: 'Hold' },
    { id: '3', text: 'Is there anything else I can help you with?', label: 'Follow-up' },
    { id: '4', text: 'Thank you for your patience. I have resolved the issue.', label: 'Resolution' },
  ];

  // Channel filters with icons
  const channels: { id: Channel; label: string; count: number; icon: React.ReactNode }[] = useMemo(() => [
    { id: 'all', label: 'All', count: conversations.length, icon: <Inbox className="w-4 h-4" /> },
    { id: 'Whatsapp', label: 'WhatsApp', count: conversations.filter(c => c.channel === 'Whatsapp').length, icon: <MessageCircle className="w-4 h-4 text-green-500" /> },
    { id: 'Email', label: 'Email', count: conversations.filter(c => c.channel === 'Email').length, icon: <Mail className="w-4 h-4 text-orange-500" /> },
    { id: 'Sms', label: 'SMS', count: conversations.filter(c => c.channel === 'Sms').length, icon: <Smartphone className="w-4 h-4 text-blue-500" /> },
    { id: 'Voice', label: 'Voice', count: conversations.filter(c => c.channel === 'Voice').length, icon: <Phone className="w-4 h-4 text-purple-500" /> },
    { id: 'Webchat', label: 'Chat', count: conversations.filter(c => c.channel === 'Webchat').length, icon: <MessageSquare className="w-4 h-4 text-indigo-500" /> },
    { id: 'SmartBot', label: 'SmartBot', count: conversations.filter(c => c.channel === 'SmartBot').length, icon: <Bot className="w-4 h-4 text-cyan-500" /> },
  ], [conversations]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      content: newMessage,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateTicket = () => {
    if (!selectedConversation) return;

    // Build description from recent messages
    const recentMessages = conversationDetail?.messages?.slice(-5) || [];
    const messagesSummary = recentMessages
      .map((m: ConversationMessage) => `[${m.senderType}]: ${m.message}`)
      .join('\n');

    // Map channel to TicketSource enum: 0=Call, 1=Email, 2=Whatsapp, 3=Sms, 4=Webchat, 5=WalkIn, 6=SmartBot
    const channelToSource: Record<string, number> = {
      Voice: 0,
      Email: 1,
      Whatsapp: 2,
      Sms: 3,
      Webchat: 4,
      SmartBot: 6,
    };

    setTicketFormData({
      subject: `Support request from ${selectedConversation.customerName}`,
      description: `Conversation summary:\n\n${messagesSummary}`,
      priority: 1, // Normal
      category: 'Support',
      customerId: selectedConversation.customerId,
      conversationId: selectedConversation.id,
      source: channelToSource[selectedConversation.channel] ?? 0,
    });
    setIsTicketModalOpen(true);
  };

  const mapSenderType = (senderType: string): 'customer' | 'agent' | 'system' => {
    switch (senderType) {
      case 'Customer': return 'customer';
      case 'Agent': return 'agent';
      case 'Bot': return 'system';
      default: return 'system';
    }
  };

  // Get sender name based on sender type
  const getSenderName = (message: ConversationMessage, conversation: Conversation | undefined): string => {
    switch (message.senderType) {
      case 'Customer':
        return conversation?.customerName || 'Customer';
      case 'Agent':
        return conversation?.agentName || user?.name || 'Agent';
      case 'Bot':
        return 'SmartBot';
      case 'System':
        return 'System';
      default:
        return 'Unknown';
    }
  };

  const mapChannelDisplay = (channel: string): 'voice' | 'whatsapp' | 'email' | 'sms' | 'chat' => {
    switch (channel) {
      case 'Voice': return 'voice';
      case 'Whatsapp': return 'whatsapp';
      case 'Email': return 'email';
      case 'Sms': return 'sms';
      case 'Webchat': return 'chat';
      default: return 'chat';
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // Simulate typing indicator (in real app, this would come from SignalR)
  useEffect(() => {
    if (selectedConversationId && selectedConversation?.state === 'Active') {
      // Simulate random typing indicator for demo
      const interval = setInterval(() => {
        setIsTyping(prev => !prev && Math.random() > 0.7);
        if (isTyping) {
          setTimeout(() => setIsTyping(false), 2000);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
    setIsTyping(false);
  }, [selectedConversationId, selectedConversation?.state, isTyping]);

  // Conversation list skeleton loader
  const ConversationListSkeleton = () => (
    <div className="space-y-1 p-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl">
          <SkeletonAvatar size="md" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Message area skeleton
  const MessagesSkeleton = () => (
    <div className="space-y-6 p-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
          <SkeletonAvatar size="sm" />
          <div className={`space-y-2 max-w-[60%] ${i % 2 === 0 ? '' : 'items-end'}`}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-64' : 'w-48'} rounded-2xl`} />
            <Skeleton className="h-2 w-16" />
          </div>
        </div>
      ))}
    </div>
  );

  // Handle quick reply selection
  const handleQuickReplySelect = (text: string) => {
    setNewMessage(text);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  if (conversationsLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
        {/* Filter skeleton */}
        <div className="flex gap-2">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
        {/* Main content skeleton */}
        <div className="flex-1 flex gap-4 min-h-0">
          <div className="w-96 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <ConversationListSkeleton />
          </div>
          <Card variant="bordered" className="flex-1">
            <MessagesSkeleton />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Page header - Enhanced */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <Inbox className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Unified Inbox
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredConversations.length} of {conversations.length} conversations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <Tooltip content={isConnected ? 'Real-time updates active' : 'Connecting to server...'}>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isConnected
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              {isConnected ? 'Live' : 'Connecting...'}
            </div>
          </Tooltip>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters row - Enhanced with status tabs */}
      <div className="flex items-center gap-4">
        {/* Status filter tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {[
            { id: 'all' as StatusFilter, label: 'All', icon: Inbox },
            { id: 'Active' as StatusFilter, label: 'Active', icon: Zap },
            { id: 'Waiting' as StatusFilter, label: 'Waiting', icon: Clock },
            { id: 'Closed' as StatusFilter, label: 'Closed', icon: CheckCircle },
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => setSelectedStatus(status.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStatus === status.id
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <status.icon className="w-4 h-4" />
              {status.label}
              {statusCounts[status.id] > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                  selectedStatus === status.id
                    ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {statusCounts[status.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />

        {/* Channel filters */}
        <div className="flex gap-2 overflow-x-auto flex-1">
          {channels.map((channel) => (
            <Tooltip key={channel.id} content={`${channel.label} (${channel.count})`}>
              <button
                onClick={() => setSelectedChannel(channel.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedChannel === channel.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                }`}
              >
                {channel.icon}
                <span className="hidden lg:inline">{channel.label}</span>
                {channel.count > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    selectedChannel === channel.id
                      ? 'bg-primary-100 dark:bg-primary-800'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {channel.count}
                  </span>
                )}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Conversation list - Enhanced */}
        <div className="w-96 flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col shadow-sm">
          {/* Search header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, message..."
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {filteredConversations.map((conv, index) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.02, duration: 0.2 }}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`group p-4 cursor-pointer transition-all border-b border-gray-50 dark:border-gray-700/30 ${
                    selectedConversationId === conv.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar with channel indicator */}
                    <div className="relative flex-shrink-0">
                      <Avatar name={conv.customerName} size="md" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-800 flex items-center justify-center shadow-sm">
                        {getChannelIcon(conv.channel)}
                      </div>
                      {/* Active indicator */}
                      {conv.state === 'Active' && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold truncate ${
                          conv.unreadCount && conv.unreadCount > 0
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {conv.customerName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                          {formatRelativeTime(conv.lastMessageTime || conv.startTime)}
                        </span>
                      </div>

                      {/* Last message preview */}
                      <p className={`text-sm truncate mb-2 ${
                        conv.unreadCount && conv.unreadCount > 0
                          ? 'text-gray-700 dark:text-gray-300 font-medium'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {conv.lastMessage || `${conv.messageCount} messages`}
                      </p>

                      {/* Status and info row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStateBadge(conv.state)}
                          {conv.agentName && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {conv.agentName}
                            </span>
                          )}
                          {/* SmartBot Handoff indicator */}
                          {conv.channel === 'SmartBot' && conv.handoffStatus === 'WaitingForAgent' && (
                            <Badge variant="warning" size="sm" className="gap-1">
                              <Headphones className="w-3 h-3" />
                              Waiting
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <span className="flex-shrink-0 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                            </span>
                          )}
                          {/* Accept Chat button for SmartBot waiting conversations */}
                          {conv.channel === 'SmartBot' && conv.handoffStatus === 'WaitingForAgent' && !conv.agentId && (
                            <Button
                              size="sm"
                              variant="primary"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Select the conversation immediately so messages will appear
                                setSelectedConversationId(conv.id);
                                acceptChatMutation.mutate(conv.id);
                              }}
                              disabled={acceptChatMutation.isPending}
                            >
                              {acceptChatMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <UserCheck className="w-3 h-3" />
                              )}
                              Accept
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty state - Enhanced */}
            {filteredConversations.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 px-6"
              >
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <MessageSquare className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm ? 'No results found' : 'No conversations'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-[200px]">
                  {searchTerm
                    ? `No conversations match "${searchTerm}"`
                    : 'New conversations will appear here when customers reach out'
                  }
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear search
                  </Button>
                )}
              </motion.div>
            )}
          </div>

          {/* List footer with stats */}
          {filteredConversations.length > 0 && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-2xl">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{filteredConversations.length} conversations</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Auto-refresh: 30s
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chat area - Enhanced */}
        {selectedConversationId && selectedConversation ? (
          <Card variant="elevated" className="flex-1 flex flex-col overflow-hidden rounded-2xl">
            {/* Chat header - Enhanced */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar with status */}
                  <div className="relative">
                    <Avatar name={selectedConversation.customerName} size="lg" />
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-800 flex items-center justify-center shadow-md">
                      {getChannelIcon(selectedConversation.channel)}
                    </div>
                  </div>

                  {/* Customer info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedConversation.customerName}
                      </h3>
                      {selectedConversation.state === 'Active' && (
                        <LiveIndicator variant="live" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        {getChannelIcon(selectedConversation.channel)}
                        <span className="capitalize">{mapChannelDisplay(selectedConversation.channel)}</span>
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      {getStateBadge(selectedConversation.state)}
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(selectedConversation.startTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header actions */}
                <div className="flex items-center gap-2">
                  {/* Accept Chat button for SmartBot handoff */}
                  {selectedConversation.channel === 'SmartBot' &&
                   selectedConversation.handoffStatus === 'WaitingForAgent' &&
                   !selectedConversation.agentId && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="gap-2 shadow-lg shadow-primary-500/25"
                      onClick={() => {
                        // Ensure conversation is selected for message display
                        setSelectedConversationId(selectedConversation.id);
                        acceptChatMutation.mutate(selectedConversation.id);
                      }}
                      disabled={acceptChatMutation.isPending}
                    >
                      {acceptChatMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                      Accept Chat
                    </Button>
                  )}
                  {/* Transfer to Queue button for active SmartBot chats */}
                  {selectedConversation.channel === 'SmartBot' &&
                   selectedConversation.handoffStatus === 'Connected' &&
                   selectedConversation.agentId === user?.id && (
                    <Tooltip content="Transfer chat back to queue for another agent">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-900/20"
                        onClick={() => transferChatMutation.mutate({
                          conversationId: selectedConversation.id,
                          requeue: true
                        })}
                        disabled={transferChatMutation.isPending}
                      >
                        {transferChatMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Transfer
                      </Button>
                    </Tooltip>
                  )}
                  {selectedConversation.channel === 'Voice' && (
                    <Tooltip content="Start call">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Phone className="w-4 h-4" />
                        Call
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip content="View customer profile">
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                  </Tooltip>
                  <Tooltip content="More options">
                    <Button variant="ghost" size="sm" className="px-2">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Messages - Enhanced Chatbox */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto relative"
              style={{
                background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
              }}
            >
              {/* Subtle pattern overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />

              <div className="relative p-4 dark:bg-gray-900/80">
                {detailLoading ? (
                  // Enhanced loading skeleton
                  <div className="space-y-6 py-4">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        <div className={`space-y-2 ${i % 2 === 0 ? '' : 'flex flex-col items-end'}`}>
                          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className={`${i % 2 === 0 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-primary-200 dark:bg-primary-800'} rounded-2xl animate-pulse`}
                               style={{ width: `${150 + Math.random() * 150}px`, height: `${40 + Math.random() * 40}px` }} />
                          <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : conversationDetail?.messages?.length > 0 ? (
                  <div className="py-2">
                    {(() => {
                      const messageGroups = groupMessagesByDate<ConversationMessage>(conversationDetail.messages);
                      return Array.from(messageGroups.entries()).map(([dateKey, messages]) => (
                        <div key={dateKey}>
                          <DateSeparator date={new Date(dateKey)} />
                          {messages.map((message, msgIndex) => {
                            const isCustomer = message.senderType === 'Customer';
                            const prevMessage = msgIndex > 0 ? messages[msgIndex - 1] : null;
                            const showAvatar = !prevMessage || prevMessage.senderType !== message.senderType;

                            return (
                              <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="group relative"
                              >
                                {/* Message hover actions */}
                                <div className={`absolute top-0 ${isCustomer ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'} opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                                  <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
                                    <Tooltip content={copiedMessageId === message.id ? 'Copied!' : 'Copy'}>
                                      <button
                                        onClick={() => handleCopyMessage(message.id, message.message)}
                                        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                      >
                                        {copiedMessageId === message.id ? (
                                          <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>
                                    </Tooltip>
                                    <Tooltip content="Reply">
                                      <button
                                        onClick={() => {
                                          setNewMessage(`> ${message.message.slice(0, 50)}${message.message.length > 50 ? '...' : ''}\n\n`);
                                          inputRef.current?.focus();
                                        }}
                                        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                      >
                                        <Reply className="w-4 h-4" />
                                      </button>
                                    </Tooltip>
                                  </div>
                                </div>

                                <MessageBubble
                                  content={message.message}
                                  sender={mapSenderType(message.senderType)}
                                  senderName={getSenderName(message, selectedConversation)}
                                  timestamp={new Date(message.createdAt)}
                                  status={message.isRead ? 'read' : 'delivered'}
                                  showAvatar={showAvatar}
                                  showFullTimestamp={true}
                                  systemMessageType={message.senderType === 'System' ? 'info' : undefined}
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                      ));
                    })()}

                    {/* Typing indicator */}
                    <AnimatePresence>
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-3 px-3 py-2"
                        >
                          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                            {selectedConversation?.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-600">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedConversation?.customerName} is typing...
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  // Enhanced empty state
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-full min-h-[300px] text-center py-12"
                  >
                    <div className="relative mb-6">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
                        <MessageSquare className="w-12 h-12 text-primary-500" />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                      >
                        <Sparkles className="w-4 h-4 text-green-500" />
                      </motion.div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Start the conversation
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-xs">
                      Send a message to begin helping {selectedConversation?.customerName}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setNewMessage('Hello! How can I help you today?');
                        inputRef.current?.focus();
                      }}
                    >
                      <Zap className="w-4 h-4" />
                      Send greeting
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Scroll to bottom button */}
              <AnimatePresence>
                {showScrollButton && conversationDetail?.messages?.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToBottom}
                    className="absolute bottom-4 right-4 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-700 transition-all z-20"
                  >
                    <ArrowDown className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Input area - Enhanced */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700/50">
              {/* Quick replies dropdown */}
              <AnimatePresence>
                {showQuickReplies && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Replies</span>
                      <button
                        onClick={() => setShowQuickReplies(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {quickReplies.map((reply) => (
                        <button
                          key={reply.id}
                          onClick={() => handleQuickReplySelect(reply.text)}
                          className="text-left p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                        >
                          <span className="text-xs font-medium text-primary-600 dark:text-primary-400">{reply.label}</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{reply.text}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main input area */}
              <div className="flex items-end gap-3">
                {/* Attachment and emoji buttons */}
                <div className="flex gap-1">
                  <Tooltip content="Attach file">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Add emoji">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                  </Tooltip>
                </div>

                {/* Text input */}
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                </div>

                {/* Send button */}
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="h-12 px-6 rounded-xl gap-2 shadow-lg shadow-primary-500/25"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline">Send</span>
                </Button>
              </div>

              {/* Quick action buttons */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <button
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    showQuickReplies
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Quick Replies
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                  Templates
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Search className="w-3.5 h-3.5" />
                  Knowledge Base
                </button>
                <div className="flex-1" />
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Transfer
                </button>
              </div>
            </div>
          </Card>
        ) : (
          <Card variant="elevated" className="flex-1 flex items-center justify-center rounded-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-sm"
            >
              {/* Illustration */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full" />
                <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                  <Inbox className="w-12 h-12 text-primary-500" />
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="absolute -bottom-1 -left-3 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Mail className="w-3 h-3 text-blue-500" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Choose a conversation from the list to view messages and respond to customers
              </p>

              {/* Quick stats */}
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-700 dark:text-green-400">{statusCounts.Active} active</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-yellow-700 dark:text-yellow-400">{statusCounts.Waiting} waiting</span>
                </div>
              </div>
            </motion.div>
          </Card>
        )}

        {/* Customer info sidebar - Enhanced */}
        {selectedConversation && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm"
          >
            {/* Customer profile header */}
            <div className="p-5 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar name={selectedConversation.customerName} size="xl" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-800 flex items-center justify-center shadow-md">
                    {getChannelIcon(selectedConversation.channel)}
                  </div>
                </div>
                <h4 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
                  {selectedConversation.customerName}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  #{selectedConversation.customerId.slice(0, 8).toUpperCase()}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  {getStateBadge(selectedConversation.state)}
                  {selectedConversation.priority && (
                    <Badge
                      variant={selectedConversation.priority === 'high' ? 'danger' : selectedConversation.priority === 'medium' ? 'warning' : 'default'}
                      size="sm"
                    >
                      {selectedConversation.priority} priority
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Customer details */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Contact info section */}
              <div>
                <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Contact Information
                </h5>
                <div className="space-y-2">
                  {selectedConversation.customerPhone && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{selectedConversation.customerPhone}</span>
                    </div>
                  )}
                  {selectedConversation.customerEmail && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{selectedConversation.customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Conversation stats */}
              <div>
                <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Conversation Details
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs">Messages</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{selectedConversation.messageCount}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Started</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatRelativeTime(selectedConversation.startTime)}</span>
                  </div>
                </div>
              </div>

              {/* SmartBot Handoff Status */}
              {selectedConversation.channel === 'SmartBot' && selectedConversation.isSmartBotHandoff && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Live Agent Handoff
                  </h5>
                  <div className={`p-3 rounded-xl border ${
                    selectedConversation.handoffStatus === 'WaitingForAgent'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      : selectedConversation.handoffStatus === 'Connected'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Headphones className={`w-4 h-4 ${
                        selectedConversation.handoffStatus === 'WaitingForAgent'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : selectedConversation.handoffStatus === 'Connected'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        selectedConversation.handoffStatus === 'WaitingForAgent'
                          ? 'text-yellow-700 dark:text-yellow-300'
                          : selectedConversation.handoffStatus === 'Connected'
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {selectedConversation.handoffStatus === 'WaitingForAgent' && 'Waiting for Agent'}
                        {selectedConversation.handoffStatus === 'Connected' && 'Live Chat Active'}
                        {selectedConversation.handoffStatus === 'Ended' && 'Handoff Ended'}
                      </span>
                    </div>
                    {selectedConversation.handoffRequestedAt && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Requested: {new Date(selectedConversation.handoffRequestedAt).toLocaleString()}
                      </div>
                    )}
                    {selectedConversation.handoffAcceptedAt && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Accepted: {new Date(selectedConversation.handoffAcceptedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Agent assignment */}
              {selectedConversation.agentName && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Assigned Agent
                  </h5>
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <Avatar name={selectedConversation.agentName} size="sm" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedConversation.agentName}</span>
                      <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Quick Actions
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <Tooltip content="Create a support ticket">
                    <button
                      onClick={handleCreateTicket}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-primary-300 dark:hover:border-primary-700 transition-all group"
                    >
                      <Ticket className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">Create Ticket</span>
                    </button>
                  </Tooltip>
                  <Tooltip content="View conversation history">
                    <button className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-primary-300 dark:hover:border-primary-700 transition-all group">
                      <History className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">History</span>
                    </button>
                  </Tooltip>
                  <Tooltip content="View full customer profile">
                    <button className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-primary-300 dark:hover:border-primary-700 transition-all group">
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">View Profile</span>
                    </button>
                  </Tooltip>
                  <Tooltip content="Add to favorites">
                    <button className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-yellow-300 dark:hover:border-yellow-700 transition-all group">
                      <Star className="w-5 h-5 text-gray-400 group-hover:text-yellow-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-400">Favorite</span>
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Footer action */}
            {selectedConversation.state !== 'Closed' && selectedConversation.state !== 'Abandoned' && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50">
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full justify-center gap-2"
                  onClick={() => closeConversationMutation.mutate(selectedConversationId!)}
                  disabled={closeConversationMutation.isPending}
                >
                  {closeConversationMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Closing...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Close Conversation
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        title="Create Support Ticket"
        size="lg"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          createTicketMutation.mutate(ticketFormData);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
            <input
              type="text"
              value={ticketFormData.subject}
              onChange={(e) => setTicketFormData({ ...ticketFormData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={ticketFormData.description}
              onChange={(e) => setTicketFormData({ ...ticketFormData, description: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={ticketFormData.priority}
                onChange={(e) => setTicketFormData({ ...ticketFormData, priority: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={0}>Low</option>
                <option value={1}>Normal</option>
                <option value={2}>High</option>
                <option value={3}>Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={ticketFormData.category}
                onChange={(e) => setTicketFormData({ ...ticketFormData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Support">Support</option>
                <option value="Billing">Billing</option>
                <option value="Technical">Technical</option>
                <option value="Sales">Sales</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Customer: {selectedConversation?.customerName}
            </span>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setIsTicketModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTicketMutation.isPending}>
              {createTicketMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Ticket'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UnifiedInbox;
