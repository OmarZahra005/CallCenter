import apiClient from '../../../api/client';

// Types
export interface RoleDto {
  id: string;
  name: string;
  systemName: string;
  description?: string;
  isSystemRole: boolean;
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  agentCount?: number;
  permissionCount?: number;
}

export interface PermissionDto {
  id: string;
  name: string;
  systemName: string;
  module: string;
  description?: string;
  displayOrder: number;
}

export interface PermissionGroupDto {
  module: string;
  permissions: PermissionDto[];
}

export interface RoleDetailDto extends RoleDto {
  updatedAt: string;
  permissions: PermissionDto[];
  agents?: RoleAgentDto[];
}

export interface RoleAgentDto {
  id: string;
  name: string;
  email: string;
  assignedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  systemName: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  systemName?: string;
  description?: string;
  isActive?: boolean;
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
  replaceExisting?: boolean;
}

export interface AssignRolesRequest {
  roleIds: string[];
  replaceExisting?: boolean;
}

export interface AgentPermissionsDto {
  agentId: string;
  agentName?: string;
  email?: string;
  isSuperAdmin: boolean;
  roles: string[];
  permissions: string[];
}

// Role API
export const rolesApi = {
  // Get all roles
  getAll: async (): Promise<RoleDto[]> => {
    const response = await apiClient.get('/roles');
    return response.data;
  },

  // Get role by ID with permissions
  getById: async (id: string): Promise<RoleDetailDto> => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  },

  // Get role by system name
  getBySystemName: async (systemName: string): Promise<RoleDetailDto> => {
    const response = await apiClient.get(`/roles/by-name/${systemName}`);
    return response.data;
  },

  // Create a new role
  create: async (request: CreateRoleRequest): Promise<RoleDto> => {
    const response = await apiClient.post('/roles', request);
    return response.data;
  },

  // Update an existing role
  update: async (id: string, request: UpdateRoleRequest): Promise<RoleDto> => {
    const response = await apiClient.put(`/roles/${id}`, request);
    return response.data;
  },

  // Delete a role
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },

  // Get permissions assigned to a role
  getPermissions: async (id: string): Promise<PermissionDto[]> => {
    const response = await apiClient.get(`/roles/${id}/permissions`);
    return response.data;
  },

  // Assign permissions to a role
  assignPermissions: async (id: string, request: AssignPermissionsRequest): Promise<void> => {
    await apiClient.post(`/roles/${id}/permissions`, request);
  },

  // Remove a permission from a role
  removePermission: async (roleId: string, permissionId: string): Promise<void> => {
    await apiClient.delete(`/roles/${roleId}/permissions/${permissionId}`);
  },
};

// Permissions API
export const permissionsApi = {
  // Get all permissions
  getAll: async (): Promise<PermissionDto[]> => {
    const response = await apiClient.get('/permissions');
    return response.data;
  },

  // Get permissions grouped by module
  getGrouped: async (): Promise<PermissionGroupDto[]> => {
    const response = await apiClient.get('/permissions/grouped');
    return response.data;
  },

  // Get all module names
  getModules: async (): Promise<string[]> => {
    const response = await apiClient.get('/permissions/modules');
    return response.data;
  },

  // Get current user's permissions
  getMyPermissions: async (): Promise<AgentPermissionsDto> => {
    const response = await apiClient.get('/permissions/me');
    return response.data;
  },

  // Check if current user has a permission
  checkPermission: async (permission: string): Promise<{ permission: string; hasPermission: boolean }> => {
    const response = await apiClient.get(`/permissions/me/check/${permission}`);
    return response.data;
  },
};

// Agent Roles API
export const agentRolesApi = {
  // Get roles assigned to an agent
  getAgentRoles: async (agentId: string): Promise<RoleDto[]> => {
    const response = await apiClient.get(`/agents/${agentId}/roles`);
    return response.data;
  },

  // Assign roles to an agent
  assignRoles: async (agentId: string, request: AssignRolesRequest): Promise<void> => {
    await apiClient.post(`/agents/${agentId}/roles`, request);
  },

  // Remove a role from an agent
  removeRole: async (agentId: string, roleId: string): Promise<void> => {
    await apiClient.delete(`/agents/${agentId}/roles/${roleId}`);
  },

  // Get permissions summary for an agent
  getAgentPermissions: async (agentId: string): Promise<AgentPermissionsDto> => {
    const response = await apiClient.get(`/agents/${agentId}/permissions`);
    return response.data;
  },
};

export default rolesApi;
