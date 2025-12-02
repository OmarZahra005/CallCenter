import { useMemo } from 'react';
import { cn } from '../../utils/cn';

// Simple Bar Chart
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  showValues?: boolean;
  className?: string;
}

export const BarChart = ({ data, height = 200, showValues = true, className }: BarChartProps) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className={cn('flex items-end gap-2', className)} style={{ height }}>
      {data.map((item, index) => {
        const barHeight = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col items-center justify-end" style={{ height: height - 40 }}>
              {showValues && (
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {item.value}
                </span>
              )}
              <div
                className={cn('w-full rounded-t transition-all duration-300', item.color || 'bg-primary-500')}
                style={{ height: `${barHeight}%`, minHeight: item.value > 0 ? 4 : 0 }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Simple Line Chart
interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  showDots?: boolean;
  showArea?: boolean;
  className?: string;
}

export const LineChart = ({ data, height = 200, color = '#3b82f6', showDots = true, showArea = true, className }: LineChartProps) => {
  const { points, areaPath, linePath } = useMemo(() => {
    if (data.length === 0) return { points: [], areaPath: '', linePath: '' };

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    const chartHeight = height - 40;
    const padding = 10;

    const pts = data.map((item, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * (100 - padding * 2);
      const y = chartHeight - ((item.value - minValue) / range) * (chartHeight - padding * 2) - padding;
      return { x, y, value: item.value, label: item.label };
    });

    const linePathStr = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPathStr = `${linePathStr} L ${pts[pts.length - 1]?.x || 0} ${chartHeight} L ${pts[0]?.x || 0} ${chartHeight} Z`;

    return { points: pts, linePath: linePathStr, areaPath: areaPathStr };
  }, [data, height]);

  return (
    <div className={cn('relative', className)} style={{ height }}>
      <svg width="100%" height={height - 20} viewBox={`0 0 100 ${height - 40}`} preserveAspectRatio="none">
        {showArea && (
          <path d={areaPath} fill={color} opacity={0.1} />
        )}
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        {showDots && points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
        ))}
      </svg>
      <div className="flex justify-between px-2 mt-1">
        {data.map((item, index) => (
          <span key={index} className="text-xs text-gray-500 dark:text-gray-400">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// Donut/Pie Chart
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  showLegend?: boolean;
  className?: string;
}

export const DonutChart = ({ data, size = 160, thickness = 20, showLegend = true, className }: DonutChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;
  const segments = data.map((item) => {
    const percentage = total > 0 ? item.value / total : 0;
    const strokeLength = circumference * percentage;
    const offset = accumulatedOffset;
    accumulatedOffset += strokeLength;
    return { ...item, strokeLength, offset, percentage };
  });

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={thickness}
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Data segments */}
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={thickness}
              strokeDasharray={`${segment.strokeLength} ${circumference}`}
              strokeDashoffset={-segment.offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-all duration-300"
            />
          ))}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{total}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
        </div>
      </div>
      {showLegend && (
        <div className="flex flex-col gap-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="text-sm text-gray-600 dark:text-gray-400">{segment.label}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.round(segment.percentage * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Progress Bar
interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'bg-primary-500',
  size = 'md',
  className,
}: ProgressBarProps) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>}
          {showPercentage && <span className="text-sm font-medium text-gray-900 dark:text-white">{percentage}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-300', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default { BarChart, LineChart, DonutChart, ProgressBar };
