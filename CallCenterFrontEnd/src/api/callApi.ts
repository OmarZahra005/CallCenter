import { API_BASE_URL } from '../config/apiConfig';
import type { CallSummary } from '../types/callTypes';

// Outbound call types
export interface InitiateOutboundRequest {
  customerNumber: string;
  customerId?: string;
  conversationId?: string;
  idempotencyKey?: string;
}

export interface InitiateOutboundResponse {
  callId: string;
  providerCallId: string;
  customerNumber: string;
  status: string;
  initiatedAt: string;
}

// Prepare outbound call types (for direct browser connect)
export interface PrepareOutboundRequest {
  customerNumber: string;
  customerId?: string;
  customerName?: string;
  conversationId?: string;
  idempotencyKey?: string;
}

export interface PrepareOutboundResponse {
  callLogId: string;
  customerNumber: string;
  customerName?: string;
  status: string;
  preparedAt: string;
}

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Initiate an outbound call to a customer (Click-to-Call)
export const initiateOutboundCall = async (
  request: InitiateOutboundRequest
): Promise<InitiateOutboundResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/api/twilio/voice/initiate-outbound`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to initiate call: ${response.statusText}`);
  }

  return response.json();
};

// Prepare an outbound call (creates CallLog, returns callLogId for device.connect)
export const prepareOutboundCall = async (
  request: PrepareOutboundRequest
): Promise<PrepareOutboundResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/api/twilio/voice/prepare-outbound`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to prepare call: ${response.statusText}`);
  }

  return response.json();
};

export const getActiveCalls = async (): Promise<CallSummary[]> => {
  const response = await fetch(`${API_BASE_URL}/api/calls/active`);
  if (!response.ok) {
    throw new Error(`Failed to fetch active calls: ${response.statusText}`);
  }
  return response.json();
};

export const getCallHistory = async (take: number = 50): Promise<CallSummary[]> => {
  const response = await fetch(`${API_BASE_URL}/api/calls/history?take=${take}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch call history: ${response.statusText}`);
  }
  return response.json();
};

export const getCallById = async (id: string): Promise<CallSummary> => {
  const response = await fetch(`${API_BASE_URL}/api/calls/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch call ${id}: ${response.statusText}`);
  }
  return response.json();
};

export const getVoiceToken = async (identity: string): Promise<{ identity: string; token: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/voice-client/token?identity=${encodeURIComponent(identity)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch voice token: ${response.statusText}`);
  }
  return response.json();
};
