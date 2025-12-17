import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button, Card, Badge, Select } from '../../../components/ui';
import apiClient from '../../../api/client';
import {
  Phone,
  Users,
  BarChart3,
  TrendingUp,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: number;
  dialingMode: number;
  totalRecords: number;
  pendingRecords: number;
  completedRecords: number;
  connectedCalls: number;
  totalAttempts: number;
  connectRate: number;
  completionRate: number;
}

interface CampaignStats {
  campaignId: string;
  campaignName: string;
  totalRecords: number;
  pendingRecords: number;
  dialedRecords: number;
  completedRecords: number;
  connectedCalls: number;
  totalAttempts: number;
  connectRate: number;
  completionRate: number;
  avgAttemptsPerRecord: number;
  totalConversions: number;
  conversionRate: number;
  avgCallDuration: string;
  totalTalkTime: string;
  recordsByStatus: Record<string, number>;
  attemptsByOutcome: Record<string, number>;
  hourlyDistribution: Record<number, number>;
  topDispositions: Array<{ disposition: string; count: number }>;
}

const dialingModes = ['Preview', 'Progressive', 'Power', 'Predictive'];
const campaignStatuses = ['Draft', 'Scheduled', 'Running', 'Paused', 'Completed', 'Cancelled'];

export function DialerAnalytics() {
  const { t } = useTranslation();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

  // Fetch all campaigns for summary
  const { data: campaigns, isLoading: campaignsLoading, refetch } = useQuery({
    queryKey: ['dialer-campaigns-analytics'],
    queryFn: async () => {
      const response = await apiClient.get('/dialer/campaigns', {
        params: { pageNumber: 1, pageSize: 100 }
      });
      return response.data.items as Campaign[];
    }
  });

  // Fetch specific campaign stats when selected
  const { data: campaignStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dialer-campaign-stats', selectedCampaignId],
    queryFn: async () => {
      if (!selectedCampaignId) return null;
      const response = await apiClient.get(`/dialer/campaigns/${selectedCampaignId}/stats`);
      return response.data as CampaignStats;
    },
    enabled: !!selectedCampaignId,
  });

  // Calculate aggregate stats
  const aggregateStats = campaigns ? {
    totalCampaigns: campaigns.length,
    runningCampaigns: campaigns.filter(c => c.status === 2).length,
    totalRecords: campaigns.reduce((sum, c) => sum + c.totalRecords, 0),
    totalAttempts: campaigns.reduce((sum, c) => sum + c.totalAttempts, 0),
    totalConnected: campaigns.reduce((sum, c) => sum + c.connectedCalls, 0),
    avgConnectRate: campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + c.connectRate, 0) / campaigns.length
      : 0,
    avgCompletionRate: campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + c.completionRate, 0) / campaigns.length
      : 0,
  } : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dialer.analytics', 'Dialer Analytics')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('dialer.analyticsDescription', 'Monitor campaign performance and agent productivity')}
          </p>
        </div>
        <Button variant="secondary" onClick={() => refetch()}>
          <RefreshCw className="h-5 w-5 mr-2" />
          {t('common.refresh', 'Refresh')}
        </Button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dialer.totalCampaigns', 'Total Campaigns')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {aggregateStats?.totalCampaigns || 0}
              </p>
              <p className="text-xs text-green-600">
                {aggregateStats?.runningCampaigns || 0} {t('dialer.running', 'running')}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dialer.totalRecords', 'Total Records')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {aggregateStats?.totalRecords?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dialer.totalAttempts', 'Total Attempts')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {aggregateStats?.totalAttempts?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-green-600">
                {aggregateStats?.totalConnected?.toLocaleString() || 0} {t('dialer.connected', 'connected')}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dialer.avgConnectRate', 'Avg Connect Rate')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {aggregateStats?.avgConnectRate?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Campaign Selector */}
      <Card className="p-4">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <Select
              label={t('dialer.selectCampaignAnalytics', 'Select Campaign for Detailed Analytics')}
              value={selectedCampaignId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCampaignId(e.target.value)}
              options={[
                { value: '', label: t('dialer.selectCampaignOption', 'Select a campaign...') },
                ...(campaigns?.map(c => ({
                  value: c.id,
                  label: `${c.name} (${campaignStatuses[c.status]} - ${dialingModes[c.dialingMode]})`
                })) || [])
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Detailed Campaign Stats */}
      {selectedCampaignId && (
        statsLoading ? (
          <Card className="p-8 text-center">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-gray-400" />
            <p className="mt-4 text-gray-500">{t('common.loading', 'Loading...')}</p>
          </Card>
        ) : campaignStats ? (
          <div className="space-y-6">
            {/* Campaign Summary */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">{campaignStats.campaignName}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{campaignStats.totalRecords}</p>
                  <p className="text-sm text-gray-500">{t('dialer.totalRecords', 'Total Records')}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{campaignStats.pendingRecords}</p>
                  <p className="text-sm text-gray-500">{t('dialer.pending', 'Pending')}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{campaignStats.dialedRecords}</p>
                  <p className="text-sm text-gray-500">{t('dialer.dialed', 'Dialed')}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{campaignStats.completedRecords}</p>
                  <p className="text-sm text-gray-500">{t('dialer.completed', 'Completed')}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{campaignStats.connectRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">{t('dialer.connectRate', 'Connect Rate')}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{campaignStats.completionRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">{t('dialer.completionRate', 'Completion Rate')}</p>
                </div>
              </div>
            </Card>

            {/* Conversion & Call Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-md font-semibold mb-4">{t('dialer.conversionStats', 'Conversion Stats')}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t('dialer.totalConversions', 'Total Conversions')}</span>
                    <span className="font-bold text-green-600">{campaignStats.totalConversions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t('dialer.conversionRate', 'Conversion Rate')}</span>
                    <span className="font-bold text-green-600">{campaignStats.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t('dialer.avgAttempts', 'Avg Attempts/Record')}</span>
                    <span className="font-bold">{campaignStats.avgAttemptsPerRecord.toFixed(1)}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-md font-semibold mb-4">{t('dialer.callStats', 'Call Stats')}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t('dialer.totalAttempts', 'Total Attempts')}</span>
                    <span className="font-bold">{campaignStats.totalAttempts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t('dialer.connectedCalls', 'Connected Calls')}</span>
                    <span className="font-bold text-green-600">{campaignStats.connectedCalls}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t('dialer.avgCallDuration', 'Avg Call Duration')}</span>
                    <span className="font-bold">{campaignStats.avgCallDuration || '0:00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t('dialer.totalTalkTime', 'Total Talk Time')}</span>
                    <span className="font-bold">{campaignStats.totalTalkTime || '0:00'}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Dispositions */}
            {campaignStats.topDispositions && campaignStats.topDispositions.length > 0 && (
              <Card className="p-6">
                <h3 className="text-md font-semibold mb-4">{t('dialer.topDispositions', 'Top Dispositions')}</h3>
                <div className="space-y-3">
                  {campaignStats.topDispositions.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-500 w-6">{index + 1}.</span>
                        <span className="font-medium">{item.disposition}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${campaignStats.totalAttempts > 0
                                ? (item.count / campaignStats.totalAttempts * 100)
                                : 0}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-12 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Hourly Distribution */}
            {campaignStats.hourlyDistribution && Object.keys(campaignStats.hourlyDistribution).length > 0 && (
              <Card className="p-6">
                <h3 className="text-md font-semibold mb-4">{t('dialer.hourlyDistribution', 'Hourly Call Distribution')}</h3>
                <div className="flex items-end space-x-1 h-32">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const count = campaignStats.hourlyDistribution[hour] || 0;
                    const maxCount = Math.max(...Object.values(campaignStats.hourlyDistribution), 1);
                    const heightPercent = (count / maxCount) * 100;
                    return (
                      <div key={hour} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-blue-500 dark:bg-blue-600 rounded-t transition-all"
                          style={{ height: `${heightPercent}%`, minHeight: count > 0 ? '4px' : '0' }}
                          title={`${hour}:00 - ${count} calls`}
                        />
                        {hour % 4 === 0 && (
                          <span className="text-xs text-gray-400 mt-1">{hour}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>12 AM</span>
                  <span>6 AM</span>
                  <span>12 PM</span>
                  <span>6 PM</span>
                  <span>12 AM</span>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <XCircle className="h-8 w-8 mx-auto text-gray-400" />
            <p className="mt-4 text-gray-500">{t('dialer.noStatsAvailable', 'No statistics available for this campaign')}</p>
          </Card>
        )
      )}

      {/* Campaign Performance Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t('dialer.campaignPerformance', 'Campaign Performance Overview')}</h2>
        {campaignsLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-gray-400" />
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b dark:border-gray-700">
                  <th className="pb-3 font-medium">{t('dialer.campaign', 'Campaign')}</th>
                  <th className="pb-3 font-medium">{t('dialer.status', 'Status')}</th>
                  <th className="pb-3 font-medium">{t('dialer.mode', 'Mode')}</th>
                  <th className="pb-3 font-medium text-right">{t('dialer.records', 'Records')}</th>
                  <th className="pb-3 font-medium text-right">{t('dialer.attempts', 'Attempts')}</th>
                  <th className="pb-3 font-medium text-right">{t('dialer.connects', 'Connects')}</th>
                  <th className="pb-3 font-medium text-right">{t('dialer.connectRate', 'Connect %')}</th>
                  <th className="pb-3 font-medium text-right">{t('dialer.completion', 'Completion')}</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => setSelectedCampaignId(campaign.id)}
                  >
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{campaign.name}</td>
                    <td className="py-3">
                      <Badge variant={campaign.status === 2 ? 'success' : campaign.status === 3 ? 'warning' : 'default'}>
                        {campaignStatuses[campaign.status]}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant="info">{dialingModes[campaign.dialingMode]}</Badge>
                    </td>
                    <td className="py-3 text-right">{campaign.totalRecords.toLocaleString()}</td>
                    <td className="py-3 text-right">{campaign.totalAttempts.toLocaleString()}</td>
                    <td className="py-3 text-right text-green-600">{campaign.connectedCalls.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className={campaign.connectRate >= 20 ? 'text-green-600' : campaign.connectRate >= 10 ? 'text-yellow-600' : 'text-red-600'}>
                        {campaign.connectRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${campaign.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm w-12 text-right">{campaign.completionRate.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {t('dialer.noCampaigns', 'No campaigns found')}
          </div>
        )}
      </Card>
    </div>
  );
}
