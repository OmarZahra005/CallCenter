import { cn } from '../../utils/cn';
import { useMemo } from 'react';

// ============================================================================
// DATE SEPARATOR - Groups messages by day
// ============================================================================
interface DateSeparatorProps {
  date: Date;
  className?: string;
}

export const DateSeparator = ({ date, className }: DateSeparatorProps) => {
  const formatDateLabel = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return 'Today';
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <div className={cn('flex items-center justify-center my-8', className)}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
      <div className="mx-4 px-5 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
          {formatDateLabel(date)}
        </span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
    </div>
  );
};

// ============================================================================
// SYSTEM MESSAGE - For events like transfers, closures, tickets
// ============================================================================
interface SystemMessageProps {
  content: string;
  timestamp?: Date;
  type?: 'info' | 'success' | 'warning' | 'transfer' | 'ticket' | 'closed' | 'joined' | 'left';
  className?: string;
}

export const SystemMessage = ({ content, timestamp, type = 'info', className }: SystemMessageProps) => {
  const typeConfig = {
    info: {
      bg: 'bg-slate-100 dark:bg-slate-800/60',
      border: 'border-slate-200 dark:border-slate-700',
      text: 'text-slate-600 dark:text-slate-400',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-400',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-400',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    transfer: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-400',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    ticket: {
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      border: 'border-violet-200 dark:border-violet-800',
      text: 'text-violet-700 dark:text-violet-400',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
    },
    closed: {
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      border: 'border-rose-200 dark:border-rose-800',
      text: 'text-rose-700 dark:text-rose-400',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    joined: {
      bg: 'bg-teal-50 dark:bg-teal-900/20',
      border: 'border-teal-200 dark:border-teal-800',
      text: 'text-teal-700 dark:text-teal-400',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    left: {
      bg: 'bg-gray-100 dark:bg-gray-800/60',
      border: 'border-gray-200 dark:border-gray-700',
      text: 'text-gray-600 dark:text-gray-400',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
    },
  };

  const config = typeConfig[type];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className={cn('flex justify-center my-5', className)}>
      <div className={cn(
        'inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium border shadow-sm',
        config.bg,
        config.border,
        config.text
      )}>
        <span className="flex-shrink-0">{config.icon}</span>
        <span>{content}</span>
        {timestamp && (
          <span className="opacity-60 text-xs ml-1">• {formatTime(timestamp)}</span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MESSAGE BUBBLE - Main chat message component
// ============================================================================
interface MessageBubbleProps {
  content: string;
  sender: 'customer' | 'agent' | 'system';
  timestamp: Date;
  senderName?: string;
  senderAvatar?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: Array<{ name: string; url: string; type: string }>;
  className?: string;
  showAvatar?: boolean;
  isRTL?: boolean;
  showFullTimestamp?: boolean;
  systemMessageType?: 'info' | 'success' | 'warning' | 'transfer' | 'ticket' | 'closed' | 'joined' | 'left';
}

export const MessageBubble = ({
  content,
  sender,
  timestamp,
  senderName,
  senderAvatar,
  status,
  attachments,
  className,
  showAvatar = true,
  isRTL,
  showFullTimestamp = true,
  systemMessageType,
}: MessageBubbleProps) => {
  const isAgent = sender === 'agent';
  const isSystem = sender === 'system';
  const isCustomer = sender === 'customer';

  // Detect RTL content
  const containsRTL = useMemo(() => {
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/;
    return rtlRegex.test(content);
  }, [content]);

  const textDirection = isRTL !== undefined ? (isRTL ? 'rtl' : 'ltr') : (containsRTL ? 'rtl' : 'ltr');

  // System messages
  if (isSystem) {
    return (
      <SystemMessage
        content={content}
        timestamp={timestamp}
        type={systemMessageType || 'info'}
        className={className}
      />
    );
  }

  // Format timestamp
  const formatTimestamp = (date: Date, showFull: boolean): string => {
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (!showFull) return timeStr;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return timeStr;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${timeStr}`;
    } else {
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      return `${dateStr}, ${timeStr}`;
    }
  };

  // Get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = senderName || (isAgent ? 'Agent' : 'Customer');

  // Avatar component
  const Avatar = () => {
    if (!showAvatar) return <div className="w-10 flex-shrink-0" />;

    if (senderAvatar) {
      return (
        <img
          src={senderAvatar}
          alt={displayName}
          className="w-10 h-10 rounded-full object-cover shadow-md flex-shrink-0"
        />
      );
    }

    return (
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md flex-shrink-0',
        isAgent
          ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
          : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
      )}>
        {getInitials(displayName)}
      </div>
    );
  };

  // Status indicator
  const StatusIndicator = () => {
    if (!status || !isAgent) return null;

    const statusConfig = {
      sending: {
        icon: (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ),
        text: 'Sending',
        color: 'text-gray-400',
      },
      sent: {
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ),
        text: 'Sent',
        color: 'text-gray-400',
      },
      delivered: {
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7M5 13l4 4L19 7" transform="translate(-3, 0)" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" transform="translate(3, 0)" />
          </svg>
        ),
        text: 'Delivered',
        color: 'text-gray-400',
      },
      read: {
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7M5 13l4 4L19 7" transform="translate(-3, 0)" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" transform="translate(3, 0)" />
          </svg>
        ),
        text: 'Seen',
        color: 'text-blue-500',
      },
      failed: {
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        text: 'Failed',
        color: 'text-red-500',
      },
    };

    const config = statusConfig[status];

    return (
      <span className={cn('inline-flex items-center gap-1', config.color)} title={config.text}>
        {config.icon}
        <span className="text-xs">{config.text}</span>
      </span>
    );
  };

  return (
    <div
      className={cn(
        'flex gap-3 mb-6 px-2',
        isCustomer ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 self-end mb-5">
        <Avatar />
      </div>

      {/* Message content wrapper */}
      <div className={cn(
        'flex flex-col max-w-[70%]',
        isCustomer ? 'items-end' : 'items-start'
      )}>
        {/* Sender name label */}
        <div className={cn(
          'flex items-center gap-2 mb-1.5 px-2',
          isCustomer ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className={cn(
            'text-xs font-semibold tracking-wide',
            isAgent ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'
          )}>
            {displayName}
          </span>
          {isAgent && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded">
              AGENT
            </span>
          )}
        </div>

        {/* Message bubble */}
        <div
          className={cn(
            'relative px-5 py-3.5 shadow-sm',
            // Agent messages - left aligned, neutral colors
            isAgent && [
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700',
              'rounded-2xl rounded-bl-md',
              'text-gray-800 dark:text-gray-100',
            ],
            // Customer messages - right aligned, brand colors
            isCustomer && [
              'bg-gradient-to-br from-emerald-500 to-emerald-600',
              'rounded-2xl rounded-br-md',
              'text-white',
              'shadow-emerald-500/20 shadow-lg',
            ],
          )}
        >
          {/* Message text */}
          <p
            className={cn(
              'text-[15px] leading-relaxed whitespace-pre-wrap break-words',
              textDirection === 'rtl' && 'text-right'
            )}
            dir={textDirection}
          >
            {content}
          </p>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className={cn(
              'mt-3 pt-3 space-y-2 border-t',
              isCustomer ? 'border-white/20' : 'border-gray-200 dark:border-gray-700'
            )}>
              {attachments.map((attachment, index) => (
                <a
                  key={index}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium hover:underline transition-colors',
                    isCustomer
                      ? 'text-white/90 hover:text-white'
                      : 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-400'
                  )}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="truncate max-w-[200px]">{attachment.name}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp and status */}
        <div className={cn(
          'flex items-center gap-2.5 mt-2 px-2',
          isCustomer ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {formatTimestamp(timestamp, showFullTimestamp)}
          </span>
          <StatusIndicator />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CONVERSATION ITEM - For inbox list
// ============================================================================
interface ConversationItemProps {
  id?: string;
  customerName: string;
  lastMessage?: string;
  timestamp?: Date | string;
  channel: 'voice' | 'whatsapp' | 'email' | 'sms' | 'chat';
  unreadCount?: number;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  customerId?: string;
  state?: string;
  startedAt?: string;
}

export const ConversationItem = ({
  customerName,
  lastMessage,
  timestamp,
  channel,
  unreadCount = 0,
  isActive = false,
  onClick,
  className,
}: ConversationItemProps) => {
  const channelIcons = {
    voice: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
    email: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    sms: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  };

  const channelColors = {
    voice: 'text-blue-500',
    whatsapp: 'text-green-500',
    email: 'text-purple-500',
    sms: 'text-indigo-500',
    chat: 'text-cyan-500',
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 text-start transition-colors rounded-lg',
        isActive
          ? 'bg-primary-50 dark:bg-primary-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800',
        className
      )}
    >
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {customerName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className={cn('absolute -bottom-1 -end-1 w-5 h-5 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center')}>
          <svg className={cn('w-3 h-3', channelColors[channel])} fill="currentColor" viewBox="0 0 24 24">
            <path d={channelIcons[channel]} />
          </svg>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={cn('text-sm font-medium truncate', unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>
            {customerName}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(timestamp)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className={cn('text-sm truncate', unreadCount > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400')}>
            {lastMessage || 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <span className="flex-shrink-0 ms-2 w-5 h-5 bg-primary-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ============================================================================
// HELPER: Group messages by date
// ============================================================================
export const groupMessagesByDate = <T extends { createdAt: string }>(messages: T[]): Map<string, T[]> => {
  const groups = new Map<string, T[]>();

  messages.forEach((message) => {
    const date = new Date(message.createdAt);
    const dateKey = date.toDateString();

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(message);
  });

  return groups;
};

export default MessageBubble;
