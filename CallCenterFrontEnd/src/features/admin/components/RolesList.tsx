import { useState, useEffect } from 'react';
import { Edit2, Trash2, Shield, ShieldCheck, Users, Key } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { rolesApi, type RoleDto } from '../api/rolesApi';

interface RolesListProps {
  onEditRole: (roleId: string) => void;
  onRefresh: () => void;
}

export default function RolesList({ onEditRole, onRefresh }: RolesListProps) {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rolesApi.getAll();
      setRoles(data);
    } catch (err) {
      setError('Failed to load roles');
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (role: RoleDto) => {
    if (role.isSystemRole) {
      alert('System roles cannot be deleted');
      return;
    }

    if (!confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(role.id);
      await rolesApi.delete(role.id);
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      onRefresh();
    } catch (err) {
      console.error('Error deleting role:', err);
      alert('Failed to delete role');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadRoles} variant="default">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              System Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {roles.map((role) => (
            <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    {role.isSuperAdmin ? (
                      <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {role.name}
                    </div>
                    {role.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {role.description}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <code className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {role.systemName}
                </code>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {role.isSuperAdmin && (
                    <Badge variant="warning" className="text-xs">
                      Super Admin
                    </Badge>
                  )}
                  {role.isSystemRole && (
                    <Badge variant="info" className="text-xs">
                      System
                    </Badge>
                  )}
                  {!role.isSystemRole && !role.isSuperAdmin && (
                    <Badge variant="default" className="text-xs">
                      Custom
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={role.isActive ? 'success' : 'danger'}>
                  {role.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onEditRole(role.id)}
                    className="flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </Button>
                  {!role.isSystemRole && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(role)}
                      disabled={deletingId === role.id}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      {deletingId === role.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No roles found</p>
        </div>
      )}
    </div>
  );
}
