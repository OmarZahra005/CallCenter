import { useState, useMemo, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../hooks/useTheme';
import { useSignalR } from '../../hooks/useSignalR';
import { useCallCenterShortcuts } from '../../hooks/useKeyboardShortcuts';
import { usePermissions } from '../../hooks/usePermissions';
import { NotificationDropdown, Toast, SkipLink, KeyboardShortcutsDialog } from '../ui';
import { cn } from '../../utils/cn';
import { pageVariants, pageTransition } from '../../utils/animations';
import {
  LayoutDashboard,
  Headphones,
  Phone,
  PhoneOutgoing,
  Inbox,
  Users,
  UsersRound,
  Calendar,
  UserCircle,
  Ticket,
  Mic,
  ClipboardCheck,
  FileQuestion,
  BookOpen,
  BarChart3,
  Download,
  MessageCircle,
  Zap,
  Bell,
  AlertTriangle,
  UserCog,
  Shield,
  Settings,
  FileText,
  ChevronDown,
  LogOut,
} from 'lucide-react';

interface NavChild {
  path: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavChild[];
  permission?: string;
}

const MainLayout = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { isConnected, notifications, markNotificationRead, markAllAsRead, clearNotifications } = useSignalR();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['operations', 'workforce']);

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

  const { i18n } = useTranslation();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  // Navigation structure with parent/child hierarchy
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/dashboard',
      permission: 'dashboard.view',
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: <Headphones className="w-5 h-5" />,
      children: [
        { path: '/agent-desktop', label: 'Agent Desktop', icon: <Headphones className="w-4 h-4" />, permission: 'calls.view' },
        { path: '/outcall', label: 'Outbound Call', icon: <PhoneOutgoing className="w-4 h-4" />, permission: 'calls.view' },
        { path: '/call-center', label: t('nav.calls'), icon: <Phone className="w-4 h-4" />, permission: 'calls.view' },
        { path: '/communications', label: 'Inbox', icon: <Inbox className="w-4 h-4" />, permission: 'calls.view' },
      ],
    },
    {
      id: 'workforce',
      label: 'Workforce',
      icon: <Users className="w-5 h-5" />,
      children: [
        { path: '/agents', label: t('nav.agents'), icon: <UserCircle className="w-4 h-4" />, permission: 'agents.view' },
        { path: '/teams', label: 'Teams', icon: <UsersRound className="w-4 h-4" />, permission: 'teams.view' },
        { path: '/wfm', label: 'WFM', icon: <Calendar className="w-4 h-4" />, permission: 'wfm.view' },
      ],
    },
    {
      id: 'customers',
      label: t('nav.customers'),
      icon: <UserCircle className="w-5 h-5" />,
      children: [
        { path: '/customers', label: t('nav.customers'), icon: <UserCircle className="w-4 h-4" />, permission: 'customers.view' },
        { path: '/tickets', label: t('nav.tickets'), icon: <Ticket className="w-4 h-4" />, permission: 'tickets.view' },
      ],
    },
    {
      id: 'quality',
      label: 'Quality',
      icon: <ClipboardCheck className="w-5 h-5" />,
      children: [
        { path: '/recordings', label: 'Recordings', icon: <Mic className="w-4 h-4" />, permission: 'recordings.view' },
        { path: '/qa', label: 'QA', icon: <ClipboardCheck className="w-4 h-4" />, permission: 'qa.view' },
        { path: '/surveys', label: 'Surveys', icon: <FileQuestion className="w-4 h-4" />, permission: 'qa.view' },
      ],
    },
    {
      id: 'knowledge',
      label: 'Knowledge',
      icon: <BookOpen className="w-5 h-5" />,
      children: [
        { path: '/knowledge-base', label: t('nav.knowledgeBase'), icon: <BookOpen className="w-4 h-4" />, permission: 'knowledge.view' },
      ],
    },
    {
      id: 'reports',
      label: t('nav.reports'),
      icon: <BarChart3 className="w-5 h-5" />,
      children: [
        { path: '/reports', label: t('nav.reports'), icon: <BarChart3 className="w-4 h-4" />, permission: 'reports.view' },
        { path: '/admin/exports', label: 'Data Exports', icon: <Download className="w-4 h-4" />, permission: 'reports.export' },
      ],
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <Zap className="w-5 h-5" />,
      children: [
        { path: '/admin/whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" />, permission: 'admin.integrations' },
        { path: '/admin/cti-events', label: 'CTI Events', icon: <Zap className="w-4 h-4" />, permission: 'admin.integrations' },
      ],
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      children: [
        { path: '/settings/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        { path: '/admin/alerts', label: 'Alert Rules', icon: <AlertTriangle className="w-4 h-4" />, permission: 'admin.alerts' },
      ],
    },
    {
      id: 'settings',
      label: t('nav.settings'),
      icon: <Settings className="w-5 h-5" />,
      children: [
        { path: '/agents', label: 'Users', icon: <UserCog className="w-4 h-4" />, permission: 'agents.view' },
        { path: '/admin/roles', label: 'Roles & Permissions', icon: <Shield className="w-4 h-4" />, permission: 'system.roles_manage' },
        { path: '/admin/system-settings', label: 'System Settings', icon: <Settings className="w-4 h-4" />, permission: 'admin.settings' },
        { path: '/admin/audit-logs', label: 'Audit Logs', icon: <FileText className="w-4 h-4" />, permission: 'admin.audit_logs' },
      ],
    },
  ];

  // Check if a parent menu has an active child
  const isParentActive = (children: NavChild[] | undefined) => {
    if (!children) return false;
    return children.some(child => location.pathname === child.path || location.pathname.startsWith(child.path + '/'));
  };

  // Filter visible children based on permissions
  const getVisibleChildren = useCallback((children: NavChild[] | undefined) => {
    if (!children) return [];
    // Super admin sees everything
    if (isSuperAdmin) return children;
    // Filter children based on permission
    return children.filter(child => !child.permission || hasPermission(child.permission));
  }, [isSuperAdmin, hasPermission]);

  // Filter nav items to hide parents with no visible children
  const visibleNavItems = useMemo(() => {
    return navItems.filter(item => {
      // Super admin sees everything
      if (isSuperAdmin) {
        if (item.path) return true;
        return (item.children?.length ?? 0) > 0;
      }
      // Standalone items check their own permission
      if (item.path) {
        return !item.permission || hasPermission(item.permission);
      }
      // Parent items check if any children are visible
      const visibleChildren = getVisibleChildren(item.children);
      return visibleChildren.length > 0;
    });
  }, [navItems, isSuperAdmin, hasPermission, getVisibleChildren]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip links for accessibility */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 start-0 z-50 w-64 bg-white dark:bg-gray-800" role="navigation" aria-label="Main navigation">
        <div className="flex flex-col h-full">
          {/* Logo & Branding - border matches header */}
          <div className="h-16 bg-primary-600 dark:bg-primary-700 flex items-center gap-3 px-5 border-e border-primary-600 dark:border-primary-700">
            <Headphones className="w-7 h-7 text-white" />
            <span className="text-lg font-semibold text-white">CallCenter</span>
          </div>

          {/* Navigation */}
          <nav id="navigation" className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
            <ul className="space-y-1" role="list">
              {visibleNavItems.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  {/* Standalone item (no children) */}
                  {item.path ? (
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
                          <span className={cn('flex-shrink-0 transition-colors', isActive && 'text-primary-500')}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  ) : (
                    /* Parent item with children */
                    <div>
                      <button
                        onClick={() => toggleMenu(item.id)}
                        className={cn(
                          'w-full group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                          isParentActive(item.children)
                            ? 'bg-primary-50/50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn('flex-shrink-0 transition-colors', isParentActive(item.children) && 'text-primary-500')}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        <motion.span
                          animate={{ rotate: expandedMenus.includes(item.id) ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.span>
                      </button>

                      {/* Children */}
                      <AnimatePresence>
                        {expandedMenus.includes(item.id) && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden mt-1 ms-4 ps-3 border-s-2 border-gray-200 dark:border-gray-700 space-y-1"
                          >
                            {getVisibleChildren(item.children).map((child) => (
                              <motion.li
                                key={child.path}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                              >
                                <NavLink
                                  to={child.path}
                                  className={({ isActive }) =>
                                    cn(
                                      'group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                                      isActive
                                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 font-medium'
                                        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                    )
                                  }
                                >
                                  {({ isActive }) => (
                                    <>
                                      <span className={cn('flex-shrink-0 transition-colors', isActive && 'text-primary-500')}>
                                        {child.icon}
                                      </span>
                                      <span>{child.label}</span>
                                    </>
                                  )}
                                </NavLink>
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
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
        <header className="sticky top-0 z-40 h-16 bg-primary-600 dark:bg-primary-700 shadow-sm">
          <div className="flex items-center justify-end h-full px-6">
            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Connection status */}
              <motion.div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isConnected ? 'bg-green-400' : 'bg-white/40'
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
                onMarkAllRead={markAllAsRead}
                onClear={clearNotifications}
                variant="light"
              />

              {/* Theme toggle */}
              <motion.button
                onClick={toggleTheme}
                className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
                className="px-3 py-1.5 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {i18n.language === 'en' ? 'العربية' : 'English'}
              </motion.button>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </button>
                {/* Dropdown */}
                <div className="absolute end-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('auth.logout')}
                  </button>
                </div>
              </div>
            </div>
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
