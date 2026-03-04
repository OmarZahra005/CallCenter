import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../utils/cn';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  trend?: number[];
  className?: string;
}

// Animated counter component
const AnimatedNumber = ({ value }: { value: number }) => {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => Math.round(current));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => setDisplayValue(v));
    return () => unsubscribe();
  }, [display]);

  return <>{displayValue}</>;
};

export const MetricCard = ({ label, value, change, icon, trend, className }: MetricCardProps) => {
  const numericValue = typeof value === 'number' ? value : parseInt(value.toString(), 10);
  const isNumeric = !isNaN(numericValue);

  return (
    <motion.div
      className={cn(
        'glass-card p-5 hover:scale-[1.02] transition-all duration-300',
        className
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {isNumeric ? <AnimatedNumber value={numericValue} /> : value}
          </p>
          {change && (
            <motion.div
              className={cn('flex items-center mt-2 text-sm', {
                'text-green-600 dark:text-green-400': change.type === 'increase',
                'text-red-600 dark:text-red-400': change.type === 'decrease',
                'text-gray-500 dark:text-gray-400': change.type === 'neutral',
              })}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {change.type === 'increase' && (
                <motion.svg
                  className="w-4 h-4 me-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </motion.svg>
              )}
              {change.type === 'decrease' && (
                <motion.svg
                  className="w-4 h-4 me-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ y: [0, 2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </motion.svg>
              )}
              <span>{Math.abs(change.value)}%</span>
            </motion.div>
          )}
        </div>
        {icon && (
          <motion.div
            className="p-3 rounded-xl glass-subtle"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {icon}
          </motion.div>
        )}
      </div>
      {trend && trend.length > 0 && (
        <div className="flex items-end gap-0.5 h-12">
          {trend.map((val, index) => (
            <motion.div
              key={index}
              className="flex-1 bg-primary-300/60 dark:bg-primary-700/60 rounded-t"
              initial={{ height: 0 }}
              animate={{ height: `${(val / Math.max(...trend)) * 100}%` }}
              transition={{ delay: 0.1 * index, duration: 0.4, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Queue monitor widget for supervisor dashboard
interface QueueMonitorProps {
  queues: Array<{
    id: string;
    name: string;
    waiting: number;
    avgWaitTime: number;
    serviceLevelPercent: number;
    agentsAvailable: number;
  }>;
  className?: string;
}

export const QueueMonitor = ({ queues, className }: QueueMonitorProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const getServiceLevelColor = (percent: number) => {
    if (percent >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-900/30';
    if (percent >= 60) return 'text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-900/30';
  };

  const getStatusBorderColor = (percent: number) => {
    if (percent >= 80) return isRTL ? 'border-r-emerald-500 border-r-4' : 'border-l-emerald-500 border-l-4';
    if (percent >= 60) return isRTL ? 'border-r-amber-500 border-r-4' : 'border-l-amber-500 border-l-4';
    return isRTL ? 'border-r-red-500 border-r-4' : 'border-l-red-500 border-l-4';
  };

  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('glass-card overflow-hidden', className)}>
      <div className="p-4 border-b border-white/20 dark:border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg glass-subtle">
            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('dashboard.queueMonitor')}</h3>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {queues.map((queue, index) => (
          <motion.div
            key={queue.id}
            className={cn(
              'p-4 rounded-xl glass-subtle transition-all duration-200 hover:scale-[1.01]',
              getStatusBorderColor(queue.serviceLevelPercent)
            )}
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-900 dark:text-white">{queue.name}</span>
              <motion.span
                className={cn('text-sm font-bold px-3 py-1 rounded-full', getServiceLevelColor(queue.serviceLevelPercent))}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1, type: 'spring', stiffness: 500 }}
              >
                {queue.serviceLevelPercent}%
              </motion.span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <span className="text-xs text-gray-500 dark:text-gray-400 block">{t('dashboard.waiting')}</span>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{queue.waiting}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <span className="text-xs text-gray-500 dark:text-gray-400 block">{t('dashboard.avgWait')}</span>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{formatWaitTime(queue.avgWaitTime)}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <span className="text-xs text-gray-500 dark:text-gray-400 block">{t('dashboard.available')}</span>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{queue.agentsAvailable}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {queues.length === 0 && (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {t('dashboard.noQueuesConfigured')}
          </div>
        )}
      </div>
    </div>
  );
};

// Agent status grid for supervisor
interface AgentStatusGridProps {
  agents: Array<{
    id: string;
    name: string;
    state: 'available' | 'busy' | 'break' | 'acw' | 'offline';
    duration?: number;
  }>;
  onAgentClick?: (agentId: string) => void;
  className?: string;
}

export const AgentStatusGrid = ({ agents, onAgentClick, className }: AgentStatusGridProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const stateColors = {
    available: `bg-emerald-100/70 dark:bg-emerald-900/40 ${isRTL ? 'border-r-emerald-500 border-r-4' : 'border-l-emerald-500 border-l-4'} hover:bg-emerald-100 dark:hover:bg-emerald-900/50`,
    busy: `bg-blue-100/70 dark:bg-blue-900/40 ${isRTL ? 'border-r-blue-500 border-r-4' : 'border-l-blue-500 border-l-4'} hover:bg-blue-100 dark:hover:bg-blue-900/50`,
    break: `bg-amber-100/70 dark:bg-amber-900/40 ${isRTL ? 'border-r-amber-500 border-r-4' : 'border-l-amber-500 border-l-4'} hover:bg-amber-100 dark:hover:bg-amber-900/50`,
    acw: `bg-purple-100/70 dark:bg-purple-900/40 ${isRTL ? 'border-r-purple-500 border-r-4' : 'border-l-purple-500 border-l-4'} hover:bg-purple-100 dark:hover:bg-purple-900/50`,
    offline: `bg-gray-100/70 dark:bg-gray-800/50 ${isRTL ? 'border-r-gray-400 border-r-4' : 'border-l-gray-400 border-l-4'} hover:bg-gray-100 dark:hover:bg-gray-800/70`,
  };

  const avatarBgColors = {
    available: 'bg-emerald-500 text-white',
    busy: 'bg-blue-500 text-white',
    break: 'bg-amber-500 text-white',
    acw: 'bg-purple-500 text-white',
    offline: 'bg-gray-400 text-white',
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2', className)}>
      {agents.map((agent, index) => (
        <motion.button
          key={agent.id}
          onClick={() => onAgentClick?.(agent.id)}
          className={cn(
            'p-2.5 rounded-xl backdrop-blur-sm transition-all duration-200',
            stateColors[agent.state]
          )}
          title={`${agent.name} - ${agent.state}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.02, duration: 0.2 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className={cn(
            'w-9 h-9 mx-auto rounded-full flex items-center justify-center text-sm font-bold shadow-sm',
            avatarBgColors[agent.state]
          )}>
            {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          {agent.duration !== undefined && (
            <p className="text-xs text-center mt-1.5 font-mono text-gray-600 dark:text-gray-400 font-medium">
              {formatDuration(agent.duration)}
            </p>
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default MetricCard;
