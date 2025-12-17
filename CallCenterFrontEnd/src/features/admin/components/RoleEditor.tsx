import { useState, useEffect } from 'react';
import { X, Save, Loader2, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { rolesApi, permissionsApi, type RoleDetailDto, type PermissionGroupDto } from '../api/rolesApi';

interface RoleEditorProps {
  isOpen: boolean;
  roleId: string | null;
  onClose: () => void;
  onSave: () => void;
}

export default function RoleEditor({ isOpen, roleId, onClose, onSave }: RoleEditorProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [systemName, setSystemName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  // Data
  const [role, setRole] = useState<RoleDetailDto | null>(null);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroupDto[]>([]);

  const isEditing = !!roleId;

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, roleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load permissions
      const groups = await permissionsApi.getGrouped();
      setPermissionGroups(groups);

      // Load role if editing
      if (roleId) {
        const roleData = await rolesApi.getById(roleId);
        setRole(roleData);
        setName(roleData.name);
        setSystemName(roleData.systemName);
        setDescription(roleData.description || '');
        setIsActive(roleData.isActive);
        setSelectedPermissions(new Set(roleData.permissions.map((p) => p.id)));
      } else {
        // Reset form for new role
        setRole(null);
        setName('');
        setSystemName('');
        setDescription('');
        setIsActive(true);
        setSelectedPermissions(new Set());
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Role name is required');
      return;
    }

    if (!systemName.trim()) {
      setError('System name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const permissionIds = Array.from(selectedPermissions);

      if (isEditing && roleId) {
        // Update role
        await rolesApi.update(roleId, {
          name: role?.isSystemRole ? undefined : name,
          systemName: role?.isSystemRole ? undefined : systemName,
          description,
          isActive: role?.isSuperAdmin ? undefined : isActive,
        });

        // Update permissions
        await rolesApi.assignPermissions(roleId, {
          permissionIds,
          replaceExisting: true,
        });
      } else {
        // Create role
        await rolesApi.create({
          name,
          systemName,
          description,
          isActive,
          permissionIds,
        });
      }

      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save role');
      console.error('Error saving role:', err);
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const toggleModule = (group: PermissionGroupDto) => {
    const modulePermissionIds = group.permissions.map((p) => p.id);
    const allSelected = modulePermissionIds.every((id) => selectedPermissions.has(id));

    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (allSelected) {
        modulePermissionIds.forEach((id) => newSet.delete(id));
      } else {
        modulePermissionIds.forEach((id) => newSet.add(id));
      }
      return newSet;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white dark:bg-gray-900 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {isEditing ? 'Edit Role' : 'Create New Role'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Basic Info */}
                <div className="space-y-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Basic Information
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Role Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={role?.isSystemRole}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="e.g., Quality Analyst"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        System Name *
                      </label>
                      <input
                        type="text"
                        value={systemName}
                        onChange={(e) => setSystemName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        disabled={role?.isSystemRole}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="e.g., quality_analyst"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of this role..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      disabled={role?.isSuperAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                      Role is active
                    </label>
                  </div>

                  {role?.isSystemRole && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      This is a system role. Name and system name cannot be changed.
                    </p>
                  )}
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Permissions ({selectedPermissions.size} selected)
                  </h4>

                  {role?.isSuperAdmin && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      Super Admin roles bypass all permission checks. Permissions below are for reference only.
                    </p>
                  )}

                  <div className="space-y-4">
                    {permissionGroups.map((group) => {
                      const modulePermissionIds = group.permissions.map((p) => p.id);
                      const selectedCount = modulePermissionIds.filter((id) =>
                        selectedPermissions.has(id)
                      ).length;
                      const allSelected = selectedCount === modulePermissionIds.length;
                      const someSelected = selectedCount > 0 && !allSelected;

                      return (
                        <div
                          key={group.module}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                          {/* Module Header */}
                          <div
                            className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                            onClick={() => toggleModule(group)}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  allSelected
                                    ? 'bg-blue-600 border-blue-600'
                                    : someSelected
                                    ? 'bg-blue-200 border-blue-400'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                              >
                                {(allSelected || someSelected) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {group.module}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {selectedCount} / {group.permissions.length}
                            </span>
                          </div>

                          {/* Permissions */}
                          <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {group.permissions.map((permission) => (
                              <label
                                key={permission.id}
                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.has(permission.id)}
                                  onChange={() => togglePermission(permission.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <div>
                                  <span className="text-sm text-gray-900 dark:text-white">
                                    {permission.name}
                                  </span>
                                  {permission.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <Button type="button" variant="default" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex items-center gap-2">
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : isEditing ? 'Update Role' : 'Create Role'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
