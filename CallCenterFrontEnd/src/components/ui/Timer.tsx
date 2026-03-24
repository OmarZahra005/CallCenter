import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface TimerProps {
  startTime?: Date;
  endTime?: Date;
  countdown?: boolean;
  className?: string;
  onComplete?: () => void;
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

// Generic timer component
export const Timer = ({
  startTime,
  endTime,
  countdown = false,
  className,
  onComplete,
  variant = 'default',
}: TimerProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = startTime || new Date();

    const updateTimer = () => {
      const now = new Date();
      if (countdown && endTime) {
        const remaining = Math.max(0, endTime.getTime() - now.getTime());
        setElapsed(remaining);
        if (remaining === 0 && onComplete) {
          onComplete();
        }
      } else {
        setElapsed(now.getTime() - start.getTime());
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime, endTime, countdown, onComplete]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const variants = {
    default: 'text-gray-900 dark:text-white',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
  };

  return (
    <span className={cn('font-mono tabular-nums', variants[variant], className)}>
      {formatTime(elapsed)}
    </span>
  );
};

// SLA Timer with visual states
interface SLATimerProps {
  deadline: Date;
  className?: string;
  onBreach?: () => void;
}

export const SLATimer = ({ deadline, className, onBreach }: SLATimerProps) => {
  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState<'ontrack' | 'atrisk' | 'breached'>('ontrack');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      setRemaining(diff);

      if (diff <= 0) {
        setStatus('breached');
        if (onBreach) onBreach();
      } else if (diff < 5 * 60 * 1000) { // Less than 5 minutes
        setStatus('atrisk');
      } else {
        setStatus('ontrack');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline, onBreach]);

  const formatTime = (ms: number) => {
    const isNegative = ms < 0;
    const absMs = Math.abs(ms);
    const totalSeconds = Math.floor(absMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const time = hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return isNegative ? `-${time}` : time;
  };

  const statusStyles = {
    ontrack: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    atrisk: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 animate-pulse',
    breached: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 animate-pulse',
  };

  return (
    <div className={cn('inline-flex items-center gap-2 px-2 py-1 rounded font-mono text-sm', statusStyles[status], className)}>
      <span className={cn('w-2 h-2 rounded-full', {
        'bg-green-500': status === 'ontrack',
        'bg-yellow-500': status === 'atrisk',
        'bg-red-500': status === 'breached',
      })} />
      {formatTime(remaining)}
    </div>
  );
};

// Call Duration Timer
interface CallDurationTimerProps {
  startTime: Date;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CallDurationTimer = ({ startTime, className, size = 'md' }: CallDurationTimerProps) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const updateDuration = () => {
      setDuration(Date.now() - startTime.getTime());
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <span className={cn('font-mono tabular-nums font-semibold text-gray-900 dark:text-white', sizes[size], className)}>
      {formatTime(duration)}
    </span>
  );
};

// Live Clock - real-time clock display
interface LiveClockProps {
  variant?: 'full' | 'compact';
  className?: string;
  locale?: string;
}

export const LiveClock = ({ variant = 'compact', className, locale }: LiveClockProps) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Detect RTL from document direction
  const isRTL = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const effectiveLocale = locale || (isRTL ? 'ar-SA' : 'en-US');

  const timeStr = now.toLocaleTimeString(effectiveLocale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !isRTL,
  });

  const dateStr = now.toLocaleDateString(effectiveLocale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  if (variant === 'full') {
    return (
      <div className={cn('glass-card px-5 py-3 text-center', className)}>
        <p className="text-2xl font-mono tabular-nums font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent leading-tight">
          {timeStr}
        </p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
          {dateStr}
        </p>
      </div>
    );
  }

  // Compact variant
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="font-mono tabular-nums text-sm font-semibold text-gray-700 dark:text-gray-300">
        {timeStr}
      </span>
      <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
        {dateStr}
      </span>
    </div>
  );
};

export default Timer;
