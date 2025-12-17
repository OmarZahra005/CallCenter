import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button, Card, Badge, Modal, Input, Select, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../components/ui';
import apiClient from '../../../api/client';
import {
  Plus,
  Edit,
  Trash2,
  PhoneCall,
  Clock,
  Users,
} from 'lucide-react';

interface Queue {
  id: string;
  name: string;
  description?: string;
  priority: number;
  maxWaitTimeSeconds: number;
  teamId?: string;
  teamName?: string;
  isActive: boolean;
  createdAt: string;
}

interface Team {
  id: string;
  name: string;
}

export function QueueManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 5,
    maxWaitTimeSeconds: 300,
    teamId: '',
    isActive: true,
  });

  // Fetch queues
  const { data: queues, isLoading } = useQuery({
    queryKey: ['queues'],
    queryFn: async () => {
      const response = await apiClient.get('/queues', {
        params: { pageNumber: 1, pageSize: 100 }
      });
      return response.data.items as Queue[];
    }
  });

  // Fetch teams for dropdown
  const { data: teams } = useQuery({
    queryKey: ['teams-dropdown'],
    queryFn: async () => {
      const response = await apiClient.get('/teams', {
        params: { pageNumber: 1, pageSize: 100 }
      });
      return response.data.items as Team[];
    }
  });

  // Create queue
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiClient.post('/queues', {
        name: data.name,
        description: data.description || undefined,
        priority: data.priority,
        maxWaitTimeSeconds: data.maxWaitTimeSeconds,
        teamId: data.teamId || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
      setIsCreateModalOpen(false);
      resetForm();
    }
  });

  // Update queue
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return apiClient.put(`/queues/${id}`, {
        name: data.name,
        description: data.description || undefined,
        priority: data.priority,
        maxWaitTimeSeconds: data.maxWaitTimeSeconds,
        teamId: data.teamId || undefined,
        isActive: data.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
      setIsEditModalOpen(false);
      setSelectedQueue(null);
      resetForm();
    }
  });

  // Delete queue
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/queues/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      priority: 5,
      maxWaitTimeSeconds: 300,
      teamId: '',
      isActive: true,
    });
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (selectedQueue) {
      updateMutation.mutate({ id: selectedQueue.id, data: formData });
    }
  };

  const handleEdit = (queue: Queue) => {
    setSelectedQueue(queue);
    setFormData({
      name: queue.name,
      description: queue.description || '',
      priority: queue.priority,
      maxWaitTimeSeconds: queue.maxWaitTimeSeconds,
      teamId: queue.teamId || '',
      isActive: queue.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (queue: Queue) => {
    if (confirm(t('admin.confirmDeleteQueue', `Are you sure you want to delete queue "${queue.name}"?`))) {
      deleteMutation.mutate(queue.id);
    }
  };

  const formatWaitTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const activeQueues = queues?.filter(q => q.isActive).length || 0;
  const inactiveQueues = queues?.filter(q => !q.isActive).length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.queueManagement', 'Queue Management')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('admin.queueManagementDescription', 'Configure and manage call queues')}
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          {t('admin.newQueue', 'New Queue')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <PhoneCall className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{t('admin.totalQueues', 'Total Queues')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{queues?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <PhoneCall className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{t('admin.activeQueues', 'Active')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeQueues}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <PhoneCall className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{t('admin.inactiveQueues', 'Inactive')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{inactiveQueues}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Queues Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.queueName', 'Queue Name')}</TableHead>
              <TableHead>{t('admin.team', 'Team')}</TableHead>
              <TableHead>{t('admin.priority', 'Priority')}</TableHead>
              <TableHead>{t('admin.maxWait', 'Max Wait')}</TableHead>
              <TableHead>{t('admin.status', 'Status')}</TableHead>
              <TableHead>{t('admin.created', 'Created')}</TableHead>
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
            ) : queues && queues.length > 0 ? (
              queues.map((queue) => (
                <TableRow key={queue.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{queue.name}</p>
                      {queue.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{queue.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {queue.teamName ? (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 dark:text-white">{queue.teamName}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">{t('admin.noTeam', 'No team')}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={queue.priority <= 3 ? 'danger' : queue.priority <= 6 ? 'warning' : 'default'}>
                      {queue.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-900 dark:text-white">{formatWaitTime(queue.maxWaitTimeSeconds)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={queue.isActive ? 'success' : 'default'}>
                      {queue.isActive ? t('admin.active', 'Active') : t('admin.inactive', 'Inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(queue.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(queue)}
                        title={t('common.edit', 'Edit')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(queue)}
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
                  {t('admin.noQueues', 'No queues found. Create your first queue to get started.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Queue Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); resetForm(); }}
        title={t('admin.createQueue', 'Create New Queue')}
      >
        <div className="space-y-4">
          <Input
            label={t('admin.queueName', 'Queue Name')}
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('admin.queueNamePlaceholder', 'e.g., Sales Queue')}
          />
          <Input
            label={t('admin.description', 'Description')}
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('admin.descriptionPlaceholder', 'Optional description')}
          />
          <Select
            label={t('admin.team', 'Team')}
            value={formData.teamId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, teamId: e.target.value })}
            options={[
              { value: '', label: t('admin.selectTeam', 'Select Team (Optional)') },
              ...(teams?.map(t => ({ value: t.id, label: t.name })) || [])
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('admin.priority', 'Priority (1-10)')}
              type="number"
              min={1}
              max={10}
              value={formData.priority.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, priority: parseInt(e.target.value) || 5 })}
            />
            <Input
              label={t('admin.maxWaitSeconds', 'Max Wait (seconds)')}
              type="number"
              min={30}
              value={formData.maxWaitTimeSeconds.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maxWaitTimeSeconds: parseInt(e.target.value) || 300 })}
            />
          </div>
          <p className="text-xs text-gray-500">{t('admin.priorityHelp', 'Lower priority numbers are handled first.')}</p>
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

      {/* Edit Queue Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedQueue(null); resetForm(); }}
        title={t('admin.editQueue', 'Edit Queue')}
      >
        <div className="space-y-4">
          <Input
            label={t('admin.queueName', 'Queue Name')}
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label={t('admin.description', 'Description')}
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
          />
          <Select
            label={t('admin.team', 'Team')}
            value={formData.teamId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, teamId: e.target.value })}
            options={[
              { value: '', label: t('admin.selectTeam', 'Select Team (Optional)') },
              ...(teams?.map(t => ({ value: t.id, label: t.name })) || [])
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('admin.priority', 'Priority (1-10)')}
              type="number"
              min={1}
              max={10}
              value={formData.priority.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, priority: parseInt(e.target.value) || 5 })}
            />
            <Input
              label={t('admin.maxWaitSeconds', 'Max Wait (seconds)')}
              type="number"
              min={30}
              value={formData.maxWaitTimeSeconds.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maxWaitTimeSeconds: parseInt(e.target.value) || 300 })}
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
              {t('admin.queueActive', 'Queue is active')}
            </label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => { setIsEditModalOpen(false); setSelectedQueue(null); resetForm(); }}>
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
