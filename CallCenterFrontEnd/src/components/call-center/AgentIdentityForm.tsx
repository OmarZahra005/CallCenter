import React, { useState } from 'react';
import { useCallCenter } from '../../context/CallCenterContext';

export const AgentIdentityForm: React.FC = () => {
  const { agentIdentity, setAgentIdentity, isLoading, twilioReady } = useCallCenter();
  const [identity, setIdentity] = useState(agentIdentity || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (identity.trim()) {
      await setAgentIdentity(identity.trim());
    }
  };

  if (twilioReady) {
    return (
      <div style={styles.container}>
        <div style={styles.readyBadge}>
          <span style={styles.statusDot}></span>
          Agent: {agentIdentity} (Ready)
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Agent Identity:
          <input
            type="text"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            placeholder="Enter your agent ID"
            disabled={isLoading}
            style={styles.input}
          />
        </label>
        <button type="submit" disabled={isLoading || !identity.trim()} style={styles.button}>
          {isLoading ? 'Connecting...' : 'Connect'}
        </button>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: 1,
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  readyBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#28a745',
  },
};
