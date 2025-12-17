import type { ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import type { Permission } from '../../constants/permissions';

interface PermissionGateProps {
  /** Single permission or array of permissions to check */
  permission?: Permission | string | (Permission | string)[];
  /**
   * Logic for multiple permissions:
   * - 'any': User needs at least one permission (default)
   * - 'all': User needs all permissions
   */
  logic?: 'any' | 'all';
  /** Content to render if user has permission */
  children: ReactNode;
  /** Optional fallback content if user lacks permission */
  fallback?: ReactNode;
  /** If true, also allows super admins even without explicit permission */
  allowSuperAdmin?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions.
 * Super admin users automatically pass all permission checks.
 *
 * @example
 * ```tsx
 * // Single permission
 * <PermissionGate permission={Permissions.RECORDINGS_DELETE}>
 *   <DeleteButton />
 * </PermissionGate>
 *
 * // Multiple permissions with OR logic (default)
 * <PermissionGate permission={[Permissions.RECORDINGS_VIEW, Permissions.RECORDINGS_PLAY]}>
 *   <RecordingsSection />
 * </PermissionGate>
 *
 * // Multiple permissions with AND logic
 * <PermissionGate
 *   permission={[Permissions.QA_EVALUATE, Permissions.RECORDINGS_VIEW]}
 *   logic="all"
 * >
 *   <QAEvaluationFeature />
 * </PermissionGate>
 *
 * // With fallback
 * <PermissionGate
 *   permission={Permissions.ADMIN_SETTINGS}
 *   fallback={<span>Access denied</span>}
 * >
 *   <AdminPanel />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permission,
  logic = 'any',
  children,
  fallback = null,
  allowSuperAdmin = true,
}: PermissionGateProps) {
  const { hasAnyPermission, hasAllPermissions, isSuperAdmin } = usePermissions();

  // Super admin bypass
  if (allowSuperAdmin && isSuperAdmin) {
    return <>{children}</>;
  }

  // No permission required - always show
  if (!permission) {
    return <>{children}</>;
  }

  // Convert single permission to array
  const permissions = Array.isArray(permission) ? permission : [permission];

  // Check permissions based on logic
  const hasAccess =
    logic === 'all' ? hasAllPermissions(...permissions) : hasAnyPermission(...permissions);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

interface RoleGateProps {
  /** Single role or array of roles to check */
  role: string | string[];
  /**
   * Logic for multiple roles:
   * - 'any': User needs at least one role (default)
   * - 'all': User needs all roles
   */
  logic?: 'any' | 'all';
  /** Content to render if user has role */
  children: ReactNode;
  /** Optional fallback content if user lacks role */
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user roles.
 *
 * @example
 * ```tsx
 * <RoleGate role={Roles.SUPERVISOR}>
 *   <SupervisorDashboard />
 * </RoleGate>
 *
 * <RoleGate role={[Roles.SUPERVISOR, Roles.TEAM_LEAD]} logic="any">
 *   <TeamManagement />
 * </RoleGate>
 * ```
 */
export function RoleGate({ role, logic = 'any', children, fallback = null }: RoleGateProps) {
  const { hasRole, hasAnyRole, isSuperAdmin } = usePermissions();

  // Super admin bypass
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Convert single role to array
  const roles = Array.isArray(role) ? role : [role];

  // Check roles based on logic
  let hasAccess: boolean;
  if (logic === 'all') {
    hasAccess = roles.every((r) => hasRole(r));
  } else {
    hasAccess = hasAnyRole(...roles);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

export default PermissionGate;
