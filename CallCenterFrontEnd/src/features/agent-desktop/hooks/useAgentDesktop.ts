import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import { useSignalR } from '../../../hooks/useSignalR';
import { useAuthStore } from '../../../store/authStore';

export type CallState = 'idle' | 'ringing' | 'active' | 'onhold' | 'dialing';

export type AgentState = 'available' | 'busy' | 'break' | 'acw' | 'offline';

export interface CallInfo {
  callId: string;
  callerNumber: string;
  callerName?: string;
  customerId?: string;
  direction: 'Inbound' | 'Outbound' | 'Transfer';
  queueName?: string;
  waitTimeSeconds?: number;
  startTime: Date;
}

export interface CustomerInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  company?: string;
  createdAt: string;
}

export interface ConversationInfo {
  id: string;
  customerId: string;
  customerName: string;
  channel: 'voice' | 'email' | 'whatsapp' | 'chat' | 'sms';
  state: string;
  lastMessage?: string;
  startedAt: string;
  unreadCount?: number;
}

export interface InteractionInfo {
  id: string;
  type: 'Call' | 'Ticket' | 'Email' | 'WhatsApp' | 'Chat';
  date: string;
  summary: string;
  status?: string;
}

export const useAgentDesktop = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { connection, isConnected, sendMessage } = useSignalR();

  // Local state
  const [callState, setCallState] = useState<CallState>('idle');
  const [agentState, setAgentState] = useState<AgentState>('available');
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [currentCall, setCurrentCall] = useState<CallInfo | null>(null);
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);
  const [_customerPhone, setCustomerPhone] = useState<string | null>(null);
  void _customerPhone; // Available for future use

  // Get current agent ID (from auth or first agent for demo)
  const agentId = user?.id || '';

  // Lookup customer by phone number
  const lookupCustomerByPhone = useCallback(async (phone: string): Promise<string | null> => {
    try {
      // Normalize phone number to local format (0546652410)
      let normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

      // Convert +966XXXXXXXXX or 966XXXXXXXXX to 0XXXXXXXXX
      if (normalizedPhone.startsWith('+966')) {
        normalizedPhone = '0' + normalizedPhone.substring(4);
      } else if (normalizedPhone.startsWith('966') && normalizedPhone.length >= 12) {
        normalizedPhone = '0' + normalizedPhone.substring(3);
      }

      const response = await apiClient.get(`/customers/phone/${normalizedPhone}`);
      if (response.data?.id) {
        return response.data.id;
      }
    } catch (error: any) {
      // 404 means customer not found - that's okay
      if (error.response?.status !== 404) {
        console.error('Error looking up customer by phone:', error);
      }
    }
    return null;
  }, []);

  // Fetch current agent info
  const { data: currentAgent, isLoading: agentLoading } = useQuery({
    queryKey: ['agents', agentId],
    queryFn: async () => {
      if (!agentId) return null;
      const response = await apiClient.get(`/agents/${agentId}`);
      return response.data;
    },
    enabled: !!agentId,
  });

  // Fetch customer when we have a customer ID from the call
  const { data: currentCustomer, isLoading: customerLoading } = useQuery({
    queryKey: ['customers', currentCustomerId],
    queryFn: async () => {
      if (!currentCustomerId) return null;
      const response = await apiClient.get(`/customers/${currentCustomerId}`);
      return response.data;
    },
    enabled: !!currentCustomerId,
  });

  // Fetch customer's tickets for interaction history
  const { data: customerTickets } = useQuery({
    queryKey: ['customer-tickets', currentCustomerId],
    queryFn: async () => {
      if (!currentCustomerId) return [];
      const response = await apiClient.get(`/tickets/customer/${currentCustomerId}`);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!currentCustomerId,
  });

  // Fetch customer's conversations for interaction history
  const { data: customerConversations } = useQuery({
    queryKey: ['customer-conversations', currentCustomerId],
    queryFn: async () => {
      if (!currentCustomerId) return [];
      const response = await apiClient.get(`/conversations/customer/${currentCustomerId}`);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!currentCustomerId,
  });

  // Fetch agent's conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', agentId],
    queryFn: async () => {
      const response = await apiClient.get('/conversations', {
        params: { agentId }
      });
      const data = response.data;
      return Array.isArray(data) ? data : (data?.items || []);
    },
    enabled: !!agentId,
    refetchInterval: 30000,
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: {
      subject: string;
      description: string;
      priority: string;
      category: string;
      customerId?: string;
    }) => {
      const response = await apiClient.post('/tickets', {
        ...ticketData,
        customerId: ticketData.customerId || currentCustomerId,
        source: 'Phone',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  // SignalR event handlers
  useEffect(() => {
    if (!connection || !isConnected) return;

    // Register agent when connected
    if (agentId && currentAgent?.name) {
      sendMessage('RegisterAgent', agentId, currentAgent.name, currentAgent.teamId);
    }

    // Handle incoming call
    const handleIncomingCall = async (data: any) => {
      console.log('Incoming call:', data);
      const callerNumber = data.callerNumber || data.CallerNumber || '';
      const callInfo: CallInfo = {
        callId: data.callId || data.CallId,
        callerNumber: callerNumber,
        callerName: data.callerName || data.CallerName,
        customerId: data.customerId || data.CustomerId,
        direction: data.direction || 'Inbound',
        queueName: data.queueName || data.QueueName,
        waitTimeSeconds: data.waitTimeSeconds || data.WaitTimeSeconds,
        startTime: new Date(),
      };

      setCurrentCall(callInfo);
      setCallState('ringing');
      setCustomerPhone(callerNumber);

      // If we have customer ID, use it
      if (callInfo.customerId) {
        setCurrentCustomerId(callInfo.customerId);
      } else if (callerNumber) {
        // Otherwise, lookup customer by phone number
        const foundCustomerId = await lookupCustomerByPhone(callerNumber);
        if (foundCustomerId) {
          setCurrentCustomerId(foundCustomerId);
          // Update call info with found customer ID
          callInfo.customerId = foundCustomerId;
          setCurrentCall({ ...callInfo });
        }
      }
    };

    // Handle call answered (from another source or confirmation)
    const handleCallAnswered = (data: any) => {
      if (data.agentId === agentId || data.AgentId === agentId) {
        setCallState('active');
        setAgentState('busy');
        setCallStartTime(new Date());
      }
    };

    // Handle call ended
    const handleCallEnded = (data: any) => {
      if (data.agentId === agentId || data.AgentId === agentId) {
        setCallState('idle');
        setAgentState('acw');
        setCallStartTime(null);
        setCurrentCall(null);
        setIsMuted(false);
        setIsOnHold(false);

        // ACW timeout - auto return to available
        setTimeout(() => setAgentState('available'), 30000);
      }
    };

    // Handle agent state changed
    const handleAgentStateChanged = (data: any) => {
      if (data.agentId === agentId || data.AgentId === agentId) {
        const state = (data.state || data.State || '').toLowerCase() as AgentState;
        if (['available', 'busy', 'break', 'acw', 'offline'].includes(state)) {
          setAgentState(state);
        }
      }
    };

    // Subscribe to events
    connection.on('IncomingCall', handleIncomingCall);
    connection.on('CallAnswered', handleCallAnswered);
    connection.on('CallEnded', handleCallEnded);
    connection.on('AgentStateChanged', handleAgentStateChanged);

    return () => {
      connection.off('IncomingCall', handleIncomingCall);
      connection.off('CallAnswered', handleCallAnswered);
      connection.off('CallEnded', handleCallEnded);
      connection.off('AgentStateChanged', handleAgentStateChanged);
    };
  }, [connection, isConnected, agentId, currentAgent, sendMessage, lookupCustomerByPhone]);

  // Call control handlers
  const handleAnswer = useCallback(async () => {
    if (!currentCall) return;

    try {
      // Notify backend via MockCtiService
      await apiClient.post('/mock-cti/call-answered', {
        agentId,
        callId: currentCall.callId,
      });

      setCallState('active');
      setAgentState('busy');
      setCallStartTime(new Date());
    } catch (error) {
      console.error('Error answering call:', error);
      // Fallback to local state change
      setCallState('active');
      setAgentState('busy');
      setCallStartTime(new Date());
    }
  }, [currentCall, agentId]);

  const handleReject = useCallback(() => {
    setCallState('idle');
    setCurrentCall(null);
    setCurrentCustomerId(null);
    setCustomerPhone(null);
  }, []);

  const handleHangup = useCallback(async () => {
    if (!currentCall) {
      setCallState('idle');
      return;
    }

    const duration = callStartTime
      ? Math.floor((Date.now() - callStartTime.getTime()) / 1000)
      : 0;

    try {
      await apiClient.post('/mock-cti/call-ended', {
        agentId,
        callId: currentCall.callId,
        durationSeconds: duration,
      });
    } catch (error) {
      console.error('Error ending call:', error);
    }

    setCallState('idle');
    setAgentState('acw');
    setCallStartTime(null);
    setCurrentCall(null);
    setCurrentCustomerId(null);
    setCustomerPhone(null);
    setIsMuted(false);
    setIsOnHold(false);

    // ACW timeout
    setTimeout(() => setAgentState('available'), 30000);
  }, [currentCall, callStartTime, agentId]);

  const handleHold = useCallback(() => {
    setIsOnHold(true);
    setCallState('onhold');
  }, []);

  const handleResume = useCallback(() => {
    setIsOnHold(false);
    setCallState('active');
  }, []);

  const handleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const handleTransfer = useCallback(async (toAgentId: string) => {
    if (!currentCall) return;

    try {
      await apiClient.post('/mock-cti/call-transferred', {
        fromAgentId: agentId,
        toAgentId,
        callId: currentCall.callId,
      });

      setCallState('idle');
      setAgentState('available');
      setCurrentCall(null);
      setCallStartTime(null);
    } catch (error) {
      console.error('Error transferring call:', error);
    }
  }, [currentCall, agentId]);

  const handleChangeAgentState = useCallback(async (newState: AgentState) => {
    try {
      await apiClient.post(`/agent-states/${agentId}`, {
        state: newState.charAt(0).toUpperCase() + newState.slice(1),
      });
      setAgentState(newState);
    } catch (error) {
      console.error('Error changing agent state:', error);
      setAgentState(newState);
    }
  }, [agentId]);

  const simulateIncomingCall = useCallback(async () => {
    const testPhone = '+966 50 123 4567';
    try {
      await apiClient.post('/mock-cti/incoming-call', {
        agentId,
        callerNumber: testPhone,
        callerName: 'Test Caller',
      });
    } catch (error) {
      console.error('Error simulating call:', error);
      // Fallback to local simulation
      setCallState('ringing');
      setCustomerPhone(testPhone);

      const callInfo: CallInfo = {
        callId: crypto.randomUUID(),
        callerNumber: testPhone,
        callerName: 'Test Caller',
        direction: 'Inbound',
        startTime: new Date(),
      };
      setCurrentCall(callInfo);

      // Try to lookup customer by phone
      const foundCustomerId = await lookupCustomerByPhone(testPhone);
      if (foundCustomerId) {
        setCurrentCustomerId(foundCustomerId);
        callInfo.customerId = foundCustomerId;
        setCurrentCall({ ...callInfo });
      }
    }
  }, [agentId, lookupCustomerByPhone]);

  // Format conversations for display
  const conversations = (conversationsData || []).map((conv: any) => ({
    id: conv.id,
    customerName: conv.customer?.name || conv.customerName || 'Unknown',
    lastMessage: conv.lastMessage || 'No messages',
    timestamp: new Date(conv.startedAt || conv.createdAt),
    channel: (conv.channel?.toLowerCase() || 'voice') as 'voice' | 'email' | 'whatsapp' | 'chat' | 'sms',
    unreadCount: conv.unreadCount || 0,
    isActive: conv.state === 'Active',
  }));

  // Format customer interactions for Customer 360 view
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const customerInteractions: InteractionInfo[] = [
    // Map tickets to interactions
    ...(customerTickets || []).map((ticket: any) => ({
      id: ticket.id,
      type: 'Ticket' as const,
      date: formatTimeAgo(new Date(ticket.createdAt)),
      summary: ticket.subject || 'No subject',
      status: ticket.status,
    })),
    // Map conversations to interactions
    ...(customerConversations || []).map((conv: any) => ({
      id: conv.id,
      type: (conv.channel === 'Voice' ? 'Call' : conv.channel) as InteractionInfo['type'],
      date: formatTimeAgo(new Date(conv.startedAt || conv.createdAt)),
      summary: conv.lastMessage || `${conv.channel} conversation`,
      status: conv.state,
    })),
  ]
    // Sort by date (most recent first)
    .sort((a, b) => {
      // Parse relative dates back for sorting
      const getWeight = (d: string) => {
        if (d.includes('m ago')) return parseInt(d);
        if (d.includes('h ago')) return parseInt(d) * 60;
        if (d.includes('d ago')) return parseInt(d) * 1440;
        return 10000;
      };
      return getWeight(a.date) - getWeight(b.date);
    })
    .slice(0, 5); // Show only last 5 interactions

  return {
    // State
    callState,
    agentState,
    isMuted,
    isOnHold,
    callStartTime,
    currentCall,

    // Data
    currentAgent,
    currentCustomer,
    conversations,
    customerInteractions,
    isConnected,

    // Loading states
    isLoading: agentLoading || conversationsLoading,
    customerLoading,

    // Handlers
    handleAnswer,
    handleReject,
    handleHangup,
    handleHold,
    handleResume,
    handleMute,
    handleTransfer,
    handleChangeAgentState,
    simulateIncomingCall,

    // Mutations
    createTicket: createTicketMutation.mutateAsync,
    isCreatingTicket: createTicketMutation.isPending,
  };
};

export default useAgentDesktop;
