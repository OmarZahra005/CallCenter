/**
 * Permission system names - must match backend seed data
 */
export const Permissions = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',

  // Agents
  AGENTS_VIEW: 'agents.view',
  AGENTS_CREATE: 'agents.create',
  AGENTS_EDIT: 'agents.edit',
  AGENTS_DELETE: 'agents.delete',
  AGENTS_ASSIGN_ROLES: 'agents.assign_roles',

  // Teams
  TEAMS_VIEW: 'teams.view',
  TEAMS_CREATE: 'teams.create',
  TEAMS_EDIT: 'teams.edit',
  TEAMS_DELETE: 'teams.delete',
  TEAMS_MANAGE_MEMBERS: 'teams.manage_members',

  // Calls
  CALLS_VIEW: 'calls.view',
  CALLS_MAKE: 'calls.make',
  CALLS_TRANSFER: 'calls.transfer',
  CALLS_MONITOR: 'calls.monitor',
  CALLS_BARGE: 'calls.barge',
  CALLS_WHISPER: 'calls.whisper',

  // Recordings
  RECORDINGS_VIEW: 'recordings.view',
  RECORDINGS_PLAY: 'recordings.play',
  RECORDINGS_DOWNLOAD: 'recordings.download',
  RECORDINGS_DELETE: 'recordings.delete',

  // QA
  QA_VIEW: 'qa.view',
  QA_EVALUATE: 'qa.evaluate',
  QA_CREATE_FORMS: 'qa.create_forms',
  QA_MANAGE_FORMS: 'qa.manage_forms',
  QA_VIEW_ALL_SCORES: 'qa.view_all_scores',

  // Dialer
  DIALER_VIEW: 'dialer.view',
  DIALER_CAMPAIGNS_MANAGE: 'dialer.campaigns_manage',
  DIALER_LISTS_MANAGE: 'dialer.lists_manage',
  DIALER_DNC_MANAGE: 'dialer.dnc_manage',

  // WFM
  WFM_VIEW: 'wfm.view',
  WFM_SCHEDULES_MANAGE: 'wfm.schedules_manage',
  WFM_TIMEOFF_APPROVE: 'wfm.timeoff_approve',
  WFM_ADHERENCE_VIEW: 'wfm.adherence_view',

  // Tickets
  TICKETS_VIEW: 'tickets.view',
  TICKETS_CREATE: 'tickets.create',
  TICKETS_EDIT: 'tickets.edit',
  TICKETS_DELETE: 'tickets.delete',
  TICKETS_ASSIGN: 'tickets.assign',

  // Customers
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_EDIT: 'customers.edit',
  CUSTOMERS_DELETE: 'customers.delete',

  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',

  // Analytics
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_AGENTS: 'analytics.agents',
  ANALYTICS_TEAMS: 'analytics.teams',
  ANALYTICS_QUEUES: 'analytics.queues',

  // IVR
  IVR_VIEW: 'ivr.view',
  IVR_MANAGE: 'ivr.manage',

  // Admin
  ADMIN_SETTINGS: 'admin.settings',
  ADMIN_AUDIT_LOGS: 'admin.audit_logs',
  ADMIN_SLA_RULES: 'admin.sla_rules',
  ADMIN_QUEUES: 'admin.queues',
  ADMIN_ALERTS: 'admin.alerts',
  ADMIN_INTEGRATIONS: 'admin.integrations',

  // System (RBAC)
  SYSTEM_ROLES_MANAGE: 'system.roles_manage',
  SYSTEM_PERMISSIONS_VIEW: 'system.permissions_view',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

/**
 * Permission modules for grouping in UI
 */
export const PermissionModules = {
  DASHBOARD: 'Dashboard',
  AGENTS: 'Agents',
  TEAMS: 'Teams',
  CALLS: 'Calls',
  RECORDINGS: 'Recordings',
  QA: 'QA',
  DIALER: 'Dialer',
  WFM: 'WFM',
  TICKETS: 'Tickets',
  CUSTOMERS: 'Customers',
  REPORTS: 'Reports',
  ANALYTICS: 'Analytics',
  IVR: 'IVR',
  ADMIN: 'Admin',
  SYSTEM: 'System',
} as const;

/**
 * Default role system names
 */
export const Roles = {
  SUPER_ADMIN: 'super_admin',
  ADMINISTRATOR: 'administrator',
  SUPERVISOR: 'supervisor',
  QA_EVALUATOR: 'qa_evaluator',
  TEAM_LEAD: 'team_lead',
  AGENT: 'agent',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
