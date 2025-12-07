import { API_BASE_URL } from '../config/apiConfig';
import type { CallSummary } from '../types/callTypes';

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
