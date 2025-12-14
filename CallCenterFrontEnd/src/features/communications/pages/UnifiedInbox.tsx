import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Badge, Avatar, Input } from '../../../components/ui';
import { MessageBubble, LiveIndicator } from '../../../components/ui';
import apiClient from '../../../api/client';
import { useAuthStore } from '../../../store/authStore';
import { createNotificationHubConnection } from '../../../realtime/notificationHubClient';
import * as signalR from '@microsoft/signalr';
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
  AlertCircle,
  Loader2,
} from 'lucide-react';

type Channel = 'all' | 'Voice' | 'Whatsapp' | 'Email' | 'Sms' | 'Webchat';

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
  agentId?: string;
  agentName?: string;
  channel: 'Voice' | 'Whatsapp' | 'Email' | 'Sms' | 'Webchat';
  state: 'Waiting' | 'Active' | 'WrapUp' | 'Closed' | 'Abandoned';
  startTime: string;
  endTime?: string;
  messageCount: number;
  messages?: ConversationMessage[];
}

const UnifiedInbox = () => {
  const { t: _t } = useTranslation();
  void _t; // Translation hook available for future use
  const queryClient = useQueryClient();
  const { user, accessToken } = useAuthStore();
  const [selectedChannel, setSelectedChannel] = useState<Channel>('all');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hubConnectionRef = useRef<signalR.HubConnection | null>(null);

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

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await apiClient.get('/conversations');
      const data = response.data;
      return Array.isArray(data) ? data : (data?.items || []);
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
        senderType: 'Agent',
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
      // Refresh the conversation detail if it's the current one
      if (selectedConversationId === message.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversationId] });
      }
      // Always refresh the conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    connection.on('ConversationUpdated', (conversation: Conversation) => {
      console.log('Conversation updated via SignalR:', conversation);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (selectedConversationId === conversation.id) {
        queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversationId] });
      }
    });

    connection.on('NewConversation', (conversation: Conversation) => {
      console.log('New conversation via SignalR:', conversation);
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
  }, [accessToken, selectedConversationId, queryClient]);

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

  const conversations: Conversation[] = conversationsData || [];

  // Filter conversations by channel and search
  const filteredConversations = conversations
    .filter(c => selectedChannel === 'all' || c.channel === selectedChannel)
    .filter(c =>
      !searchTerm ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Channel filters with icons
  const channels: { id: Channel; label: string; count: number; icon: React.ReactNode }[] = useMemo(() => [
    { id: 'all', label: 'All', count: conversations.length, icon: <Inbox className="w-4 h-4" /> },
    { id: 'Whatsapp', label: 'WhatsApp', count: conversations.filter(c => c.channel === 'Whatsapp').length, icon: <MessageCircle className="w-4 h-4 text-green-500" /> },
    { id: 'Email', label: 'Email', count: conversations.filter(c => c.channel === 'Email').length, icon: <Mail className="w-4 h-4 text-orange-500" /> },
    { id: 'Sms', label: 'SMS', count: conversations.filter(c => c.channel === 'Sms').length, icon: <Smartphone className="w-4 h-4 text-blue-500" /> },
    { id: 'Voice', label: 'Voice', count: conversations.filter(c => c.channel === 'Voice').length, icon: <Phone className="w-4 h-4 text-purple-500" /> },
    { id: 'Webchat', label: 'Chat', count: conversations.filter(c => c.channel === 'Webchat').length, icon: <MessageSquare className="w-4 h-4 text-indigo-500" /> },
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

  const mapSenderType = (senderType: string): 'customer' | 'agent' | 'system' => {
    switch (senderType) {
      case 'Customer': return 'customer';
      case 'Agent': return 'agent';
      default: return 'system';
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

  if (conversationsLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Inbox className="w-7 h-7 text-primary-600" />
            Unified Inbox
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage all customer conversations across channels
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection status indicator */}
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-600 dark:text-green-400">Live</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-yellow-600 dark:text-yellow-400">Connecting...</span>
              </>
            )}
          </div>
          <Badge variant="info" size="lg">
            {conversations.length} conversations
          </Badge>
        </div>
      </div>

      {/* Channel filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {channels.map((channel) => (
          <Button
            key={channel.id}
            variant={selectedChannel === channel.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedChannel(channel.id)}
            className="flex items-center gap-2"
          >
            {channel.icon}
            {channel.label}
            {channel.count > 0 && (
              <span className={`ms-1 px-1.5 py-0.5 text-xs rounded-full ${
                selectedChannel === channel.id
                  ? 'bg-white/20'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {channel.count}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Conversation list */}
        <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                className="w-full pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversationId(conv.id)}
                className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                  selectedConversationId === conv.id
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar name={conv.customerName} size="sm" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                      {getChannelIcon(conv.channel)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {conv.customerName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(conv.startTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conv.messageCount} messages
                      </p>
                      {getStateBadge(conv.state)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredConversations.length === 0 && (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No conversations match your search' : 'No conversations found'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        {selectedConversationId && selectedConversation ? (
          <Card variant="bordered" className="flex-1 flex flex-col overflow-hidden">
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar name={selectedConversation.customerName} size="md" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm">
                    {getChannelIcon(selectedConversation.channel)}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedConversation.customerName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="capitalize flex items-center gap-1">
                      {mapChannelDisplay(selectedConversation.channel)}
                    </span>
                    <span>•</span>
                    {getStateBadge(selectedConversation.state)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedConversation.state === 'Active' && (
                  <LiveIndicator variant="live" />
                )}
                {selectedConversation.channel === 'Voice' && (
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    Call
                  </Button>
                )}
                <Button variant="outline" size="sm">View Profile</Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {detailLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : conversationDetail?.messages?.length > 0 ? (
                <>
                  {conversationDetail.messages.map((message: ConversationMessage) => (
                    <MessageBubble
                      key={message.id}
                      content={message.message}
                      sender={mapSenderType(message.senderType)}
                      timestamp={new Date(message.createdAt)}
                      status={message.isRead ? 'read' : 'delivered'}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation by sending a message</p>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="px-3" title="Attach file">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {sendMessageMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <button className="hover:text-primary-500 flex items-center gap-1 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  Quick Replies
                </button>
                <button className="hover:text-primary-500 flex items-center gap-1 transition-colors">
                  <Search className="w-4 h-4" />
                  Knowledge Base
                </button>
                <button className="hover:text-primary-500 flex items-center gap-1 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Transfer
                </button>
              </div>
            </div>
          </Card>
        ) : (
          <Card variant="bordered" className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Inbox className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Select a conversation</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose a conversation from the list to view messages
              </p>
            </div>
          </Card>
        )}

        {/* Customer info sidebar */}
        {selectedConversation && (
          <div className="w-72 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Customer Info</h3>

            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <Avatar name={selectedConversation.customerName} size="xl" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm">
                  {getChannelIcon(selectedConversation.channel)}
                </div>
              </div>
              <h4 className="mt-3 font-medium text-gray-900 dark:text-white">
                {selectedConversation.customerName}
              </h4>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ID: {selectedConversation.customerId.slice(0, 8)}...
              </span>
              <div className="mt-2">
                {getStateBadge(selectedConversation.state)}
              </div>
            </div>

            <div className="space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{selectedConversation.messageCount} messages</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {formatRelativeTime(selectedConversation.startTime)}
                </span>
              </div>
              {selectedConversation.agentName && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Assigned to {selectedConversation.agentName}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Actions</h5>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <AlertCircle className="w-4 h-4 me-2" />
                  Create Ticket
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Clock className="w-4 h-4 me-2" />
                  View History
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Search className="w-4 h-4 me-2" />
                  View Profile
                </Button>
                {selectedConversation.state !== 'Closed' && (
                  <Button variant="danger" size="sm" className="w-full justify-start">
                    <X className="w-4 h-4 me-2" />
                    Close Conversation
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedInbox;
