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
  Menu,
  X,
  MoreHorizontal,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<string[]>(['operations', 'workforce']);

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

  const toggleMobileMenu = (menuId: string) => {
    setExpandedMobileMenus(prev =>
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
      label: t('nav.operations'),
      icon: <Headphones className="w-5 h-5" />,
      children: [
        { path: '/agent-desktop', label: t('nav.agentDesktop'), icon: <Headphones className="w-4 h-4" />, permission: 'calls.view' },
        { path: '/outcall', label: t('nav.outboundCall'), icon: <PhoneOutgoing className="w-4 h-4" />, permission: 'calls.view' },
        { path: '/call-center', label: t('nav.calls'), icon: <Phone className="w-4 h-4" />, permission: 'calls.view' },
        { path: '/communications', label: t('nav.inbox'), icon: <Inbox className="w-4 h-4" />, permission: 'calls.view' },
      ],
    },
    {
      id: 'workforce',
      label: t('nav.workforce'),
      icon: <Users className="w-5 h-5" />,
      children: [
        { path: '/agents', label: t('nav.agents'), icon: <UserCircle className="w-4 h-4" />, permission: 'agents.view' },
        { path: '/teams', label: t('nav.teams'), icon: <UsersRound className="w-4 h-4" />, permission: 'teams.view' },
        { path: '/wfm', label: t('nav.wfm'), icon: <Calendar className="w-4 h-4" />, permission: 'wfm.view' },
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
      label: t('nav.quality'),
      icon: <ClipboardCheck className="w-5 h-5" />,
      children: [
        { path: '/recordings', label: t('nav.recordings'), icon: <Mic className="w-4 h-4" />, permission: 'recordings.view' },
        { path: '/qa', label: t('nav.qa'), icon: <ClipboardCheck className="w-4 h-4" />, permission: 'qa.view' },
        { path: '/surveys', label: t('nav.surveys'), icon: <FileQuestion className="w-4 h-4" />, permission: 'qa.view' },
      ],
    },
    {
      id: 'reports',
      label: t('nav.reports'),
      icon: <BarChart3 className="w-5 h-5" />,
      children: [
        { path: '/reports', label: t('nav.reports'), icon: <BarChart3 className="w-4 h-4" />, permission: 'reports.view' },
        { path: '/admin/exports', label: t('nav.dataExports'), icon: <Download className="w-4 h-4" />, permission: 'reports.export' },
      ],
    },
    {
      id: 'knowledge',
      label: t('nav.knowledge'),
      icon: <BookOpen className="w-5 h-5" />,
      children: [
        { path: '/knowledge-base', label: t('nav.knowledgeBase'), icon: <BookOpen className="w-4 h-4" />, permission: 'knowledge.view' },
      ],
    },
    {
      id: 'integrations',
      label: t('nav.integrations'),
      icon: <Zap className="w-5 h-5" />,
      children: [
        { path: '/admin/whatsapp', label: t('nav.whatsapp'), icon: <MessageCircle className="w-4 h-4" />, permission: 'admin.integrations' },
        { path: '/admin/cti-events', label: t('nav.ctiEvents'), icon: <Zap className="w-4 h-4" />, permission: 'admin.integrations' },
      ],
    },
    {
      id: 'notifications',
      label: t('nav.notifications'),
      icon: <Bell className="w-5 h-5" />,
      children: [
        { path: '/settings/notifications', label: t('nav.notifications'), icon: <Bell className="w-4 h-4" /> },
        { path: '/admin/alerts', label: t('nav.alertRules'), icon: <AlertTriangle className="w-4 h-4" />, permission: 'admin.alerts' },
      ],
    },
    {
      id: 'settings',
      label: t('nav.settings'),
      icon: <Settings className="w-5 h-5" />,
      children: [
        { path: '/agents', label: t('nav.users'), icon: <UserCog className="w-4 h-4" />, permission: 'agents.view' },
        { path: '/admin/roles', label: t('nav.rolesPermissions'), icon: <Shield className="w-4 h-4" />, permission: 'system.roles_manage' },
        { path: '/admin/system-settings', label: t('nav.systemSettings'), icon: <Settings className="w-4 h-4" />, permission: 'admin.settings' },
        { path: '/admin/audit-logs', label: t('nav.auditLogs'), icon: <FileText className="w-4 h-4" />, permission: 'admin.audit_logs' },
      ],
    },
  ];

  // Primary nav items (always visible in desktop)
  const primaryNavIds = ['dashboard', 'operations', 'workforce', 'customers', 'quality', 'reports'];
  // Secondary nav items (in "More" dropdown)
  const secondaryNavIds = ['knowledge', 'integrations', 'notifications', 'settings'];

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

  const primaryNavItems = visibleNavItems.filter(item => primaryNavIds.includes(item.id));
  const secondaryNavItems = visibleNavItems.filter(item => secondaryNavIds.includes(item.id));

  // Check if any secondary item is active
  const isSecondaryActive = secondaryNavItems.some(item =>
    item.path ? location.pathname === item.path : isParentActive(item.children)
  );

  // Render a single nav item (for desktop horizontal menu)
  const renderDesktopNavItem = (item: NavItem) => {
    if (item.path) {
      // Standalone item
      return (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-primary-500/5 dark:hover:bg-white/10'
            )
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      );
    }

    // Parent item with dropdown
    const visibleChildren = getVisibleChildren(item.children);
    const active = isParentActive(item.children);

    return (
      <div key={item.id} className="relative group">
        <button
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            active
              ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-primary-500/5 dark:hover:bg-white/10'
          )}
        >
          {item.icon}
          <span>{item.label}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Dropdown */}
        <div className="absolute start-0 top-full mt-1 py-2 min-w-[200px] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          {visibleChildren.map(child => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-primary-500/5 dark:hover:bg-white/10'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary-500 absolute start-2" />}
                  <span className="ms-2">{child.icon}</span>
                  <span>{child.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    );
  };

  // Render mobile nav item
  const renderMobileNavItem = (item: NavItem) => {
    if (item.path) {
      return (
        <NavLink
          key={item.id}
          to={item.path}
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary-500/10 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 shadow-sm'
                : 'text-gray-700 hover:bg-primary-500/5 dark:text-gray-300 dark:hover:bg-white/10'
            )
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      );
    }

    const visibleChildren = getVisibleChildren(item.children);
    const active = isParentActive(item.children);

    return (
      <div key={item.id}>
        <button
          onClick={() => toggleMobileMenu(item.id)}
          className={cn(
            'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            active
              ? 'bg-primary-500/5 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
              : 'text-gray-700 hover:bg-primary-500/5 dark:text-gray-300 dark:hover:bg-white/10'
          )}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          <motion.span
            animate={{ rotate: expandedMobileMenus.includes(item.id) ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </button>

        <AnimatePresence>
          {expandedMobileMenus.includes(item.id) && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-1 ms-4 ps-3 border-s-2 border-primary-500/20 dark:border-white/20 space-y-1"
            >
              {visibleChildren.map(child => (
                <motion.li
                  key={child.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <NavLink
                    to={child.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                        isActive
                          ? 'bg-primary-500/10 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 font-medium'
                          : 'text-gray-600 hover:bg-primary-500/5 dark:text-gray-400 dark:hover:bg-white/10'
                      )
                    }
                  >
                    {child.icon}
                    <span>{child.label}</span>
                  </NavLink>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip links for accessibility */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>

      {/* Horizontal Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">

          {/* Left: Mobile Menu Button + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-primary-500/10 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25"
              >
                <Headphones className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-lg font-semibold text-primary-900 dark:text-white hidden sm:block">CallCenter</span>
            </div>
          </div>

          {/* Center: Horizontal Navigation (desktop only) */}
          <nav id="navigation" className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {primaryNavItems.map(item => renderDesktopNavItem(item))}

            {/* "More" dropdown for secondary items */}
            {secondaryNavItems.length > 0 && (
              <div className="relative group">
                <button
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isSecondaryActive
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-primary-500/5 dark:hover:bg-white/10'
                  )}
                >
                  <MoreHorizontal className="w-5 h-5" />
                  <span>{t('nav.more')}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* More dropdown */}
                <div className="absolute end-0 top-full mt-1 py-2 min-w-[220px] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {secondaryNavItems.map(item => {
                    if (item.path) {
                      return (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                              isActive
                                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-primary-500/5 dark:hover:bg-white/10'
                            )
                          }
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    }

                    // Nested submenu for parent items in More dropdown
                    const visibleChildren = getVisibleChildren(item.children);
                    const active = isParentActive(item.children);

                    return (
                      <div key={item.id} className="relative group/sub">
                        <div
                          className={cn(
                            'flex items-center justify-between gap-2.5 px-4 py-2.5 text-sm cursor-pointer transition-colors',
                            active
                              ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-primary-500/5 dark:hover:bg-white/10'
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                          <ChevronDown className="w-3.5 h-3.5 -rotate-90 rtl:rotate-90" />
                        </div>

                        {/* Sub-dropdown */}
                        <div className="absolute start-full top-0 ms-1 py-2 min-w-[180px] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-50">
                          {visibleChildren.map(child => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              className={({ isActive }) =>
                                cn(
                                  'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                                  isActive
                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-primary-500/5 dark:hover:bg-white/10'
                                )
                              }
                            >
                              {child.icon}
                              <span>{child.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {/* Right: User Controls */}
          <div className="flex items-center gap-2">
            {/* Connection status */}
            <motion.div
              className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'
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
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white hover:bg-primary-500/10 dark:hover:bg-white/10 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
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
              className="hidden sm:block px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white hover:bg-primary-500/10 dark:hover:bg-white/10 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {i18n.language === 'en' ? 'العربية' : 'English'}
            </motion.button>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-primary-500/10 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium shadow-lg shadow-primary-500/30">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </button>
              {/* Dropdown */}
              <div className="absolute end-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-primary-50 dark:bg-primary-900/30">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('auth.logout')}
                </button>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: i18n.dir() === 'rtl' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: i18n.dir() === 'rtl' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'fixed inset-y-0 w-72 bg-white dark:bg-gray-900 z-50 lg:hidden shadow-xl',
                i18n.dir() === 'rtl' ? 'end-0' : 'start-0'
              )}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                      <Headphones className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-primary-900 dark:text-white">CallCenter</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:bg-primary-500/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
                  <ul className="space-y-1">
                    {visibleNavItems.map(item => (
                      <li key={item.id}>
                        {renderMobileNavItem(item)}
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                      <span className="text-sm font-semibold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleLanguage}
                    className="w-full mb-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-primary-500/10 dark:hover:bg-white/10 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    {i18n.language === 'en' ? 'العربية' : 'English'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('auth.logout')}
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main id="main-content" className="pt-16 min-h-screen p-6" role="main">
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
