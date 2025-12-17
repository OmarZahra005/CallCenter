import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button, Card, Badge, Modal, Input, Select, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../components/ui';
import apiClient from '../../../api/client';
import {
  Plus,
  Upload,
  Trash2,
  FileSpreadsheet,
  Link,
  Eye,
  CheckCircle,
  AlertTriangle,
  PhoneOff,
} from 'lucide-react';

interface DialerList {
  id: string;
  name: string;
  description?: string;
  status: number;
  campaignId?: string;
  campaignName?: string;
  sourceFileName?: string;
  importedAtUtc?: string;
  importedByName?: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  dncRecords: number;
  createdAt: string;
}

interface DialerRecord {
  id: string;
  listId: string;
  phoneNumber: string;
  phoneNumber2?: string;
  phoneNumber3?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email?: string;
  company?: string;
  status: number;
  attemptCount: number;
  lastAttemptUtc?: string;
  lastDisposition?: string;
  priority: number;
}

interface Campaign {
  id: string;
  name: string;
  status: number;
}

const listStatuses = ['Active', 'Inactive', 'Processing', 'Error'];
const listStatusColors: Record<number, 'success' | 'default' | 'info' | 'danger'> = {
  0: 'success',
  1: 'default',
  2: 'info',
  3: 'danger',
};

const recordStatuses = ['Pending', 'InProgress', 'Completed', 'Failed', 'Retry', 'Callback', 'DNC', 'InvalidNumber', 'NoAnswer', 'Busy', 'Voicemail', 'Connected', 'Skipped'];

export function ListManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRecordsModalOpen, setIsRecordsModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<DialerList | null>(null);

  const [newList, setNewList] = useState({
    name: '',
    description: '',
    campaignId: '',
  });

  const [importData, setImportData] = useState({
    name: '',
    description: '',
    campaignId: '',
    records: [] as Array<{
      phoneNumber: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      company?: string;
    }>,
  });

  const [csvText, setCsvText] = useState('');

  // Fetch all lists
  const { data: lists, isLoading } = useQuery({
    queryKey: ['dialer-lists'],
    queryFn: async () => {
      const response = await apiClient.get('/dialer/lists', {
        params: { pageNumber: 1, pageSize: 100 }
      });
      return response.data.items as DialerList[];
    }
  });

  // Fetch campaigns for assignment dropdown
  const { data: campaigns } = useQuery({
    queryKey: ['dialer-campaigns-dropdown'],
    queryFn: async () => {
      const response = await apiClient.get('/dialer/campaigns', {
        params: { pageNumber: 1, pageSize: 100 }
      });
      return response.data.items as Campaign[];
    }
  });

  // Fetch records for selected list
  const { data: records, isLoading: recordsLoading } = useQuery({
    queryKey: ['dialer-list-records', selectedList?.id],
    queryFn: async () => {
      if (!selectedList) return [];
      const response = await apiClient.get(`/dialer/lists/${selectedList.id}/records`, {
        params: { pageNumber: 1, pageSize: 100 }
      });
      return response.data.items as DialerRecord[];
    },
    enabled: !!selectedList && isRecordsModalOpen
  });

  // Create list mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newList) => {
      return apiClient.post('/dialer/lists', {
        name: data.name,
        description: data.description || undefined,
        campaignId: data.campaignId || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dialer-lists'] });
      setIsCreateModalOpen(false);
      setNewList({ name: '', description: '', campaignId: '' });
    }
  });

  // Import list mutation
  const importMutation = useMutation({
    mutationFn: async (data: typeof importData) => {
      return apiClient.post('/dialer/lists/import', {
        name: data.name,
        description: data.description || undefined,
        campaignId: data.campaignId || undefined,
        records: data.records,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dialer-lists'] });
      setIsImportModalOpen(false);
      setImportData({ name: '', description: '', campaignId: '', records: [] });
      setCsvText('');
    }
  });

  // Assign to campaign mutation
  const assignMutation = useMutation({
    mutationFn: async ({ listId, campaignId }: { listId: string; campaignId: string }) => {
      return apiClient.post(`/dialer/lists/${listId}/assign/${campaignId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dialer-lists'] });
      setIsAssignModalOpen(false);
      setSelectedList(null);
    }
  });

  // Delete list mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/dialer/lists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dialer-lists'] });
    }
  });

  const handleCreate = () => {
    createMutation.mutate(newList);
  };

  const handleImport = () => {
    importMutation.mutate(importData);
  };

  const handleParseCsv = () => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const records = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const record: Record<string, string> = {};
      headers.forEach((header, i) => {
        record[header] = values[i] || '';
      });
      return {
        phoneNumber: record['phone'] || record['phonenumber'] || record['phone_number'] || '',
        firstName: record['firstname'] || record['first_name'] || record['first'] || '',
        lastName: record['lastname'] || record['last_name'] || record['last'] || '',
        email: record['email'] || '',
        company: record['company'] || '',
      };
    }).filter(r => r.phoneNumber);

    setImportData(prev => ({ ...prev, records }));
  };

  const handleViewRecords = (list: DialerList) => {
    setSelectedList(list);
    setIsRecordsModalOpen(true);
  };

  const handleAssign = (list: DialerList) => {
    setSelectedList(list);
    setIsAssignModalOpen(true);
  };

  const totalValid = lists?.reduce((sum, l) => sum + l.validRecords, 0) || 0;
  const totalInvalid = lists?.reduce((sum, l) => sum + l.invalidRecords, 0) || 0;
  const totalDnc = lists?.reduce((sum, l) => sum + l.dncRecords, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dialer.listManagement', 'List Management')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('dialer.listManagementDescription', 'Manage contact lists for dialing campaigns')}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="h-5 w-5 mr-2" />
            {t('dialer.importList', 'Import List')}
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-5 w-5 mr-2" />
            {t('dialer.newList', 'New List')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileSpreadsheet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dialer.totalLists', 'Total Lists')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{lists?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dialer.validRecords', 'Valid Records')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalValid.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dialer.invalidRecords', 'Invalid')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalInvalid.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <PhoneOff className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dialer.dncRecords', 'DNC')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDnc.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lists Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('dialer.listName', 'List Name')}</TableHead>
              <TableHead>{t('dialer.status', 'Status')}</TableHead>
              <TableHead>{t('dialer.campaign', 'Campaign')}</TableHead>
              <TableHead>{t('dialer.records', 'Records')}</TableHead>
              <TableHead>{t('dialer.valid', 'Valid')}</TableHead>
              <TableHead>{t('dialer.imported', 'Imported')}</TableHead>
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
            ) : lists && lists.length > 0 ? (
              lists.map((list) => (
                <TableRow key={list.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{list.name}</p>
                      {list.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{list.description}</p>
                      )}
                      {list.sourceFileName && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">{list.sourceFileName}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={listStatusColors[list.status]}>
                      {listStatuses[list.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {list.campaignName ? (
                      <span className="text-gray-900 dark:text-white">{list.campaignName}</span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">{t('dialer.unassigned', 'Unassigned')}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900 dark:text-white">{list.totalRecords.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 dark:text-green-400">{list.validRecords}</span>
                      {list.invalidRecords > 0 && (
                        <span className="text-yellow-600 dark:text-yellow-400">/ {list.invalidRecords} invalid</span>
                      )}
                      {list.dncRecords > 0 && (
                        <span className="text-red-600 dark:text-red-400">/ {list.dncRecords} DNC</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {list.importedAtUtc ? (
                      <div className="text-sm">
                        <p className="text-gray-900 dark:text-white">
                          {new Date(list.importedAtUtc).toLocaleDateString()}
                        </p>
                        {list.importedByName && (
                          <p className="text-gray-500 dark:text-gray-400 text-xs">by {list.importedByName}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewRecords(list)}
                        title={t('dialer.viewRecords', 'View Records')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!list.campaignId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAssign(list)}
                          title={t('dialer.assignToCampaign', 'Assign to Campaign')}
                        >
                          <Link className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(t('dialer.confirmDeleteList', 'Are you sure you want to delete this list?'))) {
                            deleteMutation.mutate(list.id);
                          }
                        }}
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
                  {t('dialer.noLists', 'No lists found. Create or import a list to get started.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create List Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('dialer.createList', 'Create New List')}
      >
        <div className="space-y-4">
          <Input
            label={t('dialer.listName', 'List Name')}
            value={newList.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewList({ ...newList, name: e.target.value })}
            placeholder={t('dialer.listNamePlaceholder', 'Enter list name')}
          />
          <Input
            label={t('dialer.description', 'Description')}
            value={newList.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewList({ ...newList, description: e.target.value })}
            placeholder={t('dialer.descriptionPlaceholder', 'Enter description (optional)')}
          />
          <Select
            label={t('dialer.campaign', 'Campaign (Optional)')}
            value={newList.campaignId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewList({ ...newList, campaignId: e.target.value })}
            options={[
              { value: '', label: t('dialer.selectCampaign', 'Select Campaign') },
              ...(campaigns?.map(c => ({ value: c.id, label: c.name })) || [])
            ]}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newList.name || createMutation.isPending}
            >
              {createMutation.isPending ? t('common.creating', 'Creating...') : t('common.create', 'Create')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import List Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title={t('dialer.importList', 'Import Contact List')}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label={t('dialer.listName', 'List Name')}
            value={importData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImportData({ ...importData, name: e.target.value })}
            placeholder={t('dialer.listNamePlaceholder', 'Enter list name')}
          />
          <Input
            label={t('dialer.description', 'Description')}
            value={importData.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImportData({ ...importData, description: e.target.value })}
            placeholder={t('dialer.descriptionPlaceholder', 'Enter description (optional)')}
          />
          <Select
            label={t('dialer.campaign', 'Campaign (Optional)')}
            value={importData.campaignId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setImportData({ ...importData, campaignId: e.target.value })}
            options={[
              { value: '', label: t('dialer.selectCampaign', 'Select Campaign') },
              ...(campaigns?.map(c => ({ value: c.id, label: c.name })) || [])
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('dialer.csvData', 'CSV Data')}
            </label>
            <textarea
              className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={t('dialer.csvPlaceholder', 'phone,firstname,lastname,email,company\n+12025551234,John,Doe,john@example.com,Acme Inc')}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />
            <div className="flex justify-between mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('dialer.csvHelp', 'Headers: phone (required), firstname, lastname, email, company')}
              </p>
              <Button size="sm" variant="secondary" onClick={handleParseCsv}>
                {t('dialer.parseCSV', 'Parse CSV')}
              </Button>
            </div>
          </div>
          {importData.records.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('dialer.previewRecords', 'Preview:')} {importData.records.length} {t('dialer.recordsFound', 'records found')}
              </p>
              <div className="max-h-40 overflow-y-auto">
                {importData.records.slice(0, 5).map((record, i) => (
                  <div key={i} className="text-xs text-gray-600 dark:text-gray-400 py-1 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    {record.phoneNumber} - {record.firstName} {record.lastName} {record.company && `(${record.company})`}
                  </div>
                ))}
                {importData.records.length > 5 && (
                  <p className="text-xs text-gray-400 mt-2">... and {importData.records.length - 5} more</p>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleImport}
              disabled={!importData.name || importData.records.length === 0 || importMutation.isPending}
            >
              {importMutation.isPending ? t('dialer.importing', 'Importing...') : t('dialer.import', 'Import')} ({importData.records.length})
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign to Campaign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => { setIsAssignModalOpen(false); setSelectedList(null); }}
        title={t('dialer.assignToCampaign', 'Assign to Campaign')}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('dialer.assignListTo', 'Assign list')} <strong>{selectedList?.name}</strong> {t('dialer.toCampaign', 'to a campaign:')}
          </p>
          <Select
            label={t('dialer.selectCampaign', 'Select Campaign')}
            value=""
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              if (selectedList && e.target.value) {
                assignMutation.mutate({ listId: selectedList.id, campaignId: e.target.value });
              }
            }}
            options={[
              { value: '', label: t('dialer.chooseCampaign', 'Choose a campaign...') },
              ...(campaigns?.filter(c => c.status < 4).map(c => ({ value: c.id, label: c.name })) || [])
            ]}
          />
          <div className="flex justify-end pt-4">
            <Button variant="secondary" onClick={() => { setIsAssignModalOpen(false); setSelectedList(null); }}>
              {t('common.cancel', 'Cancel')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Records Modal */}
      <Modal
        isOpen={isRecordsModalOpen}
        onClose={() => { setIsRecordsModalOpen(false); setSelectedList(null); }}
        title={`${t('dialer.recordsIn', 'Records in')} ${selectedList?.name || ''}`}
        size="xl"
      >
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('dialer.contact', 'Contact')}</TableHead>
                <TableHead>{t('dialer.phone', 'Phone')}</TableHead>
                <TableHead>{t('dialer.status', 'Status')}</TableHead>
                <TableHead>{t('dialer.attempts', 'Attempts')}</TableHead>
                <TableHead>{t('dialer.lastDisposition', 'Last Disposition')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recordsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {t('common.loading', 'Loading...')}
                  </TableCell>
                </TableRow>
              ) : records && records.length > 0 ? (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{record.fullName || '-'}</p>
                        {record.company && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{record.company}</p>
                        )}
                        {record.email && (
                          <p className="text-xs text-gray-400">{record.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-gray-900 dark:text-white">{record.phoneNumber}</p>
                        {record.phoneNumber2 && (
                          <p className="text-gray-500 text-xs">{record.phoneNumber2}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.status === 11 ? 'success' : record.status === 6 ? 'danger' : 'default'}>
                        {recordStatuses[record.status] || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.attemptCount}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {record.lastDisposition || '-'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {t('dialer.noRecords', 'No records in this list.')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <Button variant="secondary" onClick={() => { setIsRecordsModalOpen(false); setSelectedList(null); }}>
            {t('common.close', 'Close')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
