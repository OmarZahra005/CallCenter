import React from 'react';
import { useCallCenter } from '../../context/CallCenterContext';

export const IncomingCallBanner: React.FC = () => {
  const { incomingRingingCall, acceptIncoming, rejectIncoming, isAnswering } = useCallCenter();

  if (!incomingRingingCall) {
    return null;
  }

  return (
    <div style={styles.banner}>
      <div style={styles.content}>
        <div style={styles.info}>
          <h3 style={styles.title}>Incoming Call</h3>
          <p style={styles.detail}>From: {incomingRingingCall.fromNumber}</p>
          <p style={styles.detail}>To: {incomingRingingCall.toNumber}</p>
        </div>
        <div style={styles.actions}>
          <button
            onClick={acceptIncoming}
            disabled={isAnswering}
            style={{ ...styles.button, ...styles.acceptButton }}
          >
            {isAnswering ? 'Answering...' : 'Answer'}
          </button>
          <button
            onClick={rejectIncoming}
            disabled={isAnswering}
            style={{ ...styles.button, ...styles.rejectButton }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  banner: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    backgroundColor: '#fff',
    border: '2px solid #28a745',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: '400px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  content: {
    padding: '20px',
  },
  info: {
    marginBottom: '15px',
  },
  title: {
    margin: '0 0 10px 0',
    color: '#28a745',
    fontSize: '18px',
  },
  detail: {
    margin: '5px 0',
    fontSize: '14px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    flex: 1,
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#28a745',
    color: 'white',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
    color: 'white',
  },
};
