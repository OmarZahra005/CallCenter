import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../hooks/useTheme';
import { useSignalR } from '../../hooks/useSignalR';
import { useCallCenterShortcuts } from '../../hooks/useKeyboardShortcuts';
import { NotificationDropdown, Toast, SkipLink, KeyboardShortcutsDialog } from '../ui';
import { cn } from '../../utils/cn';
import { pageVariants, pageTransition } from '../../utils/animations';

const MainLayout = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { isConnected, notifications, markNotificationRead, clearNotifications } = useSignalR();
  const navigate = useNavigate();
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Keyboard shortcuts
  const shortcuts = useCallCenterShortcuts({
    onNavigateDashboard: () => navigate('/dashboard'),
    onNavigateAgents: () => navigate('/agents'),
    onNavigateTickets: () => navigate('/tickets'),
    onToggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    onHelp: () => setShowShortcuts(true),
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/agent-desktop', label: 'Agent Desktop', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
    { path: '/communications', label: 'Inbox', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { path: '/agents', label: t('nav.agents'), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { path: '/tickets', label: t('nav.tickets'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { path: '/customers', label: t('nav.customers'), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { path: '/teams', label: 'Teams', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { path: '/knowledge-base', label: t('nav.knowledgeBase'), icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { path: '/reports', label: t('nav.reports'), icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { path: '/qa', label: 'QA', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/wfm', label: 'WFM', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { path: '/settings', label: t('nav.settings'), icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip links for accessibility */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 start-0 z-50 w-64 bg-white dark:bg-gray-800 border-e border-gray-200 dark:border-gray-700/50" role="navigation" aria-label="Main navigation">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700/50">
            <motion.h1
              className="text-xl font-bold gradient-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              CallCenter
            </motion.h1>
          </div>

          {/* Navigation */}
          <nav id="navigation" className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
            <ul className="space-y-1" role="list">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <motion.svg
                          className={cn(
                            'w-5 h-5 flex-shrink-0 transition-colors',
                            isActive && 'text-primary-500'
                          )}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </motion.svg>
                        <span>{item.label}</span>
                        {isActive && (
                          <motion.div
                            className="absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full"
                            layoutId="activeIndicator"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* User section */}
          <motion.div
            className="p-4 border-t border-gray-200 dark:border-gray-700/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <span className="text-sm font-semibold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.role}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </aside>

      {/* Main content */}
      <div className="ms-64">
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-end h-full px-6 gap-3">
            {/* Connection status */}
            <motion.div
              className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-gray-400'
              )}
              title={isConnected ? 'Connected' : 'Disconnected'}
              animate={isConnected ? {
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1],
              } : undefined}
              transition={isConnected ? {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              } : undefined}
            />

            {/* Notifications */}
            <NotificationDropdown
              notifications={notifications}
              onMarkRead={markNotificationRead}
              onClear={clearNotifications}
            />

            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.svg
                    key="sun"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="moon"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Language toggle */}
            <motion.button
              onClick={toggleLanguage}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {i18n.language === 'en' ? 'العربية' : 'English'}
            </motion.button>

            {/* Logout */}
            <motion.button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('auth.logout')}
            </motion.button>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="p-6" role="main">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toast />

      {/* Keyboard shortcuts dialog */}
      <KeyboardShortcutsDialog
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        shortcuts={shortcuts}
      />
    </div>
  );
};

export default MainLayout;
