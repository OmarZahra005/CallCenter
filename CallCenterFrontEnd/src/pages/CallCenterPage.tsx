import React from 'react';
import { CallCenterProvider } from '../context/CallCenterContext';
import {
  AgentStatusBar,
  IncomingCallBanner,
  ActiveCallsList,
  CallHistoryList,
  CallControls,
} from '../components/call-center';

const CallCenterContent: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Call Center
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage incoming and outgoing calls
        </p>
      </div>

      {/* Agent Status Bar - Shows connection status and auto-initializes */}
      <AgentStatusBar />

      {/* Incoming Call Banner */}
      <IncomingCallBanner />

      {/* Main Content */}
      <div className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
