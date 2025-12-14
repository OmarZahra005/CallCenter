import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import apiClient from '../../../api/client';
import { Card, CardContent, Badge, DonutChart } from '../../../components/ui';
import { SkeletonCard, QueueMonitor, AgentStatusGrid } from '../../../components/ui';
import {
  Users,
  Ticket,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Activity,
  RefreshCw,
  LayoutDashboard,
  Headphones,
} from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    },
  },
};

const Dashboard = () => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard summary from API
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/summary');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch tickets for recent tickets list
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await apiClient.get('/tickets');
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Fetch agents for status grid
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await apiClient.get('/agents');
      return response.data;
    },
    refetchInterval: 30000,
  });

  const agents = Array.isArray(agentsData) ? agentsData : (agentsData?.data || agentsData?.items || []);
  const tickets = Array.isArray(ticketsData) ? ticketsData : (ticketsData?.data || ticketsData?.items || []);

  // Extract data from dashboard summary
  const activeAgents = dashboardData?.activeAgents ?? 0;
  const openTickets = dashboardData?.openTickets ?? 0;
  const totalCustomers = dashboardData?.totalCustomers ?? 0;
  const resolvedToday = dashboardData?.resolvedToday ?? 0;

  // Queue data from API
  const queues = (dashboardData?.queues ?? []).map((q: { id: string; name: string; waiting: number; avgWaitTime: number; serviceLevelPercent: number; agentsAvailable: number }) => ({
    id: q.id,
    name: q.name,
    waiting: q.waiting,
    avgWaitTime: q.avgWaitTime,
    serviceLevelPercent: q.serviceLevelPercent,
    agentsAvailable: q.agentsAvailable,
  }));

  // Map agents to status grid format
  const agentStatusData = agents.map((agent: { id: string; name: string; currentState?: string }) => ({
    id: agent.id,
    name: agent.name,
    state: (agent.currentState?.toLowerCase() || 'offline') as 'available' | 'busy' | 'break' | 'acw' | 'offline',
    duration: Math.floor(Math.random() * 600), // TODO: Track actual duration from backend
  }));

  // Agent state breakdown from API
  const stateColors: Record<string, string> = {
    'Available': 'bg-green-500',
    'Busy': 'bg-blue-500',
    'Break': 'bg-yellow-500',
    'ACW': 'bg-purple-500',
    'Offline': 'bg-gray-500',
  };

  const agentStates = (dashboardData?.agentStates ?? []).map((s: { state: string; count: number }) => ({
    state: t(`agentState.${s.state.toLowerCase()}`),
    count: s.count,
    color: stateColors[s.state] || 'bg-gray-500',
  }));

  // SLA Performance from API
  const slaPerformance = dashboardData?.slaPerformance ?? {
    onTrackPercent: 85,
    atRiskPercent: 10,
    breachedPercent: 5,
    averageResponseTimeSeconds: 165,
    averageResolutionTimeSeconds: 930,
    firstContactResolutionRate: 78,
  };

  // Recent tickets
  const recentTickets = tickets
    .sort((a: { createdAt: string }, b: { createdAt: string }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const isLoading = dashboardLoading || ticketsLoading || agentsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.dashboard')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of your call center performance
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Page header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/20">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.dashboard')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real-time call center performance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => {
              // Trigger refetch
              window.location.reload();
            }}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
          <motion.div
            className="text-end bg-white dark:bg-gray-800 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Time</p>
            <p className="text-xl font-mono font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              {currentTime.toLocaleTimeString()}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Key Metrics - Color-coded KPI Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        {/* Active Agents - Blue */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border-l-4 border-l-blue-500 border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Agents</p>
                <motion.p
                  className="mt-2 text-3xl font-bold text-gray-900 dark:text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {activeAgents}
                </motion.p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">+12%</span>
                  <span className="text-gray-400">vs last hour</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Headphones className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            {/* Mini sparkline */}
            <div className="mt-4 flex items-end gap-1 h-8">
              {[5, 8, 12, 10, 15, 12, activeAgents].map((v, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-t"
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / Math.max(...[5, 8, 12, 10, 15, 12, activeAgents])) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Open Tickets - Amber */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border-l-4 border-l-amber-500 border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Tickets</p>
                <motion.p
                  className="mt-2 text-3xl font-bold text-gray-900 dark:text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {openTickets}
                </motion.p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  {openTickets > 10 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-red-500" />
                      <span className="text-red-600 dark:text-red-400 font-medium">+5%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-medium">-5%</span>
                    </>
                  )}
                  <span className="text-gray-400">vs last hour</span>
                </div>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <Ticket className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-4 flex items-end gap-1 h-8">
              {[8, 12, 15, 10, 8, 6, openTickets].map((v, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-amber-200 dark:bg-amber-800 rounded-t"
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / Math.max(...[8, 12, 15, 10, 8, 6, openTickets])) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Total Customers - Purple */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border-l-4 border-l-purple-500 border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Customers</p>
                <motion.p
                  className="mt-2 text-3xl font-bold text-gray-900 dark:text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {totalCustomers}
                </motion.p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">+8%</span>
                  <span className="text-gray-400">this week</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-end gap-1 h-8">
              {[20, 35, 45, 50, 55, 60, totalCustomers].map((v, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-purple-200 dark:bg-purple-800 rounded-t"
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / Math.max(...[20, 35, 45, 50, 55, 60, totalCustomers])) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Resolved Today - Emerald */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border-l-4 border-l-emerald-500 border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved Today</p>
                <motion.p
                  className="mt-2 text-3xl font-bold text-gray-900 dark:text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {resolvedToday}
                </motion.p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">+15%</span>
                  <span className="text-gray-400">vs yesterday</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-end gap-1 h-8">
              {[2, 4, 3, 5, 8, 6, resolvedToday].map((v, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-emerald-200 dark:bg-emerald-800 rounded-t"
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / Math.max(...[2, 4, 3, 5, 8, 6, resolvedToday])) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Queue Monitor and Agent Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        <motion.div variants={cardVariants}>
          <QueueMonitor queues={queues} />
        </motion.div>

        {/* Agent Status Grid */}
        <motion.div variants={cardVariants}>
          <Card variant="bordered" className="overflow-hidden h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Agent Status Grid</h3>
                </div>
                <Badge variant="default" size="sm">{agentStatusData.length} agents</Badge>
              </div>
              {/* Status summary badges */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Available ({agentStatusData.filter((a: { state: string }) => a.state === 'available').length})
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Busy ({agentStatusData.filter((a: { state: string }) => a.state === 'busy').length})
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  Break ({agentStatusData.filter((a: { state: string }) => a.state === 'break').length})
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-full">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  ACW ({agentStatusData.filter((a: { state: string }) => a.state === 'acw').length})
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  Offline ({agentStatusData.filter((a: { state: string }) => a.state === 'offline').length})
                </span>
              </div>
            </div>
            <CardContent>
              {agentStatusData.length > 0 ? (
                <AgentStatusGrid
                  agents={agentStatusData}
                  onAgentClick={(id) => console.log('Agent clicked:', id)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-12 h-12 mb-2 opacity-50" />
                  <p>No agents found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Agent states and SLA Performance */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        {/* Agent states with DonutChart */}
        <motion.div variants={cardVariants}>
          <Card variant="bordered" className="h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Agent Distribution</h2>
              </div>
            </div>
            <CardContent>
              <div className="flex items-center gap-6">
                {/* DonutChart */}
                <div className="flex-shrink-0">
                  <DonutChart
                    data={[
                      { label: 'Available', value: agentStatusData.filter((a: { state: string }) => a.state === 'available').length, color: '#22c55e' },
                      { label: 'Busy', value: agentStatusData.filter((a: { state: string }) => a.state === 'busy').length, color: '#3b82f6' },
                      { label: 'Break', value: agentStatusData.filter((a: { state: string }) => a.state === 'break').length, color: '#eab308' },
                      { label: 'ACW', value: agentStatusData.filter((a: { state: string }) => a.state === 'acw').length, color: '#a855f7' },
                      { label: 'Offline', value: agentStatusData.filter((a: { state: string }) => a.state === 'offline').length, color: '#9ca3af' },
                    ]}
                    size={140}
                    thickness={24}
                    showLegend={false}
                  />
                </div>
                {/* Legend with progress bars */}
                <div className="flex-1 space-y-3">
                  {agentStates.map((item: { state: string; count: number; color: string }, index: number) => (
                    <motion.div
                      key={item.state}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.color}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.state}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${item.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${agents.length ? (item.count / agents.length) * 100 : 0}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.5, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              {agents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-12 h-12 mb-2 opacity-50" />
                  <p>No agents found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* SLA Performance with DonutChart */}
        <motion.div variants={cardVariants}>
          <Card variant="bordered" className="h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SLA Performance</h2>
              </div>
            </div>
            <CardContent>
              <div className="flex items-start gap-6">
                {/* SLA DonutChart */}
                <div className="flex-shrink-0">
                  <DonutChart
                    data={[
                      { label: 'On Track', value: Math.round(slaPerformance.onTrackPercent), color: '#10b981' },
                      { label: 'At Risk', value: Math.round(slaPerformance.atRiskPercent), color: '#f59e0b' },
                      { label: 'Breached', value: Math.round(slaPerformance.breachedPercent), color: '#ef4444' },
                    ]}
                    size={140}
                    thickness={24}
                    showLegend={false}
                  />
                </div>
                {/* SLA Status Cards */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div className="flex-1">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">On Track</p>
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{Math.round(slaPerformance.onTrackPercent)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <div className="flex-1">
                      <p className="text-xs text-amber-600 dark:text-amber-400">At Risk</p>
                      <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{Math.round(slaPerformance.atRiskPercent)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <div className="flex-1">
                      <p className="text-xs text-red-600 dark:text-red-400">Breached</p>
                      <p className="text-lg font-bold text-red-700 dark:text-red-300">{Math.round(slaPerformance.breachedPercent)}%</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* SLA Metrics */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">Avg Response</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {Math.floor(slaPerformance.averageResponseTimeSeconds / 60)}:{String(slaPerformance.averageResponseTimeSeconds % 60).padStart(2, '0')}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">Avg Resolution</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {Math.floor(slaPerformance.averageResolutionTimeSeconds / 60)}:{String(slaPerformance.averageResolutionTimeSeconds % 60).padStart(2, '0')}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                    <Target className="w-3.5 h-3.5" />
                    <span className="text-xs">FCR Rate</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {Math.round(slaPerformance.firstContactResolutionRate)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Tickets */}
      <motion.div variants={cardVariants}>
        <Card variant="bordered">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tickets</h2>
              </div>
              <Badge variant="default" size="sm">{recentTickets.length} tickets</Badge>
            </div>
          </div>
          <CardContent>
            {recentTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                <Ticket className="w-12 h-12 mb-2 opacity-50" />
                <p>No tickets found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket: { id: string; ticketNumber: string; subject: string; priority: string; status: string; createdAt: string }, index: number) => (
                  <motion.div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{ticket.ticketNumber}</span>
                        <Badge
                          variant={ticket.priority === 'Critical' || ticket.priority === 'High' ? 'danger' : ticket.priority === 'Medium' ? 'warning' : 'default'}
                          size="sm"
                        >
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{ticket.subject}</p>
                    </div>
                    <div className="text-end ms-4 flex-shrink-0">
                      <Badge variant={ticket.status === 'New' ? 'info' : ticket.status === 'Resolved' ? 'success' : 'warning'}>
                        {ticket.status}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
