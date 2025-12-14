import React, { useState, useRef } from 'react';
import { useCallCenter } from '../../context/CallCenterContext';
import { Card, CardHeader, CardContent, Badge, Button, EmptyState } from '../ui';
import { Play, Pause, PhoneIncoming, PhoneOutgoing, Clock, History } from 'lucide-react';
import type { CallSummary } from '../../types/callTypes';

export const CallHistoryList: React.FC = () => {
  const { history } = useCallCenter();
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingRecording, setIsLoadingRecording] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatPhone = (phone: string | null | undefined): string => {
    if (!phone || phone === 'N/A') return '--';
    return phone;
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (call: CallSummary): string => {
    if (!call.endedAtUtc) return '--:--';
    const start = new Date(call.startedAtUtc).getTime();
    const end = new Date(call.endedAtUtc).getTime();
    const durationSeconds = Math.floor((end - start) / 1000);
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'InProgress':
        return <Badge variant="info" dot pulse>In Progress</Badge>;
      case 'Ringing':
        return <Badge variant="warning" dot pulse>Ringing</Badge>;
      case 'Failed':
        return <Badge variant="danger">Failed</Badge>;
      case 'Busy':
        return <Badge variant="warning">Busy</Badge>;
      case 'NoAnswer':
        return <Badge variant="default">No Answer</Badge>;
      default:
        return <Badge variant="default">{status || 'Unknown'}</Badge>;
    }
  };

  const getDirectionDisplay = (direction: string) => {
    const isInbound = direction?.toLowerCase() === 'inbound';
    return (
      <div className="flex items-center gap-1.5">
        {isInbound
          ? <PhoneIncoming className="w-4 h-4 text-green-500" />
          : <PhoneOutgoing className="w-4 h-4 text-blue-500" />
        }
        <span className="capitalize text-sm">{direction || '--'}</span>
      </div>
    );
  };

  const handlePlayRecording = async (callSid: string) => {
    // If already playing this recording, pause it
    if (selectedRecording === callSid && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    // If playing a different recording, stop it first
    if (selectedRecording !== callSid) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }

    setIsLoadingRecording(true);
    try {
      const token = localStorage.getItem('authToken');

      // Get recording by CallSid
      const recordingResponse = await fetch(`/api/recordings/call-sid/${callSid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!recordingResponse.ok) {
        console.error('Failed to get recording');
        return;
      }

      const recording = await recordingResponse.json();

      // Stream recording
      const streamResponse = await fetch(`/api/recordings/${recording.id}/stream`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (streamResponse.ok) {
        const blob = await streamResponse.blob();
        const url = URL.createObjectURL(blob);

        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
          setIsPlaying(true);
          setSelectedRecording(callSid);
        }
      }
    } catch (error) {
      console.error('Failed to play recording:', error);
    } finally {
      setIsLoadingRecording(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Call History
            </h2>
          </div>
          <Badge variant="default" size="sm">{history.length}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        {history.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Clock className="w-12 h-12" />}
              title="No call history"
              description="Completed calls will appear here"
            />
          </div>
        ) : (
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">From</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">To</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Direction</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recording</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Started</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {history.map((call) => (
                  <tr
                    key={call.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {formatPhone(call.fromNumber)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatPhone(call.toNumber)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {getDirectionDisplay(call.direction)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(call.status)}
                    </td>
                    <td className="px-4 py-3">
                      {call.recordingUrl ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePlayRecording(call.providerCallId)}
                          disabled={isLoadingRecording}
                          className="flex items-center gap-1.5"
                        >
                          {selectedRecording === call.providerCallId && isPlaying
                            ? <><Pause className="w-4 h-4" /> Pause</>
                            : <><Play className="w-4 h-4" /> Play</>
                          }
                        </Button>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(call.startedAtUtc)}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                      {formatDuration(call)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <audio
              ref={audioRef}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
