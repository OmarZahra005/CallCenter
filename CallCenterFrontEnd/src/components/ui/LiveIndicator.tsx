import { cn } from '../../utils/cn';

interface LiveIndicatorProps {
  variant?: 'live' | 'recording' | 'typing' | 'connecting';
  label?: string;
  className?: string;
}

export const LiveIndicator = ({ variant = 'live', label, className }: LiveIndicatorProps) => {
  const variants = {
    live: {
      dot: 'bg-red-500',
      ping: 'bg-red-400',
      text: 'text-red-600 dark:text-red-400',
      label: label || 'LIVE',
    },
    recording: {
      dot: 'bg-red-500',
      ping: 'bg-red-400',
      text: 'text-red-600 dark:text-red-400',
      label: label || 'REC',
    },
    typing: {
      dot: 'bg-blue-500',
      ping: 'bg-blue-400',
      text: 'text-blue-600 dark:text-blue-400',
      label: label || 'Typing',
    },
    connecting: {
      dot: 'bg-yellow-500',
      ping: 'bg-yellow-400',
      text: 'text-yellow-600 dark:text-yellow-400',
      label: label || 'Connecting',
    },
  };

  const config = variants[variant];

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative flex h-2.5 w-2.5">
        <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', config.ping)} />
        <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5', config.dot)} />
      </span>
      <span className={cn('text-xs font-semibold uppercase tracking-wide', config.text)}>
        {config.label}
      </span>
    </div>
  );
};

// Typing indicator with animated dots
export const TypingIndicator = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
};

// Status dot for various states
interface StatusDotProps {
  status: 'online' | 'offline' | 'busy' | 'away' | 'dnd';
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const StatusDot = ({ status, size = 'sm', pulse = false, className }: StatusDotProps) => {
  const colors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
    dnd: 'bg-red-600',
  };

  const sizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
  };

  return (
    <span className={cn('relative flex', sizes[size], className)}>
      {pulse && (
        <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', colors[status])} />
      )}
      <span className={cn('relative inline-flex rounded-full', sizes[size], colors[status])} />
    </span>
  );
};

export default LiveIndicator;
