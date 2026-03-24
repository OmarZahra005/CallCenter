import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import { Card, CardContent, CardHeader, Button, Badge, Select } from '../../../components/ui';
import { BarChart, LineChart, DonutChart, ProgressBar, MetricCard } from '../../../components/ui';

interface AgentPerformance {
  name: string;
  calls: number;
  avgHandleTime: number;
  csat: string;
  fcr: string;
}

const Reports = () => {
  const { t, i18n } = useTranslation();
  const [dateRange, setDateRange] = useState('7d');
  const [_selectedReport, _setSelectedReport] = useState<string | null>(null);
  void _selectedReport; // Available for future use
  void _setSelectedReport;

  // Fetch data for reports
  const { data: ticketsData } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await apiClient.get('/tickets');
      return response.data;
    },
  });

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await apiClient.get('/agents');
      return response.data;
    },
  });

  const tickets = Array.isArray(ticketsData) ? ticketsData : (ticketsData?.data || ticketsData?.items || []);
  const agents = Array.isArray(agentsData) ? agentsData : (agentsData?.data || agentsData?.items || []);

  // Chart data with translations
  const callVolumeData = [
    { label: t('reportsPage.mon'), value: 145 },
    { label: t('reportsPage.tue'), value: 189 },
    { label: t('reportsPage.wed'), value: 176 },
    { label: t('reportsPage.thu'), value: 198 },
    { label: t('reportsPage.fri'), value: 167 },
    { label: t('reportsPage.sat'), value: 89 },
    { label: t('reportsPage.sun'), value: 67 },
  ];

  const ticketsByStatus = [
    { label: t('reportsPage.new'), value: tickets.filter((t: { status: string }) => t.status === 'New').length, color: '#3b82f6' },
    { label: t('reportsPage.open'), value: tickets.filter((t: { status: string }) => t.status === 'Open').length, color: '#f59e0b' },
    { label: t('reportsPage.inProgress'), value: tickets.filter((t: { status: string }) => t.status === 'InProgress').length, color: '#8b5cf6' },
    { label: t('reportsPage.resolved'), value: tickets.filter((t: { status: string }) => t.status === 'Resolved').length, color: '#10b981' },
    { label: t('reportsPage.closed'), value: tickets.filter((t: { status: string }) => t.status === 'Closed').length, color: '#6b7280' },
  ];

  const ticketsByPriority = [
    { label: t('reportsPage.critical'), value: tickets.filter((t: { priority: string }) => t.priority === 'Critical').length, color: 'bg-red-500' },
    { label: t('reportsPage.high'), value: tickets.filter((t: { priority: string }) => t.priority === 'High').length, color: 'bg-orange-500' },
    { label: t('reportsPage.medium'), value: tickets.filter((t: { priority: string }) => t.priority === 'Medium').length, color: 'bg-yellow-500' },
    { label: t('reportsPage.low'), value: tickets.filter((t: { priority: string }) => t.priority === 'Low').length, color: 'bg-green-500' },
  ];

  const serviceLevelTrend = [
    { label: t('reportsPage.week', { number: 1 }), value: 85 },
    { label: t('reportsPage.week', { number: 2 }), value: 88 },
    { label: t('reportsPage.week', { number: 3 }), value: 82 },
    { label: t('reportsPage.week', { number: 4 }), value: 91 },
  ];

  const agentPerformance = agents.slice(0, 5).map((agent: { id: string; name: string }) => ({
    name: agent.name,
    calls: Math.floor(Math.random() * 50) + 20,
    avgHandleTime: Math.floor(Math.random() * 180) + 120,
    csat: (Math.random() * 1 + 4).toFixed(1),
    fcr: Math.floor(Math.random() * 20) + 70,
  }));

  const reportCategories = [
    { name: t('reportsPage.agentKpiSummary'), icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { name: t('reportsPage.queueAnalytics'), icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' },
    { name: t('reportsPage.csatOverview'), icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: t('reportsPage.slaPerformance'), icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="space-y-6" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('reportsPage.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('reportsPage.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-40"
          >
            <option value="1d">{t('reportsPage.today')}</option>
            <option value="7d">{t('reportsPage.last7Days')}</option>
            <option value="30d">{t('reportsPage.last30Days')}</option>
            <option value="90d">{t('reportsPage.last90Days')}</option>
          </Select>
          <Button variant="outline">
            <svg className="w-4 h-4 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('reportsPage.export')}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={t('reportsPage.totalCalls')}
          value="1,234"
          change={{ value: 12, type: 'increase' }}
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }
        />
        <MetricCard
          label={t('reportsPage.avgHandleTime')}
          value="2:45"
          change={{ value: 8, type: 'decrease' }}
          icon={
            <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          label={t('reportsPage.serviceLevel')}
          value="92%"
          change={{ value: 3, type: 'increase' }}
          icon={
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          label={t('reportsPage.avgCsat')}
          value="4.5"
          change={{ value: 5, type: 'increase' }}
          icon={
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Volume */}
        <Card variant="bordered">
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('reportsPage.callVolume')}</h3>
          </CardHeader>
          <CardContent>
            <BarChart data={callVolumeData} height={220} />
          </CardContent>
        </Card>

        {/* Tickets by Status */}
        <Card variant="bordered">
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('reportsPage.ticketsByStatus')}</h3>
          </CardHeader>
          <CardContent className="flex justify-center">
            <DonutChart data={ticketsByStatus} size={180} />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Level Trend */}
        <Card variant="bordered">
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('reportsPage.serviceLevelTrend')}</h3>
          </CardHeader>
          <CardContent>
            <LineChart data={serviceLevelTrend} height={200} color="#10b981" />
          </CardContent>
        </Card>

        {/* Tickets by Priority */}
        <Card variant="bordered">
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('reportsPage.ticketsByPriority')}</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketsByPriority.map((item) => (
                <ProgressBar
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  max={Math.max(...ticketsByPriority.map(p => p.value)) || 1}
                  color={item.color}
                  size="md"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance Table */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('reportsPage.agentPerformance')}</h3>
            <Button variant="outline" size="sm">{t('reportsPage.viewAll')}</Button>
          </div>
        </CardHeader>
        <CardContent>
          {agentPerformance.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('reportsPage.noAgentsFound')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-start py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('reportsPage.agent')}</th>
                    <th className="text-end py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('reportsPage.calls')}</th>
                    <th className="text-end py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('reportsPage.avgHandleTime')}</th>
                    <th className="text-end py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('reportsPage.csat')}</th>
                    <th className="text-end py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('reportsPage.fcr')}</th>
                  </tr>
                </thead>
                <tbody>
                  {agentPerformance.map((agent: AgentPerformance, index: number) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">{agent.name}</span>
                      </td>
                      <td className="py-3 px-4 text-end text-gray-700 dark:text-gray-300">{agent.calls}</td>
                      <td className="py-3 px-4 text-end text-gray-700 dark:text-gray-300">
                        {Math.floor(agent.avgHandleTime / 60)}:{(agent.avgHandleTime % 60).toString().padStart(2, '0')}
                      </td>
                      <td className="py-3 px-4 text-end">
                        <Badge variant={parseFloat(agent.csat) >= 4.5 ? 'success' : parseFloat(agent.csat) >= 4 ? 'warning' : 'danger'}>
                          {agent.csat}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <span className={parseFloat(agent.fcr.toString()) >= 80 ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}>
                          {agent.fcr}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Categories */}
      <Card variant="bordered">
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('reportsPage.availableReports')}</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportCategories.map((report) => (
              <button
                key={report.name}
                onClick={() => _setSelectedReport(report.name)}
                className="flex items-center gap-3 p-4 text-start bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={report.icon} />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
