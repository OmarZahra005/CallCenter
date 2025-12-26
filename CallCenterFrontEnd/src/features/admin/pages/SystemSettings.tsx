import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Settings,
  Phone,
  Globe,
  Bell,
  Mail,
  MessageSquare,
  Clock,
  Save,
  RefreshCw,
  CheckCircle,
  Loader2,
  ChevronRight,
  Search,
  Info,
  Key,
  Mic,
  HardDrive,
  Plus,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, Button, Badge, Modal, Input, Select } from '../../../components/ui';
import { staggerContainer, fadeUp } from '../../../utils/animations';
import { settingsApi, type SystemSettingDto, type SettingCategory as ApiSettingCategory, type SettingDataType, type CreateSettingRequest } from '../api/settingsApi';

// Types for local state
interface DisplaySetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  dataType: 'String' | 'Int' | 'Bool' | 'Json';
  isSensitive: boolean;
}

interface SettingCategoryConfig {
  id: ApiSettingCategory;
  name: string;
  icon: React.ElementType;
  description: string;
}

const CATEGORIES: SettingCategoryConfig[] = [
  { id: 'General', name: 'General', icon: Settings, description: 'Basic system configuration' },
  { id: 'Twilio', name: 'Twilio / Voice', icon: Phone, description: 'Voice call and telephony settings' },
  { id: 'WhatsApp', name: 'WhatsApp', icon: MessageSquare, description: 'WhatsApp Business API configuration' },
  { id: 'Sms', name: 'SMS', icon: MessageSquare, description: 'SMS messaging configuration' },
  { id: 'Email', name: 'Email', icon: Mail, description: 'Email server configuration' },
  { id: 'Transcription', name: 'Transcription', icon: Mic, description: 'Speech-to-text API settings' },
  { id: 'RecordingStorage', name: 'Recording Storage', icon: HardDrive, description: 'Call recording storage settings' },
  { id: 'Jwt', name: 'JWT / Security', icon: Key, description: 'Authentication token settings' },
  { id: 'Sla', name: 'SLA', icon: Clock, description: 'Service Level Agreement settings' },
  { id: 'Notification', name: 'Notifications', icon: Bell, description: 'Alert and notification preferences' },
  { id: 'Integration', name: 'Integrations', icon: Globe, description: 'Third-party service connections' },
];

// Map numeric category enum to string
const CATEGORY_MAP: Record<number, ApiSettingCategory> = {
  0: 'General',
  1: 'WhatsApp',
  2: 'Twilio',
  3: 'Sms',
  4: 'Email',
  5: 'Transcription',
  6: 'RecordingStorage',
  7: 'Jwt',
  8: 'Sla',
  9: 'Notification',
  10: 'Integration',
};

// Transform API data to display format
const transformSettings = (settings: SystemSettingDto[]): DisplaySetting[] => {
  return settings.map(s => ({
    id: s.id,
    key: s.key,
    value: s.value,
    // Handle both numeric and string category values from API
    category: typeof s.category === 'number' ? CATEGORY_MAP[s.category] || 'General' : s.category,
    description: s.description,
    dataType: typeof s.dataType === 'number' ? (['String', 'Int', 'Bool', 'Json'][s.dataType] || 'String') as DisplaySetting['dataType'] : s.dataType,
    isSensitive: s.isSensitive,
  }));
};

export const SystemSettings = () => {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<ApiSettingCategory>('General');
  const [searchQuery, setSearchQuery] = useState('');
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Create/Delete modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<DisplaySetting | null>(null);
  const [newSetting, setNewSetting] = useState<Partial<CreateSettingRequest>>({
    key: '',
    value: '',
    dataType: 'String',
    category: 'General',
    description: '',
    isSensitive: false,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Import/Export state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [importResult, setImportResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null);

  // Fetch settings from API
  const { data: settings = [], isLoading, error } = useQuery<DisplaySetting[]>({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const data = await settingsApi.getAll();
      return transformSettings(data);
    },
  });

  // Save mutation using bulk update
  const saveMutation = useMutation({
    mutationFn: async (updates: { key: string; value: string }[]) => {
      await settingsApi.bulkUpdate({ settings: updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      setEditedSettings({});
      setHasChanges(false);
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (request: CreateSettingRequest) => {
      return await settingsApi.create(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      setIsCreateModalOpen(false);
      setNewSetting({
        key: '',
        value: '',
        dataType: 'String',
        category: 'General',
        description: '',
        isSensitive: false,
      });
      setValidationErrors({});
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await settingsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      setIsDeleteModalOpen(false);
      setSettingToDelete(null);
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (settings: CreateSettingRequest[]) => {
      return await settingsApi.importSettings(settings);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      setImportResult(result);
    },
  });

  // Filter settings by category and search
  const filteredSettings = settings.filter((setting) => {
    const matchesCategory = setting.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      setting.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSettingChange = (key: string, value: string) => {
    setEditedSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const getValue = (setting: DisplaySetting) => {
    return editedSettings[setting.key] ?? setting.value;
  };

  const handleSave = () => {
    const updates = Object.entries(editedSettings).map(([key, value]) => ({ key, value }));
    saveMutation.mutate(updates);
  };

  const handleReset = () => {
    setEditedSettings({});
    setHasChanges(false);
  };

  // Validate new setting
  const validateNewSetting = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newSetting.key?.trim()) {
      errors.key = 'Key is required';
    } else if (!/^[A-Za-z][A-Za-z0-9_:]*$/.test(newSetting.key)) {
      errors.key = 'Key must start with a letter and contain only letters, numbers, underscores, or colons';
    } else if (settings.some(s => s.key.toLowerCase() === newSetting.key?.toLowerCase())) {
      errors.key = 'A setting with this key already exists';
    }

    if (newSetting.dataType === 'Int' && newSetting.value && isNaN(parseInt(newSetting.value))) {
      errors.value = 'Value must be a valid number for Int type';
    }

    if (newSetting.dataType === 'Bool' && newSetting.value && !['true', 'false', 'True', 'False', '0', '1'].includes(newSetting.value)) {
      errors.value = 'Value must be true or false for Bool type';
    }

    if (newSetting.dataType === 'Json' && newSetting.value) {
      try {
        JSON.parse(newSetting.value);
      } catch {
        errors.value = 'Value must be valid JSON';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create setting
  const handleCreateSetting = () => {
    if (!validateNewSetting()) return;

    createMutation.mutate(newSetting as CreateSettingRequest);
  };

  // Handle open create modal
  const handleOpenCreateModal = () => {
    setNewSetting({
      key: `${activeCategory}:`,
      value: '',
      dataType: 'String',
      category: activeCategory,
      description: '',
      isSensitive: false,
    });
    setValidationErrors({});
    setIsCreateModalOpen(true);
  };

  // Handle delete setting
  const handleDeleteSetting = (setting: DisplaySetting) => {
    setSettingToDelete(setting);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (settingToDelete) {
      deleteMutation.mutate(settingToDelete.id);
    }
  };

  // Export settings
  const handleExport = async () => {
    try {
      const allSettings = await settingsApi.exportAll();
      // Transform to export format (exclude sensitive values, include structure)
      const exportData = allSettings.map(s => ({
        key: s.key,
        value: s.isSensitive ? '' : s.value, // Don't export sensitive values
        dataType: s.dataType,
        category: s.category,
        description: s.description,
        isSensitive: s.isSensitive,
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Handle file selection for import
  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportResult(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        setImportPreview(data);
      } else {
        setImportPreview(null);
      }
    } catch {
      setImportPreview(null);
    }
  };

  // Perform import
  const handlePerformImport = () => {
    if (!importPreview) return;

    const settingsToImport: CreateSettingRequest[] = importPreview.map(s => ({
      key: s.key,
      value: s.value || '',
      dataType: s.dataType || 'String',
      category: s.category || 'General',
      description: s.description || '',
      isSensitive: s.isSensitive || false,
    }));

    importMutation.mutate(settingsToImport);
  };

  // Close import modal and reset state
  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setImportFile(null);
    setImportPreview(null);
    setImportResult(null);
  };

  const formatSettingLabel = (key: string): string => {
    // Remove category prefix (e.g., "Twilio:" from "Twilio:AccountSid")
    const parts = key.split(':');
    const name = parts.length > 1 ? parts[1] : key;
    // Convert camelCase/PascalCase to Title Case with spaces
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const renderSettingInput = (setting: DisplaySetting) => {
    const value = getValue(setting);

    // Boolean type
    if (setting.dataType === 'Bool') {
      return (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={value === 'true' || value === 'True'}
            onChange={(e) => handleSettingChange(setting.key, e.target.checked ? 'true' : 'false')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
        </label>
      );
    }

    // Number type
    if (setting.dataType === 'Int') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleSettingChange(setting.key, e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      );
    }

    // String type (default) - use password field for sensitive values
    return (
      <input
        type={setting.isSensitive ? 'password' : 'text'}
        value={value}
        placeholder={setting.isSensitive ? 'Enter new value' : ''}
        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
        className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
      />
    );
  };

  const activeCateg = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-5"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure system-wide settings and preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="warning">Unsaved Changes</Badge>
            )}
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Setting
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </motion.div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Category Sidebar */}
        <Card className="lg:col-span-1 p-2">
          <nav className="space-y-1">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              const count = settings.filter((s) => s.category === category.id).length;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{category.name}</p>
                  </div>
                  {count > 0 && (
                    <Badge variant="default" size="sm">
                      {count}
                    </Badge>
                  )}
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Settings Panel */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            {activeCateg && (
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <activeCateg.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {activeCateg.name}
                    </h2>
                    <p className="text-sm text-gray-500">{activeCateg.description}</p>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 mx-auto text-red-300 mb-3" />
                <p className="text-red-500">Failed to load settings</p>
              </div>
            ) : filteredSettings.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No settings found in this category</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredSettings.map((setting) => {
                  const isEdited = setting.key in editedSettings;

                  return (
                    <div
                      key={setting.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg ${
                        isEdited ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'bg-gray-50 dark:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatSettingLabel(setting.key)}
                          </p>
                          {setting.isSensitive && (
                            <Badge variant="default" size="sm">
                              Sensitive
                            </Badge>
                          )}
                          {isEdited && (
                            <Badge variant="warning" size="sm">
                              Modified
                            </Badge>
                          )}
                        </div>
                        {setting.description && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            {setting.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1 font-mono">{setting.key}</p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {renderSettingInput(setting)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSetting(setting)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Success/Error Toast */}
      {saveMutation.isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg shadow-lg"
        >
          <CheckCircle className="w-5 h-5" />
          Settings saved successfully
        </motion.div>
      )}

      {saveMutation.isError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg shadow-lg"
        >
          <Settings className="w-5 h-5" />
          Failed to save settings
        </motion.div>
      )}

      {/* Create Setting Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Setting"
      >
        <div className="space-y-4">
          <div>
            <Input
              label="Setting Key"
              value={newSetting.key || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewSetting({ ...newSetting, key: e.target.value })
              }
              placeholder="Category:SettingName"
              error={validationErrors.key}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use format: Category:SettingName (e.g., Twilio:AccountSid)
            </p>
          </div>

          <Select
            label="Category"
            value={newSetting.category || 'General'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setNewSetting({ ...newSetting, category: e.target.value as ApiSettingCategory })
            }
            options={CATEGORIES.map(c => ({ value: c.id, label: c.name }))}
          />

          <Select
            label="Data Type"
            value={newSetting.dataType || 'String'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setNewSetting({ ...newSetting, dataType: e.target.value as SettingDataType })
            }
            options={[
              { value: 'String', label: 'String' },
              { value: 'Int', label: 'Integer' },
              { value: 'Bool', label: 'Boolean' },
              { value: 'Json', label: 'JSON' },
            ]}
          />

          <div>
            {newSetting.dataType === 'Bool' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Value
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSetting.value === 'true'}
                    onChange={(e) => setNewSetting({ ...newSetting, value: e.target.checked ? 'true' : 'false' })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    {newSetting.value === 'true' ? 'True' : 'False'}
                  </span>
                </label>
              </div>
            ) : newSetting.dataType === 'Json' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Value (JSON)
                </label>
                <textarea
                  value={newSetting.value || ''}
                  onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                  rows={4}
                  placeholder='{"key": "value"}'
                />
                {validationErrors.value && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.value}</p>
                )}
              </div>
            ) : (
              <Input
                label="Value"
                type={newSetting.dataType === 'Int' ? 'number' : 'text'}
                value={newSetting.value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewSetting({ ...newSetting, value: e.target.value })
                }
                error={validationErrors.value}
              />
            )}
          </div>

          <Input
            label="Description (optional)"
            value={newSetting.description || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewSetting({ ...newSetting, description: e.target.value })
            }
            placeholder="Brief description of this setting"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isSensitive"
              checked={newSetting.isSensitive || false}
              onChange={(e) => setNewSetting({ ...newSetting, isSensitive: e.target.checked })}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isSensitive" className="text-sm text-gray-700 dark:text-gray-300">
              Sensitive value (will be masked in UI and encrypted in database)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSetting} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create Setting
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Setting"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this setting? This action cannot be undone.
              </p>
              {settingToDelete && (
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatSettingLabel(settingToDelete.key)}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-1">{settingToDelete.key}</p>
                  {settingToDelete.description && (
                    <p className="text-sm text-gray-500 mt-1">{settingToDelete.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete Setting
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        title="Import Settings"
      >
        <div className="space-y-4">
          {!importResult ? (
            <>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Upload a JSON file to import settings. Existing settings with matching keys will be updated.
                  New settings will be created. Sensitive values must be entered manually after import.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select JSON File
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFileChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {importFile && importPreview && (
                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Key</th>
                        <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Type</th>
                        <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {importPreview.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-3 py-2 font-mono text-xs text-gray-900 dark:text-white">
                            {item.key}
                          </td>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                            {item.dataType || 'String'}
                          </td>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                            {item.category || 'General'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {importFile && !importPreview && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Invalid JSON file. Please ensure the file contains an array of settings.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={handleCloseImportModal}>
                  Cancel
                </Button>
                <Button
                  onClick={handlePerformImport}
                  disabled={!importPreview || importMutation.isPending}
                >
                  {importMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Import {importPreview?.length || 0} Settings
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className={`p-4 rounded-lg ${importResult.errors.length > 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className={`w-5 h-5 ${importResult.errors.length > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
                  <p className="font-medium text-gray-900 dark:text-white">
                    Import Complete
                  </p>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <p>Created: {importResult.created} settings</p>
                  <p>Updated: {importResult.updated} settings</p>
                  {importResult.errors.length > 0 && (
                    <p className="text-red-600 dark:text-red-400">
                      Errors: {importResult.errors.length}
                    </p>
                  )}
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Errors:</p>
                  <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={handleCloseImportModal}>
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </motion.div>
  );
};

export default SystemSettings;
