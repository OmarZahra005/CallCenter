import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { CallCenterProvider } from './context/CallCenterContext';

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
const CampaignManagement = lazy(() => import('./features/dialer/pages/CampaignManagement').then(m => ({ default: m.CampaignManagement })));
const AgentDialer = lazy(() => import('./features/dialer/pages/AgentDialer').then(m => ({ default: m.AgentDialer })));
const DialerAnalytics = lazy(() => import('./features/dialer/pages/DialerAnalytics').then(m => ({ default: m.DialerAnalytics })));
const IvrFlows = lazy(() => import('./features/ivr/pages/IvrFlows').then(m => ({ default: m.IvrFlows })));
const IvrFlowBuilder = lazy(() => import('./features/ivr/pages/IvrFlowBuilder').then(m => ({ default: m.IvrFlowBuilder })));
const ListManagement = lazy(() => import('./features/dialer/pages/ListManagement').then(m => ({ default: m.ListManagement })));
const DncManagement = lazy(() => import('./features/dialer/pages/DncManagement').then(m => ({ default: m.DncManagement })));
const AgentKpis = lazy(() => import('./features/analytics/pages/AgentKpis').then(m => ({ default: m.AgentKpis })));
const QueueMetrics = lazy(() => import('./features/analytics/pages/QueueMetrics').then(m => ({ default: m.QueueMetrics })));
const TeamAnalytics = lazy(() => import('./features/analytics/pages/TeamAnalytics').then(m => ({ default: m.TeamAnalytics })));
const QueueManagement = lazy(() => import('./features/admin/pages/QueueManagement').then(m => ({ default: m.QueueManagement })));
const SlaRules = lazy(() => import('./features/admin/pages/SlaRules').then(m => ({ default: m.SlaRules })));
const AdherenceTracking = lazy(() => import('./features/wfm/pages/AdherenceTracking').then(m => ({ default: m.AdherenceTracking })));
const Recordings = lazy(() => import('./features/recordings/pages/Recordings'));
const EvaluationForms = lazy(() => import('./features/qa/pages/EvaluationForms').then(m => ({ default: m.EvaluationForms })));
const CoachingSessions = lazy(() => import('./features/qa/pages/CoachingSessions').then(m => ({ default: m.CoachingSessions })));
const Surveys = lazy(() => import('./features/surveys/pages/Surveys').then(m => ({ default: m.Surveys })));
const AuditLogs = lazy(() => import('./features/admin/pages/AuditLogs').then(m => ({ default: m.AuditLogs })));
const SystemSettings = lazy(() => import('./features/admin/pages/SystemSettings').then(m => ({ default: m.SystemSettings })));
const AlertRules = lazy(() => import('./features/admin/pages/AlertRules').then(m => ({ default: m.AlertRules })));
const DataExports = lazy(() => import('./features/admin/pages/DataExports').then(m => ({ default: m.DataExports })));
const WhatsAppConfig = lazy(() => import('./features/admin/pages/WhatsAppConfig').then(m => ({ default: m.WhatsAppConfig })));
const CtiEvents = lazy(() => import('./features/admin/pages/CtiEvents').then(m => ({ default: m.CtiEvents })));
const NotificationSettings = lazy(() => import('./features/settings/pages/NotificationSettings').then(m => ({ default: m.NotificationSettings })));
const RolesPermissions = lazy(() => import('./features/admin/pages/RolesPermissions'));
const PublicSurvey = lazy(() => import('./features/surveys/pages/PublicSurvey'));
const OutCall = lazy(() => import('./features/outcall/pages/OutCall'));

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
    // Public survey page - no auth required, secured by token
    path: '/survey/:token',
    element: (
      <Suspense fallback={<PageLoader />}>
        <PublicSurvey />
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
          <CallCenterProvider>
            <Suspense fallback={<PageLoader />}>
              <Customers />
            </Suspense>
          </CallCenterProvider>
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
      {
        path: 'dialer/campaigns',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CampaignManagement />
          </Suspense>
        ),
      },
      {
        path: 'dialer/agent',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AgentDialer />
          </Suspense>
        ),
      },
      {
        path: 'dialer/analytics',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DialerAnalytics />
          </Suspense>
        ),
      },
      {
        path: 'dialer/lists',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ListManagement />
          </Suspense>
        ),
      },
      {
        path: 'dialer/dnc',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DncManagement />
          </Suspense>
        ),
      },
      {
        path: 'ivr/flows',
        element: (
          <Suspense fallback={<PageLoader />}>
            <IvrFlows />
          </Suspense>
        ),
      },
      {
        path: 'ivr/builder/:flowId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <IvrFlowBuilder />
          </Suspense>
        ),
      },
      {
        path: 'analytics/agents',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AgentKpis />
          </Suspense>
        ),
      },
      {
        path: 'analytics/agents/:agentId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AgentKpis />
          </Suspense>
        ),
      },
      {
        path: 'analytics/queues',
        element: (
          <Suspense fallback={<PageLoader />}>
            <QueueMetrics />
          </Suspense>
        ),
      },
      {
        path: 'analytics/queues/:queueId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <QueueMetrics />
          </Suspense>
        ),
      },
      {
        path: 'analytics/teams',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TeamAnalytics />
          </Suspense>
        ),
      },
      {
        path: 'analytics/teams/:teamId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TeamAnalytics />
          </Suspense>
        ),
      },
      {
        path: 'admin/queues',
        element: (
          <Suspense fallback={<PageLoader />}>
            <QueueManagement />
          </Suspense>
        ),
      },
      {
        path: 'admin/sla-rules',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SlaRules />
          </Suspense>
        ),
      },
      {
        path: 'wfm/adherence',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdherenceTracking />
          </Suspense>
        ),
      },
      {
        path: 'recordings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Recordings />
          </Suspense>
        ),
      },
      {
        path: 'qa/forms',
        element: (
          <Suspense fallback={<PageLoader />}>
            <EvaluationForms />
          </Suspense>
        ),
      },
      {
        path: 'qa/coaching',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CoachingSessions />
          </Suspense>
        ),
      },
      {
        path: 'surveys',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Surveys />
          </Suspense>
        ),
      },
      {
        path: 'admin/audit-logs',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AuditLogs />
          </Suspense>
        ),
      },
      {
        path: 'admin/system-settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SystemSettings />
          </Suspense>
        ),
      },
      {
        path: 'admin/alerts',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AlertRules />
          </Suspense>
        ),
      },
      {
        path: 'admin/exports',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DataExports />
          </Suspense>
        ),
      },
      {
        path: 'admin/whatsapp',
        element: (
          <Suspense fallback={<PageLoader />}>
            <WhatsAppConfig />
          </Suspense>
        ),
      },
      {
        path: 'admin/cti-events',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CtiEvents />
          </Suspense>
        ),
      },
      {
        path: 'settings/notifications',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NotificationSettings />
          </Suspense>
        ),
      },
      {
        path: 'admin/roles',
        element: (
          <Suspense fallback={<PageLoader />}>
            <RolesPermissions />
          </Suspense>
        ),
      },
      {
        path: 'outcall',
        element: (
          <CallCenterProvider>
            <Suspense fallback={<PageLoader />}>
              <OutCall />
            </Suspense>
          </CallCenterProvider>
        ),
      },
    ],
  },
]);

export default router;
