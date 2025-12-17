import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button, Card, Badge, Modal, Input, Select, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../components/ui';
import apiClient from '../../../api/client';
import {
  Plus,
  Play,
  Pause,
  Square,
  BarChart3,
  Users,
  Phone,
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  dialingMode: number;
  status: number;
  totalRecords: number;
  pendingRecords: number;
  completedRecords: number;
  connectedCalls: number;
  totalAttempts: number;
  connectRate: number;
  completionRate: number;
  createdAt: string;
}

const dialingModes = ['Preview', 'Progressive', 'Power', 'Predictive'];
const campaignStatuses = ['Draft', 'Scheduled', 'Running', 'Paused', 'Completed', 'Cancelled'];

const statusColors: Record<number, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
  0: 'default',    // Draft
  1: 'info',       // Scheduled
  2: 'success',    // Running
  3: 'warning',    // Paused
  4: 'default',    // Completed
  5: 'danger',     // Cancelled
};

export function CampaignManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    dialingMode: 0,
    maxAttempts: 3,
    retryDelayMinutes: 60,
    callWindowStart: '09:00',
    callWindowEnd: '21:00',
    callerId: '',
  });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['dialer-campaigns'],
    queryFn: async () => {
      const response = await apiClient.get('/dialer/campaigns', {
        params: { pageNumber: 1, pageSize: 50 }
      });
      return response.data.items as Campaign[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newCampaign) => {
      return apiClient.post('/dialer/campaigns', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dialer-campaigns'] });
      setIsCreateModalOpen(false);
      setNewCampaign({
        name: '',
        description: '',
        dialingMode: 0,
        maxAttempts: 3,
        retryDelayMinutes: 60,
        callWindowStart: '09:00',
        callWindowEnd: '21:00',
        callerId: '',
      });
    }
  });

  const startMutation = useMutation({
    mutationFn: async (id: string) => apiClient.post(`/dialer/campaigns/${id}/start`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dialer-campaigns'] })
  });

  const pauseMutation = useMutation({
    mutationFn: async (id: string) => apiClient.post(`/dialer/campaigns/${id}/pause`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dialer-campaigns'] })
  });

  const stopMutation = useMutation({
    mutationFn: async (id: string) => apiClient.post(`/dialer/campaigns/${id}/stop`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dialer-campaigns'] })
  });

  const handleCreate = () => {
    createMutation.mutate(newCampaign);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dialer.campaigns', 'Campaign Management')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('dialer.campaignsDescription', 'Manage outbound dialing campaigns')}
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          {t('dialer.newCampaign', 'New Campaign')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dialer.totalCampaigns', 'Total Campaigns')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{campaigns?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Play className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dialer.running', 'Running')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {campaigns?.filter(c => c.status === 2).length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dialer.totalRecords', 'Total Records')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {campaigns?.reduce((sum, c) => sum + c.totalRecords, 0) || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <BarChart3 className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dialer.avgConnectRate', 'Avg Connect Rate')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {campaigns && campaigns.length > 0
                  ? (campaigns.reduce((sum, c) => sum + c.connectRate, 0) / campaigns.length).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('dialer.campaignName', 'Campaign Name')}</TableHead>
              <TableHead>{t('dialer.mode', 'Mode')}</TableHead>
              <TableHead>{t('dialer.status', 'Status')}</TableHead>
              <TableHead>{t('dialer.records', 'Records')}</TableHead>
              <TableHead>{t('dialer.progress', 'Progress')}</TableHead>
              <TableHead>{t('dialer.connectRate', 'Connect Rate')}</TableHead>
              <TableHead>{t('dialer.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t('common.loading', 'Loading...')}
                </TableCell>
              </TableRow>
            ) : campaigns && campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{campaign.name}</p>
                      {campaign.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{campaign.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">{dialingModes[campaign.dialingMode]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[campaign.status]}>
                      {campaignStatuses[campaign.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="text-gray-900 dark:text-white">{campaign.completedRecords}</span>
                      <span className="text-gray-500"> / {campaign.totalRecords}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${campaign.completionRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{campaign.completionRate.toFixed(1)}%</span>
                  </TableCell>
                  <TableCell>
                    <span className={campaign.connectRate > 20 ? 'text-green-600' : 'text-yellow-600'}>
                      {campaign.connectRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {campaign.status === 0 || campaign.status === 3 ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startMutation.mutate(campaign.id)}
                          disabled={startMutation.isPending}
                        >
                          <Play className="h-4 w-4 text-green-600" />
                        </Button>
                      ) : campaign.status === 2 ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => pauseMutation.mutate(campaign.id)}
                            disabled={pauseMutation.isPending}
                          >
                            <Pause className="h-4 w-4 text-yellow-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => stopMutation.mutate(campaign.id)}
                            disabled={stopMutation.isPending}
                          >
                            <Square className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      ) : null}
                      <Button size="sm" variant="ghost">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {t('dialer.noCampaigns', 'No campaigns found. Create your first campaign to get started.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Campaign Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('dialer.createCampaign', 'Create New Campaign')}
      >
        <div className="space-y-4">
          <Input
            label={t('dialer.campaignName', 'Campaign Name')}
            value={newCampaign.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCampaign({ ...newCampaign, name: e.target.value })}
            placeholder={t('dialer.campaignNamePlaceholder', 'Enter campaign name')}
          />
          <Input
            label={t('dialer.description', 'Description')}
            value={newCampaign.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCampaign({ ...newCampaign, description: e.target.value })}
            placeholder={t('dialer.descriptionPlaceholder', 'Enter description (optional)')}
          />
          <Select
            label={t('dialer.dialingMode', 'Dialing Mode')}
            value={newCampaign.dialingMode.toString()}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewCampaign({ ...newCampaign, dialingMode: parseInt(e.target.value) })}
            options={dialingModes.map((mode, index) => ({ value: index.toString(), label: mode }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('dialer.maxAttempts', 'Max Attempts')}
              type="number"
              value={newCampaign.maxAttempts.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCampaign({ ...newCampaign, maxAttempts: parseInt(e.target.value) })}
            />
            <Input
              label={t('dialer.retryDelay', 'Retry Delay (min)')}
              type="number"
              value={newCampaign.retryDelayMinutes.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCampaign({ ...newCampaign, retryDelayMinutes: parseInt(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('dialer.callWindowStart', 'Call Window Start')}
              type="time"
              value={newCampaign.callWindowStart}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCampaign({ ...newCampaign, callWindowStart: e.target.value })}
            />
            <Input
              label={t('dialer.callWindowEnd', 'Call Window End')}
              type="time"
              value={newCampaign.callWindowEnd}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCampaign({ ...newCampaign, callWindowEnd: e.target.value })}
            />
          </div>
          <Input
            label={t('dialer.callerId', 'Caller ID')}
            value={newCampaign.callerId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCampaign({ ...newCampaign, callerId: e.target.value })}
            placeholder={t('dialer.callerIdPlaceholder', '+1234567890')}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newCampaign.name || createMutation.isPending}
            >
              {createMutation.isPending ? t('common.creating', 'Creating...') : t('common.create', 'Create')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
