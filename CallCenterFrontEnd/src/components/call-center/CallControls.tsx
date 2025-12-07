import React from 'react';
import { useCallCenter } from '../../context/CallCenterContext';

export const CallControls: React.FC = () => {
  const { selectedCall, isMuted, hangupCurrent, toggleMute, incomingTwilioCall } = useCallCenter();

  const hasActiveCall = incomingTwilioCall !== null;

  if (!hasActiveCall && !selectedCall) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Call Controls</h3>
        {selectedCall && (
          <div style={styles.callInfo}>
            <span>From: {selectedCall.fromNumber}</span>
            <span style={{ marginLeft: '20px' }}>To: {selectedCall.toNumber}</span>
            <span style={{ marginLeft: '20px', fontWeight: 'bold' }}>
              Status: {selectedCall.status}
            </span>
          </div>
        )}
      </div>
      <div style={styles.controls}>
        <button
          onClick={toggleMute}
          disabled={!hasActiveCall}
          style={{
            ...styles.button,
            ...(isMuted ? styles.muteActiveButton : styles.muteButton),
          }}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button
          onClick={hangupCurrent}
          disabled={!hasActiveCall}
          style={{ ...styles.button, ...styles.hangupButton }}
        >
          Hang Up
        </button>
      </div>
      {!hasActiveCall && (
        <p style={styles.infoText}>Select an active call or answer an incoming call to use controls</p>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    marginTop: '20px',
  },
  header: {
    marginBottom: '15px',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '18px',
    color: '#333',
  },
  callInfo: {
    fontSize: '14px',
    color: '#666',
  },
  controls: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.2s',
  },
  muteButton: {
    backgroundColor: '#6c757d',
    color: 'white',
  },
  muteActiveButton: {
    backgroundColor: '#ffc107',
    color: '#000',
  },
  hangupButton: {
    backgroundColor: '#dc3545',
    color: 'white',
  },
  infoText: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic',
  },
};
