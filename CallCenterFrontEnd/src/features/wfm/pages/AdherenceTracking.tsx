import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button, Card, Badge, Select } from '../../../components/ui';
import apiClient from '../../../api/client';
import {
  User,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface AdherenceData {
  agentId: string;
  date: string;
  scheduledMinutes: number;
  actualMinutes: number;
  adherencePercentage: number;
  conformancePercentage: number;
  events: AdherenceEvent[];
}

interface AdherenceEvent {
  scheduledActivity?: string;
  actualActivity?: string;
  scheduledStart: string;
  actualStart: string;
  duration: number;
  isCompliant: boolean;
}

interface AdherenceSummary {
  agentId: string;
  startDate: string;
  endDate: string;
  averageAdherence: number;
  averageConformance: number;
  totalScheduledMinutes: number;
  totalActualMinutes: number;
  dailyAdherence: { date: string; adherence: number }[];
}

interface Agent {
  id: string;
  name: string;
  email: string;
}

interface Team {
  id: string;
  name: string;
}

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export function AdherenceTracking() {
  const { t } = useTranslation();
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'agent' | 'team'>('agent');

  // Fetch agents
  const { data: agents } = useQuery({
    queryKey: ['agents-list'],
    queryFn: async () => {
      const response = await apiClient.get('/agents', {
        params: { pageNumber: 1, pageSize: 100 }
      });
      return response.data.items as Agent[];
    }
  });

  // Fetch teams
  const { data: teams } = useQuery({
    queryKey: ['teams-list'],
    queryFn: async () => {
      const response = await apiClient.get('/teams', {
        params: { pageNumber: 1, pageSize: 100 }
      });
      return response.data.items as Team[];
    }
  });

  // Fetch agent adherence
  const { data: agentAdherence, isLoading: agentLoading } = useQuery({
    queryKey: ['agent-adherence', selectedAgentId, selectedDate],
    queryFn: async () => {
      const response = await apiClient.get(`/adherence/agent/${selectedAgentId}`, {
        params: { date: selectedDate }
      });
      return response.data as AdherenceData;
    },
    enabled: viewMode === 'agent' && !!selectedAgentId
  });

  // Fetch team adherence
  const { data: teamAdherence, isLoading: teamLoading } = useQuery({
    queryKey: ['team-adherence', selectedTeamId, selectedDate],
    queryFn: async () => {
      const response = await apiClient.get(`/adherence/team/${selectedTeamId}`, {
        params: { date: selectedDate }
      });
      return response.data as AdherenceData[];
    },
    enabled: viewMode === 'team' && !!selectedTeamId
  });

  // Fetch agent summary (last 7 days)
  const { data: agentSummary } = useQuery({
    queryKey: ['agent-adherence-summary', selectedAgentId],
    queryFn: async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      const response = await apiClient.get(`/adherence/summary/${selectedAgentId}`, {
        params: { startDate, endDate }
      });
      return response.data as AdherenceSummary;
    },
    enabled: viewMode === 'agent' && !!selectedAgentId
  });

  const getAdherenceBadge = (percentage: number) => {
    if (percentage >= 95) return <Badge variant="success">{percentage.toFixed(1)}%</Badge>;
    if (percentage >= 80) return <Badge variant="warning">{percentage.toFixed(1)}%</Badge>;
    return <Badge variant="danger">{percentage.toFixed(1)}%</Badge>;
  };

  const selectedAgent = agents?.find(a => a.id === selectedAgentId);
  const isLoading = viewMode === 'agent' ? agentLoading : teamLoading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('wfm.adherenceTracking', 'Adherence Tracking')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('wfm.adherenceDescription', 'Monitor agent schedule adherence and conformance')}
          </p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex space-x-2">
        <Button
          variant={viewMode === 'agent' ? 'primary' : 'secondary'}
          onClick={() => setViewMode('agent')}
        >
          <User className="h-4 w-4 mr-2" />
          {t('wfm.agentView', 'Agent View')}
        </Button>
        <Button
          variant={viewMode === 'team' ? 'primary' : 'secondary'}
          onClick={() => setViewMode('team')}
        >
          <Users className="h-4 w-4 mr-2" />
          {t('wfm.teamView', 'Team View')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {viewMode === 'agent' ? (
            <Select
              label={t('wfm.selectAgent', 'Select Agent')}
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              options={[
                { value: '', label: t('wfm.chooseAgent', 'Choose an agent...') },
                ...(agents?.map(a => ({ value: a.id, label: a.name })) || [])
              ]}
            />
          ) : (
            <Select
              label={t('wfm.selectTeam', 'Select Team')}
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              options={[
                { value: '', label: t('wfm.chooseTeam', 'Choose a team...') },
                ...(teams?.map(t => ({ value: t.id, label: t.name })) || [])
              ]}
            />
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('wfm.date', 'Date')}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Agent View */}
      {viewMode === 'agent' && selectedAgentId && (
        <>
          {/* Agent Info and Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 md:col-span-2">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{selectedAgent?.name}</h3>
                  <p className="text-sm text-gray-500">{selectedAgent?.email}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('wfm.adherenceToday', 'Adherence Today')}</p>
                  <div className="flex items-center">
                    {agentAdherence ? getAdherenceBadge(agentAdherence.adherencePercentage) : <span className="text-gray-400">-</span>}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('wfm.conformance', 'Conformance')}</p>
                  <div className="flex items-center">
                    {agentAdherence ? getAdherenceBadge(agentAdherence.conformancePercentage) : <span className="text-gray-400">-</span>}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 7-Day Summary */}
          {agentSummary && (
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                {t('wfm.weeklyTrend', '7-Day Trend')}
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {agentSummary.dailyAdherence.map((day) => (
                  <div key={day.date} className="text-center">
                    <div className="text-xs text-gray-500 mb-1">
                      {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                    </div>
                    <div className={`py-2 rounded ${
                      day.adherence >= 95 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      day.adherence >= 80 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {day.adherence.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">{t('wfm.avgAdherence', 'Avg Adherence')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{agentSummary.averageAdherence.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('wfm.scheduledTime', 'Scheduled Time')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatTime(agentSummary.totalScheduledMinutes)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('wfm.actualTime', 'Actual Time')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatTime(agentSummary.totalActualMinutes)}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Today's Events */}
          <Card>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {t('wfm.dailyActivities', 'Daily Activities')} - {new Date(selectedDate).toLocaleDateString()}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('wfm.scheduledActivity', 'Scheduled')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('wfm.actualActivity', 'Actual')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('wfm.scheduledStart', 'Sched. Start')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('wfm.actualStart', 'Actual Start')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('wfm.duration', 'Duration')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('wfm.status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        {t('common.loading', 'Loading...')}
                      </td>
                    </tr>
                  ) : agentAdherence?.events && agentAdherence.events.length > 0 ? (
                    agentAdherence.events.map((event, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {event.scheduledActivity || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={event.isCompliant ? 'text-green-600' : 'text-red-600'}>
                            {event.actualActivity || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {event.scheduledStart}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {event.actualStart}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {event.duration}m
                        </td>
                        <td className="px-4 py-3">
                          {event.isCompliant ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        {t('wfm.noEventsFound', 'No schedule events found for this date.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Team View */}
      {viewMode === 'team' && selectedTeamId && (
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {t('wfm.teamAdherence', 'Team Adherence')} - {new Date(selectedDate).toLocaleDateString()}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('wfm.agent', 'Agent')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('wfm.scheduled', 'Scheduled')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('wfm.actual', 'Actual')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('wfm.adherence', 'Adherence')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('wfm.conformance', 'Conformance')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      {t('common.loading', 'Loading...')}
                    </td>
                  </tr>
                ) : teamAdherence && teamAdherence.length > 0 ? (
                  teamAdherence.map((adherence) => {
                    const agent = agents?.find(a => a.id === adherence.agentId);
                    return (
                      <tr key={adherence.agentId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {agent?.name || adherence.agentId}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                          {formatTime(adherence.scheduledMinutes)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                          {formatTime(adherence.actualMinutes)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {getAdherenceBadge(adherence.adherencePercentage)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {getAdherenceBadge(adherence.conformancePercentage)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      {t('wfm.noTeamData', 'No adherence data found for this team and date.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {((viewMode === 'agent' && !selectedAgentId) || (viewMode === 'team' && !selectedTeamId)) && (
        <Card className="p-12 text-center">
          {viewMode === 'agent' ? (
            <>
              <User className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {t('wfm.selectAgentToView', 'Select an agent to view adherence')}
              </h3>
            </>
          ) : (
            <>
              <Users className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {t('wfm.selectTeamToView', 'Select a team to view adherence')}
              </h3>
            </>
          )}
          <p className="mt-2 text-gray-500">
            {t('wfm.selectToViewAdherence', 'Choose from the dropdown above to see schedule adherence data.')}
          </p>
        </Card>
      )}
    </div>
  );
}
