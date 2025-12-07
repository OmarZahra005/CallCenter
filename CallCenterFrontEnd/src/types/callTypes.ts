export type CallStatus = 'Ringing' | 'InProgress' | 'Completed' | 'Failed' | 'Busy' | 'NoAnswer' | 'Queued' | 'Unknown';

export interface CallSummary {
  id: string; // Guid from backend
  providerCallId: string;
  fromNumber: string;
  toNumber: string;
  direction: string;
  status: string;
  startedAtUtc: string; // ISO date string
  endedAtUtc?: string | null;
  recordingUrl?: string | null;
}
