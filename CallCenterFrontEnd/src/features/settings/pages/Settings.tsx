import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, Button, Switch, Select, Input } from '../../../components/ui';
import { useThemeStore } from '../../../hooks/useTheme';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useThemeStore();

  // Local state for settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [timezone, setTimezone] = useState('Asia/Riyadh');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.settings')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account and application preferences
        </p>
      </div>

      {/* Appearance */}
      <Card variant="bordered">
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">Appearance</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Customize how the app looks</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Theme</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred theme</p>
              </div>
              <Select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                className="w-32"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </Select>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Language</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred language</p>
              </div>
              <Select
                value={i18n.language}
                onChange={handleLanguageChange}
                className="w-32"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional */}
      <Card variant="bordered">
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">Regional Settings</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure date, time, and regional preferences</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Timezone</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your local timezone</p>
              </div>
              <Select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-48"
              >
                <option value="Asia/Riyadh">Asia/Riyadh (UTC+3)</option>
                <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                <option value="Europe/London">Europe/London (UTC+0)</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
              </Select>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Date Format</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">How dates are displayed</p>
              </div>
              <Select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-40"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card variant="bordered">
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure notification preferences</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
              </div>
              <Switch
                checked={emailNotifications}
                onChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications in browser</p>
              </div>
              <Switch
                checked={pushNotifications}
                onChange={setPushNotifications}
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Sound Alerts</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Play sound for incoming calls and messages</p>
              </div>
              <Switch
                checked={soundAlerts}
                onChange={setSoundAlerts}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card variant="bordered">
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">Security</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Account security settings</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
              </div>
              <Switch
                checked={twoFactorAuth}
                onChange={setTwoFactorAuth}
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Session Timeout</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Auto logout after inactivity</p>
              </div>
              <Select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-40"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </Select>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Change Password</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Settings */}
      <Card variant="bordered">
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">Agent Settings</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure agent-specific preferences</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-Accept Calls</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Automatically answer incoming calls</p>
              </div>
              <Switch checked={false} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Wrap-up Time</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Time for after-call work</p>
              </div>
              <Select className="w-40">
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="120">2 minutes</option>
                <option value="300">5 minutes</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card variant="bordered" className="border-red-200 dark:border-red-900">
        <CardHeader>
          <h3 className="font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Delete Account</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="danger" size="sm">{t('common.delete')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
};

export default Settings;
