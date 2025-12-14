import React, { useEffect, useRef } from 'react';
import { useCallCenter } from '../../context/CallCenterContext';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, Badge, Avatar } from '../ui';
import { Loader2, Phone, AlertCircle } from 'lucide-react';

export const AgentStatusBar: React.FC = () => {
  const { agentIdentity, setAgentIdentity, isLoading, twilioReady, error } = useCallCenter();
  const user = useAuthStore((state) => state.user);
  const initializingRef = useRef(false);

  // Auto-initialize Twilio Device with current user's email
  useEffect(() => {
    // Prevent double initialization from React Strict Mode
    if (initializingRef.current) {
      return;
    }

    if (user?.email && !twilioReady && !isLoading && !agentIdentity) {
      initializingRef.current = true;
      setAgentIdentity(user.email).finally(() => {
        // Reset after a delay to allow for component unmount/remount in Strict Mode
        setTimeout(() => {
          initializingRef.current = false;
        }, 1000);
      });
    }
  }, [user?.email, twilioReady, isLoading, agentIdentity, setAgentIdentity]);

  // Not authenticated state
  if (!user) {
    return (
      <Card className="mb-4 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Not Authenticated</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Please log in to use the call center</p>
            </div>
            <Badge variant="warning">Offline</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="mb-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <Avatar name={user.name || 'Agent'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-sm text-red-600 dark:text-red-400 truncate">{error}</p>
            </div>
            <Badge variant="danger">Error</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Connecting state
  if (isLoading) {
    return (
      <Card className="mb-4 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <Avatar name={user.name || 'Agent'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 truncate">{agentIdentity || user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <Badge variant="info">Connecting...</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ready state
  if (twilioReady) {
    return (
      <Card className="mb-4 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar name={user.name || 'Agent'} size="sm" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{agentIdentity}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-600" />
              <Badge variant="success" dot pulse>Ready</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default/Waiting state
  return (
    <Card className="mb-4">
      <CardContent className="py-3">
        <div className="flex items-center gap-3">
          <Avatar name={user.name || 'Agent'} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          <Badge variant="default">Initializing...</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
