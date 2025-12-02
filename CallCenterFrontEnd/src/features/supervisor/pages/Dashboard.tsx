import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../../api/client';
import { Card, CardContent, Badge } from '../../../components/ui';
import { SkeletonCard, MetricCard, QueueMonitor, AgentStatusGrid } from '../../../components/ui';

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
      type: 'spring',
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
      type: 'spring',
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
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.dashboard')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of your call center performance
          </p>
        </div>
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
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <MetricCard
            label="Active Agents"
            value={activeAgents}
            change={{ value: 12, type: 'increase' }}
            icon={
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            trend={[5, 8, 12, 10, 15, 12, activeAgents]}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            label="Open Tickets"
            value={openTickets}
            change={{ value: 5, type: openTickets > 10 ? 'increase' : 'decrease' }}
            icon={
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            trend={[8, 12, 15, 10, 8, 6, openTickets]}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            label="Total Customers"
            value={totalCustomers}
            change={{ value: 8, type: 'increase' }}
            icon={
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            trend={[20, 35, 45, 50, 55, 60, totalCustomers]}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            label="Resolved Today"
            value={resolvedToday}
            change={{ value: 15, type: 'increase' }}
            icon={
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            trend={[2, 4, 3, 5, 8, 6, resolvedToday]}
          />
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
              <h3 className="font-semibold text-gray-900 dark:text-white">Agent Status Grid</h3>
            </div>
            <CardContent>
              {agentStatusData.length > 0 ? (
                <AgentStatusGrid
                  agents={agentStatusData}
                  onAgentClick={(id) => console.log('Agent clicked:', id)}
                />
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No agents found</p>
              )}
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-green-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Busy
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Break
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span> ACW
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span> Offline
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Agent states and Ticket priorities */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        {/* Agent states */}
        <motion.div variants={cardVariants}>
          <Card variant="bordered" className="h-full">
            <CardContent>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agent States</h2>
              <div className="space-y-4">
                {agentStates.map((item, index) => (
                  <motion.div
                    key={item.state}
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.count}</span>
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
              {agents.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No agents found</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* SLA Performance */}
        <motion.div variants={cardVariants}>
          <Card variant="bordered" className="h-full">
            <CardContent>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SLA Performance</h2>
              <div className="grid grid-cols-3 gap-3">
                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30"
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{Math.round(slaPerformance.onTrackPercent)}%</p>
                  <p className="text-xs font-medium text-emerald-700/70 dark:text-emerald-300/70 mt-1">On Track</p>
                </motion.div>
                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/30 dark:to-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30"
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{Math.round(slaPerformance.atRiskPercent)}%</p>
                  <p className="text-xs font-medium text-amber-700/70 dark:text-amber-300/70 mt-1">At Risk</p>
                </motion.div>
                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/30 dark:to-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30"
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{Math.round(slaPerformance.breachedPercent)}%</p>
                  <p className="text-xs font-medium text-red-700/70 dark:text-red-300/70 mt-1">Breached</p>
                </motion.div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-gray-600 dark:text-gray-400">Average Response Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.floor(slaPerformance.averageResponseTimeSeconds / 60)}m {slaPerformance.averageResponseTimeSeconds % 60}s
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-gray-600 dark:text-gray-400">Average Resolution Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.floor(slaPerformance.averageResolutionTimeSeconds / 60)}m {slaPerformance.averageResolutionTimeSeconds % 60}s
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-gray-600 dark:text-gray-400">First Contact Resolution</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{Math.round(slaPerformance.firstContactResolutionRate)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Tickets */}
      <motion.div variants={cardVariants}>
        <Card variant="bordered">
          <CardContent>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Tickets</h2>
            {recentTickets.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No tickets found</p>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket: { id: string; ticketNumber: string; subject: string; priority: string; status: string; createdAt: string }, index: number) => (
                  <motion.div
                    key={ticket.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
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
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{ticket.subject}</p>
                    </div>
                    <div className="text-end ms-4">
                      <Badge variant={ticket.status === 'New' ? 'info' : ticket.status === 'Resolved' ? 'success' : 'warning'}>
                        {ticket.status}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
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
