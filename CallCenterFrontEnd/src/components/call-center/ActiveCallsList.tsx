import React from 'react';
import { useCallCenter } from '../../context/CallCenterContext';
import type { CallSummary } from '../../types/callTypes';

export const ActiveCallsList: React.FC = () => {
  const { activeCalls, selectedCall, setSelectedCall } = useCallCenter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const handleCallClick = (call: CallSummary) => {
    setSelectedCall(call);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Active Calls ({activeCalls.length})</h2>
      {activeCalls.length === 0 ? (
        <p style={styles.empty}>No active calls</p>
      ) : (
        <div style={styles.list}>
          {activeCalls.map((call) => (
            <div
              key={call.id}
              onClick={() => handleCallClick(call)}
              style={{
                ...styles.callItem,
                ...(selectedCall?.id === call.id ? styles.selectedCall : {}),
              }}
            >
              <div style={styles.callHeader}>
                <span style={styles.status}>{call.status}</span>
                <span style={styles.direction}>{call.direction}</span>
              </div>
              <div style={styles.callDetails}>
                <p style={styles.phone}>From: {call.fromNumber}</p>
                <p style={styles.phone}>To: {call.toNumber}</p>
                <p style={styles.time}>Started: {formatDate(call.startedAtUtc)}</p>
              </div>
            </div>
          ))}
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
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  callItem: {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  selectedCall: {
    backgroundColor: '#e7f3ff',
    borderColor: '#007bff',
  },
  callHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  status: {
    fontWeight: 'bold',
    color: '#28a745',
  },
  direction: {
    fontSize: '12px',
    color: '#666',
  },
  callDetails: {
    fontSize: '14px',
  },
  phone: {
    margin: '3px 0',
  },
  time: {
    margin: '3px 0',
    fontSize: '12px',
    color: '#666',
  },
};
