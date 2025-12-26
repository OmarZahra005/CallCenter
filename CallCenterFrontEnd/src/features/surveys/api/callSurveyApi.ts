import apiClient from '../../../api/client';

// Types
export interface SurveyStats {
  totalSurveys: number;
  completedCount: number;
  pendingCount: number;
  expiredCount: number;
  failedCount: number;
  responseRate: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

export interface AgentSurveyStats {
  agentId: string;
  agentName: string;
  totalSurveys: number;
  completedCount: number;
  responseRate: number;
  averageRating: number;
}

export interface DailyTrend {
  date: string;
  totalSurveys: number;
  completedCount: number;
  responseRate: number;
  averageRating: number;
}

export interface SurveyReport {
  overallStats: SurveyStats;
  dailyTrends: DailyTrend[];
  topAgents: AgentSurveyStats[];
  bottomAgents: AgentSurveyStats[];
  channelBreakdown: Record<string, number>;
  directionBreakdown: Record<string, number>;
}

export interface CallSurveyDto {
  id: string;
  callId: string;
  agentId?: string;
  agentName?: string;
  queueId?: string;
  direction?: string;
  customerContactMasked?: string;
  channel: string;
  questionCode: string;
  rating?: number;
  status: string;
  sentAt?: string;
  respondedAt?: string;
  expiresAt: string;
  retryCount: number;
  lastError?: string;
  createdAt: string;
}

export interface SurveyListResponse {
  items: CallSurveyDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SurveyListFilter {
  fromDate?: string;
  toDate?: string;
  agentId?: string;
  status?: string;
  minRating?: number;
  maxRating?: number;
  channel?: string;
  direction?: string;
  page?: number;
  pageSize?: number;
}

// API functions
export const callSurveyApi = {
  // Get basic survey statistics
  getStats: async (fromDate?: string, toDate?: string): Promise<SurveyStats> => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const response = await apiClient.get(`/callsurvey/stats?${params.toString()}`);
    return response.data;
  },

  // Get agent survey statistics
  getAgentStats: async (fromDate?: string, toDate?: string): Promise<AgentSurveyStats[]> => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const response = await apiClient.get(`/callsurvey/stats/agents?${params.toString()}`);
    return response.data;
  },

  // Get comprehensive survey report
  getReport: async (fromDate?: string, toDate?: string): Promise<SurveyReport> => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const response = await apiClient.get(`/callsurvey/report?${params.toString()}`);
    return response.data;
  },

  // Get paginated list of surveys
  getSurveyList: async (filter: SurveyListFilter): Promise<SurveyListResponse> => {
    const params = new URLSearchParams();
    if (filter.fromDate) params.append('fromDate', filter.fromDate);
    if (filter.toDate) params.append('toDate', filter.toDate);
    if (filter.agentId) params.append('agentId', filter.agentId);
    if (filter.status) params.append('status', filter.status);
    if (filter.minRating !== undefined) params.append('minRating', filter.minRating.toString());
    if (filter.maxRating !== undefined) params.append('maxRating', filter.maxRating.toString());
    if (filter.channel) params.append('channel', filter.channel);
    if (filter.direction) params.append('direction', filter.direction);
    if (filter.page) params.append('page', filter.page.toString());
    if (filter.pageSize) params.append('pageSize', filter.pageSize.toString());

    const response = await apiClient.get(`/callsurvey/list?${params.toString()}`);
    return response.data;
  },

  // Process pending survey messages
  sendPendingSurveys: async (): Promise<{ processedCount: number; message: string }> => {
    const response = await apiClient.post('/callsurvey/send-pending');
    return response.data;
  },

  // Retry failed survey messages
  retryFailedSurveys: async (maxRetries = 3): Promise<{ retriedCount: number; message: string }> => {
    const response = await apiClient.post(`/callsurvey/retry-failed?maxRetries=${maxRetries}`);
    return response.data;
  },

  // Process expired surveys
  processExpired: async (): Promise<{ processedCount: number; message: string }> => {
    const response = await apiClient.post('/callsurvey/process-expired');
    return response.data;
  },
};

export default callSurveyApi;
