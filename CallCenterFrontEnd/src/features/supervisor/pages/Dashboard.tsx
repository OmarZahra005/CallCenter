import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import apiClient from '../../../api/client';
import { Badge, SparklineArea, GlassDonutChart } from '../../../components/ui';
import { QueueMonitor, AgentStatusGrid } from '../../../components/ui';
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
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const isRTL = i18n.language === 'ar';

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard summary from API
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/summary');
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Fetch tickets for recent tickets list
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['dashboard-tickets'],
    queryFn: async () => {
      const response = await apiClient.get('/tickets', {
        params: { pageSize: 5, sortBy: 'createdAt', sortOrder: 'desc' }
      });
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

  const agents = useMemo(() =>
    Array.isArray(agentsData) ? agentsData : (agentsData?.data || agentsData?.items || []),
    [agentsData]
  );
  const tickets = useMemo(() =>
    Array.isArray(ticketsData) ? ticketsData : (ticketsData?.data || ticketsData?.items || []),
    [ticketsData]
  );

  // Extract data from dashboard summary
  const activeAgents = dashboardData?.activeAgents ?? 0;
  const openTickets = dashboardData?.openTickets ?? 0;
  const totalCustomers = dashboardData?.totalCustomers ?? 0;
  const resolvedToday = dashboardData?.resolvedToday ?? 0;

  // Queue data from API
  const queues = useMemo(() =>
    (dashboardData?.queues ?? []).map((q: { id: string; name: string; waiting: number; avgWaitTime: number; serviceLevelPercent: number; agentsAvailable: number }) => ({
      id: q.id,
      name: q.name,
      waiting: q.waiting,
      avgWaitTime: q.avgWaitTime,
      serviceLevelPercent: q.serviceLevelPercent,
      agentsAvailable: q.agentsAvailable,
    })),
    [dashboardData?.queues]
  );

  // Map agents to status grid format
  const agentStatusData = useMemo(() => {
    const now = Date.now();
    return agents.map((agent: { id: string; name: string; currentState?: string; stateChangedAt?: string }) => {
      let duration = 0;
      if (agent.stateChangedAt) {
        duration = Math.floor((now - new Date(agent.stateChangedAt).getTime()) / 1000);
      }
      return {
        id: agent.id,
        name: agent.name,
        state: (agent.currentState?.toLowerCase() || 'offline') as 'available' | 'busy' | 'break' | 'acw' | 'offline',
        duration,
      };
    });
  }, [agents]);

  // Memoize agent counts
  const agentCounts = useMemo(() => ({
    available: agentStatusData.filter((a: { state: string }) => a.state === 'available').length,
    busy: agentStatusData.filter((a: { state: string }) => a.state === 'busy').length,
    break: agentStatusData.filter((a: { state: string }) => a.state === 'break').length,
    acw: agentStatusData.filter((a: { state: string }) => a.state === 'acw').length,
    offline: agentStatusData.filter((a: { state: string }) => a.state === 'offline').length,
  }), [agentStatusData]);

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
  const recentTickets = useMemo(() => tickets.slice(0, 5), [tickets]);

  // Memoized callback for agent click
  const handleAgentClick = useCallback((id: string) => {
    console.log('Agent clicked:', id);
  }, []);

  const isLoading = dashboardLoading || ticketsLoading || agentsLoading;

  // Sparkline data for KPI cards
  const sparklineData = {
    agents: [5, 8, 12, 10, 15, 12, activeAgents || 8],
    tickets: [8, 12, 15, 10, 8, 6, openTickets || 5],
    customers: [20, 35, 45, 50, 55, 60, totalCustomers || 65],
    resolved: [2, 4, 3, 5, 8, 6, resolvedToday || 7],
  };

  // Format date based on locale
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen dashboard-glass-bg flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Animated Logo/Spinner */}
          <div className="relative">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-xl shadow-primary-500/30 flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <LayoutDashboard className="w-10 h-10 text-white" />
            </motion.div>
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-primary-500/50"
              animate={{
                scale: [1, 1.3, 1.3],
                opacity: [0.5, 0, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          </div>

          {/* Loading text */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('dashboard.title')}
            </h2>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <motion.div
                className="flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary-500"
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
              <span className="text-sm">{t('common.loading')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen dashboard-glass-bg"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="p-6 space-y-6">
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => window.location.reload()}
              className="p-2.5 glass-card text-gray-500 hover:text-primary-600 transition-colors"
              whileHover={{ rotate: isRTL ? -180 : 180 }}
              transition={{ duration: 0.3 }}
              title={t('dashboard.refreshData')}
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
            <motion.div
              className="glass-card px-4 py-3"
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('dashboard.currentTime')}</p>
              <p className="text-xl font-mono font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                {currentTime.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US')}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-4 auto-rows-[minmax(140px,auto)]">
          {/* KPI Cards Row - 4 cards */}
          {/* Active Agents - Blue */}
          <motion.div variants={itemVariants} className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="glass-card p-5 h-full hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.activeAgents')}</p>
                  <motion.p
                    className="mt-1 text-3xl font-bold text-gray-900 dark:text-white"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {activeAgents}
                  </motion.p>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">+12%</span>
                    <span className="text-gray-400 text-xs">{t('dashboard.vsLastHour')}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl glass-subtle bg-blue-100/50 dark:bg-blue-900/30">
                  <Headphones className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <SparklineArea data={sparklineData.agents} color="blue" height={48} />
            </div>
          </motion.div>

          {/* Open Tickets - Amber */}
          <motion.div variants={itemVariants} className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="glass-card p-5 h-full hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.openTickets')}</p>
                  <motion.p
                    className="mt-1 text-3xl font-bold text-gray-900 dark:text-white"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {openTickets}
                  </motion.p>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    {openTickets > 10 ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-red-500" />
                        <span className="text-red-600 dark:text-red-400 font-medium">+5%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">-5%</span>
                      </>
                    )}
                    <span className="text-gray-400 text-xs">{t('dashboard.vsLastHour')}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl glass-subtle bg-amber-100/50 dark:bg-amber-900/30">
                  <Ticket className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <SparklineArea data={sparklineData.tickets} color="amber" height={48} />
            </div>
          </motion.div>

          {/* Total Customers - Purple */}
          <motion.div variants={itemVariants} className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="glass-card p-5 h-full hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.totalCustomers')}</p>
                  <motion.p
                    className="mt-1 text-3xl font-bold text-gray-900 dark:text-white"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {totalCustomers}
                  </motion.p>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">+8%</span>
                    <span className="text-gray-400 text-xs">{t('dashboard.thisWeek')}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl glass-subtle bg-purple-100/50 dark:bg-purple-900/30">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <SparklineArea data={sparklineData.customers} color="purple" height={48} />
            </div>
          </motion.div>

          {/* Resolved Today - Emerald */}
          <motion.div variants={itemVariants} className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="glass-card p-5 h-full hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.resolvedToday')}</p>
                  <motion.p
                    className="mt-1 text-3xl font-bold text-gray-900 dark:text-white"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {resolvedToday}
                  </motion.p>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">+15%</span>
                    <span className="text-gray-400 text-xs">{t('dashboard.vsYesterday')}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl glass-subtle bg-emerald-100/50 dark:bg-emerald-900/30">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <SparklineArea data={sparklineData.resolved} color="emerald" height={48} />
            </div>
          </motion.div>

          {/* Queue Monitor - Large card spanning 2 rows */}
          <motion.div variants={itemVariants} className="col-span-12 lg:col-span-6 row-span-2">
            <QueueMonitor queues={queues} className="h-full" />
          </motion.div>

          {/* Agent Status Grid - Large card spanning 2 rows */}
          <motion.div variants={itemVariants} className="col-span-12 lg:col-span-6 row-span-2">
            <div className="glass-card overflow-hidden h-full flex flex-col">
              <div className="p-4 border-b border-white/20 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg glass-subtle">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('dashboard.agentStatusGrid')}</h3>
                  </div>
                  <Badge variant="default" size="sm">{t('dashboard.agentsCount', { count: agentStatusData.length })}</Badge>
                </div>
                {/* Status summary badges */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {t('agentState.available')} ({agentCounts.available})
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {t('agentState.busy')} ({agentCounts.busy})
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/70 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {t('agentState.break')} ({agentCounts.break})
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100/70 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-full backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    {t('agentState.acw')} ({agentCounts.acw})
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100/70 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    {t('agentState.offline')} ({agentCounts.offline})
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 overflow-auto">
                {agentStatusData.length > 0 ? (
                  <AgentStatusGrid
                    agents={agentStatusData}
                    onAgentClick={handleAgentClick}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mb-2 opacity-50" />
                    <p>{t('dashboard.noAgentsFound')}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Agent Distribution - Medium card */}
          <motion.div variants={itemVariants} className="col-span-12 md:col-span-6 lg:col-span-4">
            <div className="glass-card h-full">
              <div className="p-4 border-b border-white/20 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg glass-subtle">
                    <Activity className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{t('dashboard.agentDistribution')}</h2>
                </div>
              </div>
              <div className="p-4">
                {agents.length > 0 ? (
                  <GlassDonutChart
                    data={[
                      { label: t('agentState.available'), value: agentCounts.available, color: '#10b981' },
                      { label: t('agentState.busy'), value: agentCounts.busy, color: '#3b82f6' },
                      { label: t('agentState.break'), value: agentCounts.break, color: '#f59e0b' },
                      { label: t('agentState.acw'), value: agentCounts.acw, color: '#a855f7' },
                      { label: t('agentState.offline'), value: agentCounts.offline, color: '#9ca3af' },
                    ]}
                    size={140}
                    thickness={24}
                    centerValue={agents.length}
                    centerLabel={t('common.total')}
                    showLegend={false}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mb-2 opacity-50" />
                    <p>{t('dashboard.noAgentsFound')}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* SLA Performance - Medium card */}
          <motion.div variants={itemVariants} className="col-span-12 md:col-span-6 lg:col-span-4">
            <div className="glass-card h-full">
              <div className="p-4 border-b border-white/20 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg glass-subtle">
                    <Target className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{t('dashboard.slaPerformance')}</h2>
                </div>
              </div>
              <div className="p-4">
                <GlassDonutChart
                  data={[
                    { label: t('dashboard.onTrack'), value: Math.round(slaPerformance.onTrackPercent), color: '#10b981' },
                    { label: t('dashboard.atRisk'), value: Math.round(slaPerformance.atRiskPercent), color: '#f59e0b' },
                    { label: t('dashboard.breached'), value: Math.round(slaPerformance.breachedPercent), color: '#ef4444' },
                  ]}
                  size={140}
                  thickness={24}
                  centerValue={`${Math.round(slaPerformance.onTrackPercent)}%`}
                  centerLabel={t('dashboard.onTrack')}
                  showLegend={false}
                />
                {/* SLA Status Cards */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl glass-subtle bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-300 flex-1">{t('dashboard.onTrack')}</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">{Math.round(slaPerformance.onTrackPercent)}%</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl glass-subtle bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm text-amber-700 dark:text-amber-300 flex-1">{t('dashboard.atRisk')}</span>
                    <span className="font-bold text-amber-700 dark:text-amber-300">{Math.round(slaPerformance.atRiskPercent)}%</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl glass-subtle bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-700 dark:text-red-300 flex-1">{t('dashboard.breached')}</span>
                    <span className="font-bold text-red-700 dark:text-red-300">{Math.round(slaPerformance.breachedPercent)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Tickets - Large card */}
          <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4">
            <div className="glass-card h-full">
              <div className="p-4 border-b border-white/20 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg glass-subtle">
                      <Ticket className="w-5 h-5 text-primary-600" />
                    </div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">{t('dashboard.recentTickets')}</h2>
                  </div>
                  <Badge variant="default" size="sm">{t('dashboard.ticketsCount', { count: recentTickets.length })}</Badge>
                </div>
              </div>
              <div className="p-3">
                {recentTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                    <Ticket className="w-12 h-12 mb-2 opacity-50" />
                    <p>{t('dashboard.noTicketsFound')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentTickets.map((ticket: { id: string; ticketNumber: string; subject: string; priority: string; status: string; createdAt: string }, index: number) => (
                      <motion.div
                        key={ticket.id}
                        className="p-3 rounded-xl glass-subtle hover:scale-[1.01] transition-all duration-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white text-sm">{ticket.ticketNumber}</span>
                            <Badge
                              variant={ticket.priority === 'Critical' || ticket.priority === 'High' ? 'danger' : ticket.priority === 'Medium' ? 'warning' : 'default'}
                              size="sm"
                            >
                              {t(`priority.${ticket.priority.toLowerCase()}`)}
                            </Badge>
                          </div>
                          <Badge variant={ticket.status === 'New' ? 'info' : ticket.status === 'Resolved' ? 'success' : 'warning'} size="sm">
                            {t(`ticketStatus.${ticket.status.toLowerCase().replace(' ', '')}`)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ticket.subject}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(ticket.createdAt)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* SLA Metrics - Full width bottom row */}
          <motion.div variants={itemVariants} className="col-span-12">
            <div className="glass-card p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl glass-subtle">
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('dashboard.avgResponseTime')}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.floor(slaPerformance.averageResponseTimeSeconds / 60)}:{String(slaPerformance.averageResponseTimeSeconds % 60).padStart(2, '0')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{t('dashboard.minutes')}</p>
                </div>
                <div className="text-center p-4 rounded-xl glass-subtle">
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('dashboard.avgResolutionTime')}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.floor(slaPerformance.averageResolutionTimeSeconds / 60)}:{String(slaPerformance.averageResolutionTimeSeconds % 60).padStart(2, '0')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{t('dashboard.minutes')}</p>
                </div>
                <div className="text-center p-4 rounded-xl glass-subtle">
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <Target className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('dashboard.firstContactResolution')}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(slaPerformance.firstContactResolutionRate)}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{t('dashboard.fcrRate')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
