import { useState, useMemo, useCallback, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../hooks/useTheme';
import { useSignalR } from '../../hooks/useSignalR';
import { useCallCenterShortcuts } from '../../hooks/useKeyboardShortcuts';
import { usePermissions } from '../../hooks/usePermissions';
import { NotificationDropdown, Toast, SkipLink, KeyboardShortcutsDialog, Tooltip } from '../ui';
import { cn } from '../../utils/cn';
import { pageVariants, pageTransition } from '../../utils/animations';
import {
  LayoutDashboard,
  Headphones,
  Phone,
  PhoneOutgoing,
  Users,
  UsersRound,
  Calendar,
  UserCircle,
  Ticket,
  Mic,
  ClipboardCheck,
  FileQuestion,
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
  PanelLeftClose,
  PanelLeftOpen,
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

const SIDEBAR_KEY = 'sidebar-collapsed';

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
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['operations', 'workforce']);

  const { i18n } = useTranslation();

  // Persist collapsed state
  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_KEY, String(collapsed)); } catch { /* noop */ }
  }, [collapsed]);

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

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  // Navigation structure
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
        { path: '/calls', label: t('nav.calls'), icon: <Phone className="w-4 h-4" />, permission: 'calls.view' },
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
        { path: '/settings/notifications', label: t('nav.notificationSettings'), icon: <Bell className="w-4 h-4" /> },
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

  // Check if a parent menu has an active child
  const isParentActive = (children: NavChild[] | undefined) => {
    if (!children) return false;
    return children.some(child => location.pathname === child.path || location.pathname.startsWith(child.path + '/'));
  };

  // Filter visible children based on permissions
  const getVisibleChildren = useCallback((children: NavChild[] | undefined) => {
    if (!children) return [];
    if (isSuperAdmin) return children;
    return children.filter(child => !child.permission || hasPermission(child.permission));
  }, [isSuperAdmin, hasPermission]);

  // Filter nav items to hide parents with no visible children
  const visibleNavItems = useMemo(() => {
    return navItems.filter(item => {
      if (isSuperAdmin) {
        if (item.path) return true;
        return (item.children?.length ?? 0) > 0;
      }
      if (item.path) {
        return !item.permission || hasPermission(item.permission);
      }
      const visibleChildren = getVisibleChildren(item.children);
      return visibleChildren.length > 0;
    });
  }, [navItems, isSuperAdmin, hasPermission, getVisibleChildren]);

  // Auto-expand parent of active route
  useEffect(() => {
    for (const item of navItems) {
      if (item.children && isParentActive(item.children)) {
        setExpandedMenus(prev =>
          prev.includes(item.id) ? prev : [...prev, item.id]
        );
      }
    }
  }, [location.pathname]);

  // ── Sidebar nav item renderer ──
  const renderSidebarItem = (item: NavItem) => {
    if (item.path) {
      // Standalone item (e.g. Dashboard)
      const navContent = (
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
            )
          }
        >
          {({ isActive }) => (
            <>
              {/* Active indicator bar */}
              {isActive && (
                <span
                  className="absolute inset-inline-start-0 top-1.5 bottom-1.5 w-1 rounded-full bg-primary-500"
                />
              )}
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </>
          )}
        </NavLink>
      );

      return collapsed ? (
        <Tooltip key={item.id} content={item.label} position="right" delay={100}>
          {navContent}
        </Tooltip>
      ) : (
        <div key={item.id}>{navContent}</div>
      );
    }

    // Parent item with children
    const visibleChildren = getVisibleChildren(item.children);
    const active = isParentActive(item.children);
    const expanded = expandedMenus.includes(item.id);

    if (collapsed) {
      // Collapsed: show icon-only with tooltip flyout
      return (
        <div key={item.id} className="relative group/flyout">
          <Tooltip content={item.label} position="right" delay={100}>
            <button
              className={cn(
                'w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
            </button>
          </Tooltip>

          {/* Flyout submenu on hover when collapsed */}
          <div className={cn(
            'absolute top-0 z-50 py-2 min-w-[200px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700',
            'opacity-0 invisible group-hover/flyout:opacity-100 group-hover/flyout:visible transition-all duration-200',
            'start-full ms-2'
          )}>
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {item.label}
            </div>
            {visibleChildren.map(child => (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
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
    }

    // Expanded sidebar: collapsible section
    return (
      <div key={item.id}>
        <button
          onClick={() => toggleMenu(item.id)}
          className={cn(
            'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            active
              ? 'bg-primary-500/5 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </div>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-1 ms-4 ps-3 border-s-2 border-gray-200 dark:border-gray-700 space-y-0.5">
                {visibleChildren.map(child => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                        isActive
                          ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium border-s-2 border-primary-500 -ms-[2px]'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      )
                    }
                  >
                    {child.icon}
                    <span className="truncate">{child.label}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ── Mobile nav item renderer ──
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
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5'
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
          onClick={() => toggleMenu(item.id)}
          className={cn(
            'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            active
              ? 'bg-primary-500/5 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5'
          )}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          <motion.span
            animate={{ rotate: expandedMenus.includes(item.id) ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </button>

        <AnimatePresence>
          {expandedMenus.includes(item.id) && (
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
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
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
      {/* Skip links */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>

      {/* ══════════════════════════════════════════════
          Desktop Sidebar
          ══════════════════════════════════════════════ */}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-40 hidden lg:flex flex-col',
          'bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-800',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {/* Sidebar header — Logo */}
        <div className={cn(
          'h-14 flex items-center border-b border-gray-200 dark:border-gray-800 flex-shrink-0',
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}>
          <NavLink to="/dashboard" className="flex items-center gap-3 min-w-0">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 flex-shrink-0"
            >
              <Headphones className="w-5 h-5 text-white" />
            </motion.div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg font-bold text-gray-900 dark:text-white truncate"
              >
                CallCenter
              </motion.span>
            )}
          </NavLink>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          id="navigation"
          className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1 scrollbar-thin"
          role="navigation"
          aria-label="Main navigation"
        >
          {visibleNavItems.map(item => renderSidebarItem(item))}
        </nav>

        {/* Sidebar footer */}
        <div className={cn(
          'border-t border-gray-200 dark:border-gray-800 flex-shrink-0',
          collapsed ? 'p-2' : 'p-3'
        )}>
          {/* Collapse toggle (when collapsed) */}
          {collapsed && (
            <Tooltip content="Expand sidebar" position="right" delay={100}>
              <button
                onClick={() => setCollapsed(false)}
                className="w-full p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors flex items-center justify-center mb-2"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            </Tooltip>
          )}

          {/* Connection status */}
          {!collapsed ? (
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium mb-2',
              isConnected
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
            )}>
              <motion.span
                className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  isConnected ? 'bg-green-500' : 'bg-yellow-500'
                )}
                animate={isConnected ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : undefined}
                transition={isConnected ? { duration: 2, repeat: Infinity } : undefined}
              />
              {isConnected ? 'Connected' : 'Connecting...'}
            </div>
          ) : (
            <Tooltip content={isConnected ? 'Connected' : 'Connecting...'} position="right" delay={100}>
              <div className="flex items-center justify-center mb-2">
                <motion.span
                  className={cn(
                    'w-2.5 h-2.5 rounded-full',
                    isConnected ? 'bg-green-500' : 'bg-yellow-500'
                  )}
                  animate={isConnected ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : undefined}
                  transition={isConnected ? { duration: 2, repeat: Infinity } : undefined}
                />
              </div>
            </Tooltip>
          )}

          {/* User section */}
          {!collapsed ? (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/25 flex-shrink-0">
                <span className="text-sm font-semibold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.role}</p>
              </div>
            </div>
          ) : (
            <Tooltip content={user?.name || 'User'} position="right" delay={100}>
              <div className="flex items-center justify-center">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <span className="text-sm font-semibold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            </Tooltip>
          )}
        </div>
      </aside>

      {/* ══════════════════════════════════════════════
          Top Header Bar
          ══════════════════════════════════════════════ */}
      <header
        className={cn(
          'fixed top-0 end-0 z-30 h-14 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800',
          'transition-all duration-300 ease-in-out',
          // On desktop, offset by sidebar width
          collapsed ? 'lg:start-[72px]' : 'lg:start-64',
          // On mobile, full width
          'start-0'
        )}
      >
        <div className="flex items-center justify-between h-full px-4">
          {/* Left: Mobile menu + breadcrumb area */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-500 rounded-lg flex items-center justify-center">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-semibold text-gray-900 dark:text-white">CallCenter</span>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
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
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
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
              className="hidden sm:block px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {i18n.language === 'en' ? 'العربية' : 'English'}
            </motion.button>

            {/* User avatar + dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium shadow-lg shadow-primary-500/30">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </button>
              <div className="absolute end-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
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

      {/* ══════════════════════════════════════════════
          Mobile Navigation Drawer
          ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

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
                {/* Mobile header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                      <Headphones className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">CallCenter</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile nav */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
                  <ul className="space-y-1">
                    {visibleNavItems.map(item => (
                      <li key={item.id}>
                        {renderMobileNavItem(item)}
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Mobile footer */}
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
                    className="w-full mb-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
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

      {/* ══════════════════════════════════════════════
          Main Content Area
          ══════════════════════════════════════════════ */}
      <main
        id="main-content"
        className={cn(
          'min-h-screen pt-20 px-6 pb-6 transition-all duration-300 ease-in-out',
          collapsed ? 'lg:ps-[calc(72px+1.5rem)]' : 'lg:ps-[calc(16rem+1.5rem)]'
        )}
        role="main"
      >
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
