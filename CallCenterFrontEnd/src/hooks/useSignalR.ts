import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../store/authStore';

const HUB_URL = 'http://localhost:5045/hubs/callcenter';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface UseSignalRReturn {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  notifications: Notification[];
  agentStates: Record<string, string>;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  sendMessage: (method: string, ...args: any[]) => Promise<void>;
}

export const useSignalR = (): UseSignalRReturn => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [agentStates, setAgentStates] = useState<Record<string, string>>({});
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token || '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Event handlers
    connection.on('Notification', (data: { title: string; message: string; type: string; timestamp: string }) => {
      const notification: Notification = {
        id: crypto.randomUUID(),
        title: data.title,
        message: data.message,
        type: data.type as 'info' | 'success' | 'warning' | 'error',
        timestamp: new Date(data.timestamp),
        read: false,
      };
      setNotifications(prev => [notification, ...prev].slice(0, 50));
    });

    connection.on('AgentStateChanged', (data: { agentId: string; state: string }) => {
      setAgentStates(prev => ({ ...prev, [data.agentId]: data.state }));
    });

    connection.on('AgentConnected', (data: { agentId: string; agentName: string }) => {
      console.log('Agent connected:', data.agentName);
    });

    connection.on('AgentDisconnected', (agentId: string) => {
      setAgentStates(prev => {
        const newState = { ...prev };
        delete newState[agentId];
        return newState;
      });
    });

    connection.on('NewTicketCreated', (ticket: any) => {
      const notification: Notification = {
        id: crypto.randomUUID(),
        title: 'New Ticket',
        message: `Ticket ${ticket.ticketNumber}: ${ticket.subject}`,
        type: 'info',
        timestamp: new Date(),
        read: false,
      };
      setNotifications(prev => [notification, ...prev].slice(0, 50));
    });

    connection.on('TicketUpdated', (ticket: any) => {
      const notification: Notification = {
        id: crypto.randomUUID(),
        title: 'Ticket Updated',
        message: `Ticket ${ticket.ticketNumber} has been updated`,
        type: 'info',
        timestamp: new Date(),
        read: false,
      };
      setNotifications(prev => [notification, ...prev].slice(0, 50));
    });

    connection.on('IncomingCall', (callInfo: any) => {
      const notification: Notification = {
        id: crypto.randomUUID(),
        title: 'Incoming Call',
        message: `Call from ${callInfo.callerName || callInfo.callerId}`,
        type: 'warning',
        timestamp: new Date(),
        read: false,
      };
      setNotifications(prev => [notification, ...prev].slice(0, 50));
    });

    connection.on('QueueUpdated', (queueStats: any) => {
      console.log('Queue updated:', queueStats);
    });

    connection.on('NewMessage', (message: any) => {
      const notification: Notification = {
        id: crypto.randomUUID(),
        title: 'New Message',
        message: `${message.senderName}: ${message.content.substring(0, 50)}...`,
        type: 'info',
        timestamp: new Date(),
        read: false,
      };
      setNotifications(prev => [notification, ...prev].slice(0, 50));
    });

    // Connection state handlers
    connection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      console.log('SignalR reconnected');
      setIsConnected(true);
    });

    connection.onclose(() => {
      console.log('SignalR connection closed');
      setIsConnected(false);
    });

    // Start connection
    connection.start()
      .then(() => {
        console.log('SignalR connected');
        setIsConnected(true);
        connectionRef.current = connection;
      })
      .catch(err => {
        console.error('SignalR connection error:', err);
        setIsConnected(false);
      });

    return () => {
      connection.stop();
    };
  }, [isAuthenticated, token]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const sendMessage = useCallback(async (method: string, ...args: any[]) => {
    if (connectionRef.current && isConnected) {
      await connectionRef.current.invoke(method, ...args);
    }
  }, [isConnected]);

  return {
    connection: connectionRef.current,
    isConnected,
    notifications,
    agentStates,
    markNotificationRead,
    clearNotifications,
    sendMessage,
  };
};

export default useSignalR;
