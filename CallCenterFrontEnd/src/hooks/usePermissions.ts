import { useCallback, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import type { Permission } from '../constants/permissions';

interface UsePermissionsReturn {
  /** Check if user has a specific permission */
  hasPermission: (permission: Permission | string) => boolean;
  /** Check if user has ANY of the specified permissions (OR logic) */
  hasAnyPermission: (...permissions: (Permission | string)[]) => boolean;
  /** Check if user has ALL of the specified permissions (AND logic) */
  hasAllPermissions: (...permissions: (Permission | string)[]) => boolean;
  /** Check if user has a specific role */
  hasRole: (role: string) => boolean;
  /** Check if user has ANY of the specified roles */
  hasAnyRole: (...roles: string[]) => boolean;
  /** Whether the user is a super admin (bypasses all permission checks) */
  isSuperAdmin: boolean;
  /** User's assigned roles */
  roles: string[];
  /** User's combined permissions from all roles */
  permissions: string[];
  /** Refresh permissions from the server */
  refreshPermissions: () => Promise<void>;
}

/**
 * Hook for checking user permissions in the frontend.
 * Super admin users automatically pass all permission checks.
 *
 * @example
 * ```tsx
 * const { hasPermission, hasAnyPermission, isSuperAdmin } = usePermissions();
 *
 * // Single permission check
 * if (hasPermission(Permissions.RECORDINGS_DELETE)) {
 *   // Show delete button
 * }
 *
 * // Multiple permissions (OR logic)
 * if (hasAnyPermission(Permissions.RECORDINGS_VIEW, Permissions.RECORDINGS_PLAY)) {
 *   // Show recordings section
 * }
 *
 * // Multiple permissions (AND logic)
 * if (hasAllPermissions(Permissions.QA_EVALUATE, Permissions.RECORDINGS_VIEW)) {
 *   // Show QA evaluation feature
 * }
 * ```
 */
export function usePermissions(): UsePermissionsReturn {
  const user = useAuthStore((state) => state.user);
  const refreshPermissionsAction = useAuthStore((state) => state.refreshPermissions);

  const isSuperAdmin = useMemo(() => user?.isSuperAdmin ?? false, [user?.isSuperAdmin]);
  const roles = useMemo(() => user?.roles ?? [], [user?.roles]);
  const permissions = useMemo(() => user?.permissions ?? [], [user?.permissions]);

  const hasPermission = useCallback(
    (permission: Permission | string): boolean => {
      // Super admin bypasses all permission checks
      if (isSuperAdmin) return true;
      return permissions.includes(permission);
    },
    [isSuperAdmin, permissions]
  );

  const hasAnyPermission = useCallback(
    (...permissionsToCheck: (Permission | string)[]): boolean => {
      // Super admin bypasses all permission checks
      if (isSuperAdmin) return true;
      return permissionsToCheck.some((p) => permissions.includes(p));
    },
    [isSuperAdmin, permissions]
  );

  const hasAllPermissions = useCallback(
    (...permissionsToCheck: (Permission | string)[]): boolean => {
      // Super admin bypasses all permission checks
      if (isSuperAdmin) return true;
      return permissionsToCheck.every((p) => permissions.includes(p));
    },
    [isSuperAdmin, permissions]
  );

  const hasRole = useCallback(
    (role: string): boolean => {
      return roles.includes(role);
    },
    [roles]
  );

  const hasAnyRole = useCallback(
    (...rolesToCheck: string[]): boolean => {
      return rolesToCheck.some((r) => roles.includes(r));
    },
    [roles]
  );

  const refreshPermissions = useCallback(async () => {
    await refreshPermissionsAction();
  }, [refreshPermissionsAction]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    roles,
    permissions,
    refreshPermissions,
  };
}

export default usePermissions;
