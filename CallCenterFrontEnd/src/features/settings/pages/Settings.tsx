import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, Button, Switch, Select } from '../../../components/ui';
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
    <div className="space-y-6 max-w-4xl" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settingsPage.title')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('settingsPage.subtitle')}
        </p>
      </div>

      {/* Appearance */}
      <Card variant="bordered">
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('settingsPage.appearance')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.appearanceDesc')}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settingsPage.theme')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.themeDesc')}</p>
              </div>
              <Select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                className="w-32"
              >
                <option value="light">{t('settingsPage.light')}</option>
                <option value="dark">{t('settingsPage.dark')}</option>
                <option value="system">{t('settingsPage.system')}</option>
              </Select>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settingsPage.language')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.languageDesc')}</p>
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
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('settingsPage.regionalSettings')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.regionalDesc')}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settingsPage.timezone')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.timezoneDesc')}</p>
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
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settingsPage.dateFormat')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.dateFormatDesc')}</p>
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
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('settingsPage.notifications')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.notificationsDesc')}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settingsPage.emailNotifications')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.emailNotificationsDesc')}</p>
              </div>
              <Switch
                checked={emailNotifications}
                onChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settingsPage.pushNotifications')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.pushNotificationsDesc')}</p>
              </div>
              <Switch
                checked={pushNotifications}
                onChange={setPushNotifications}
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settingsPage.soundAlerts')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.soundAlertsDesc')}</p>
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
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('settingsPage.security')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.securityDesc')}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settingsPage.twoFactorAuth')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.twoFactorAuthDesc')}</p>
              </div>
              <Switch
                checked={twoFactorAuth}
                onChange={setTwoFactorAuth}
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settingsPage.sessionTimeout')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.sessionTimeoutDesc')}</p>
              </div>
              <Select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-40"
              >
                <option value="15">{t('settingsPage.minutes15')}</option>
                <option value="30">{t('settingsPage.minutes30')}</option>
                <option value="60">{t('settingsPage.hour1')}</option>
                <option value="120">{t('settingsPage.hours2')}</option>
              </Select>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settingsPage.changePassword')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.changePasswordDesc')}</p>
              </div>
              <Button variant="outline" size="sm">{t('settingsPage.change')}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Settings */}
      <Card variant="bordered">
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('settingsPage.agentSettings')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.agentSettingsDesc')}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settingsPage.autoAcceptCalls')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.autoAcceptCallsDesc')}</p>
              </div>
              <Switch checked={false} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settingsPage.wrapUpTime')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.wrapUpTimeDesc')}</p>
              </div>
              <Select className="w-40">
                <option value="30">{t('settingsPage.seconds30')}</option>
                <option value="60">{t('settingsPage.minute1')}</option>
                <option value="120">{t('settingsPage.minutes2')}</option>
                <option value="300">{t('settingsPage.minutes5')}</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card variant="bordered" className="border-red-200 dark:border-red-900">
        <CardHeader>
          <h3 className="font-semibold text-red-600 dark:text-red-400">{t('settingsPage.dangerZone')}</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settingsPage.deleteAccount')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settingsPage.deleteAccountDesc')}
              </p>
            </div>
            <Button variant="danger" size="sm">{t('common.delete')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button>{t('settingsPage.saveChanges')}</Button>
      </div>
    </div>
  );
};

export default Settings;
