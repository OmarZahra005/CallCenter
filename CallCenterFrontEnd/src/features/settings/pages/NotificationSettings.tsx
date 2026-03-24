import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bell,
  BellOff,
  Mail,
  Smartphone,
  Volume2,
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
import { Button, Badge, Card, CardContent, Modal, Switch } from '../../../components/ui';
import apiClient from '../../../api/client';

interface NotificationCategory {
  id: string;
  nameKey: string;
  descKey: string;
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
  { id: 'calls', nameKey: 'callNotifications', descKey: 'callNotificationsDesc', icon: Phone, color: 'text-blue-500' },
  { id: 'messages', nameKey: 'messages', descKey: 'messagesDesc', icon: MessageSquare, color: 'text-green-500' },
  { id: 'alerts', nameKey: 'systemAlerts', descKey: 'systemAlertsDesc', icon: AlertTriangle, color: 'text-red-500' },
  { id: 'team', nameKey: 'teamUpdates', descKey: 'teamUpdatesDesc', icon: Users, color: 'text-purple-500' },
  { id: 'schedule', nameKey: 'schedule', descKey: 'scheduleDesc', icon: Calendar, color: 'text-orange-500' },
  { id: 'tickets', nameKey: 'tickets', descKey: 'ticketsDesc', icon: FileText, color: 'text-cyan-500' },
  { id: 'qa', nameKey: 'qualityAssurance', descKey: 'qualityAssuranceDesc', icon: Shield, color: 'text-yellow-500' },
  { id: 'system', nameKey: 'systemCategory', descKey: 'systemCategoryDesc', icon: Zap, color: 'text-gray-500' },
];

const defaultPreferences: NotificationPreference[] = NOTIFICATION_CATEGORIES.map((cat) => ({
  categoryId: cat.id,
  inApp: true,
  email: cat.id !== 'calls',
  push: ['calls', 'messages', 'alerts'].includes(cat.id),
  sound: ['calls', 'messages'].includes(cat.id),
}));

export const NotificationSettings = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'preferences' | 'history'>('preferences');
  const [preferences, setPreferences] = useState<NotificationPreference[]>(defaultPreferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationHistory | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Fetch preferences
  const { isLoading: prefsLoading } = useQuery<NotificationPreference[]>({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const response = await apiClient.get('/users/me/notification-preferences');
      const data = response.data.items || response.data || [];
      if (data.length > 0) {
        setPreferences(data);
      }
      return data;
    },
  });

  // Fetch notification history
  const { data: history = [], isLoading: historyLoading } = useQuery<NotificationHistory[]>({
    queryKey: ['notification-history'],
    queryFn: async () => {
      const response = await apiClient.get('/users/me/notifications');
      return response.data.items || response.data || [];
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
    setPreferences(defaultPreferences);
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

    if (diffMins < 1) return t('notificationSettingsPage.justNow');
    if (diffMins < 60) return t('notificationSettingsPage.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('notificationSettingsPage.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('notificationSettingsPage.daysAgo', { count: diffDays });
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US');
  };

  const getCategoryInfo = (categoryId: string) => {
    const cat = NOTIFICATION_CATEGORIES.find((c) => c.id === categoryId);
    if (!cat) {
      return {
        id: categoryId,
        name: categoryId,
        description: '',
        icon: Bell,
        color: 'text-gray-500',
      };
    }
    return {
      id: cat.id,
      name: t(`notificationSettingsPage.${cat.nameKey}`),
      description: t(`notificationSettingsPage.${cat.descKey}`),
      icon: cat.icon,
      color: cat.color,
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
    <div className="space-y-6" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('notificationSettingsPage.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('notificationSettingsPage.subtitle')}
          </p>
        </div>
        {activeTab === 'preferences' && hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('notificationSettingsPage.reset')}
            </Button>
            <Button onClick={handleSave} isLoading={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {t('notificationSettingsPage.saveChanges')}
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
            {t('notificationSettingsPage.preferences')}
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
            {t('notificationSettingsPage.history')}
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
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">{t('notificationSettingsPage.quickActions')}</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{t('notificationSettingsPage.inApp')}:</span>
                  <Button size="sm" variant="outline" onClick={() => handleEnableAll('inApp')}>
                    {t('notificationSettingsPage.enableAll')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDisableAll('inApp')}>
                    {t('notificationSettingsPage.disableAll')}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{t('notificationSettingsPage.email')}:</span>
                  <Button size="sm" variant="outline" onClick={() => handleEnableAll('email')}>
                    {t('notificationSettingsPage.enableAll')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDisableAll('email')}>
                    {t('notificationSettingsPage.disableAll')}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{t('notificationSettingsPage.sound')}:</span>
                  <Button size="sm" variant="outline" onClick={() => handleEnableAll('sound')}>
                    {t('notificationSettingsPage.enableAll')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDisableAll('sound')}>
                    {t('notificationSettingsPage.disableAll')}
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
                  <div className="col-span-4">{t('notificationSettingsPage.category')}</div>
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Monitor className="w-4 h-4" />
                      <span>{t('notificationSettingsPage.inApp')}</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{t('notificationSettingsPage.email')}</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Smartphone className="w-4 h-4" />
                      <span>{t('notificationSettingsPage.push')}</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Volume2 className="w-4 h-4" />
                      <span>{t('notificationSettingsPage.sound')}</span>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                {NOTIFICATION_CATEGORIES.map((category) => {
                  const pref = preferences.find((p) => p.categoryId === category.id);
                  const Icon = category.icon;
                  const catInfo = getCategoryInfo(category.id);
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
                          <p className="font-medium text-gray-900 dark:text-white">{catInfo.name}</p>
                          <p className="text-xs text-gray-500">{catInfo.description}</p>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <Switch
                          id={`${category.id}-inApp`}
                          checked={pref?.inApp ?? true}
                          onChange={() => handleToggle(category.id, 'inApp')}
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <Switch
                          id={`${category.id}-email`}
                          checked={pref?.email ?? false}
                          onChange={() => handleToggle(category.id, 'email')}
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <Switch
                          id={`${category.id}-push`}
                          checked={pref?.push ?? false}
                          onChange={() => handleToggle(category.id, 'push')}
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <Switch
                          id={`${category.id}-sound`}
                          checked={pref?.sound ?? false}
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
              <option value="all">{t('notificationSettingsPage.allCategories')}</option>
              {NOTIFICATION_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {t(`notificationSettingsPage.${cat.nameKey}`)}
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
                  {t('notificationSettingsPage.markAllRead')}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearAllMutation.mutate()}
                isLoading={clearAllMutation.isPending}
              >
                <X className="w-4 h-4 mr-1" />
                {t('notificationSettingsPage.clearAll')}
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
                <p className="text-gray-500">{t('notificationSettingsPage.noNotifications')}</p>
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
        title={t('notificationSettingsPage.notificationDetails')}
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
              {t('notificationSettingsPage.received')}: {new Date(selectedNotification.createdAt).toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {selectedNotification.actionUrl && (
                <Button
                  onClick={() => {
                    window.location.href = selectedNotification.actionUrl!;
                  }}
                >
                  {t('notificationSettingsPage.viewDetails')}
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedNotification(null)}>
                {t('notificationSettingsPage.close')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NotificationSettings;
