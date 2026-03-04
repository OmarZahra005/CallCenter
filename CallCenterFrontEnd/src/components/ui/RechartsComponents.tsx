import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

// Color palette for charts
export const chartColors = {
  primary: '#00754a',
  blue: '#3b82f6',
  amber: '#f59e0b',
  purple: '#a855f7',
  emerald: '#10b981',
  red: '#ef4444',
  gray: '#6b7280',
};

// Gradient definitions for charts
const GradientDefs = ({ id, color }: { id: string; color: string }) => (
  <defs>
    <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity={0.4} />
      <stop offset="100%" stopColor={color} stopOpacity={0.05} />
    </linearGradient>
    <linearGradient id={`stroke-${id}`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor={color} stopOpacity={0.8} />
      <stop offset="100%" stopColor={color} stopOpacity={1} />
    </linearGradient>
  </defs>
);

// Glass-styled custom tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
  formatter?: (value: number) => string;
}

const GlassTooltip = ({ active, payload, label, formatter }: TooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="glass-tooltip">
      {label && <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>}
      {payload.map((entry, index) => (
        <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
          {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

// SparklineArea - Mini area chart for KPI cards
interface SparklineAreaProps {
  data: number[];
  color?: keyof typeof chartColors;
  height?: number;
  className?: string;
  showAnimation?: boolean;
}

export const SparklineArea = ({
  data,
  color = 'primary',
  height = 48,
  className,
  showAnimation = true,
}: SparklineAreaProps) => {
  const chartData = useMemo(() => data.map((value, index) => ({ value, index })), [data]);
  const chartColor = chartColors[color];
  const gradientId = `sparkline-${color}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <motion.div
      className={cn('w-full', className)}
      initial={showAnimation ? { opacity: 0 } : undefined}
      animate={showAnimation ? { opacity: 1 } : undefined}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <GradientDefs id={gradientId} color={chartColor} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={chartColor}
            strokeWidth={2}
            fill={`url(#gradient-${gradientId})`}
            animationDuration={showAnimation ? 1000 : 0}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// TrendAreaChart - Larger area chart with labels and tooltips
interface TrendAreaChartProps {
  data: Array<{ label: string; value: number; [key: string]: string | number }>;
  dataKey?: string;
  color?: keyof typeof chartColors;
  height?: number;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  formatter?: (value: number) => string;
  className?: string;
}

export const TrendAreaChart = ({
  data,
  dataKey = 'value',
  color = 'primary',
  height = 200,
  showGrid = true,
  showXAxis = true,
  showYAxis = false,
  formatter,
  className,
}: TrendAreaChartProps) => {
  const chartColor = chartColors[color];
  const gradientId = `trend-${color}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <motion.div
      className={cn('w-full', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <GradientDefs id={gradientId} color={chartColor} />
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              vertical={false}
            />
          )}
          {showXAxis && (
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              className="text-gray-500 dark:text-gray-400"
            />
          )}
          {showYAxis && (
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              className="text-gray-500 dark:text-gray-400"
            />
          )}
          <Tooltip content={<GlassTooltip formatter={formatter} />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={chartColor}
            strokeWidth={2.5}
            fill={`url(#gradient-${gradientId})`}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// GlassDonutChart - Donut chart with glass effect
interface DonutChartData {
  label: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface GlassDonutChartProps {
  data: DonutChartData[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
  showLegend?: boolean;
  className?: string;
}

export const GlassDonutChart = ({
  data,
  size = 160,
  thickness = 28,
  centerLabel,
  centerValue,
  showLegend = true,
  className,
}: GlassDonutChartProps) => {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  const innerRadius = size / 2 - thickness;
  const outerRadius = size / 2;

  return (
    <motion.div
      className={cn('flex items-center gap-6', className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="none"
                  className="drop-shadow-sm"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {(centerLabel || centerValue !== undefined) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue !== undefined && (
              <motion.span
                className="text-2xl font-bold text-gray-900 dark:text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {centerValue}
              </motion.span>
            )}
            {centerLabel && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{centerLabel}</span>
            )}
          </div>
        )}
      </div>
      {showLegend && (
        <div className="flex-1 space-y-2">
          {data.map((item, index) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// GlassBarChart - Bar chart with gradient fills
interface BarChartData {
  label: string;
  value: number;
  [key: string]: string | number;
}

interface GlassBarChartProps {
  data: BarChartData[];
  dataKey?: string;
  color?: keyof typeof chartColors;
  height?: number;
  horizontal?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  barRadius?: number;
  formatter?: (value: number) => string;
  className?: string;
}

export const GlassBarChart = ({
  data,
  dataKey = 'value',
  color = 'primary',
  height = 200,
  horizontal = false,
  showGrid = true,
  showXAxis = true,
  showYAxis = false,
  barRadius = 6,
  formatter,
  className,
}: GlassBarChartProps) => {
  const chartColor = chartColors[color];
  const gradientId = `bar-${color}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <motion.div
      className={cn('w-full', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`bar-gradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity={1} />
              <stop offset="100%" stopColor={chartColor} stopOpacity={0.7} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              vertical={!horizontal}
              horizontal={horizontal}
            />
          )}
          {showXAxis && (
            <XAxis
              dataKey={horizontal ? dataKey : 'label'}
              type={horizontal ? 'number' : 'category'}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              className="text-gray-500 dark:text-gray-400"
            />
          )}
          {showYAxis && (
            <YAxis
              dataKey={horizontal ? 'label' : dataKey}
              type={horizontal ? 'category' : 'number'}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              className="text-gray-500 dark:text-gray-400"
              width={80}
            />
          )}
          <Tooltip content={<GlassTooltip formatter={formatter} />} />
          <Bar
            dataKey={dataKey}
            fill={`url(#bar-gradient-${gradientId})`}
            radius={[barRadius, barRadius, 0, 0]}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// MultiAreaChart - For comparing multiple series
interface MultiAreaChartProps {
  data: Array<{ label: string; [key: string]: string | number }>;
  series: Array<{ key: string; color: keyof typeof chartColors; name: string }>;
  height?: number;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  className?: string;
}

export const MultiAreaChart = ({
  data,
  series,
  height = 200,
  showGrid = true,
  showXAxis = true,
  showYAxis = false,
  showLegend = true,
  className,
}: MultiAreaChartProps) => {
  return (
    <motion.div
      className={cn('w-full', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {series.map(({ key, color }) => {
              const chartColor = chartColors[color];
              return (
                <linearGradient key={key} id={`multi-gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0.05} />
                </linearGradient>
              );
            })}
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              vertical={false}
            />
          )}
          {showXAxis && (
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              className="text-gray-500 dark:text-gray-400"
            />
          )}
          {showYAxis && (
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              className="text-gray-500 dark:text-gray-400"
            />
          )}
          <Tooltip content={<GlassTooltip />} />
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
              )}
            />
          )}
          {series.map(({ key, color, name }) => {
            const chartColor = chartColors[color];
            return (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={name}
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#multi-gradient-${key})`}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default {
  SparklineArea,
  TrendAreaChart,
  GlassDonutChart,
  GlassBarChart,
  MultiAreaChart,
  chartColors,
};
