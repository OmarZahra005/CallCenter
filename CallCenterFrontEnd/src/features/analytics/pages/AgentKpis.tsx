import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Badge, Select } from '../../../components/ui';
import apiClient from '../../../api/client';
import {
  ArrowLeft,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  CheckCircle,
  ThumbsUp,
  User,
  Calendar,
} from 'lucide-react';

interface AgentKpi {
  id: string;
  agentId: string;
  agentName: string;
  date: string;
  totalCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  abandonedCalls: number;
  ahtSeconds?: number;
  asaSeconds?: number;
  resolvedTickets: number;
  createdTickets: number;
  fcrRate?: number;
  customerSatisfactionScore?: number;
  adherencePercentage?: number;
  utilizationPercentage?: number;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  status: number;
}

const formatDuration = (seconds?: number): string => {
  if (!seconds) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatPercent = (value?: number): string => {
  if (value === undefined || value === null) return '-';
  return `${value.toFixed(1)}%`;
};

export function AgentKpis() {
  const { t } = useTranslation();
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [selectedAgentId, setSelectedAgentId] = useState(agentId || '');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  // Fetch agents list
  const { data: agents } = useQuery({
    queryKey: ['agents-list'],
    queryFn: async () => {
      const response = await apiClient.get('/agents', {
        params: { pageNumber: 1, pageSize: 100 }
      });
      return response.data.items as Agent[];
    }
  });

  // Fetch KPIs
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['agent-kpis', selectedAgentId, dateRange],
    queryFn: async () => {
      if (!selectedAgentId) return [];
      const response = await apiClient.get(`/analytics/agents/${selectedAgentId}/kpis`, {
        params: { from: dateRange.from, to: dateRange.to }
      });
      return response.data as AgentKpi[];
    },
    enabled: !!selectedAgentId
  });

  // Calculate aggregates
  const aggregates = kpis?.reduce((acc, kpi) => ({
    totalCalls: acc.totalCalls + kpi.totalCalls,
    inboundCalls: acc.inboundCalls + kpi.inboundCalls,
    outboundCalls: acc.outboundCalls + kpi.outboundCalls,
    abandonedCalls: acc.abandonedCalls + kpi.abandonedCalls,
    resolvedTickets: acc.resolvedTickets + kpi.resolvedTickets,
    avgAht: kpi.ahtSeconds ? (acc.ahtCount + 1, acc.avgAht + kpi.ahtSeconds) : acc.avgAht,
    ahtCount: kpi.ahtSeconds ? acc.ahtCount + 1 : acc.ahtCount,
    avgCsat: kpi.customerSatisfactionScore ? (acc.csatCount + 1, acc.avgCsat + kpi.customerSatisfactionScore) : acc.avgCsat,
    csatCount: kpi.customerSatisfactionScore ? acc.csatCount + 1 : acc.csatCount,
  }), {
    totalCalls: 0,
    inboundCalls: 0,
    outboundCalls: 0,
    abandonedCalls: 0,
    resolvedTickets: 0,
    avgAht: 0,
    ahtCount: 0,
    avgCsat: 0,
    csatCount: 0,
  });

  const selectedAgent = agents?.find(a => a.id === selectedAgentId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('analytics.agentKpis', 'Agent KPIs')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t('analytics.agentKpisDescription', 'View detailed performance metrics for agents')}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label={t('analytics.selectAgent', 'Select Agent')}
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            options={[
              { value: '', label: t('analytics.chooseAgent', 'Choose an agent...') },
              ...(agents?.map(a => ({ value: a.id, label: a.name })) || [])
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('analytics.fromDate', 'From Date')}
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('analytics.toDate', 'To Date')}
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </Card>

      {selectedAgentId && selectedAgent && (
        <>
          {/* Agent Info */}
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedAgent.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{selectedAgent.email}</p>
              </div>
              <Badge variant={selectedAgent.status === 1 ? 'success' : 'default'}>
                {selectedAgent.status === 1 ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('analytics.totalCalls', 'Total Calls')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{aggregates?.totalCalls || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <PhoneIncoming className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('analytics.inbound', 'Inbound')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{aggregates?.inboundCalls || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <PhoneOutgoing className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('analytics.outbound', 'Outbound')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{aggregates?.outboundCalls || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('analytics.avgAht', 'Avg AHT')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {aggregates?.ahtCount ? formatDuration(Math.round(aggregates.avgAht / aggregates.ahtCount)) : '-'}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('analytics.resolved', 'Resolved')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{aggregates?.resolvedTickets || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                  <ThumbsUp className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('analytics.avgCsat', 'Avg CSAT')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {aggregates?.csatCount ? `${(aggregates.avgCsat / aggregates.csatCount).toFixed(1)}` : '-'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Daily KPIs Table */}
          <Card>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('analytics.dailyKpis', 'Daily KPIs')}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('analytics.date', 'Date')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.calls', 'Calls')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.inOut', 'In/Out')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.aht', 'AHT')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.asa', 'ASA')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.fcr', 'FCR')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.csat', 'CSAT')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.adherence', 'Adherence')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.utilization', 'Utilization')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        {t('common.loading', 'Loading...')}
                      </td>
                    </tr>
                  ) : kpis && kpis.length > 0 ? (
                    kpis.map((kpi) => (
                      <tr key={kpi.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {new Date(kpi.date).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                          {kpi.totalCalls}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                          {kpi.inboundCalls} / {kpi.outboundCalls}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {formatDuration(kpi.ahtSeconds)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {formatDuration(kpi.asaSeconds)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm ${kpi.fcrRate && kpi.fcrRate >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {formatPercent(kpi.fcrRate)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm ${kpi.customerSatisfactionScore && kpi.customerSatisfactionScore >= 4 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {kpi.customerSatisfactionScore?.toFixed(1) || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm ${kpi.adherencePercentage && kpi.adherencePercentage >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {formatPercent(kpi.adherencePercentage)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm ${kpi.utilizationPercentage && kpi.utilizationPercentage >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {formatPercent(kpi.utilizationPercentage)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        {t('analytics.noKpisFound', 'No KPI data found for the selected period.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {!selectedAgentId && (
        <Card className="p-12 text-center">
          <User className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {t('analytics.selectAgentToView', 'Select an agent to view KPIs')}
          </h3>
          <p className="mt-2 text-gray-500">
            {t('analytics.selectAgentDescription', 'Choose an agent from the dropdown above to see their performance metrics.')}
          </p>
        </Card>
      )}
    </div>
  );
}
