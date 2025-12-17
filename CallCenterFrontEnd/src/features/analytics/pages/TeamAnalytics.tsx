import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Select } from '../../../components/ui';
import apiClient from '../../../api/client';
import {
  ArrowLeft,
  Users,
  Phone,
  Clock,
  CheckCircle,
  TrendingUp,
  ThumbsUp,
  Target,
  Calendar,
  Building2,
} from 'lucide-react';

interface TeamKpi {
  id: string;
  teamId: string;
  teamName: string;
  date: string;
  totalCalls: number;
  totalTicketsResolved: number;
  averageAhtSeconds?: number;
  averageAsaSeconds?: number;
  serviceLevelPercentage?: number;
  fcrRate?: number;
  customerSatisfactionScore?: number;
  slaCompliancePercentage?: number;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
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

export function TeamAnalytics() {
  const { t } = useTranslation();
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [selectedTeamId, setSelectedTeamId] = useState(teamId || '');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  // Fetch teams list
  const { data: teams } = useQuery({
    queryKey: ['teams-list'],
    queryFn: async () => {
      const response = await apiClient.get('/teams', {
        params: { pageNumber: 1, pageSize: 100 }
      });
      return response.data.items as Team[];
    }
  });

  // Fetch KPIs
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['team-kpis', selectedTeamId, dateRange],
    queryFn: async () => {
      if (!selectedTeamId) return [];
      const response = await apiClient.get(`/analytics/teams/${selectedTeamId}/kpis`, {
        params: { from: dateRange.from, to: dateRange.to }
      });
      return response.data as TeamKpi[];
    },
    enabled: !!selectedTeamId
  });

  // Calculate aggregates
  const aggregates = kpis?.reduce((acc, kpi) => ({
    totalCalls: acc.totalCalls + kpi.totalCalls,
    totalResolved: acc.totalResolved + kpi.totalTicketsResolved,
    avgAht: kpi.averageAhtSeconds ? acc.avgAht + kpi.averageAhtSeconds : acc.avgAht,
    ahtCount: kpi.averageAhtSeconds ? acc.ahtCount + 1 : acc.ahtCount,
    avgSl: kpi.serviceLevelPercentage ? acc.avgSl + kpi.serviceLevelPercentage : acc.avgSl,
    slCount: kpi.serviceLevelPercentage ? acc.slCount + 1 : acc.slCount,
    avgFcr: kpi.fcrRate ? acc.avgFcr + kpi.fcrRate : acc.avgFcr,
    fcrCount: kpi.fcrRate ? acc.fcrCount + 1 : acc.fcrCount,
    avgCsat: kpi.customerSatisfactionScore ? acc.avgCsat + kpi.customerSatisfactionScore : acc.avgCsat,
    csatCount: kpi.customerSatisfactionScore ? acc.csatCount + 1 : acc.csatCount,
    avgSla: kpi.slaCompliancePercentage ? acc.avgSla + kpi.slaCompliancePercentage : acc.avgSla,
    slaCount: kpi.slaCompliancePercentage ? acc.slaCount + 1 : acc.slaCount,
  }), {
    totalCalls: 0,
    totalResolved: 0,
    avgAht: 0,
    ahtCount: 0,
    avgSl: 0,
    slCount: 0,
    avgFcr: 0,
    fcrCount: 0,
    avgCsat: 0,
    csatCount: 0,
    avgSla: 0,
    slaCount: 0,
  });

  const selectedTeam = teams?.find(t => t.id === selectedTeamId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('analytics.teamAnalytics', 'Team Analytics')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t('analytics.teamAnalyticsDescription', 'View team performance metrics and trends')}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label={t('analytics.selectTeam', 'Select Team')}
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            options={[
              { value: '', label: t('analytics.chooseTeam', 'Choose a team...') },
              ...(teams?.map(t => ({ value: t.id, label: t.name })) || [])
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

      {selectedTeamId && selectedTeam && (
        <>
          {/* Team Info */}
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTeam.name}</h2>
                {selectedTeam.description && (
                  <p className="text-gray-500 dark:text-gray-400">{selectedTeam.description}</p>
                )}
              </div>
              {selectedTeam.memberCount && (
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{selectedTeam.memberCount} members</span>
                </div>
              )}
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
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('analytics.resolved', 'Resolved')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{aggregates?.totalResolved || 0}</p>
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
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('analytics.avgSl', 'Avg SL')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {aggregates?.slCount ? `${(aggregates.avgSl / aggregates.slCount).toFixed(1)}%` : '-'}
                  </p>
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
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{t('analytics.slaCompliance', 'SLA')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {aggregates?.slaCount ? `${(aggregates.avgSla / aggregates.slaCount).toFixed(1)}%` : '-'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Daily KPIs Table */}
          <Card>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('analytics.dailyTeamKpis', 'Daily Team KPIs')}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('analytics.date', 'Date')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.calls', 'Calls')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.resolved', 'Resolved')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.aht', 'AHT')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.asa', 'ASA')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.sl', 'SL%')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.fcr', 'FCR')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.csat', 'CSAT')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('analytics.sla', 'SLA')}</th>
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
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {kpi.totalTicketsResolved}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {formatDuration(kpi.averageAhtSeconds)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {formatDuration(kpi.averageAsaSeconds)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-medium ${kpi.serviceLevelPercentage && kpi.serviceLevelPercentage >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {formatPercent(kpi.serviceLevelPercentage)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm ${kpi.fcrRate && kpi.fcrRate >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {formatPercent(kpi.fcrRate)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm ${kpi.customerSatisfactionScore && kpi.customerSatisfactionScore >= 4 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {kpi.customerSatisfactionScore?.toFixed(1) || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm ${kpi.slaCompliancePercentage && kpi.slaCompliancePercentage >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {formatPercent(kpi.slaCompliancePercentage)}
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

      {!selectedTeamId && (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {t('analytics.selectTeamToView', 'Select a team to view analytics')}
          </h3>
          <p className="mt-2 text-gray-500">
            {t('analytics.selectTeamDescription', 'Choose a team from the dropdown above to see performance metrics.')}
          </p>
        </Card>
      )}
    </div>
  );
}
