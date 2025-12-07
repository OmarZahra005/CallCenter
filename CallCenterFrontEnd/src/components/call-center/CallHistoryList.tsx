import React, { useState, useRef } from 'react';
import { useCallCenter } from '../../context/CallCenterContext';
import type { CallSummary } from '../../types/callTypes';

export const CallHistoryList: React.FC = () => {
  const { history } = useCallCenter();
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = (call: CallSummary): string => {
    if (!call.endedAtUtc) return 'N/A';
    const start = new Date(call.startedAtUtc).getTime();
    const end = new Date(call.endedAtUtc).getTime();
    const durationSeconds = Math.floor((end - start) / 1000);
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Completed':
        return '#28a745';
      case 'InProgress':
      case 'Ringing':
        return '#007bff';
      case 'Failed':
      case 'Busy':
      case 'NoAnswer':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const handlePlayRecording = async (callSid: string) => {
    try {
      const token = localStorage.getItem('authToken');

      // Get recording by CallSid
      const recordingResponse = await fetch(`/api/recordings/call-sid/${callSid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!recordingResponse.ok) return;

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
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Call History ({history.length})</h2>
      {history.length === 0 ? (
        <p style={styles.empty}>No call history</p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>From</th>
                <th style={styles.th}>To</th>
                <th style={styles.th}>Direction</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Recording</th>
                <th style={styles.th}>Started</th>
                <th style={styles.th}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {history.map((call) => (
                <tr key={call.id} style={styles.tr}>
                  <td style={styles.td}>{call.fromNumber}</td>
                  <td style={styles.td}>{call.toNumber}</td>
                  <td style={styles.td}>{call.direction}</td>
                  <td style={{ ...styles.td, color: getStatusColor(call.status) }}>
                    {call.status}
                  </td>
                  <td style={styles.td}>
                    {call.recordingUrl && (
                      <button
                        onClick={() => handlePlayRecording(call.providerCallId)}
                        style={styles.playButton}
                      >
                        {selectedRecording === call.providerCallId && isPlaying ? 'Pause' : 'Play'}
                      </button>
                    )}
                  </td>
                  <td style={styles.td}>{formatDate(call.startedAtUtc)}</td>
                  <td style={styles.td}>{calculateDuration(call)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <audio
            ref={audioRef}
            onEnded={() => setIsPlaying(false)}
            style={{ display: 'none' }}
          />
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    flex: 1,
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    margin: '0 0 15px 0',
    fontSize: '20px',
    color: '#333',
  },
  empty: {
    color: '#999',
    textAlign: 'center',
    padding: '20px',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    textAlign: 'left',
    padding: '10px',
    borderBottom: '2px solid #ddd',
    fontWeight: 'bold',
    backgroundColor: '#f8f9fa',
  },
  tr: {
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '10px',
  },
  playButton: {
    padding: '4px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
};
