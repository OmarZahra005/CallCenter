import { useEffect, useState } from 'react';
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
        'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4',
        'hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300',
        className
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {isNumeric ? <AnimatedNumber value={numericValue} /> : value}
          </p>
          {change && (
            <motion.div
              className={cn('flex items-center mt-1 text-sm', {
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
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {icon}
          </motion.div>
        )}
      </div>
      {trend && trend.length > 0 && (
        <div className="mt-3 flex items-end gap-0.5 h-8">
          {trend.map((val, index) => (
            <motion.div
              key={index}
              className="flex-1 bg-primary-200 dark:bg-primary-800 rounded-t"
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
  const getServiceLevelColor = (percent: number) => {
    if (percent >= 80) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (percent >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  };

  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700', className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Queue Monitor</h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {queues.map((queue, index) => (
          <motion.div
            key={queue.id}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-white">{queue.name}</span>
              <motion.span
                className={cn('text-sm font-semibold px-2 py-0.5 rounded', getServiceLevelColor(queue.serviceLevelPercent))}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1, type: 'spring', stiffness: 500 }}
              >
                {queue.serviceLevelPercent}%
              </motion.span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Waiting</span>
                <p className="font-semibold text-gray-900 dark:text-white">{queue.waiting}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Avg Wait</span>
                <p className="font-semibold text-gray-900 dark:text-white">{formatWaitTime(queue.avgWaitTime)}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Available</span>
                <p className="font-semibold text-gray-900 dark:text-white">{queue.agentsAvailable}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {queues.length === 0 && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No queues configured
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
  const stateColors = {
    available: 'bg-green-100 dark:bg-green-900/30 border-green-500',
    busy: 'bg-blue-100 dark:bg-blue-900/30 border-blue-500',
    break: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500',
    acw: 'bg-purple-100 dark:bg-purple-900/30 border-purple-500',
    offline: 'bg-gray-100 dark:bg-gray-800 border-gray-400',
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2', className)}>
      {agents.map((agent, index) => (
        <motion.button
          key={agent.id}
          onClick={() => onAgentClick?.(agent.id)}
          className={cn(
            'p-2 rounded-lg border-l-4 transition-colors',
            stateColors[agent.state]
          )}
          title={`${agent.name} - ${agent.state}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.02, duration: 0.2 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-8 h-8 mx-auto rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-sm font-medium">
            {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          {agent.duration !== undefined && (
            <p className="text-xs text-center mt-1 font-mono text-gray-600 dark:text-gray-400">
              {formatDuration(agent.duration)}
            </p>
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default MetricCard;
