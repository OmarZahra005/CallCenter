import React, { useMemo } from 'react';
import { useCallCenter } from '../../context/CallCenterContext';
import { Card, CardHeader, CardContent, Badge, EmptyState } from '../ui';
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, User } from 'lucide-react';
import type { CallSummary } from '../../types/callTypes';

export const ActiveCallsList: React.FC = () => {
  const { activeCalls, selectedCall, setSelectedCall } = useCallCenter();

  // Sort calls by status priority (InProgress first, then Ringing, then others)
  const sortedCalls = useMemo(() => {
    const priority: Record<string, number> = {
      'InProgress': 1,
      'Ringing': 2,
      'Queued': 3,
    };
    return [...activeCalls].sort((a, b) =>
      (priority[a.status] || 99) - (priority[b.status] || 99)
    );
  }, [activeCalls]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ringing':
        return <Badge variant="warning" dot pulse>Ringing</Badge>;
      case 'InProgress':
        return <Badge variant="success" dot pulse>In Progress</Badge>;
      case 'Queued':
        return <Badge variant="info" dot>Queued</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getDirectionIcon = (direction: string) => {
    const isInbound = direction?.toLowerCase() === 'inbound';
    return isInbound
      ? <PhoneIncoming className="w-4 h-4 text-green-500" />
      : <PhoneOutgoing className="w-4 h-4 text-blue-500" />;
  };

  const handleCallClick = (call: CallSummary) => {
    setSelectedCall(call);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Active Calls
            </h2>
          </div>
          <Badge variant="primary" size="sm">{activeCalls.length}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        {activeCalls.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Phone className="w-12 h-12" />}
              title="No active calls"
              description="When calls come in, they'll appear here"
            />
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[400px] p-4 space-y-3">
            {sortedCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => handleCallClick(call)}
                className={`
                  p-4 rounded-xl border cursor-pointer transition-all duration-200
                  hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700
                  ${selectedCall?.id === call.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }
                `}
              >
                {/* Call Header */}
                <div className="flex items-center justify-between mb-3">
                  {getStatusBadge(call.status)}
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    {getDirectionIcon(call.direction)}
                    <span className="capitalize">{call.direction || 'Unknown'}</span>
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <User className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">From</p>
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {call.fromNumber || '--'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Phone className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">To</p>
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {call.toNumber || '--'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Time Info */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>Started at {formatTime(call.startedAtUtc)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
