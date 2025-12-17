import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Badge, Select } from '../../../components/ui';
import apiClient from '../../../api/client';
import {
  ArrowLeft,
  Users,
  Clock,
  PhoneCall,
  PhoneMissed,
  TrendingUp,
  Timer,
  BarChart3,
} from 'lucide-react';

interface QueueMetric {
  id: string;
  queueId: string;
  queueName: string;
  timestamp: string;
  waitingCalls: number;
  activeCalls: number;
  availableAgents: number;
  busyAgents: number;
  averageWaitSeconds?: number;
  longestWaitSeconds?: number;
  abandonedCount: number;
  serviceLevelPercentage?: number;
}

interface Queue {
  id: string;
  name: string;
  description?: string;
}

const formatDuration = (seconds?: number): string => {
  if (!seconds) return '-';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

export function QueueMetrics() {
  const { t } = useTranslation();
  const { queueId } = useParams<{ queueId: string }>();
  const navigate = useNavigate();
  const [selectedQueueId, setSelectedQueueId] = useState(queueId || '');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  // Fetch queues list
  const { data: queues } = useQuery({
    queryKey: ['queues-list'],
    queryFn: async () => {
      const response = await apiClient.get('/queues', {
        params: { pageNumber: 1, pageSize: 100 }
      });
      return response.data.items as Queue[];
    }
  });

  // Fetch metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['queue-metrics', selectedQueueId, dateRange],
    queryFn: async () => {
      if (!selectedQueueId) return [];
      const response = await apiClient.get(`/analytics/queues/${selectedQueueId}/metrics`, {
        params: { from: dateRange.from, to: dateRange.to }
      });
      return response.data as QueueMetric[];
    },
    enabled: !!selectedQueueId
  });

  // Calculate summary
  const summary = metrics?.reduce((acc, m) => ({
    totalCalls: acc.totalCalls + m.activeCalls + m.waitingCalls,
    totalAbandoned: acc.totalAbandoned + m.abandonedCount,
    avgWait: m.averageWaitSeconds ? acc.avgWait + m.averageWaitSeconds : acc.avgWait,
    waitCount: m.averageWaitSeconds ? acc.waitCount + 1 : acc.waitCount,
    avgServiceLevel: m.serviceLevelPercentage ? acc.avgServiceLevel + m.serviceLevelPercentage : acc.avgServiceLevel,
    slCount: m.serviceLevelPercentage ? acc.slCount + 1 : acc.slCount,
    maxWait: Math.max(acc.maxWait, m.longestWaitSeconds || 0),
  }), {
    totalCalls: 0,
    totalAbandoned: 0,
    avgWait: 0,
    waitCount: 0,
    avgServiceLevel: 0,
    slCount: 0,
    maxWait: 0,
  });

  const selectedQueue = queues?.find(q => q.id === selectedQueueId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('analytics.queueMetrics', 'Queue Metrics')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t('analytics.queueMetricsDescription', 'Monitor queue performance and wait times')}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label={t('analytics.selectQueue', 'Select Queue')}
            value={selectedQueueId}
            onChange={(e) => setSelectedQueueId(e.target.value)}
            options={[
              { value: '', label: t('analytics.chooseQueue', 'Choose a queue...') },
              ...(queues?.map(q => ({ value: q.id, label: q.name })) || [])
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

      {selectedQueueId && selectedQueue && (
        <>
          {/* Queue Info */}
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <PhoneCall className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedQueue.name}</h2>
                {selectedQueue.description && (
                  <p className="text-gray-500 dark:text-gray-400">{selectedQueue.description}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <PhoneCall className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('analytics.totalCalls', 'Total Calls')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{summary?.totalCalls || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <PhoneMissed className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('analytics.abandoned', 'Abandoned')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{summary?.totalAbandoned || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('analytics.avgWait', 'Avg Wait')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {summary?.waitCount ? formatDuration(Math.round(summary.avgWait / summary.waitCount)) : '-'}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Timer className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('analytics.maxWait', 'Max Wait')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatDuration(summary?.maxWait)}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('analytics.serviceLevel', 'Avg SL')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {summary?.slCount ? `${(summary.avgServiceLevel / summary.slCount).toFixed(1)}%` : '-'}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('analytics.dataPoints', 'Data Points')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{metrics?.length || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Metrics Table */}
          <Card>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('analytics.historicalMetrics', 'Historical Metrics')}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('analytics.timestamp', 'Timestamp')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.waiting', 'Waiting')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.active', 'Active')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.available', 'Available')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.busy', 'Busy')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.avgWait', 'Avg Wait')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.longestWait', 'Longest')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.abandoned', 'Abandoned')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.sl', 'SL%')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        {t('common.loading', 'Loading...')}
                      </td>
                    </tr>
                  ) : metrics && metrics.length > 0 ? (
                    metrics.map((metric) => (
                      <tr key={metric.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(metric.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge variant={metric.waitingCalls > 5 ? 'warning' : 'default'}>
                            {metric.waitingCalls}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                          {metric.activeCalls}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-green-600">{metric.availableAgents}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-orange-600">{metric.busyAgents}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                          {formatDuration(metric.averageWaitSeconds)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm ${metric.longestWaitSeconds && metric.longestWaitSeconds > 120 ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
                            {formatDuration(metric.longestWaitSeconds)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm ${metric.abandonedCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {metric.abandonedCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-medium ${metric.serviceLevelPercentage && metric.serviceLevelPercentage >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {metric.serviceLevelPercentage?.toFixed(1) || '-'}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        {t('analytics.noMetricsFound', 'No metrics found for the selected period.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {!selectedQueueId && (
        <Card className="p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {t('analytics.selectQueueToView', 'Select a queue to view metrics')}
          </h3>
          <p className="mt-2 text-gray-500">
            {t('analytics.selectQueueDescription', 'Choose a queue from the dropdown above to see performance metrics.')}
          </p>
        </Card>
      )}
    </div>
  );
}
