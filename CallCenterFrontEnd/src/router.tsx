import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Lazy load pages
import { lazy, Suspense } from 'react';

const Login = lazy(() => import('./features/auth/pages/Login'));
const Register = lazy(() => import('./features/auth/pages/Register'));
const Dashboard = lazy(() => import('./features/supervisor/pages/Dashboard'));
const MainLayout = lazy(() => import('./components/layout/MainLayout'));
const Agents = lazy(() => import('./features/agents/pages/Agents'));
const Tickets = lazy(() => import('./features/tickets/pages/Tickets'));
const Customers = lazy(() => import('./features/customers/pages/Customers'));
const Reports = lazy(() => import('./features/reports/pages/Reports'));
const Settings = lazy(() => import('./features/settings/pages/Settings'));
const KnowledgeBase = lazy(() => import('./features/knowledge-base/pages/KnowledgeBase'));
const Teams = lazy(() => import('./features/teams/pages/Teams'));
const AgentDesktop = lazy(() => import('./features/agent-desktop/pages/AgentDesktop'));
const TicketsKanban = lazy(() => import('./features/tickets/pages/TicketsKanban'));
const UnifiedInbox = lazy(() => import('./features/communications/pages/UnifiedInbox'));
const QualityAssurance = lazy(() => import('./features/qa/pages/QualityAssurance'));
const WorkforceManagement = lazy(() => import('./features/wfm/pages/WorkforceManagement'));
const CallCenter = lazy(() => import('./pages/CallCenterPage').then(m => ({ default: m.CallCenterPage })));

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route wrapper (redirect if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <PublicRoute>
          <Login />
        </PublicRoute>
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<PageLoader />}>
        <PublicRoute>
          <Register />
        </PublicRoute>
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'agents',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Agents />
          </Suspense>
        ),
      },
      {
        path: 'tickets',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Tickets />
          </Suspense>
        ),
      },
      {
        path: 'tickets/kanban',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TicketsKanban />
          </Suspense>
        ),
      },
      {
        path: 'customers',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Customers />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Reports />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Settings />
          </Suspense>
        ),
      },
      {
        path: 'knowledge-base',
        element: (
          <Suspense fallback={<PageLoader />}>
            <KnowledgeBase />
          </Suspense>
        ),
      },
      {
        path: 'teams',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Teams />
          </Suspense>
        ),
      },
      {
        path: 'agent-desktop',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AgentDesktop />
          </Suspense>
        ),
      },
      {
        path: 'communications',
        element: (
          <Suspense fallback={<PageLoader />}>
            <UnifiedInbox />
          </Suspense>
        ),
      },
      {
        path: 'qa',
        element: (
          <Suspense fallback={<PageLoader />}>
            <QualityAssurance />
          </Suspense>
        ),
      },
      {
        path: 'wfm',
        element: (
          <Suspense fallback={<PageLoader />}>
            <WorkforceManagement />
          </Suspense>
        ),
      },
      {
        path: 'call-center',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CallCenter />
          </Suspense>
        ),
      },
    ],
  },
]);

export default router;
