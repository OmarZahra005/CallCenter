import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/apiConfig';
import apiClient from '../api/client';

const HUB_URL = `${API_BASE_URL}/hubs/callcenter`;

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Backend notification structure
interface BackendNotification {
  id: string;
  recipientId: string;
  notificationType: string;
  message: string;
  priority: number;
  relatedEntityType?: string;
  relatedEntityId?: string;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
}

// Map backend priority to UI type
const priorityToType = (priority: number): 'info' | 'success' | 'warning' | 'error' => {
  switch (priority) {
    case 0: return 'info';
    case 1: return 'warning';
    case 2: return 'error';
    default: return 'info';
  }
};

// Map notification type to title
const typeToTitle = (type: string): string => {
  const titles: Record<string, string> = {
    'CallAssigned': 'Call Assigned',
    'TicketCreated': 'New Ticket',
    'TicketUpdated': 'Ticket Updated',
    'QAScoreReceived': 'QA Score',
    'ShiftReminder': 'Shift Reminder',
    'TimeOffApproved': 'Time Off Approved',
    'TimeOffRejected': 'Time Off Rejected',
    'SystemAlert': 'System Alert',
  };
  return titles[type] || type.replace(/([A-Z])/g, ' $1').trim();
};

interface UseSignalRReturn {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  notifications: Notification[];
  agentStates: Record<string, string>;
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  refreshNotifications: () => Promise<void>;
  sendMessage: (method: string, ...args: any[]) => Promise<void>;
}

export const useSignalR = (): UseSignalRReturn => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [agentStates, setAgentStates] = useState<Record<string, string>>({});
  const { accessToken: token, isAuthenticated } = useAuthStore();

  // Load notifications from backend API
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await apiClient.get<BackendNotification[]>('/notifications', {
        params: { unreadOnly: false, pageSize: 50 }
      });
      const backendNotifications: Notification[] = response.data.map((n: BackendNotification) => ({
        id: n.id,
        title: typeToTitle(n.notificationType),
        message: n.message,
        type: priorityToType(n.priority),
        timestamp: new Date(n.createdAt),
        read: n.isRead,
        actionUrl: n.actionUrl,
      }));
      setNotifications(prev => {
        // Merge with real-time notifications, avoiding duplicates
        const existingIds = new Set(backendNotifications.map(n => n.id));
        const realTimeOnly = prev.filter(n => !existingIds.has(n.id));
        return [...realTimeOnly, ...backendNotifications].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        ).slice(0, 50);
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  // Load notifications on auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

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

  const markNotificationRead = useCallback(async (id: string) => {
    // Update local state immediately
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    // Call API to persist
    try {
      await apiClient.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter(n => !n.read);
    // Update local state immediately
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // Call API for each unread notification
    for (const notification of unread) {
      try {
        await apiClient.put(`/notifications/${notification.id}/read`);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  }, [notifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const sendMessage = useCallback(async (method: string, ...args: any[]) => {
    if (connectionRef.current && isConnected) {
      await connectionRef.current.invoke(method, ...args);
    }
  }, [isConnected]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    connection: connectionRef.current,
    isConnected,
    notifications,
    agentStates,
    unreadCount,
    markNotificationRead,
    markAllAsRead,
    clearNotifications,
    refreshNotifications: fetchNotifications,
    sendMessage,
  };
};

export default useSignalR;
