import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Call } from '@twilio/voice-sdk';
import * as signalR from '@microsoft/signalr';
import type { CallSummary } from '../types/callTypes';
import { getActiveCalls, getCallHistory, getVoiceToken } from '../api/callApi';
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
  | { type: 'ADD_CALL'; payload: CallSummary };

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
    default:
      return state;
  }
};

export const CallCenterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hubConnectionRef = React.useRef<signalR.HubConnection | null>(null);

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
    twilioDeviceManager.answer(state.incomingTwilioCall || undefined);

    // Move the call to active state
    if (state.incomingRingingCall) {
      dispatch({ type: 'SET_ACTIVE_CALL', payload: state.incomingRingingCall });
      dispatch({ type: 'SET_CALL_START_TIME', payload: new Date() });
    }

    dispatch({ type: 'SET_INCOMING_RINGING_CALL', payload: null });
    dispatch({ type: 'SET_IS_ANSWERING', payload: false });
  }, [state.incomingTwilioCall, state.incomingRingingCall]);

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

      twilioDeviceManager.onDisconnected(() => {
        console.log('Call disconnected');
        dispatch({ type: 'SET_INCOMING_RINGING_CALL', payload: null });
        dispatch({ type: 'SET_INCOMING_TWILIO_CALL', payload: null });
        dispatch({ type: 'SET_ACTIVE_CALL', payload: null });
        dispatch({ type: 'SET_CALL_START_TIME', payload: null });
        dispatch({ type: 'SET_IS_MUTED', payload: false });
        dispatch({ type: 'SET_IS_ON_HOLD', payload: false });
      });

      dispatch({ type: 'SET_IS_LOADING', payload: false });
    } catch (error) {
      console.error('Failed to initialize voice:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Cannot initialize voice. Please check your Twilio config.' });
      dispatch({ type: 'SET_IS_LOADING', payload: false });
    }
  }, []);

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
