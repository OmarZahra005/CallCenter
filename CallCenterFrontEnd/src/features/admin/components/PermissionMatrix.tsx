import { useState, useEffect, useCallback } from 'react';
import { Check, Loader2, Save, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button, Badge } from '../../../components/ui';
import {
  rolesApi,
  permissionsApi,
  type RoleDto,
  type RoleDetailDto,
  type PermissionGroupDto,
} from '../api/rolesApi';

interface RolePermissions {
  roleId: string;
  permissionIds: Set<string>;
  originalPermissionIds: Set<string>;
  hasChanges: boolean;
}

export default function PermissionMatrix() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroupDto[]>([]);
  const [rolePermissionsMap, setRolePermissionsMap] = useState<Map<string, RolePermissions>>(
    new Map()
  );

  const hasAnyChanges = useCallback(() => {
    for (const rp of rolePermissionsMap.values()) {
      if (rp.hasChanges) return true;
    }
    return false;
  }, [rolePermissionsMap]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load roles and permission groups in parallel
      const [rolesData, groupsData] = await Promise.all([
        rolesApi.getAll(),
        permissionsApi.getGrouped(),
      ]);

      setRoles(rolesData.filter((r) => r.isActive));
      setPermissionGroups(groupsData);

      // Load permissions for each role
      const permissionsMap = new Map<string, RolePermissions>();

      await Promise.all(
        rolesData
          .filter((r) => r.isActive)
          .map(async (role) => {
            const roleDetail: RoleDetailDto = await rolesApi.getById(role.id);
            const permissionIds = new Set(roleDetail.permissions.map((p) => p.id));
            permissionsMap.set(role.id, {
              roleId: role.id,
              permissionIds: new Set(permissionIds),
              originalPermissionIds: new Set(permissionIds),
              hasChanges: false,
            });
          })
      );

      setRolePermissionsMap(permissionsMap);
    } catch (err) {
      setError('Failed to load permission matrix data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (roleId: string, permissionId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSuperAdmin) return; // Can't modify super admin

    setRolePermissionsMap((prev) => {
      const newMap = new Map(prev);
      const rolePerms = newMap.get(roleId);
      if (!rolePerms) return prev;

      const newPermissionIds = new Set(rolePerms.permissionIds);
      if (newPermissionIds.has(permissionId)) {
        newPermissionIds.delete(permissionId);
      } else {
        newPermissionIds.add(permissionId);
      }

      // Check if there are changes from original
      const hasChanges = !setsEqual(newPermissionIds, rolePerms.originalPermissionIds);

      newMap.set(roleId, {
        ...rolePerms,
        permissionIds: newPermissionIds,
        hasChanges,
      });

      return newMap;
    });
  };

  const toggleModuleForRole = (roleId: string, group: PermissionGroupDto) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSuperAdmin) return;

    const rolePerms = rolePermissionsMap.get(roleId);
    if (!rolePerms) return;

    const modulePermissionIds = group.permissions.map((p) => p.id);
    const allSelected = modulePermissionIds.every((id) => rolePerms.permissionIds.has(id));

    setRolePermissionsMap((prev) => {
      const newMap = new Map(prev);
      const newPermissionIds = new Set(rolePerms.permissionIds);

      if (allSelected) {
        modulePermissionIds.forEach((id) => newPermissionIds.delete(id));
      } else {
        modulePermissionIds.forEach((id) => newPermissionIds.add(id));
      }

      const hasChanges = !setsEqual(newPermissionIds, rolePerms.originalPermissionIds);

      newMap.set(roleId, {
        ...rolePerms,
        permissionIds: newPermissionIds,
        hasChanges,
      });

      return newMap;
    });
  };

  const setsEqual = (a: Set<string>, b: Set<string>): boolean => {
    if (a.size !== b.size) return false;
    for (const item of a) {
      if (!b.has(item)) return false;
    }
    return true;
  };

  const handleSaveAll = async () => {
    const changedRoles = Array.from(rolePermissionsMap.values()).filter((rp) => rp.hasChanges);

    if (changedRoles.length === 0) return;

    try {
      setSaving(true);
      setError(null);

      await Promise.all(
        changedRoles.map((rp) =>
          rolesApi.assignPermissions(rp.roleId, {
            permissionIds: Array.from(rp.permissionIds),
            replaceExisting: true,
          })
        )
      );

      // Update original permissions to match current (no longer has changes)
      setRolePermissionsMap((prev) => {
        const newMap = new Map(prev);
        for (const rp of changedRoles) {
          const current = newMap.get(rp.roleId);
          if (current) {
            newMap.set(rp.roleId, {
              ...current,
              originalPermissionIds: new Set(current.permissionIds),
              hasChanges: false,
            });
          }
        }
        return newMap;
      });
    } catch (err) {
      setError('Failed to save permission changes');
      console.error('Error saving permissions:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setRolePermissionsMap((prev) => {
      const newMap = new Map(prev);
      for (const [roleId, rp] of newMap.entries()) {
        if (rp.hasChanges) {
          newMap.set(roleId, {
            ...rp,
            permissionIds: new Set(rp.originalPermissionIds),
            hasChanges: false,
          });
        }
      }
      return newMap;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadData} variant="secondary">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasAnyChanges() && (
            <Badge variant="warning">Unsaved Changes</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleReset}
            disabled={!hasAnyChanges() || saving}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={!hasAnyChanges() || saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px] sticky left-0 bg-gray-50 dark:bg-gray-800 z-10">
                Permission
              </th>
              {roles.map((role) => (
                <th
                  key={role.id}
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="truncate max-w-[90px]" title={role.name}>
                      {role.name}
                    </span>
                    {role.isSuperAdmin && (
                      <ShieldCheck className="w-4 h-4 text-amber-500" aria-label="Super Admin - All permissions" />
                    )}
                    {rolePermissionsMap.get(role.id)?.hasChanges && (
                      <Badge variant="warning" className="text-xs py-0">
                        Modified
                      </Badge>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {permissionGroups.map((group) => (
              <>
                {/* Module Header Row */}
                <tr
                  key={`module-${group.module}`}
                  className="bg-gray-100 dark:bg-gray-800"
                >
                  <td className="px-4 py-2 font-semibold text-gray-900 dark:text-white sticky left-0 bg-gray-100 dark:bg-gray-800">
                    {group.module}
                  </td>
                  {roles.map((role) => {
                    if (role.isSuperAdmin) {
                      return (
                        <td
                          key={`${group.module}-${role.id}`}
                          className="px-3 py-2 text-center"
                        >
                          <span className="text-amber-500 text-xs">All</span>
                        </td>
                      );
                    }

                    const rolePerms = rolePermissionsMap.get(role.id);
                    const modulePermissionIds = group.permissions.map((p) => p.id);
                    const selectedCount = modulePermissionIds.filter(
                      (id) => rolePerms?.permissionIds.has(id)
                    ).length;
                    const allSelected = selectedCount === modulePermissionIds.length;
                    const someSelected = selectedCount > 0 && !allSelected;

                    return (
                      <td
                        key={`${group.module}-${role.id}`}
                        className="px-3 py-2 text-center"
                      >
                        <button
                          onClick={() => toggleModuleForRole(role.id, group)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mx-auto ${
                            allSelected
                              ? 'bg-blue-600 border-blue-600'
                              : someSelected
                              ? 'bg-blue-200 border-blue-400'
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                          }`}
                          title={`Toggle all ${group.module} permissions`}
                        >
                          {(allSelected || someSelected) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>

                {/* Permission Rows */}
                {group.permissions.map((permission) => (
                  <tr
                    key={permission.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-2 sticky left-0 bg-white dark:bg-gray-900">
                      <div className="pl-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {permission.name}
                        </span>
                        <code className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {permission.systemName}
                        </code>
                      </div>
                    </td>
                    {roles.map((role) => {
                      if (role.isSuperAdmin) {
                        return (
                          <td
                            key={`${permission.id}-${role.id}`}
                            className="px-3 py-2 text-center"
                          >
                            <Check className="w-4 h-4 text-amber-500 mx-auto" />
                          </td>
                        );
                      }

                      const rolePerms = rolePermissionsMap.get(role.id);
                      const isChecked = rolePerms?.permissionIds.has(permission.id) ?? false;

                      return (
                        <td
                          key={`${permission.id}-${role.id}`}
                          className="px-3 py-2 text-center"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(role.id, permission.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>Super Admin (All permissions automatically granted)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span>All module permissions selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200 border-2 border-blue-400 rounded flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span>Some module permissions selected</span>
        </div>
      </div>
    </div>
  );
}
