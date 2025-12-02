import { cn } from '../../utils/cn';

interface SoftphoneControlsProps {
  callState: 'idle' | 'ringing' | 'active' | 'onhold' | 'dialing';
  onAnswer?: () => void;
  onReject?: () => void;
  onHangup?: () => void;
  onHold?: () => void;
  onResume?: () => void;
  onMute?: () => void;
  onTransfer?: () => void;
  isMuted?: boolean;
  isOnHold?: boolean;
  className?: string;
}

export const SoftphoneControls = ({
  callState,
  onAnswer,
  onReject,
  onHangup,
  onHold,
  onResume,
  onMute,
  onTransfer,
  isMuted = false,
  isOnHold = false,
  className,
}: SoftphoneControlsProps) => {
  const ControlButton = ({
    onClick,
    variant,
    children,
    label,
    disabled,
  }: {
    onClick?: () => void;
    variant: 'answer' | 'reject' | 'default' | 'active';
    children: React.ReactNode;
    label: string;
    disabled?: boolean;
  }) => {
    const variants = {
      answer: 'bg-green-500 hover:bg-green-600 text-white',
      reject: 'bg-red-500 hover:bg-red-600 text-white',
      default: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300',
      active: 'bg-primary-500 hover:bg-primary-600 text-white',
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'flex flex-col items-center gap-1 p-3 rounded-xl transition-colors',
          variants[variant],
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {children}
        <span className="text-xs font-medium">{label}</span>
      </button>
    );
  };

  // Ringing state - show answer/reject
  if (callState === 'ringing') {
    return (
      <div className={cn('flex items-center justify-center gap-8', className)}>
        <ControlButton onClick={onReject} variant="reject" label="Reject">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </ControlButton>
        <ControlButton onClick={onAnswer} variant="answer" label="Answer">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </ControlButton>
      </div>
    );
  }

  // Active call state - show all controls
  if (callState === 'active' || callState === 'onhold') {
    return (
      <div className={cn('flex items-center justify-center gap-4', className)}>
        <ControlButton
          onClick={isMuted ? onMute : onMute}
          variant={isMuted ? 'active' : 'default'}
          label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </ControlButton>

        <ControlButton
          onClick={isOnHold ? onResume : onHold}
          variant={isOnHold ? 'active' : 'default'}
          label={isOnHold ? 'Resume' : 'Hold'}
        >
          {isOnHold ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </ControlButton>

        <ControlButton onClick={onTransfer} variant="default" label="Transfer">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </ControlButton>

        <ControlButton onClick={onHangup} variant="reject" label="End">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
        </ControlButton>
      </div>
    );
  }

  // Idle or dialing state
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {callState === 'dialing' ? 'Dialing...' : 'No active call'}
      </p>
    </div>
  );
};

// Answer/Reject buttons for incoming call overlay
interface IncomingCallControlsProps {
  onAnswer: () => void;
  onReject: () => void;
  className?: string;
}

export const IncomingCallControls = ({ onAnswer, onReject, className }: IncomingCallControlsProps) => {
  return (
    <div className={cn('flex items-center gap-6', className)}>
      <button
        onClick={onReject}
        className="flex items-center justify-center w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all hover:scale-105"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button
        onClick={onAnswer}
        className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all hover:scale-105 animate-pulse"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </button>
    </div>
  );
};

export default SoftphoneControls;
