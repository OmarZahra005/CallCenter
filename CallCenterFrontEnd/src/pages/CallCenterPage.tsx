import React from 'react';
import { CallCenterProvider, useCallCenter } from '../context/CallCenterContext';
import {
  AgentIdentityForm,
  IncomingCallBanner,
  ActiveCallsList,
  CallHistoryList,
  CallControls,
} from '../components/call-center';

const CallCenterContent: React.FC = () => {
  const { isLoading, error, twilioReady } = useCallCenter();

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Call Center</h1>
        {error && <div style={styles.error}>{error}</div>}
        {isLoading && <div style={styles.loading}>Connecting to call server...</div>}
        {!isLoading && twilioReady && (
          <div style={styles.success}>Twilio device ready</div>
        )}
      </div>

      <AgentIdentityForm />
      <IncomingCallBanner />

      <div style={styles.mainContent}>
        <div style={styles.listsContainer}>
          <ActiveCallsList />
          <CallHistoryList />
        </div>
        <CallControls />
      </div>
    </div>
  );
};

export const CallCenterPage: React.FC = () => {
  return (
    <CallCenterProvider>
      <CallCenterContent />
    </CallCenterProvider>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    marginBottom: '20px',
  },
  pageTitle: {
    margin: '0 0 10px 0',
    fontSize: '28px',
    color: '#333',
  },
  error: {
    padding: '10px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    marginTop: '10px',
  },
  loading: {
    padding: '10px',
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    borderRadius: '4px',
    marginTop: '10px',
  },
  success: {
    padding: '10px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
    marginTop: '10px',
  },
  mainContent: {
    marginTop: '20px',
  },
  listsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
};
