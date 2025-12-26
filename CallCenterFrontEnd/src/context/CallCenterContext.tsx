import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Call } from '@twilio/voice-sdk';
import * as signalR from '@microsoft/signalr';
import type { CallSummary } from '../types/callTypes';
import { getActiveCalls, getCallHistory, getVoiceToken, prepareOutboundCall } from '../api/callApi';
import { createNotificationHubConnection } from '../realtime/notificationHubClient';
import { twilioDeviceManager } from '../twilio/twilioDeviceService';

interface CallCenterState {
  activeCalls: CallSummary[];
  history: CallSummary[];
  selectedCall: CallSummary | null;
  incomingRingingCall: CallSummary | null;
  activeCall: CallSummary | null;
  callStartTime: Date | null;
  twilioReady: boolean;
  isAnswering: boolean;
  isMuted: boolean;
  isOnHold: boolean;
  agentIdentity: string;
  isLoading: boolean;
  error: string | null;
  incomingTwilioCall: Call | null;
  // Outbound call tracking
  pendingOutboundCall: { callId: string; customerNumber: string; customerName?: string } | null;
  isInitiatingOutbound: boolean;
  isConnectingOutbound: boolean;  // True when browser is connecting via device.connect()
}

interface CallCenterActions {
  refreshActive: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  setSelectedCall: (call: CallSummary | null) => void;
  acceptIncoming: () => void;
  rejectIncoming: () => void;
  hangupCurrent: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
  setAgentIdentity: (id: string) => Promise<void>;
  // Direct outbound call - browser connects directly, no accept step
  initiateDirectOutbound: (customerNumber: string, customerId?: string, customerName?: string) => Promise<void>;
}

type CallCenterContextType = CallCenterState & CallCenterActions;

const CallCenterContext = createContext<CallCenterContextType | undefined>(undefined);

type Action =
  | { type: 'SET_ACTIVE_CALLS'; payload: CallSummary[] }
  | { type: 'SET_HISTORY'; payload: CallSummary[] }
  | { type: 'SET_SELECTED_CALL'; payload: CallSummary | null }
  | { type: 'SET_INCOMING_RINGING_CALL'; payload: CallSummary | null }
  | { type: 'SET_ACTIVE_CALL'; payload: CallSummary | null }
  | { type: 'SET_CALL_START_TIME'; payload: Date | null }
  | { type: 'SET_INCOMING_TWILIO_CALL'; payload: Call | null }
  | { type: 'SET_TWILIO_READY'; payload: boolean }
  | { type: 'SET_IS_ANSWERING'; payload: boolean }
  | { type: 'SET_IS_MUTED'; payload: boolean }
  | { type: 'SET_IS_ON_HOLD'; payload: boolean }
  | { type: 'SET_AGENT_IDENTITY'; payload: string }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_CALL'; payload: CallSummary }
  | { type: 'ADD_CALL'; payload: CallSummary }
  | { type: 'SET_PENDING_OUTBOUND'; payload: { callId: string; customerNumber: string; customerName?: string } | null }
  | { type: 'SET_IS_INITIATING_OUTBOUND'; payload: boolean }
  | { type: 'SET_IS_CONNECTING_OUTBOUND'; payload: boolean };

const initialState: CallCenterState = {
  activeCalls: [],
  history: [],
  selectedCall: null,
  incomingRingingCall: null,
  activeCall: null,
  callStartTime: null,
  twilioReady: false,
  isAnswering: false,
  isMuted: false,
  isOnHold: false,
  agentIdentity: '',
  isLoading: false,
  error: null,
  incomingTwilioCall: null,
  pendingOutboundCall: null,
  isInitiatingOutbound: false,
  isConnectingOutbound: false,
};

const reducer = (state: CallCenterState, action: Action): CallCenterState => {
  switch (action.type) {
    case 'SET_ACTIVE_CALLS':
      return { ...state, activeCalls: action.payload };
    case 'SET_HISTORY':
      return { ...state, history: action.payload };
    case 'SET_SELECTED_CALL':
      return { ...state, selectedCall: action.payload };
    case 'SET_INCOMING_RINGING_CALL':
      return { ...state, incomingRingingCall: action.payload };
    case 'SET_ACTIVE_CALL':
      return { ...state, activeCall: action.payload };
    case 'SET_CALL_START_TIME':
      return { ...state, callStartTime: action.payload };
    case 'SET_INCOMING_TWILIO_CALL':
      return { ...state, incomingTwilioCall: action.payload };
    case 'SET_TWILIO_READY':
      return { ...state, twilioReady: action.payload };
    case 'SET_IS_ANSWERING':
      return { ...state, isAnswering: action.payload };
    case 'SET_IS_MUTED':
      return { ...state, isMuted: action.payload };
    case 'SET_IS_ON_HOLD':
      return { ...state, isOnHold: action.payload };
    case 'SET_AGENT_IDENTITY':
      return { ...state, agentIdentity: action.payload };
    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_CALL': {
      const updatedCall = action.payload;
      const isActive = !['Completed', 'Failed', 'Busy', 'NoAnswer'].includes(updatedCall.status);

      return {
        ...state,
        activeCalls: isActive
          ? state.activeCalls.map(c => c.id === updatedCall.id ? updatedCall : c)
          : state.activeCalls.filter(c => c.id !== updatedCall.id),
        history: state.history.map(c => c.id === updatedCall.id ? updatedCall : c),
        selectedCall: state.selectedCall?.id === updatedCall.id ? updatedCall : state.selectedCall,
        incomingRingingCall: state.incomingRingingCall?.id === updatedCall.id
          ? (updatedCall.status === 'Ringing' ? updatedCall : null)
          : state.incomingRingingCall,
      };
    }
    case 'ADD_CALL': {
      const newCall = action.payload;
      const callExists = state.history.some(c => c.id === newCall.id);

      // Case-insensitive comparison for status and direction
      const status = newCall.status?.toLowerCase();
      const direction = newCall.direction?.toLowerCase();
      const isRinging = status === 'ringing';
      const isInProgress = status === 'inprogress' || status === 'in-progress';
      const isInbound = direction === 'inbound';

      return {
        ...state,
        activeCalls: isRinging || isInProgress
          ? [newCall, ...state.activeCalls]
          : state.activeCalls,
        history: callExists ? state.history : [newCall, ...state.history],
        incomingRingingCall: isRinging && isInbound
          ? newCall
          : state.incomingRingingCall,
      };
    }
    case 'SET_PENDING_OUTBOUND':
      return { ...state, pendingOutboundCall: action.payload };
    case 'SET_IS_INITIATING_OUTBOUND':
      return { ...state, isInitiatingOutbound: action.payload };
    case 'SET_IS_CONNECTING_OUTBOUND':
      return { ...state, isConnectingOutbound: action.payload };
    default:
      return state;
  }
};

export const CallCenterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hubConnectionRef = React.useRef<signalR.HubConnection | null>(null);
  // Ref to track pending outbound call for use in Twilio callbacks
  const pendingOutboundRef = React.useRef<{ callId: string; customerNumber: string } | null>(null);

  // Keep ref in sync with state
  React.useEffect(() => {
    pendingOutboundRef.current = state.pendingOutboundCall;
  }, [state.pendingOutboundCall]);

  const refreshActive = useCallback(async () => {
    try {
      const calls = await getActiveCalls();
      dispatch({ type: 'SET_ACTIVE_CALLS', payload: calls });
    } catch (error) {
      console.error('Failed to refresh active calls:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load active calls' });
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      const calls = await getCallHistory();
      dispatch({ type: 'SET_HISTORY', payload: calls });
    } catch (error) {
      console.error('Failed to refresh call history:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load call history' });
    }
  }, []);

  const setSelectedCall = useCallback((call: CallSummary | null) => {
    dispatch({ type: 'SET_SELECTED_CALL', payload: call });
  }, []);

  const acceptIncoming = useCallback(() => {
    dispatch({ type: 'SET_IS_ANSWERING', payload: true });

    // Answer the call - activeCall will be set when 'accept' event fires (audio connected)
    twilioDeviceManager.answer(state.incomingTwilioCall || undefined);

    // Clear the incoming call banner immediately (user clicked answer)
    dispatch({ type: 'SET_INCOMING_RINGING_CALL', payload: null });
    dispatch({ type: 'SET_INCOMING_TWILIO_CALL', payload: null });

    // Note: SET_ACTIVE_CALL and SET_CALL_START_TIME are now set in the onAccepted handler
    // This ensures the call panel only shows after audio is actually connected
  }, [state.incomingTwilioCall]);

  const rejectIncoming = useCallback(() => {
    twilioDeviceManager.reject();
    dispatch({ type: 'SET_INCOMING_RINGING_CALL', payload: null });
    dispatch({ type: 'SET_INCOMING_TWILIO_CALL', payload: null });
  }, []);

  const hangupCurrent = useCallback(() => {
    twilioDeviceManager.hangup();
    dispatch({ type: 'SET_INCOMING_RINGING_CALL', payload: null });
    dispatch({ type: 'SET_INCOMING_TWILIO_CALL', payload: null });
    dispatch({ type: 'SET_ACTIVE_CALL', payload: null });
    dispatch({ type: 'SET_CALL_START_TIME', payload: null });
    dispatch({ type: 'SET_IS_MUTED', payload: false });
    dispatch({ type: 'SET_IS_ON_HOLD', payload: false });
    // Clear outbound state
    dispatch({ type: 'SET_PENDING_OUTBOUND', payload: null });
    dispatch({ type: 'SET_IS_INITIATING_OUTBOUND', payload: false });
  }, []);

  const toggleMute = useCallback(() => {
    const newMuteState = !state.isMuted;
    twilioDeviceManager.mute(newMuteState);
    dispatch({ type: 'SET_IS_MUTED', payload: newMuteState });
  }, [state.isMuted]);

  const toggleHold = useCallback(() => {
    const newHoldState = !state.isOnHold;
    // Note: Twilio hold is implemented by muting both input and output
    // For now, we'll track the state but actual hold implementation may vary
    dispatch({ type: 'SET_IS_ON_HOLD', payload: newHoldState });
  }, [state.isOnHold]);

  const setAgentIdentity = useCallback(async (identity: string) => {
    try {
      dispatch({ type: 'SET_IS_LOADING', payload: true });
      dispatch({ type: 'SET_AGENT_IDENTITY', payload: identity });

      const { token } = await getVoiceToken(identity);

      twilioDeviceManager.initialize(token);

      twilioDeviceManager.onReady(() => {
        dispatch({ type: 'SET_TWILIO_READY', payload: true });
      });

      twilioDeviceManager.onError((error) => {
        console.error('Twilio error:', error);
        dispatch({ type: 'SET_ERROR', payload: `Twilio error: ${error.message}` });
      });

      twilioDeviceManager.onIncoming((call: Call) => {
        console.log('Incoming call from:', call.parameters.From);
        dispatch({ type: 'SET_INCOMING_TWILIO_CALL', payload: call });
      });

      twilioDeviceManager.onAccepted((call: Call) => {
        console.log('Call accepted - audio connected, showing call panel');

        // Check if this is an outbound call (we have a pending outbound)
        const pendingOutbound = pendingOutboundRef.current;
        const isOutbound = pendingOutbound !== null;

        // Build call summary from Twilio call parameters
        const callSummary: CallSummary = {
          id: pendingOutbound?.callId || call.parameters.CallSid || `twilio-${Date.now()}`,
          providerCallId: call.parameters.CallSid || '',
          fromNumber: isOutbound ? identity : (call.parameters.From || 'Unknown'),
          toNumber: isOutbound ? pendingOutbound.customerNumber : (call.parameters.To || identity || ''),
          direction: isOutbound ? 'outbound' : 'inbound',
          status: 'InProgress',
          startedAtUtc: new Date().toISOString(),
          endedAtUtc: null,
          recordingUrl: null,
        };

        console.log(`${isOutbound ? 'Outbound' : 'Inbound'} call connected:`, callSummary);

        dispatch({ type: 'SET_ACTIVE_CALL', payload: callSummary });
        dispatch({ type: 'SET_CALL_START_TIME', payload: new Date() });
        dispatch({ type: 'SET_IS_ANSWERING', payload: false });

        // Clear pending outbound after call is connected
        if (isOutbound) {
          dispatch({ type: 'SET_IS_INITIATING_OUTBOUND', payload: false });
          dispatch({ type: 'SET_IS_CONNECTING_OUTBOUND', payload: false });
        }
      });

      twilioDeviceManager.onDisconnected(() => {
        console.log('Call disconnected');
        dispatch({ type: 'SET_INCOMING_RINGING_CALL', payload: null });
        dispatch({ type: 'SET_INCOMING_TWILIO_CALL', payload: null });
        dispatch({ type: 'SET_ACTIVE_CALL', payload: null });
        dispatch({ type: 'SET_CALL_START_TIME', payload: null });
        dispatch({ type: 'SET_IS_MUTED', payload: false });
        dispatch({ type: 'SET_IS_ON_HOLD', payload: false });
        // Clear outbound state
        dispatch({ type: 'SET_PENDING_OUTBOUND', payload: null });
        dispatch({ type: 'SET_IS_INITIATING_OUTBOUND', payload: false });
        dispatch({ type: 'SET_IS_CONNECTING_OUTBOUND', payload: false });
      });

      dispatch({ type: 'SET_IS_LOADING', payload: false });
    } catch (error) {
      console.error('Failed to initialize voice:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Cannot initialize voice. Please check your Twilio config.' });
      dispatch({ type: 'SET_IS_LOADING', payload: false });
    }
  }, []);

  /**
   * Initiate a direct outbound call - browser connects directly, no accept step
   * Flow: prepareOutboundCall API → device.connect() → conference + customer dial
   */
  const initiateDirectOutbound = useCallback(async (
    customerNumber: string,
    customerId?: string,
    customerName?: string
  ) => {
    if (!state.twilioReady) {
      dispatch({ type: 'SET_ERROR', payload: 'Voice system not ready' });
      return;
    }

    if (state.activeCall || state.isConnectingOutbound) {
      dispatch({ type: 'SET_ERROR', payload: 'Already on a call or connecting' });
      return;
    }

    try {
      dispatch({ type: 'SET_IS_CONNECTING_OUTBOUND', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Generate idempotency key
      const idempotencyKey = crypto.randomUUID();

      console.log('Preparing outbound call:', { customerNumber, customerId, customerName, idempotencyKey });

      // Step 1: Call API to create CallLog and get callLogId
      const prepareResult = await prepareOutboundCall({
        customerNumber,
        customerId,
        customerName,
        idempotencyKey,
      });

      console.log('Outbound call prepared:', prepareResult);

      // Handle both camelCase and PascalCase responses (backend JSON serialization)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = prepareResult as any;
      const parsedCallLogId = result.callLogId || result.CallLogId;
      const parsedCustomerNumber = result.customerNumber || result.CustomerNumber;
      const parsedCustomerName = result.customerName || result.CustomerName;

      console.log('Parsed response - callLogId:', parsedCallLogId, 'customerNumber:', parsedCustomerNumber);

      if (!parsedCallLogId || !parsedCustomerNumber) {
        throw new Error(`Invalid response from prepare-outbound: callLogId=${parsedCallLogId}, customerNumber=${parsedCustomerNumber}`);
      }

      // Set pending outbound for tracking
      dispatch({
        type: 'SET_PENDING_OUTBOUND',
        payload: {
          callId: parsedCallLogId,
          customerNumber: parsedCustomerNumber,
          customerName: parsedCustomerName,
        },
      });

      // Step 2: Connect browser directly using device.connect()
      console.log('Connecting browser via device.connect() with params:', { To: parsedCustomerNumber, callLogId: parsedCallLogId });
      const call = await twilioDeviceManager.connectOutbound({
        To: parsedCustomerNumber,
        callLogId: parsedCallLogId,
      });

      if (!call) {
        throw new Error('Failed to connect outbound call');
      }

      console.log('Browser connected, call initiated:', call.parameters);

      // The onAccepted handler will set activeCall when audio connects
      // isConnectingOutbound will be cleared when call connects or fails

    } catch (error) {
      console.error('Failed to initiate direct outbound call:', error);
      dispatch({ type: 'SET_ERROR', payload: `Failed to call: ${(error as Error).message}` });
      dispatch({ type: 'SET_IS_CONNECTING_OUTBOUND', payload: false });
      dispatch({ type: 'SET_PENDING_OUTBOUND', payload: null });
    }
  }, [state.twilioReady, state.activeCall, state.isConnectingOutbound]);

  useEffect(() => {
    const initializeHub = async () => {
      try {
        const connection = createNotificationHubConnection();
        hubConnectionRef.current = connection;

        connection.on('CallCreated', (callSummary: CallSummary) => {
          console.log('CallCreated event received:', callSummary);
          dispatch({ type: 'ADD_CALL', payload: callSummary });
        });

        connection.on('CallStatusChanged', (callSummary: CallSummary) => {
          console.log('CallStatusChanged event received:', callSummary);
          dispatch({ type: 'UPDATE_CALL', payload: callSummary });
        });

        // Outbound call events
        connection.on('OutboundCallInitiated', (data: { callId: string; providerCallId: string; customerNumber: string; agentIdentity: string; status: string }) => {
          console.log('OutboundCallInitiated event received:', data);
          dispatch({ type: 'SET_PENDING_OUTBOUND', payload: { callId: data.callId, customerNumber: data.customerNumber } });
          dispatch({ type: 'SET_IS_INITIATING_OUTBOUND', payload: true });
        });

        connection.on('OutboundCallStatusChanged', (data: { callId: string; providerCallId: string; status: string; customerNumber: string }) => {
          console.log('OutboundCallStatusChanged event received:', data);
          // If call completed or failed, clear pending outbound
          if (['completed', 'failed', 'busy', 'no-answer', 'canceled'].includes(data.status.toLowerCase())) {
            dispatch({ type: 'SET_PENDING_OUTBOUND', payload: null });
            dispatch({ type: 'SET_IS_INITIATING_OUTBOUND', payload: false });
          }
        });

        connection.on('OutboundCallRingingCustomer', (data: { callId: string; customerNumber: string; conferenceSid: string }) => {
          console.log('OutboundCallRingingCustomer event received:', data);
          // Customer is now being dialed - agent is connected
        });

        connection.on('OutboundCallFailed', (data: { callId: string; status: string }) => {
          console.log('OutboundCallFailed event received:', data);
          dispatch({ type: 'SET_PENDING_OUTBOUND', payload: null });
          dispatch({ type: 'SET_IS_INITIATING_OUTBOUND', payload: false });
          dispatch({ type: 'SET_ERROR', payload: `Outbound call failed: ${data.status}` });
        });

        await connection.start();
        console.log('SignalR connected');

        await refreshActive();
        await refreshHistory();
      } catch (error) {
        console.error('SignalR connection failed:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to call server' });
      }
    };

    initializeHub();

    return () => {
      if (hubConnectionRef.current) {
        hubConnectionRef.current.stop();
      }
      twilioDeviceManager.destroy();
    };
  }, [refreshActive, refreshHistory]);

  const value: CallCenterContextType = {
    ...state,
    refreshActive,
    refreshHistory,
    setSelectedCall,
    acceptIncoming,
    rejectIncoming,
    hangupCurrent,
    toggleMute,
    toggleHold,
    setAgentIdentity,
    initiateDirectOutbound,
  };

  return (
    <CallCenterContext.Provider value={value}>
      {children}
    </CallCenterContext.Provider>
  );
};

export const useCallCenter = (): CallCenterContextType => {
  const context = useContext(CallCenterContext);
  if (context === undefined) {
    throw new Error('useCallCenter must be used within a CallCenterProvider');
  }
  return context;
};

/**
 * Safe version of useCallCenter that returns null when outside CallCenterProvider.
 * Use this in components that may be rendered outside the provider context.
 */
export const useCallCenterSafe = (): CallCenterContextType | null => {
  const context = useContext(CallCenterContext);
  return context ?? null;
};
