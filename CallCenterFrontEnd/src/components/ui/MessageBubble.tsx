import { cn } from '../../utils/cn';

interface MessageBubbleProps {
  content: string;
  sender: 'customer' | 'agent' | 'system';
  timestamp: Date;
  senderName?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: Array<{ name: string; url: string; type: string }>;
  className?: string;
}

export const MessageBubble = ({
  content,
  sender,
  timestamp,
  senderName,
  status,
  attachments,
  className,
}: MessageBubbleProps) => {
  const isAgent = sender === 'agent';
  const isSystem = sender === 'system';

  if (isSystem) {
    return (
      <div className={cn('flex justify-center my-2', className)}>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {content}
        </span>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const StatusIcon = () => {
    if (!status || sender !== 'agent') return null;

    const icons = {
      sending: (
        <svg className="w-3 h-3 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ),
      sent: (
        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      delivered: (
        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      read: (
        <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      failed: (
        <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };

    return icons[status];
  };

  return (
    <div className={cn('flex flex-col mb-3', isAgent ? 'items-end' : 'items-start', className)}>
      {senderName && (
        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-3">
          {senderName}
        </span>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2',
          isAgent
            ? 'bg-primary-600 text-white rounded-br-sm'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        {attachments && attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-2 text-xs underline',
                  isAgent ? 'text-white/80 hover:text-white' : 'text-primary-600 hover:text-primary-700'
                )}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                {attachment.name}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 mt-1 px-3">
        <span className={cn('text-xs', isAgent ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500')}>
          {formatTime(timestamp)}
        </span>
        <StatusIcon />
      </div>
    </div>
  );
};

// Conversation list item for inbox
interface ConversationItemProps {
  id: string;
  customerName: string;
  lastMessage: string;
  timestamp: Date;
  channel: 'voice' | 'whatsapp' | 'email' | 'sms' | 'chat';
  unreadCount?: number;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
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

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
            {lastMessage}
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

export default MessageBubble;
