import { Card, CardContent, Badge, Button } from '../../../components/ui';
import { CallDurationTimer, LiveIndicator } from '../../../components/ui';
import type { CallInfo, CustomerInfo } from '../hooks/useAgentDesktop';

type CallState = 'active' | 'onhold';

interface CallInfoPanelProps {
  callInfo: CallInfo;
  customer: CustomerInfo | null;
  callState: CallState;
  callStartTime: Date;
  isMuted: boolean;
  isOnHold: boolean;
  onMute: () => void;
  onHold: () => void;
  onResume: () => void;
  onTransfer: () => void;
  onHangup: () => void;
}

export const CallInfoPanel = ({
  callInfo,
  customer,
  callState,
  callStartTime,
  isMuted,
  isOnHold,
  onMute,
  onHold,
  onResume,
  onTransfer,
  onHangup,
}: CallInfoPanelProps) => {
  // Derived values
  const customerName = customer?.name || callInfo.callerName || 'Unknown Caller';
  const customerPhone = customer?.phone || callInfo.callerNumber;
  const customerType = customer?.type || 'Standard';

  // Status configuration
  const statusConfig = {
    active: { variant: 'live' as const, label: 'LIVE' },
    onhold: { variant: 'paused' as const, label: 'ON HOLD' },
  };

  const currentStatus = statusConfig[callState];

  return (
    <Card variant="bordered" className="flex-shrink-0">
      <CardContent className="p-6">
        {/* Header: Status + Customer Badge */}
        <div className="flex items-start justify-between mb-4">
          <LiveIndicator variant={currentStatus.variant} label={currentStatus.label} />
          <Badge variant={customerType === 'VIP' || customerType === 'Premium' ? 'success' : 'default'}>
            {customerType}
          </Badge>
        </div>

        {/* Customer Info */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            {customerName}
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400">{customerPhone}</p>
        </div>

        {/* Call Duration - Prominent */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 px-8 py-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <CallDurationTimer startTime={callStartTime} size="lg" className="text-4xl font-mono font-bold" />
          </div>
        </div>

        {/* Call Metadata */}
        <div className="flex items-center gap-3 mb-6 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
          <Badge variant="info" size="sm">
            {callInfo.direction}
          </Badge>
          {callInfo.queueName && <span>Queue: {callInfo.queueName}</span>}
          {callInfo.callId && <span className="text-xs">ID: {callInfo.callId.slice(0, 8)}</span>}
          {/* Recording indicator - always show for now */}
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Recording
          </span>
        </div>

        {/* Call Controls */}
        <div className="grid grid-cols-4 gap-3">
          {/* Mute Button */}
          <Button
            onClick={onMute}
            variant={isMuted ? 'primary' : 'secondary'}
            size="md"
            className={`flex flex-col items-center gap-1 h-auto py-3 ${
              isMuted ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMuted ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              )}
            </svg>
            <span className="text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
          </Button>

          {/* Hold/Resume Button */}
          <Button
            onClick={isOnHold ? onResume : onHold}
            variant={isOnHold ? 'warning' : 'secondary'}
            size="md"
            className={`flex flex-col items-center gap-1 h-auto py-3 ${
              isOnHold ? 'ring-2 ring-yellow-500' : ''
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs">{isOnHold ? 'Resume' : 'Hold'}</span>
          </Button>

          {/* Transfer Button */}
          <Button
            onClick={onTransfer}
            variant="secondary"
            size="md"
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <span className="text-xs">Transfer</span>
          </Button>

          {/* End Call Button */}
          <Button
            onClick={onHangup}
            variant="danger"
            size="md"
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
              />
            </svg>
            <span className="text-xs">End Call</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
