import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button, Card, Badge, Modal, Input, Select, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../components/ui';
import apiClient from '../../../api/client';
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface SlaRule {
  id: string;
  name: string;
  category: string;
  priority: number;
  firstResponseTimeMinutes: number;
  resolveTimeMinutes: number;
  isActive: boolean;
  createdAt: string;
}

const priorityLabels = ['', 'Critical', 'High', 'Medium', 'Low'];
const priorityColors: Record<number, 'danger' | 'warning' | 'info' | 'default'> = {
  1: 'danger',
  2: 'warning',
  3: 'info',
  4: 'default',
};

const categories = ['General', 'Technical', 'Billing', 'Sales', 'Support', 'VIP'];

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

export function SlaRules() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<SlaRule | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    priority: 3,
    firstResponseTimeMinutes: 60,
    resolveTimeMinutes: 480,
    isActive: true,
  });

  // Fetch SLA rules
  const { data: rules, isLoading } = useQuery({
    queryKey: ['sla-rules'],
    queryFn: async () => {
      const response = await apiClient.get('/slarules', {
        params: { pageNumber: 1, pageSize: 100 }
      });
      return response.data.items as SlaRule[];
    }
  });

  // Create rule
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiClient.post('/slarules', {
        name: data.name,
        category: data.category,
        priority: data.priority,
        firstResponseTimeMinutes: data.firstResponseTimeMinutes,
        resolveTimeMinutes: data.resolveTimeMinutes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-rules'] });
      setIsCreateModalOpen(false);
      resetForm();
    }
  });

  // Update rule
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return apiClient.put(`/slarules/${id}`, {
        name: data.name,
        category: data.category,
        priority: data.priority,
        firstResponseTimeMinutes: data.firstResponseTimeMinutes,
        resolveTimeMinutes: data.resolveTimeMinutes,
        isActive: data.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-rules'] });
      setIsEditModalOpen(false);
      setSelectedRule(null);
      resetForm();
    }
  });

  // Delete rule
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/slarules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-rules'] });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'General',
      priority: 3,
      firstResponseTimeMinutes: 60,
      resolveTimeMinutes: 480,
      isActive: true,
    });
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (selectedRule) {
      updateMutation.mutate({ id: selectedRule.id, data: formData });
    }
  };

  const handleEdit = (rule: SlaRule) => {
    setSelectedRule(rule);
    setFormData({
      name: rule.name,
      category: rule.category,
      priority: rule.priority,
      firstResponseTimeMinutes: rule.firstResponseTimeMinutes,
      resolveTimeMinutes: rule.resolveTimeMinutes,
      isActive: rule.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (rule: SlaRule) => {
    if (confirm(t('admin.confirmDeleteSla', `Are you sure you want to delete SLA rule "${rule.name}"?`))) {
      deleteMutation.mutate(rule.id);
    }
  };

  const activeRules = rules?.filter(r => r.isActive).length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.slaRules', 'SLA Rules')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('admin.slaRulesDescription', 'Define service level agreements for ticket resolution')}
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          {t('admin.newSlaRule', 'New SLA Rule')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{t('admin.totalRules', 'Total Rules')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{rules?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{t('admin.activeRules', 'Active')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeRules}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{t('admin.categories', 'Categories')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(rules?.map(r => r.category)).size || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* SLA Rules Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.ruleName', 'Rule Name')}</TableHead>
              <TableHead>{t('admin.category', 'Category')}</TableHead>
              <TableHead>{t('admin.priority', 'Priority')}</TableHead>
              <TableHead>{t('admin.firstResponse', 'First Response')}</TableHead>
              <TableHead>{t('admin.resolution', 'Resolution')}</TableHead>
              <TableHead>{t('admin.status', 'Status')}</TableHead>
              <TableHead>{t('admin.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t('common.loading', 'Loading...')}
                </TableCell>
              </TableRow>
            ) : rules && rules.length > 0 ? (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <p className="font-medium text-gray-900 dark:text-white">{rule.name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">{rule.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityColors[rule.priority]}>
                      {priorityLabels[rule.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-gray-900 dark:text-white">{formatTime(rule.firstResponseTimeMinutes)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-gray-900 dark:text-white">{formatTime(rule.resolveTimeMinutes)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.isActive ? 'success' : 'default'}>
                      {rule.isActive ? t('admin.active', 'Active') : t('admin.inactive', 'Inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(rule)}
                        title={t('common.edit', 'Edit')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(rule)}
                        title={t('common.delete', 'Delete')}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {t('admin.noSlaRules', 'No SLA rules found. Create your first rule to get started.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create SLA Rule Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); resetForm(); }}
        title={t('admin.createSlaRule', 'Create SLA Rule')}
      >
        <div className="space-y-4">
          <Input
            label={t('admin.ruleName', 'Rule Name')}
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('admin.ruleNamePlaceholder', 'e.g., Critical Support')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('admin.category', 'Category')}
              value={formData.category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, category: e.target.value })}
              options={categories.map(c => ({ value: c, label: c }))}
            />
            <Select
              label={t('admin.priority', 'Priority')}
              value={formData.priority.toString()}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              options={[
                { value: '1', label: 'Critical' },
                { value: '2', label: 'High' },
                { value: '3', label: 'Medium' },
                { value: '4', label: 'Low' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('admin.firstResponseMinutes', 'First Response (minutes)')}
              type="number"
              min={1}
              value={formData.firstResponseTimeMinutes.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, firstResponseTimeMinutes: parseInt(e.target.value) || 60 })}
            />
            <Input
              label={t('admin.resolveMinutes', 'Resolution Time (minutes)')}
              type="number"
              min={1}
              value={formData.resolveTimeMinutes.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, resolveTimeMinutes: parseInt(e.target.value) || 480 })}
            />
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              <strong>{t('admin.preview', 'Preview')}:</strong> First response within <span className="font-medium text-yellow-600">{formatTime(formData.firstResponseTimeMinutes)}</span>, resolve within <span className="font-medium text-blue-600">{formatTime(formData.resolveTimeMinutes)}</span>
            </p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name || createMutation.isPending}>
              {createMutation.isPending ? t('common.creating', 'Creating...') : t('common.create', 'Create')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit SLA Rule Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedRule(null); resetForm(); }}
        title={t('admin.editSlaRule', 'Edit SLA Rule')}
      >
        <div className="space-y-4">
          <Input
            label={t('admin.ruleName', 'Rule Name')}
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('admin.category', 'Category')}
              value={formData.category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, category: e.target.value })}
              options={categories.map(c => ({ value: c, label: c }))}
            />
            <Select
              label={t('admin.priority', 'Priority')}
              value={formData.priority.toString()}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              options={[
                { value: '1', label: 'Critical' },
                { value: '2', label: 'High' },
                { value: '3', label: 'Medium' },
                { value: '4', label: 'Low' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('admin.firstResponseMinutes', 'First Response (minutes)')}
              type="number"
              min={1}
              value={formData.firstResponseTimeMinutes.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, firstResponseTimeMinutes: parseInt(e.target.value) || 60 })}
            />
            <Input
              label={t('admin.resolveMinutes', 'Resolution Time (minutes)')}
              type="number"
              min={1}
              value={formData.resolveTimeMinutes.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, resolveTimeMinutes: parseInt(e.target.value) || 480 })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
              {t('admin.ruleActive', 'Rule is active')}
            </label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => { setIsEditModalOpen(false); setSelectedRule(null); resetForm(); }}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleUpdate} disabled={!formData.name || updateMutation.isPending}>
              {updateMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
