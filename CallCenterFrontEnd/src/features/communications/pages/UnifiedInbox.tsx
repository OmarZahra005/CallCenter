import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, Button, Badge, Avatar, Input } from '../../../components/ui';
import { ConversationItem, MessageBubble, TypingIndicator, LiveIndicator } from '../../../components/ui';
import apiClient from '../../../api/client';
import { useAuthStore } from '../../../store/authStore';

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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedChannel, setSelectedChannel] = useState<Channel>('all');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const conversations: Conversation[] = conversationsData || [];

  // Filter conversations by channel and search
  const filteredConversations = conversations
    .filter(c => selectedChannel === 'all' || c.channel === selectedChannel)
    .filter(c =>
      !searchTerm ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Calculate unread count (simplified - would need backend support for accurate count)
  const getUnreadCount = (conv: Conversation) => {
    // Without messages in list, we can't count unread
    // This would need backend enhancement to return unread count per conversation
    return 0;
  };

  // Channel filters
  const channels: { id: Channel; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: conversations.length },
    { id: 'Whatsapp', label: 'WhatsApp', count: conversations.filter(c => c.channel === 'Whatsapp').length },
    { id: 'Email', label: 'Email', count: conversations.filter(c => c.channel === 'Email').length },
    { id: 'Sms', label: 'SMS', count: conversations.filter(c => c.channel === 'Sms').length },
    { id: 'Voice', label: 'Voice', count: conversations.filter(c => c.channel === 'Voice').length },
    { id: 'Webchat', label: 'Chat', count: conversations.filter(c => c.channel === 'Webchat').length },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Unified Inbox</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage all customer conversations across channels
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          >
            {channel.label}
            {channel.count > 0 && (
              <span className="ms-2 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
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
            <Input
              placeholder="Search conversations..."
              className="w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                id={conv.id}
                customerName={conv.customerName}
                lastMessage={`${conv.messageCount} messages`}
                timestamp={new Date(conv.startTime)}
                channel={mapChannelDisplay(conv.channel)}
                unreadCount={getUnreadCount(conv)}
                isActive={selectedConversationId === conv.id}
                onClick={() => setSelectedConversationId(conv.id)}
              />
            ))}
            {filteredConversations.length === 0 && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No conversations found
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
                <Avatar name={selectedConversation.customerName} size="md" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedConversation.customerName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="capitalize">{mapChannelDisplay(selectedConversation.channel)}</span>
                    <span>•</span>
                    <span>{selectedConversation.state}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedConversation.state === 'Active' && (
                  <LiveIndicator variant="live" />
                )}
                <Button variant="outline" size="sm">View Profile</Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {detailLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : conversationDetail?.messages?.length > 0 ? (
                conversationDetail.messages.map((message: ConversationMessage) => (
                  <MessageBubble
                    key={message.id}
                    content={message.message}
                    sender={mapSenderType(message.senderType)}
                    timestamp={new Date(message.createdAt)}
                    status={message.isRead ? 'read' : 'delivered'}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No messages yet
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
                  <Button variant="outline" size="sm" className="px-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <button className="hover:text-primary-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Quick Replies
                </button>
                <button className="hover:text-primary-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Knowledge Base
                </button>
                <button className="hover:text-primary-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Transfer
                </button>
              </div>
            </div>
          </Card>
        ) : (
          <Card variant="bordered" className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
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
              <Avatar name={selectedConversation.customerName} size="xl" />
              <h4 className="mt-2 font-medium text-gray-900 dark:text-white">
                {selectedConversation.customerName}
              </h4>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ID: {selectedConversation.customerId.slice(0, 8)}...
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">{selectedConversation.messageCount} messages</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  Started {new Date(selectedConversation.startTime).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Actions</h5>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <svg className="w-4 h-4 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Create Ticket
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <svg className="w-4 h-4 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View History
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <svg className="w-4 h-4 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedInbox;
