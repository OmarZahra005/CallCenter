import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Settings,
  Phone,
  Globe,
  Bell,
  Shield,
  Database,
  Mail,
  Clock,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronRight,
  Search,
  Info,
} from 'lucide-react';
import { Card, CardContent, Button, Badge } from '../../../components/ui';
import { staggerContainer, fadeUp } from '../../../utils/animations';
import apiClient from '../../../api/client';

// Types
interface SystemSetting {
  key: string;
  value: string;
  category: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'json';
  options?: { value: string; label: string }[];
  isSecret?: boolean;
}

interface SettingCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

const CATEGORIES: SettingCategory[] = [
  { id: 'general', name: 'General', icon: Settings, description: 'Basic system configuration' },
  { id: 'voice', name: 'Voice & Telephony', icon: Phone, description: 'Call center and Twilio settings' },
  { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Alert and notification preferences' },
  { id: 'security', name: 'Security', icon: Shield, description: 'Authentication and access control' },
  { id: 'integrations', name: 'Integrations', icon: Globe, description: 'Third-party service connections' },
  { id: 'email', name: 'Email', icon: Mail, description: 'Email server configuration' },
  { id: 'database', name: 'Database', icon: Database, description: 'Data storage and backup settings' },
];

// Mock settings
const generateMockSettings = (): SystemSetting[] => [
  // General
  { key: 'company_name', value: 'Call Center Pro', category: 'general', description: 'Company display name', type: 'string' },
  { key: 'timezone', value: 'America/New_York', category: 'general', description: 'Default system timezone', type: 'select', options: [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC' },
  ]},
  { key: 'date_format', value: 'MM/DD/YYYY', category: 'general', description: 'Date display format', type: 'select', options: [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  ]},
  { key: 'language', value: 'en', category: 'general', description: 'Default system language', type: 'select', options: [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'Arabic' },
    { value: 'es', label: 'Spanish' },
  ]},

  // Voice
  { key: 'twilio_account_sid', value: 'AC*********************', category: 'voice', description: 'Twilio Account SID', type: 'string', isSecret: true },
  { key: 'twilio_auth_token', value: '********************************', category: 'voice', description: 'Twilio Auth Token', type: 'string', isSecret: true },
  { key: 'twilio_phone_number', value: '+1234567890', category: 'voice', description: 'Main Twilio phone number', type: 'string' },
  { key: 'call_recording_enabled', value: 'true', category: 'voice', description: 'Enable call recording', type: 'boolean' },
  { key: 'max_call_duration', value: '3600', category: 'voice', description: 'Maximum call duration (seconds)', type: 'number' },
  { key: 'wrap_up_time', value: '30', category: 'voice', description: 'After-call work time (seconds)', type: 'number' },

  // Notifications
  { key: 'email_notifications', value: 'true', category: 'notifications', description: 'Enable email notifications', type: 'boolean' },
  { key: 'push_notifications', value: 'true', category: 'notifications', description: 'Enable push notifications', type: 'boolean' },
  { key: 'sound_alerts', value: 'true', category: 'notifications', description: 'Enable sound alerts', type: 'boolean' },
  { key: 'notification_frequency', value: 'instant', category: 'notifications', description: 'Notification delivery timing', type: 'select', options: [
    { value: 'instant', label: 'Instant' },
    { value: 'batched', label: 'Batched (every 5 min)' },
    { value: 'hourly', label: 'Hourly digest' },
  ]},

  // Security
  { key: 'session_timeout', value: '30', category: 'security', description: 'Session timeout (minutes)', type: 'number' },
  { key: 'password_min_length', value: '8', category: 'security', description: 'Minimum password length', type: 'number' },
  { key: 'two_factor_enabled', value: 'false', category: 'security', description: 'Require two-factor authentication', type: 'boolean' },
  { key: 'ip_whitelist', value: '', category: 'security', description: 'IP whitelist (comma-separated)', type: 'string' },

  // Integrations
  { key: 'webhook_url', value: '', category: 'integrations', description: 'Webhook endpoint URL', type: 'string' },
  { key: 'api_rate_limit', value: '100', category: 'integrations', description: 'API requests per minute', type: 'number' },
  { key: 'crm_integration', value: 'none', category: 'integrations', description: 'CRM integration', type: 'select', options: [
    { value: 'none', label: 'None' },
    { value: 'salesforce', label: 'Salesforce' },
    { value: 'hubspot', label: 'HubSpot' },
    { value: 'zoho', label: 'Zoho CRM' },
  ]},

  // Email
  { key: 'smtp_host', value: 'smtp.example.com', category: 'email', description: 'SMTP server hostname', type: 'string' },
  { key: 'smtp_port', value: '587', category: 'email', description: 'SMTP port', type: 'number' },
  { key: 'smtp_username', value: 'notifications@example.com', category: 'email', description: 'SMTP username', type: 'string' },
  { key: 'smtp_password', value: '********', category: 'email', description: 'SMTP password', type: 'string', isSecret: true },
  { key: 'from_email', value: 'no-reply@example.com', category: 'email', description: 'Default sender email', type: 'string' },

  // Database
  { key: 'backup_enabled', value: 'true', category: 'database', description: 'Enable automatic backups', type: 'boolean' },
  { key: 'backup_frequency', value: 'daily', category: 'database', description: 'Backup frequency', type: 'select', options: [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
  ]},
  { key: 'data_retention_days', value: '365', category: 'database', description: 'Data retention period (days)', type: 'number' },
];

export const SystemSettings = () => {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch settings
  const { data: settings = [], isLoading } = useQuery<SystemSetting[]>({
    queryKey: ['system-settings'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/settings');
        return response.data.items || response.data || [];
      } catch {
        return generateMockSettings();
      }
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (updates: { key: string; value: string }[]) => {
      return apiClient.put('/settings', { settings: updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      setEditedSettings({});
      setHasChanges(false);
    },
  });

  // Filter settings by category and search
  const filteredSettings = settings.filter((setting) => {
    const matchesCategory = setting.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      setting.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSettingChange = (key: string, value: string) => {
    setEditedSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const getValue = (setting: SystemSetting) => {
    return editedSettings[setting.key] ?? setting.value;
  };

  const handleSave = () => {
    const updates = Object.entries(editedSettings).map(([key, value]) => ({ key, value }));
    saveMutation.mutate(updates);
  };

  const handleReset = () => {
    setEditedSettings({});
    setHasChanges(false);
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const value = getValue(setting);

    switch (setting.type) {
      case 'boolean':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked ? 'true' : 'false')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </label>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        );

      default:
        return (
          <input
            type={setting.isSecret ? 'password' : 'text'}
            value={value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        );
    }
  };

  const activeCateg = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-5"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure system-wide settings and preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="warning">Unsaved Changes</Badge>
            )}
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </motion.div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Category Sidebar */}
        <Card className="lg:col-span-1 p-2">
          <nav className="space-y-1">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              const count = settings.filter((s) => s.category === category.id).length;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{category.name}</p>
                  </div>
                  <Badge variant="outline" size="sm">
                    {count}
                  </Badge>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Settings Panel */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            {activeCateg && (
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <activeCateg.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {activeCateg.name}
                    </h2>
                    <p className="text-sm text-gray-500">{activeCateg.description}</p>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : filteredSettings.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No settings found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredSettings.map((setting) => {
                  const isEdited = setting.key in editedSettings;

                  return (
                    <div
                      key={setting.key}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg ${
                        isEdited ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'bg-gray-50 dark:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {setting.key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </p>
                          {setting.isSecret && (
                            <Badge variant="outline" size="sm">
                              Secret
                            </Badge>
                          )}
                          {isEdited && (
                            <Badge variant="warning" size="sm">
                              Modified
                            </Badge>
                          )}
                        </div>
                        {setting.description && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            {setting.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">{renderSettingInput(setting)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Success/Error Toast */}
      {saveMutation.isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg shadow-lg"
        >
          <CheckCircle className="w-5 h-5" />
          Settings saved successfully
        </motion.div>
      )}
    </motion.div>
  );
};

export default SystemSettings;
