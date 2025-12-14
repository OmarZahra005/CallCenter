import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge, Modal, Input, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../components/ui';
import apiClient from '../../../api/client';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Phone,
  CheckCircle,
  Clock,
  GitBranch,
} from 'lucide-react';

interface IvrFlow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  phoneNumbers?: string;
  defaultLanguage: string;
  defaultVoice: string;
  maxInvalidAttempts: number;
  inputTimeout: number;
  businessHoursStart?: string;
  businessHoursEnd?: string;
  businessDays?: string;
  nodeCount: number;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

export function IvrFlows() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<IvrFlow | null>(null);
  const [duplicateName, setDuplicateName] = useState('');
  const [newFlow, setNewFlow] = useState({
    name: '',
    description: '',
    isActive: false,
    isDefault: false,
    defaultLanguage: 'ar-SA',
    defaultVoice: 'Polly.Zeina',
    maxInvalidAttempts: 3,
    inputTimeout: 5,
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
    businessDays: 'Sunday,Monday,Tuesday,Wednesday,Thursday',
  });

  const { data: flows, isLoading } = useQuery({
    queryKey: ['ivr-flows'],
    queryFn: async () => {
      const response = await apiClient.get('/ivr/flows', {
        params: { pageNumber: 1, pageSize: 50 }
      });
      return response.data.items as IvrFlow[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newFlow) => {
      return apiClient.post('/ivr/flows', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ivr-flows'] });
      setIsCreateModalOpen(false);
      setNewFlow({
        name: '',
        description: '',
        isActive: false,
        isDefault: false,
        defaultLanguage: 'ar-SA',
        defaultVoice: 'Polly.Zeina',
        maxInvalidAttempts: 3,
        inputTimeout: 5,
        businessHoursStart: '09:00',
        businessHoursEnd: '17:00',
        businessDays: 'Sunday,Monday,Tuesday,Wednesday,Thursday',
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/ivr/flows/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ivr-flows'] })
  });

  const duplicateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return apiClient.post(`/ivr/flows/${id}/duplicate?newName=${encodeURIComponent(name)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ivr-flows'] });
      setIsDuplicateModalOpen(false);
      setSelectedFlow(null);
      setDuplicateName('');
    }
  });

  const handleCreate = () => {
    createMutation.mutate(newFlow);
  };

  const handleDuplicate = () => {
    if (selectedFlow && duplicateName) {
      duplicateMutation.mutate({ id: selectedFlow.id, name: duplicateName });
    }
  };

  const openDuplicateModal = (flow: IvrFlow) => {
    setSelectedFlow(flow);
    setDuplicateName(`${flow.name} (Copy)`);
    setIsDuplicateModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('ivr.flows', 'IVR Flow Management')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('ivr.flowsDescription', 'Design and manage interactive voice response flows')}
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          {t('ivr.newFlow', 'New IVR Flow')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <GitBranch className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('ivr.totalFlows', 'Total Flows')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{flows?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('ivr.activeFlows', 'Active')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {flows?.filter(f => f.isActive).length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('ivr.withPhoneNumbers', 'With Phone Numbers')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {flows?.filter(f => f.phoneNumbers).length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('ivr.totalNodes', 'Total Nodes')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {flows?.reduce((sum, f) => sum + f.nodeCount, 0) || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Flows Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('ivr.flowName', 'Flow Name')}</TableHead>
              <TableHead>{t('ivr.status', 'Status')}</TableHead>
              <TableHead>{t('ivr.phoneNumbers', 'Phone Numbers')}</TableHead>
              <TableHead>{t('ivr.nodes', 'Nodes')}</TableHead>
              <TableHead>{t('ivr.businessHours', 'Business Hours')}</TableHead>
              <TableHead>{t('ivr.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {t('common.loading', 'Loading...')}
                </TableCell>
              </TableRow>
            ) : flows && flows.length > 0 ? (
              flows.map((flow) => (
                <TableRow key={flow.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{flow.name}</p>
                      {flow.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{flow.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={flow.isActive ? 'success' : 'default'}>
                        {flow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {flow.isDefault && (
                        <Badge variant="info">Default</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {flow.phoneNumbers ? (
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {flow.phoneNumbers.split(',').length} number(s)
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{flow.nodeCount} nodes</Badge>
                  </TableCell>
                  <TableCell>
                    {flow.businessHoursStart && flow.businessHoursEnd ? (
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {flow.businessHoursStart} - {flow.businessHoursEnd}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">24/7</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/ivr/builder/${flow.id}`)}
                        title="Edit Flow"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDuplicateModal(flow)}
                        title="Duplicate Flow"
                      >
                        <Copy className="h-4 w-4 text-purple-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this flow?')) {
                            deleteMutation.mutate(flow.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        title="Delete Flow"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {t('ivr.noFlows', 'No IVR flows found. Create your first flow to get started.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Flow Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('ivr.createFlow', 'Create New IVR Flow')}
      >
        <div className="space-y-4">
          <Input
            label={t('ivr.flowName', 'Flow Name')}
            value={newFlow.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFlow({ ...newFlow, name: e.target.value })}
            placeholder={t('ivr.flowNamePlaceholder', 'Enter flow name')}
          />
          <Input
            label={t('ivr.description', 'Description')}
            value={newFlow.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFlow({ ...newFlow, description: e.target.value })}
            placeholder={t('ivr.descriptionPlaceholder', 'Enter description (optional)')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('ivr.defaultLanguage', 'Default Language')}
              value={newFlow.defaultLanguage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFlow({ ...newFlow, defaultLanguage: e.target.value })}
              placeholder="ar-SA"
            />
            <Input
              label={t('ivr.defaultVoice', 'Default Voice')}
              value={newFlow.defaultVoice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFlow({ ...newFlow, defaultVoice: e.target.value })}
              placeholder="Polly.Zeina"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('ivr.maxInvalidAttempts', 'Max Invalid Attempts')}
              type="number"
              value={newFlow.maxInvalidAttempts.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFlow({ ...newFlow, maxInvalidAttempts: parseInt(e.target.value) })}
            />
            <Input
              label={t('ivr.inputTimeout', 'Input Timeout (sec)')}
              type="number"
              value={newFlow.inputTimeout.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFlow({ ...newFlow, inputTimeout: parseInt(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('ivr.businessHoursStart', 'Business Hours Start')}
              type="time"
              value={newFlow.businessHoursStart}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFlow({ ...newFlow, businessHoursStart: e.target.value })}
            />
            <Input
              label={t('ivr.businessHoursEnd', 'Business Hours End')}
              type="time"
              value={newFlow.businessHoursEnd}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFlow({ ...newFlow, businessHoursEnd: e.target.value })}
            />
          </div>
          <Input
            label={t('ivr.businessDays', 'Business Days')}
            value={newFlow.businessDays}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFlow({ ...newFlow, businessDays: e.target.value })}
            placeholder="Sunday,Monday,Tuesday,Wednesday,Thursday"
          />
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newFlow.isActive}
                onChange={(e) => setNewFlow({ ...newFlow, isActive: e.target.checked })}
                className="mr-2"
              />
              {t('ivr.active', 'Active')}
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newFlow.isDefault}
                onChange={(e) => setNewFlow({ ...newFlow, isDefault: e.target.checked })}
                className="mr-2"
              />
              {t('ivr.default', 'Set as Default')}
            </label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newFlow.name || createMutation.isPending}
            >
              {createMutation.isPending ? t('common.creating', 'Creating...') : t('common.create', 'Create')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Duplicate Flow Modal */}
      <Modal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        title={t('ivr.duplicateFlow', 'Duplicate IVR Flow')}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            {t('ivr.duplicateDescription', `Create a copy of "${selectedFlow?.name}"`)}
          </p>
          <Input
            label={t('ivr.newFlowName', 'New Flow Name')}
            value={duplicateName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuplicateName(e.target.value)}
            placeholder={t('ivr.newFlowNamePlaceholder', 'Enter new flow name')}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsDuplicateModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={!duplicateName || duplicateMutation.isPending}
            >
              {duplicateMutation.isPending ? t('common.duplicating', 'Duplicating...') : t('common.duplicate', 'Duplicate')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
