import { useState } from 'react';
import { Shield, Users, Grid3X3, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../../components/ui';
import { PermissionGate } from '../../../components/auth';
import { Permissions } from '../../../constants/permissions';
import RolesList from '../components/RolesList';
import RoleEditor from '../components/RoleEditor';
import PermissionMatrix from '../components/PermissionMatrix';

type TabType = 'roles' | 'matrix';

export default function RolesPermissions() {
  const [activeTab, setActiveTab] = useState<TabType>('roles');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateRole = () => {
    setEditingRoleId(null);
    setIsEditorOpen(true);
  };

  const handleEditRole = (roleId: string) => {
    setEditingRoleId(roleId);
    setIsEditorOpen(true);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setEditingRoleId(null);
  };

  const handleEditorSave = () => {
    setIsEditorOpen(false);
    setEditingRoleId(null);
    setRefreshKey((k) => k + 1);
  };

  const tabs = [
    { id: 'roles' as const, label: 'Roles', icon: Users },
    { id: 'matrix' as const, label: 'Permission Matrix', icon: Grid3X3 },
  ];

  return (
    <PermissionGate
      permission={Permissions.SYSTEM_ROLES_MANAGE}
      fallback={
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Access Denied
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                You don't have permission to manage roles and permissions.
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-7 h-7" />
              Roles & Permissions
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage user roles and their associated permissions
            </p>
          </div>
          {activeTab === 'roles' && (
            <Button onClick={handleCreateRole} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Role
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'roles' ? 'System Roles' : 'Permission Matrix'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === 'roles' ? (
              <RolesList
                key={refreshKey}
                onEditRole={handleEditRole}
                onRefresh={() => setRefreshKey((k) => k + 1)}
              />
            ) : (
              <PermissionMatrix key={refreshKey} />
            )}
          </CardContent>
        </Card>

        {/* Role Editor Modal */}
        <RoleEditor
          isOpen={isEditorOpen}
          roleId={editingRoleId}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
        />
      </div>
    </PermissionGate>
  );
}
