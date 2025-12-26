import apiClient from '../../../api/client';

// Types
export interface SystemSettingDto {
  id: string;
  key: string;
  value: string;
  dataType: SettingDataType;
  category: SettingCategory;
  description?: string;
  isSensitive: boolean;
  updatedAt: string;
}

export type SettingDataType = 'String' | 'Int' | 'Bool' | 'Json';

export type SettingCategory =
  | 'General'
  | 'WhatsApp'
  | 'Twilio'
  | 'Sms'
  | 'Email'
  | 'Transcription'
  | 'RecordingStorage'
  | 'Jwt'
  | 'Sla'
  | 'Notification'
  | 'Integration';

export interface CategorySettingsDto {
  category: SettingCategory;
  categoryName: string;
  settings: SystemSettingDto[];
}

export interface CreateSettingRequest {
  key: string;
  value: string;
  dataType: SettingDataType;
  category: SettingCategory;
  description?: string;
  isSensitive: boolean;
}

export interface UpdateSettingRequest {
  value: string;
  description?: string;
}

export interface BulkUpdateSettingsRequest {
  settings: { key: string; value: string }[];
}

// API functions
export const settingsApi = {
  /**
   * Get all settings
   */
  getAll: async (): Promise<SystemSettingDto[]> => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  /**
   * Get settings grouped by category
   */
  getGrouped: async (): Promise<CategorySettingsDto[]> => {
    const response = await apiClient.get('/settings/grouped');
    return response.data;
  },

  /**
   * Get settings by category
   */
  getByCategory: async (category: SettingCategory): Promise<SystemSettingDto[]> => {
    const response = await apiClient.get(`/settings/category/${category}`);
    return response.data;
  },

  /**
   * Get setting by key
   */
  getByKey: async (key: string): Promise<SystemSettingDto> => {
    const response = await apiClient.get(`/settings/key/${encodeURIComponent(key)}`);
    return response.data;
  },

  /**
   * Get setting by ID
   */
  getById: async (id: string): Promise<SystemSettingDto> => {
    const response = await apiClient.get(`/settings/${id}`);
    return response.data;
  },

  /**
   * Create a new setting
   */
  create: async (request: CreateSettingRequest): Promise<SystemSettingDto> => {
    const response = await apiClient.post('/settings', request);
    return response.data;
  },

  /**
   * Update a setting by ID
   */
  update: async (id: string, request: UpdateSettingRequest): Promise<SystemSettingDto> => {
    const response = await apiClient.put(`/settings/${id}`, request);
    return response.data;
  },

  /**
   * Bulk update multiple settings
   */
  bulkUpdate: async (request: BulkUpdateSettingsRequest): Promise<void> => {
    await apiClient.put('/settings/bulk', request);
  },

  /**
   * Delete a setting
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/settings/${id}`);
  },

  /**
   * Export all settings as JSON
   */
  exportAll: async (): Promise<SystemSettingDto[]> => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  /**
   * Import settings from JSON (creates or updates)
   */
  importSettings: async (settings: CreateSettingRequest[]): Promise<{ created: number; updated: number; errors: string[] }> => {
    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const setting of settings) {
      try {
        // Try to get existing setting by key
        try {
          const existing = await apiClient.get(`/settings/key/${encodeURIComponent(setting.key)}`);
          if (existing.data) {
            // Update existing
            await apiClient.put(`/settings/${existing.data.id}`, { value: setting.value, description: setting.description });
            results.updated++;
            continue;
          }
        } catch {
          // Setting doesn't exist, create it
        }

        // Create new setting
        await apiClient.post('/settings', setting);
        results.created++;
      } catch (error: any) {
        results.errors.push(`Failed to import ${setting.key}: ${error.message || 'Unknown error'}`);
      }
    }

    return results;
  },
};

export default settingsApi;
