import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button, Card, Badge, Modal, Input, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../components/ui';
import apiClient from '../../../api/client';
import {
  Plus,
  Upload,
  Trash2,
  PhoneOff,
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  User,
} from 'lucide-react';

interface DncEntry {
  id: string;
  phoneNumber: string;
  source?: string;
  reason?: string;
  addedAtUtc: string;
  expiresAtUtc?: string;
  isActive: boolean;
  addedByName?: string;
  customerName?: string;
}

interface DncCheckResult {
  phoneNumber: string;
  isOnDnc: boolean;
  reason?: string;
  addedAtUtc?: string;
}

export function DncManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newEntry, setNewEntry] = useState({
    phoneNumber: '',
    reason: '',
    expiresAtUtc: '',
  });

  const [importData, setImportData] = useState({
    phoneNumbers: [] as string[],
    source: 'Manual Import',
    reason: '',
  });

  const [phoneNumbersText, setPhoneNumbersText] = useState('');
  const [checkPhone, setCheckPhone] = useState('');
  const [checkResult, setCheckResult] = useState<DncCheckResult | null>(null);

  // Fetch DNC entries
  const { data: dncEntries, isLoading } = useQuery({
    queryKey: ['dnc-entries'],
    queryFn: async () => {
      const response = await apiClient.get('/dialer/dnc', {
        params: { pageNumber: 1, pageSize: 200 }
      });
      return response.data.items as DncEntry[];
    }
  });

  // Add DNC entry mutation
  const addMutation = useMutation({
    mutationFn: async (data: typeof newEntry) => {
      return apiClient.post('/dialer/dnc', {
        phoneNumber: data.phoneNumber,
        reason: data.reason || undefined,
        expiresAtUtc: data.expiresAtUtc || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dnc-entries'] });
      setIsAddModalOpen(false);
      setNewEntry({ phoneNumber: '', reason: '', expiresAtUtc: '' });
    }
  });

  // Import DNC entries mutation
  const importMutation = useMutation({
    mutationFn: async (data: typeof importData) => {
      return apiClient.post('/dialer/dnc/import', {
        phoneNumbers: data.phoneNumbers,
        source: data.source,
        reason: data.reason || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dnc-entries'] });
      setIsImportModalOpen(false);
      setImportData({ phoneNumbers: [], source: 'Manual Import', reason: '' });
      setPhoneNumbersText('');
    }
  });

  // Delete DNC entry mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/dialer/dnc/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dnc-entries'] });
    }
  });

  // Check DNC mutation
  const checkMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const response = await apiClient.get('/dialer/dnc/check', {
        params: { phoneNumber }
      });
      return response.data as DncCheckResult;
    },
    onSuccess: (data) => {
      setCheckResult(data);
    }
  });

  const handleAdd = () => {
    addMutation.mutate(newEntry);
  };

  const handleImport = () => {
    importMutation.mutate(importData);
  };

  const handleParsePhoneNumbers = () => {
    const numbers = phoneNumbersText
      .split(/[\n,;]+/)
      .map(n => n.trim().replace(/[^\d+]/g, ''))
      .filter(n => n.length >= 10);
    setImportData(prev => ({ ...prev, phoneNumbers: numbers }));
  };

  const handleCheck = () => {
    if (checkPhone) {
      checkMutation.mutate(checkPhone);
    }
  };

  // Filter entries by search
  const filteredEntries = dncEntries?.filter(entry =>
    entry.phoneNumber.includes(searchQuery) ||
    entry.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = dncEntries?.filter(e => e.isActive).length || 0;
  const expiredCount = dncEntries?.filter(e => !e.isActive).length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dialer.dncManagement', 'Do Not Call List')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('dialer.dncDescription', 'Manage phone numbers that should not be called')}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => setIsCheckModalOpen(true)}>
            <Search className="h-5 w-5 mr-2" />
            {t('dialer.checkNumber', 'Check Number')}
          </Button>
          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="h-5 w-5 mr-2" />
            {t('dialer.importDnc', 'Import')}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-5 w-5 mr-2" />
            {t('dialer.addNumber', 'Add Number')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <PhoneOff className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dialer.totalDnc', 'Total DNC Entries')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dncEntries?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dialer.activeEntries', 'Active')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <XCircle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dialer.expiredEntries', 'Expired')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{expiredCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={t('dialer.searchDnc', 'Search by phone number, customer name, or reason...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* DNC Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('dialer.phoneNumber', 'Phone Number')}</TableHead>
              <TableHead>{t('dialer.customer', 'Customer')}</TableHead>
              <TableHead>{t('dialer.reason', 'Reason')}</TableHead>
              <TableHead>{t('dialer.source', 'Source')}</TableHead>
              <TableHead>{t('dialer.addedBy', 'Added By')}</TableHead>
              <TableHead>{t('dialer.addedAt', 'Added')}</TableHead>
              <TableHead>{t('dialer.expires', 'Expires')}</TableHead>
              <TableHead>{t('dialer.status', 'Status')}</TableHead>
              <TableHead>{t('dialer.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  {t('common.loading', 'Loading...')}
                </TableCell>
              </TableRow>
            ) : filteredEntries && filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <span className="font-mono text-gray-900 dark:text-white">{entry.phoneNumber}</span>
                  </TableCell>
                  <TableCell>
                    {entry.customerName || <span className="text-gray-400">-</span>}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate block">
                      {entry.reason || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">{entry.source || 'Manual'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {entry.addedByName || 'System'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(entry.addedAtUtc).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {entry.expiresAtUtc ? (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(entry.expiresAtUtc).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">{t('dialer.never', 'Never')}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={entry.isActive ? 'danger' : 'default'}>
                      {entry.isActive ? t('dialer.active', 'Active') : t('dialer.expired', 'Expired')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(t('dialer.confirmRemoveDnc', 'Are you sure you want to remove this number from the DNC list?'))) {
                          deleteMutation.mutate(entry.id);
                        }
                      }}
                      title={t('common.delete', 'Delete')}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  {searchQuery
                    ? t('dialer.noMatchingDnc', 'No matching DNC entries found.')
                    : t('dialer.noDncEntries', 'No DNC entries. Add numbers that should not be called.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add DNC Entry Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('dialer.addDncEntry', 'Add to Do Not Call List')}
      >
        <div className="space-y-4">
          <Input
            label={t('dialer.phoneNumber', 'Phone Number')}
            value={newEntry.phoneNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEntry({ ...newEntry, phoneNumber: e.target.value })}
            placeholder={t('dialer.phoneNumberPlaceholder', '+12025551234')}
          />
          <Input
            label={t('dialer.reason', 'Reason')}
            value={newEntry.reason}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEntry({ ...newEntry, reason: e.target.value })}
            placeholder={t('dialer.reasonPlaceholder', 'Customer requested (optional)')}
          />
          <Input
            label={t('dialer.expirationDate', 'Expiration Date (Optional)')}
            type="date"
            value={newEntry.expiresAtUtc}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEntry({ ...newEntry, expiresAtUtc: e.target.value })}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('dialer.expirationHint', 'Leave blank for permanent DNC status.')}
          </p>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!newEntry.phoneNumber || addMutation.isPending}
            >
              {addMutation.isPending ? t('common.adding', 'Adding...') : t('common.add', 'Add')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import DNC Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title={t('dialer.importDncList', 'Import DNC Numbers')}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label={t('dialer.source', 'Source')}
            value={importData.source}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImportData({ ...importData, source: e.target.value })}
            placeholder={t('dialer.sourcePlaceholder', 'e.g., National DNC Registry')}
          />
          <Input
            label={t('dialer.reason', 'Reason (Optional)')}
            value={importData.reason}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImportData({ ...importData, reason: e.target.value })}
            placeholder={t('dialer.importReasonPlaceholder', 'Bulk import reason')}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('dialer.phoneNumbers', 'Phone Numbers')}
            </label>
            <textarea
              className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              placeholder={t('dialer.phoneNumbersPlaceholder', '+12025551234\n+12025555678\n+12025559012')}
              value={phoneNumbersText}
              onChange={(e) => setPhoneNumbersText(e.target.value)}
            />
            <div className="flex justify-between mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('dialer.phoneNumbersHelp', 'Enter one phone number per line, or separate with commas')}
              </p>
              <Button size="sm" variant="secondary" onClick={handleParsePhoneNumbers}>
                {t('dialer.parseNumbers', 'Parse Numbers')}
              </Button>
            </div>
          </div>
          {importData.phoneNumbers.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {importData.phoneNumbers.length} {t('dialer.numbersFound', 'phone numbers found')}
              </p>
              <div className="max-h-32 overflow-y-auto font-mono text-xs text-gray-600 dark:text-gray-400">
                {importData.phoneNumbers.slice(0, 10).join(', ')}
                {importData.phoneNumbers.length > 10 && ` ... and ${importData.phoneNumbers.length - 10} more`}
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleImport}
              disabled={importData.phoneNumbers.length === 0 || importMutation.isPending}
            >
              {importMutation.isPending ? t('dialer.importing', 'Importing...') : t('dialer.import', 'Import')} ({importData.phoneNumbers.length})
            </Button>
          </div>
        </div>
      </Modal>

      {/* Check Number Modal */}
      <Modal
        isOpen={isCheckModalOpen}
        onClose={() => { setIsCheckModalOpen(false); setCheckResult(null); setCheckPhone(''); }}
        title={t('dialer.checkDncStatus', 'Check DNC Status')}
      >
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              label={t('dialer.phoneNumber', 'Phone Number')}
              value={checkPhone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckPhone(e.target.value)}
              placeholder={t('dialer.phoneNumberPlaceholder', '+12025551234')}
              className="flex-1"
            />
            <div className="pt-6">
              <Button
                onClick={handleCheck}
                disabled={!checkPhone || checkMutation.isPending}
              >
                {checkMutation.isPending ? t('dialer.checking', 'Checking...') : t('dialer.check', 'Check')}
              </Button>
            </div>
          </div>
          {checkResult && (
            <div className={`p-4 rounded-lg ${checkResult.isOnDnc ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'}`}>
              <div className="flex items-center">
                {checkResult.isOnDnc ? (
                  <PhoneOff className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                )}
                <div>
                  <p className={`font-medium ${checkResult.isOnDnc ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}`}>
                    {checkResult.isOnDnc
                      ? t('dialer.numberOnDnc', 'This number is on the DNC list')
                      : t('dialer.numberNotOnDnc', 'This number is NOT on the DNC list')}
                  </p>
                  {checkResult.isOnDnc && checkResult.reason && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {t('dialer.dncReason', 'Reason:')} {checkResult.reason}
                    </p>
                  )}
                  {checkResult.isOnDnc && checkResult.addedAtUtc && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {t('dialer.addedOn', 'Added on:')} {new Date(checkResult.addedAtUtc).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button variant="secondary" onClick={() => { setIsCheckModalOpen(false); setCheckResult(null); setCheckPhone(''); }}>
              {t('common.close', 'Close')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
