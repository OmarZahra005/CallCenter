import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import { useSignalR } from '../../../hooks/useSignalR';
import { useAuthStore } from '../../../store/authStore';

export type CallState = 'idle' | 'ringing' | 'active' | 'onhold' | 'dialing';

export type AgentState = 'available' | 'busy' | 'break' | 'acw' | 'offline';

export interface ACWData {
  disposition: string;
  notes: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

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

  // Active conversation for timeline
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // ACW (After Call Work) state
  const [isACWActive, setIsACWActive] = useState(false);
  const [lastCallId, setLastCallId] = useState<string | null>(null);
  const [lastCallSid, setLastCallSid] = useState<string | null>(null);
  const [lastConversationId, setLastConversationId] = useState<string | null>(null);
  const [lastCustomerId, setLastCustomerId] = useState<string | null>(null);
  const [lastCallDuration, setLastCallDuration] = useState<number>(0);
  const [lastCustomerName, setLastCustomerName] = useState<string | null>(null);
  const [acwTimeoutId, setAcwTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

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

  // Use current customer ID or fallback to last customer ID (for ACW)
  const effectiveCustomerId = currentCustomerId || lastCustomerId;

  // Fetch customer when we have a customer ID from the call
  const { data: currentCustomer, isLoading: customerLoading } = useQuery({
    queryKey: ['customers', effectiveCustomerId],
    queryFn: async () => {
      if (!effectiveCustomerId) return null;
      const response = await apiClient.get(`/customers/${effectiveCustomerId}`);
      return response.data;
    },
    enabled: !!effectiveCustomerId,
  });

  // Fetch customer's tickets for interaction history
  const { data: customerTickets } = useQuery({
    queryKey: ['customer-tickets', effectiveCustomerId],
    queryFn: async () => {
      if (!effectiveCustomerId) return [];
      const response = await apiClient.get(`/tickets/customer/${effectiveCustomerId}`);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!effectiveCustomerId,
  });

  // Fetch customer's conversations for interaction history
  const { data: customerConversations } = useQuery({
    queryKey: ['customer-conversations', effectiveCustomerId],
    queryFn: async () => {
      if (!effectiveCustomerId) return [];
      const response = await apiClient.get(`/conversations/customer/${effectiveCustomerId}`);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!effectiveCustomerId,
  });

  // Fetch agent's conversations
  // Note: Real-time updates via SignalR (ConversationCreated/Updated events)
  // Polling is kept as a fallback with longer interval
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', agentId],
    queryFn: async () => {
      const response = await apiClient.get('/conversations', {
        params: {
          agentId,
          pageNumber: 1,
          pageSize: 50,
          sortDescending: true,
        }
      });
      const data = response.data;
      return Array.isArray(data) ? data : (data?.items || []);
    },
    enabled: !!agentId,
    refetchInterval: 120000, // 2 minutes fallback - main updates via SignalR
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: {
      subject: string;
      description: string;
      priority: string;
      category: string;
      customerId?: string;
      conversationId?: string;
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
      // Also invalidate conversation tickets if we have an active conversation
      if (activeConversationId) {
        queryClient.invalidateQueries({ queryKey: ['tickets', 'conversation', activeConversationId] });
      }
      if (lastConversationId) {
        queryClient.invalidateQueries({ queryKey: ['tickets', 'conversation', lastConversationId] });
      }
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
    const handleCallEnded = async (data: any) => {
      if (data.agentId === agentId || data.AgentId === agentId) {
        // Store call info for ACW and recording
        const duration = callStartTime
          ? Math.floor((Date.now() - callStartTime.getTime()) / 1000)
          : 0;
        setLastCallId(currentCall?.callId || null);
        setLastCallSid(currentCall?.callId || data.callSid || data.CallSid || null);
        setLastCallDuration(duration);
        setLastCustomerName(currentCustomer?.name || currentCall?.callerName || null);
        // Preserve conversation ID for timeline during ACW
        setLastConversationId(activeConversationId);
        // Preserve customer ID for Customer 360 during ACW
        setLastCustomerId(currentCustomerId);

        setCallState('idle');
        setAgentState('acw');
        setIsACWActive(true);
        setCallStartTime(null);
        setCurrentCall(null);
        // Don't clear currentCustomerId here - it will be cleared when ACW completes
        setIsMuted(false);
        setIsOnHold(false);

        // Notify backend of ACW state
        try {
          await apiClient.post(`/agent-states/${agentId}`, { state: 'AfterCallWork' });
        } catch (error) {
          console.error('Error setting ACW state:', error);
        }

        // ACW timeout - auto return to available after 30 seconds
        const timeoutId = setTimeout(async () => {
          setAgentState('available');
          setIsACWActive(false);
          setActiveConversationId(null);
          setLastConversationId(null);
          setLastCustomerId(null);
          setCurrentCustomerId(null);
          setLastCallId(null);
          setLastCallSid(null);
          setLastCallDuration(0);
          setLastCustomerName(null);
          // Notify backend of Available state
          try {
            await apiClient.post(`/agent-states/${agentId}`, { state: 'Available' });
          } catch (error) {
            console.error('Error setting Available state:', error);
          }
        }, 30000);
        setAcwTimeoutId(timeoutId);
      }
    };

    // Handle agent state changed
    const handleAgentStateChanged = (data: any) => {
      if (data.agentId === agentId || data.AgentId === agentId) {
        const rawState = data.state ?? data.State ?? '';
        // Handle both string and numeric enum values
        const stateMap: Record<string | number, AgentState> = {
          'Available': 'available', 'available': 'available', 0: 'available',
          'Busy': 'busy', 'busy': 'busy', 1: 'busy',
          'Break': 'break', 'break': 'break', 2: 'break',
          'Acw': 'acw', 'acw': 'acw', 'ACW': 'acw', 3: 'acw',
          'Offline': 'offline', 'offline': 'offline', 4: 'offline',
        };
        const state = stateMap[rawState] || (typeof rawState === 'string' ? rawState.toLowerCase() as AgentState : 'available');
        if (['available', 'busy', 'break', 'acw', 'offline'].includes(state)) {
          setAgentState(state);
        }
      }
    };

    // Handle conversation created - refresh conversation list and set active
    const handleConversationCreated = (conversation: any) => {
      console.log('ConversationCreated event received:', conversation);
      // Invalidate conversations query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations', agentId] });

      // If this is a Voice conversation for the current agent, set it as active
      if (conversation.agentId === agentId && (conversation.channel === 'Voice' || conversation.channel === 0)) {
        setActiveConversationId(conversation.id);
      }
    };

    // Handle conversation updated - refresh conversation list
    const handleConversationUpdated = (conversation: any) => {
      console.log('ConversationUpdated event received:', conversation);
      // Invalidate conversations query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations', agentId] });
      // Also invalidate customer conversations if this is the current customer
      if (currentCustomerId && conversation.customerId === currentCustomerId) {
        queryClient.invalidateQueries({ queryKey: ['customer-conversations', currentCustomerId] });
      }
      // Also invalidate timeline if active conversation
      if (activeConversationId && conversation.id === activeConversationId) {
        queryClient.invalidateQueries({ queryKey: ['timeline', activeConversationId] });
      }
    };

    // Subscribe to events
    connection.on('IncomingCall', handleIncomingCall);
    connection.on('CallAnswered', handleCallAnswered);
    connection.on('CallEnded', handleCallEnded);
    connection.on('AgentStateChanged', handleAgentStateChanged);
    connection.on('ConversationCreated', handleConversationCreated);
    connection.on('ConversationUpdated', handleConversationUpdated);

    return () => {
      connection.off('IncomingCall', handleIncomingCall);
      connection.off('CallAnswered', handleCallAnswered);
      connection.off('CallEnded', handleCallEnded);
      connection.off('AgentStateChanged', handleAgentStateChanged);
      connection.off('ConversationCreated', handleConversationCreated);
      connection.off('ConversationUpdated', handleConversationUpdated);
    };
  }, [connection, isConnected, agentId, currentAgent, sendMessage, lookupCustomerByPhone, queryClient, currentCustomerId, activeConversationId]);

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

    // Store call info for ACW and recording
    setLastCallId(currentCall.callId);
    setLastCallSid(currentCall.callId); // callId is typically the Twilio CallSid
    setLastCallDuration(duration);
    setLastCustomerName(currentCustomer?.name || currentCall.callerName || null);
    // Preserve conversation ID for timeline during ACW
    setLastConversationId(activeConversationId);
    // Preserve customer ID for Customer 360 during ACW
    setLastCustomerId(currentCustomerId);

    setCallState('idle');
    setAgentState('acw');
    setIsACWActive(true);
    setCallStartTime(null);
    setCurrentCall(null);
    // Don't clear currentCustomerId here - it will be cleared when ACW completes
    setCustomerPhone(null);
    setIsMuted(false);
    setIsOnHold(false);

    // Notify backend of ACW state
    try {
      await apiClient.post(`/agent-states/${agentId}`, { state: 'AfterCallWork' });
    } catch (error) {
      console.error('Error setting ACW state:', error);
    }

    // ACW timeout - auto return to available after 30 seconds
    const timeoutId = setTimeout(async () => {
      setAgentState('available');
      setIsACWActive(false);
      setActiveConversationId(null);
      setLastConversationId(null);
      setLastCustomerId(null);
      setCurrentCustomerId(null);
      setLastCallId(null);
      setLastCallSid(null);
      setLastCallDuration(0);
      setLastCustomerName(null);
      // Notify backend of Available state
      try {
        await apiClient.post(`/agent-states/${agentId}`, { state: 'Available' });
      } catch (error) {
        console.error('Error setting Available state:', error);
      }
    }, 30000);
    setAcwTimeoutId(timeoutId);
  }, [currentCall, callStartTime, agentId, currentCustomer, activeConversationId, currentCustomerId]);

  const handleHold = useCallback(async () => {
    if (!currentCall) return;

    setIsOnHold(true);
    setCallState('onhold');

    try {
      // Notify backend to track hold event
      await apiClient.post(`/twilio/voice/hold/${currentCall.callId}`);
    } catch (error) {
      console.error('Error notifying backend of hold:', error);
      // Continue even if API call fails - UI state already updated
    }
  }, [currentCall]);

  const handleResume = useCallback(async () => {
    if (!currentCall) return;

    setIsOnHold(false);
    setCallState('active');

    try {
      // Notify backend to track resume event
      await apiClient.post(`/twilio/voice/resume/${currentCall.callId}`);
    } catch (error) {
      console.error('Error notifying backend of resume:', error);
      // Continue even if API call fails - UI state already updated
    }
  }, [currentCall]);

  const handleMute = useCallback(async () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (currentCall) {
      try {
        // Notify backend to track mute event
        await apiClient.post(`/twilio/voice/mute/${currentCall.callId}?muted=${newMutedState}`);
      } catch (error) {
        console.error('Error notifying backend of mute:', error);
        // Continue even if API call fails - UI state already updated
      }
    }
  }, [currentCall, isMuted]);

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
  const conversations = (conversationsData || []).map((conv: any) => {
    // Map channel enum/string to lowercase display value
    const channelMap: Record<string, 'voice' | 'email' | 'whatsapp' | 'chat' | 'sms'> = {
      'Voice': 'voice',
      'voice': 'voice',
      '0': 'voice',
      'Email': 'email',
      'email': 'email',
      '1': 'email',
      'Whatsapp': 'whatsapp',
      'whatsapp': 'whatsapp',
      '2': 'whatsapp',
      'Webchat': 'chat',
      'webchat': 'chat',
      'Chat': 'chat',
      'chat': 'chat',
      '3': 'chat',
      'Sms': 'sms',
      'sms': 'sms',
      '4': 'sms',
    };
    const channel = channelMap[String(conv.channel)] || 'voice';

    // Get customer name, fallback to phone number if name not available
    const phoneNumber = conv.phoneNumber || conv.customer?.phone || '';
    const customerName = conv.customerName || conv.customer?.name || phoneNumber || 'Unknown';

    // Format duration for display (e.g., "2m 30s" or "5s")
    const durationSeconds = conv.durationSeconds;
    let durationDisplay = '';
    if (durationSeconds != null && durationSeconds > 0) {
      const mins = Math.floor(durationSeconds / 60);
      const secs = durationSeconds % 60;
      durationDisplay = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }

    // Map state enum/string to display value
    const stateMap: Record<string, string> = {
      'Waiting': 'Waiting',
      'waiting': 'Waiting',
      '0': 'Waiting',
      'Active': 'Active',
      'active': 'Active',
      '1': 'Active',
      'WrapUp': 'Wrap Up',
      'wrapup': 'Wrap Up',
      '2': 'Wrap Up',
      'Closed': 'Closed',
      'closed': 'Closed',
      '3': 'Closed',
      'Abandoned': 'Abandoned',
      'abandoned': 'Abandoned',
      '4': 'Abandoned',
    };
    const state = stateMap[String(conv.state)] || 'Unknown';

    return {
      id: conv.id,
      customerId: conv.customerId,
      customerName,
      phoneNumber,
      lastMessage: conv.lastMessage || (channel === 'voice' ? 'Voice Call' : 'No messages'),
      timestamp: new Date(conv.startTime || conv.startedAt || conv.createdAt),
      endTime: conv.endTime ? new Date(conv.endTime) : undefined,
      duration: durationDisplay,
      durationSeconds,
      channel,
      state,
      unreadCount: conv.unreadCount || 0,
      isActive: conv.state === 'Active' || conv.state === 1,
      messageCount: conv.messageCount || 0,
    };
  });

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
    ...(customerConversations || []).map((conv: any) => {
      // Map channel to interaction type (handle both string and numeric enum values)
      const channelToType: Record<string | number, InteractionInfo['type']> = {
        'Voice': 'Call', 'voice': 'Call', 0: 'Call',
        'Email': 'Email', 'email': 'Email', 1: 'Email',
        'Whatsapp': 'WhatsApp', 'whatsapp': 'WhatsApp', 2: 'WhatsApp',
        'Webchat': 'Chat', 'webchat': 'Chat', 'Chat': 'Chat', 'chat': 'Chat', 3: 'Chat',
        'Sms': 'Chat', 'sms': 'Chat', 4: 'Chat',
      };
      const interactionType = channelToType[conv.channel] || 'Call';

      // Map state to string (handle both string and numeric enum values)
      const stateMap: Record<string | number, string> = {
        'Waiting': 'Waiting', 0: 'Waiting',
        'Active': 'Active', 1: 'Active',
        'WrapUp': 'Wrap Up', 2: 'Wrap Up',
        'Closed': 'Closed', 3: 'Closed',
        'Abandoned': 'Abandoned', 4: 'Abandoned',
      };
      const stateStr = stateMap[conv.state] || String(conv.state || 'Unknown');

      return {
        id: conv.id,
        type: interactionType,
        date: formatTimeAgo(new Date(conv.startedAt || conv.createdAt)),
        summary: conv.lastMessage || `${interactionType} conversation`,
        status: stateStr,
      };
    }),
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

  // ACW completion handler
  const handleACWComplete = useCallback(async (acwData: ACWData) => {
    // Clear the timeout if it exists
    if (acwTimeoutId) {
      clearTimeout(acwTimeoutId);
      setAcwTimeoutId(null);
    }

    try {
      // Save ACW data to conversation if we have a conversation ID
      if (lastConversationId) {
        await apiClient.put(`/conversations/${lastConversationId}/acw`, {
          disposition: acwData.disposition,
          notes: acwData.notes,
          followUpRequired: acwData.followUpRequired,
          followUpDate: acwData.followUpDate,
        });
      } else {
        // Fallback to old endpoint if no conversation ID
        await apiClient.post('/calls/acw', {
          callId: lastCallId,
          agentId,
          disposition: acwData.disposition,
          notes: acwData.notes,
          followUpRequired: acwData.followUpRequired,
          followUpDate: acwData.followUpDate,
        });
      }
    } catch (error) {
      console.error('Error saving ACW data:', error);
      // Continue even if save fails - don't block the agent
    }

    // Clear ACW state and return to available
    setIsACWActive(false);
    setAgentState('available');
    setLastCallId(null);
    setLastCallSid(null);
    setLastCallDuration(0);
    setLastCustomerName(null);
    setActiveConversationId(null);
    setLastConversationId(null);
    setLastCustomerId(null);
    setCurrentCustomerId(null);

    // Notify backend of Available state
    try {
      await apiClient.post(`/agent-states/${agentId}`, { state: 'Available' });
    } catch (error) {
      console.error('Error setting Available state:', error);
    }
  }, [acwTimeoutId, lastCallId, agentId, lastConversationId]);

  // ACW skip handler
  const handleACWSkip = useCallback(async () => {
    // Clear the timeout if it exists
    if (acwTimeoutId) {
      clearTimeout(acwTimeoutId);
      setAcwTimeoutId(null);
    }

    // Clear ACW state and return to available
    setIsACWActive(false);
    setAgentState('available');
    setLastCallId(null);
    setLastCallSid(null);
    setLastCallDuration(0);
    setLastCustomerName(null);
    setActiveConversationId(null);
    setLastConversationId(null);
    setLastCustomerId(null);
    setCurrentCustomerId(null);

    // Notify backend of Available state
    try {
      await apiClient.post(`/agent-states/${agentId}`, { state: 'Available' });
    } catch (error) {
      console.error('Error setting Available state:', error);
    }
  }, [acwTimeoutId, agentId]);

  return {
    // State
    callState,
    agentState,
    isMuted,
    isOnHold,
    callStartTime,
    currentCall,

    // ACW State
    isACWActive,
    lastCallId,
    lastCallSid,
    lastCallDuration,
    lastCustomerName,
    lastConversationId,
    lastCustomerId,

    // Active conversation for timeline
    activeConversationId,

    // Effective IDs (current or last for ACW)
    effectiveCustomerId,

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
    handleACWComplete,
    handleACWSkip,

    // Mutations
    createTicket: createTicketMutation.mutateAsync,
    isCreatingTicket: createTicketMutation.isPending,

    // Allow external customer ID setting (for Twilio integration)
    setCustomerIdFromTwilio: setCurrentCustomerId,
    lookupCustomerByPhone,
  };
};

export default useAgentDesktop;
