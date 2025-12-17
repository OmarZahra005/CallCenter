import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bell,
  BellOff,
  Mail,
  Smartphone,
  Volume2,
  VolumeX,
  Monitor,
  Check,
  X,
  Loader2,
  Save,
  RefreshCw,
  Phone,
  MessageSquare,
  AlertTriangle,
  Users,
  Calendar,
  FileText,
  Shield,
  Zap,
} from 'lucide-react';
import { Button, Badge, Card, CardContent, Modal } from '../../../components/ui';
import apiClient from '../../../api/client';

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface NotificationPreference {
  categoryId: string;
  inApp: boolean;
  email: boolean;
  push: boolean;
  sound: boolean;
}

interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  category: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  { id: 'calls', name: 'Call Notifications', description: 'Incoming calls, missed calls, voicemails', icon: Phone, color: 'text-blue-500' },
  { id: 'messages', name: 'Messages', description: 'New messages, chat requests', icon: MessageSquare, color: 'text-green-500' },
  { id: 'alerts', name: 'System Alerts', description: 'Queue alerts, SLA warnings, system issues', icon: AlertTriangle, color: 'text-red-500' },
  { id: 'team', name: 'Team Updates', description: 'Agent status changes, shift changes', icon: Users, color: 'text-purple-500' },
  { id: 'schedule', name: 'Schedule', description: 'Shift reminders, schedule changes', icon: Calendar, color: 'text-orange-500' },
  { id: 'tickets', name: 'Tickets', description: 'New tickets, assignments, updates', icon: FileText, color: 'text-cyan-500' },
  { id: 'qa', name: 'Quality Assurance', description: 'Evaluation results, coaching sessions', icon: Shield, color: 'text-yellow-500' },
  { id: 'system', name: 'System', description: 'Maintenance, updates, announcements', icon: Zap, color: 'text-gray-500' },
];

const mockPreferences: NotificationPreference[] = NOTIFICATION_CATEGORIES.map((cat) => ({
  categoryId: cat.id,
  inApp: true,
  email: cat.id !== 'calls',
  push: ['calls', 'messages', 'alerts'].includes(cat.id),
  sound: ['calls', 'messages'].includes(cat.id),
}));

const mockHistory: NotificationHistory[] = [
  {
    id: 'notif-1',
    title: 'Incoming Call',
    message: 'Call from +1 (555) 123-4567',
    category: 'calls',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'New Ticket Assigned',
    message: 'Ticket #1234 has been assigned to you',
    category: 'tickets',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    actionUrl: '/tickets/1234',
  },
  {
    id: 'notif-3',
    title: 'Queue Alert',
    message: 'Support queue wait time exceeded 5 minutes',
    category: 'alerts',
    type: 'warning',
    read: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    title: 'QA Evaluation Complete',
    message: 'Your call has been evaluated. Score: 92%',
    category: 'qa',
    type: 'success',
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/qa',
  },
  {
    id: 'notif-5',
    title: 'Shift Reminder',
    message: 'Your shift starts in 30 minutes',
    category: 'schedule',
    type: 'info',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const NotificationSettings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'preferences' | 'history'>('preferences');
  const [preferences, setPreferences] = useState<NotificationPreference[]>(mockPreferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationHistory | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Fetch preferences
  const { isLoading: prefsLoading } = useQuery<NotificationPreference[]>({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/users/me/notification-preferences');
        const data = response.data.items || response.data || [];
        setPreferences(data);
        return data;
      } catch {
        return mockPreferences;
      }
    },
  });

  // Fetch notification history
  const { data: history = [], isLoading: historyLoading } = useQuery<NotificationHistory[]>({
    queryKey: ['notification-history'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/users/me/notifications');
        return response.data.items || response.data || [];
      } catch {
        return mockHistory;
      }
    },
  });

  // Save preferences mutation
  const saveMutation = useMutation({
    mutationFn: (data: NotificationPreference[]) =>
      apiClient.put('/users/me/notification-preferences', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setHasChanges(false);
    },
  });

  // Mark notification as read
  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/users/me/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-history'] });
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () => apiClient.post('/users/me/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-history'] });
    },
  });

  // Clear all notifications
  const clearAllMutation = useMutation({
    mutationFn: () => apiClient.delete('/users/me/notifications'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-history'] });
    },
  });

  const handleToggle = (categoryId: string, channel: keyof Omit<NotificationPreference, 'categoryId'>) => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.categoryId === categoryId ? { ...pref, [channel]: !pref[channel] } : pref
      )
    );
    setHasChanges(true);
  };

  const handleEnableAll = (channel: keyof Omit<NotificationPreference, 'categoryId'>) => {
    setPreferences((prev) => prev.map((pref) => ({ ...pref, [channel]: true })));
    setHasChanges(true);
  };

  const handleDisableAll = (channel: keyof Omit<NotificationPreference, 'categoryId'>) => {
    setPreferences((prev) => prev.map((pref) => ({ ...pref, [channel]: false })));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(preferences);
  };

  const handleReset = () => {
    setPreferences(mockPreferences);
    setHasChanges(false);
  };

  const filteredHistory = categoryFilter === 'all'
    ? history
    : history.filter((n) => n.category === categoryFilter);

  const unreadCount = history.filter((n) => !n.read).length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryInfo = (categoryId: string) => {
    return NOTIFICATION_CATEGORIES.find((c) => c.id === categoryId) || {
      id: categoryId,
      name: categoryId,
      description: '',
      icon: Bell,
      color: 'text-gray-500',
    };
  };

  const getTypeBadge = (type: NotificationHistory['type']) => {
    const config = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config[type]}`}>{type}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage how you receive notifications
          </p>
        </div>
        {activeTab === 'preferences' && hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} isLoading={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'preferences'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            History
            {unreadCount > 0 && (
              <Badge variant="danger" size="sm">
                {unreadCount}
              </Badge>
            )}
          </button>
        </nav>
      </div>

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card variant="bordered">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">In-App:</span>
                  <Button size="sm" variant="outline" onClick={() => handleEnableAll('inApp')}>
                    Enable All
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDisableAll('inApp')}>
                    Disable All
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Email:</span>
                  <Button size="sm" variant="outline" onClick={() => handleEnableAll('email')}>
                    Enable All
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDisableAll('email')}>
                    Disable All
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sound:</span>
                  <Button size="sm" variant="outline" onClick={() => handleEnableAll('sound')}>
                    Enable All
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDisableAll('sound')}>
                    Disable All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Categories */}
          {prefsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : (
            <Card variant="bordered">
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 text-sm font-medium text-gray-500">
                  <div className="col-span-4">Category</div>
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Monitor className="w-4 h-4" />
                      <span>In-App</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Smartphone className="w-4 h-4" />
                      <span>Push</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Volume2 className="w-4 h-4" />
                      <span>Sound</span>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                {NOTIFICATION_CATEGORIES.map((category) => {
                  const pref = preferences.find((p) => p.categoryId === category.id);
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.id}
                      className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${category.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{category.name}</p>
                          <p className="text-xs text-gray-500">{category.description}</p>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <ToggleButton
                          enabled={pref?.inApp ?? true}
                          onChange={() => handleToggle(category.id, 'inApp')}
                        />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <ToggleButton
                          enabled={pref?.email ?? false}
                          onChange={() => handleToggle(category.id, 'email')}
                        />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <ToggleButton
                          enabled={pref?.push ?? false}
                          onChange={() => handleToggle(category.id, 'push')}
                        />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <ToggleButton
                          enabled={pref?.sound ?? false}
                          onChange={() => handleToggle(category.id, 'sound')}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* History Controls */}
          <div className="flex items-center justify-between">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            >
              <option value="all">All Categories</option>
              {NOTIFICATION_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllReadMutation.mutate()}
                  isLoading={markAllReadMutation.isPending}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark All Read
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearAllMutation.mutate()}
                isLoading={clearAllMutation.isPending}
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <Card variant="bordered">
              <CardContent className="py-12 text-center">
                <BellOff className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No notifications</p>
              </CardContent>
            </Card>
          ) : (
            <Card variant="bordered">
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filteredHistory.map((notification) => {
                  const categoryInfo = getCategoryInfo(notification.category);
                  const Icon = categoryInfo.icon;

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 cursor-pointer transition-colors ${
                        !notification.read
                          ? 'bg-blue-50/50 dark:bg-blue-900/10'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markReadMutation.mutate(notification.id);
                        }
                        setSelectedNotification(notification);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${categoryInfo.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {notification.title}
                            </h4>
                            {getTypeBadge(notification.type)}
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1 truncate">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Notification Detail Modal */}
      <Modal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        title="Notification Details"
        size="md"
      >
        {selectedNotification && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {(() => {
                const categoryInfo = getCategoryInfo(selectedNotification.category);
                const Icon = categoryInfo.icon;
                return (
                  <>
                    <div className={`w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${categoryInfo.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {selectedNotification.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">{categoryInfo.name}</span>
                        {getTypeBadge(selectedNotification.type)}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300">{selectedNotification.message}</p>
            </div>

            <div className="text-sm text-gray-500">
              Received: {new Date(selectedNotification.createdAt).toLocaleString()}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {selectedNotification.actionUrl && (
                <Button
                  onClick={() => {
                    window.location.href = selectedNotification.actionUrl!;
                  }}
                >
                  View Details
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedNotification(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Toggle Button Component
const ToggleButton = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full shadow"
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
};

export default NotificationSettings;
