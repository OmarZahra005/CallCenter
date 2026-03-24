import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Search,
  Filter,
  Play,
  Download,
  Clock,
  User,
  ChevronDown,
  FileAudio,
  Eye,
  X,
  Volume2,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, Button, Badge, Modal, Pagination } from '../../../components/ui';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui';
import { SkeletonTable, EmptyStateNoData } from '../../../components/ui';
import apiClient from '../../../api/client';
import { RecordingPlayer } from '../components/RecordingPlayer';
import { TranscriptionViewer } from '../components/TranscriptionViewer';

// Types
interface Recording {
  id: string;
  callId: string;
  conversationId?: string;
  url: string;
  durationSeconds: number;
  sizeBytes: number;
  format: string;
  isEncrypted: boolean;
  retentionUntil?: string;
  createdAt: string;
  // Extended fields from API
  agentId?: string;
  agentName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  direction?: string;
  hasTranscription?: boolean;
  transcriptionStatus?: string;
  qaScore?: number;
}

interface RecordingsResponse {
  items: Recording[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 15;

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const tableRowVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

// Format duration
const formatDuration = (seconds: number): string => {
  if (!seconds || seconds === 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const Recordings = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  // Format date
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return t('recordingsPage.mAgo', { count: diffMins });
    if (diffHours < 24) return t('recordingsPage.hAgo', { count: diffHours });
    if (diffDays < 7) return t('recordingsPage.dAgo', { count: diffDays });
    return formatDate(dateStr);
  };

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');

  // Fetch recordings
  const { data, isLoading, error, refetch, isFetching } = useQuery<RecordingsResponse>({
    queryKey: ['recordings', currentPage],
    queryFn: async () => {
      const response = await apiClient.get('/recordings', {
        params: {
          pageNumber: currentPage,
          pageSize: ITEMS_PER_PAGE,
        },
      });
      // Handle both paginated and array responses
      if (Array.isArray(response.data)) {
        return {
          items: response.data,
          totalCount: response.data.length,
          pageNumber: 1,
          pageSize: ITEMS_PER_PAGE,
          totalPages: Math.ceil(response.data.length / ITEMS_PER_PAGE),
        };
      }
      return response.data;
    },
    refetchOnMount: 'always', // Always fetch fresh data when navigating to page
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  const recordings = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  // Filter recordings
  const filteredRecordings = useMemo(() => {
    return recordings.filter((recording) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        recording.callId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recording.agentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recording.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recording.customerPhone?.includes(searchTerm);

      // Date filter
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const recordingDate = new Date(recording.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - recordingDate.getTime()) / 86400000);

        if (dateFilter === 'today') matchesDate = diffDays < 1;
        else if (dateFilter === 'week') matchesDate = diffDays < 7;
        else if (dateFilter === 'month') matchesDate = diffDays < 30;
      }

      // Duration filter
      let matchesDuration = true;
      if (durationFilter !== 'all') {
        const duration = recording.durationSeconds;
        if (durationFilter === 'short') matchesDuration = duration < 60;
        else if (durationFilter === 'medium') matchesDuration = duration >= 60 && duration < 300;
        else if (durationFilter === 'long') matchesDuration = duration >= 300;
      }

      return matchesSearch && matchesDate && matchesDuration;
    });
  }, [recordings, searchTerm, dateFilter, durationFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredRecordings.length;
    const totalDuration = filteredRecordings.reduce((acc, r) => acc + (r.durationSeconds || 0), 0);
    const totalSize = filteredRecordings.reduce((acc, r) => acc + (r.sizeBytes || 0), 0);
    const withTranscription = filteredRecordings.filter((r) => r.hasTranscription).length;
    return { total, totalDuration, totalSize, withTranscription };
  }, [filteredRecordings]);

  // Handle play recording
  const handlePlayRecording = (recording: Recording) => {
    setSelectedRecording(recording);
    setIsPlayerOpen(true);
  };

  // Handle download
  const handleDownload = (recording: Recording) => {
    window.open(`${apiClient.defaults.baseURL}/recordings/${recording.id}/stream`, '_blank');
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setDurationFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || dateFilter !== 'all' || durationFilter !== 'all';

  return (
    <motion.div
      className="space-y-6 p-1"
      initial="initial"
      animate="animate"
      variants={pageVariants}
    >
      {/* Page Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mic className="w-7 h-7 text-primary-600" />
            {t('recordingsPage.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('recordingsPage.subtitle')}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          {t('recordingsPage.refresh')}
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('recordingsPage.totalRecordings')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
              <FileAudio className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('recordingsPage.totalDuration')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('recordingsPage.hoursMinutes', { hours: Math.floor(stats.totalDuration / 3600), minutes: Math.floor((stats.totalDuration % 3600) / 60) })}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('recordingsPage.storageUsed')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatFileSize(stats.totalSize)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Volume2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('recordingsPage.transcribed')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.withTranscription}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('recordingsPage.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full ps-10 pe-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter dropdown */}
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Filter className="w-4 h-4 me-2" />
                {t('recordingsPage.filters')}
                {hasActiveFilters && (
                  <span className="ms-2 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                    {(dateFilter !== 'all' ? 1 : 0) + (durationFilter !== 'all' ? 1 : 0)}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 ms-2" />
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute end-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4 space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('recordingsPage.dateRange')}
                      </label>
                      <select
                        value={dateFilter}
                        onChange={(e) => {
                          setDateFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="all">{t('recordingsPage.allTime')}</option>
                        <option value="today">{t('recordingsPage.today')}</option>
                        <option value="week">{t('recordingsPage.thisWeek')}</option>
                        <option value="month">{t('recordingsPage.thisMonth')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('recordingsPage.durationLabel')}
                      </label>
                      <select
                        value={durationFilter}
                        onChange={(e) => {
                          setDurationFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="all">{t('recordingsPage.anyDuration')}</option>
                        <option value="short">{t('recordingsPage.short')}</option>
                        <option value="medium">{t('recordingsPage.medium')}</option>
                        <option value="long">{t('recordingsPage.long')}</option>
                      </select>
                    </div>
                    {hasActiveFilters && (
                      <button
                        onClick={resetFilters}
                        className="w-full text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      >
                        {t('recordingsPage.clearAllFilters')}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {t('recordingsPage.searchChip', { term: searchTerm })}
                <button onClick={() => setSearchTerm('')} className="ms-2 text-gray-500 hover:text-gray-700">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {dateFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {t('recordingsPage.dateChip', { value: dateFilter })}
                <button onClick={() => setDateFilter('all')} className="ms-2 text-gray-500 hover:text-gray-700">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {durationFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {t('recordingsPage.durationChip', { value: durationFilter })}
                <button onClick={() => setDurationFilter('all')} className="ms-2 text-gray-500 hover:text-gray-700">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Results count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {t('recordingsPage.showing', { count: filteredRecordings.length, total: totalCount })}
      </div>

      {/* Recordings Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <CardContent>
            <SkeletonTable rows={10} columns={7} />
          </CardContent>
        ) : error ? (
          <CardContent>
            <div className="text-center py-12">
              <FileAudio className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">{t('recordingsPage.failedToLoad')}</p>
            </div>
          </CardContent>
        ) : filteredRecordings.length === 0 ? (
          <CardContent>
            <EmptyStateNoData
              title={hasActiveFilters ? t('recordingsPage.noMatchingRecordings') : t('recordingsPage.noRecordingsFound')}
              description={hasActiveFilters ? t('recordingsPage.tryAdjusting') : t('recordingsPage.willAppear')}
            />
          </CardContent>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">{t('recordingsPage.durationHeader')}</TableHead>
                    <TableHead>{t('recordingsPage.callId')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('recordingsPage.agent')}</TableHead>
                    <TableHead className="hidden lg:table-cell">{t('recordingsPage.customer')}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t('recordingsPage.date')}</TableHead>
                    <TableHead>{t('recordingsPage.status')}</TableHead>
                    <TableHead className="text-end w-[150px]">{t('recordingsPage.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredRecordings.map((recording, index) => (
                      <motion.tr
                        key={recording.id}
                        variants={tableRowVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                              <Mic className="w-4 h-4 text-primary-600" />
                            </div>
                            <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                              {formatDuration(recording.durationSeconds)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                              {recording.callId?.slice(0, 20) || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(recording.sizeBytes)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {recording.agentName ? (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {recording.agentName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {recording.customerName || recording.customerPhone ? (
                            <div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {recording.customerName || t('recordingsPage.unknown')}
                              </p>
                              {recording.customerPhone && (
                                <p className="text-xs text-gray-500">{recording.customerPhone}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm text-gray-500" title={formatDate(recording.createdAt)}>
                            {formatRelativeTime(recording.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {recording.hasTranscription ? (
                              <Badge variant="success" size="sm">{t('recordingsPage.transcribedBadge')}</Badge>
                            ) : (
                              <Badge variant="default" size="sm">{t('recordingsPage.noTranscript')}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePlayRecording(recording)}
                              className="h-8 w-8 p-0"
                              title={t('recordingsPage.play')}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(recording)}
                              className="h-8 w-8 p-0"
                              title={t('recordingsPage.download')}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePlayRecording(recording)}
                              className="h-8 w-8 p-0"
                              title={t('recordingsPage.viewDetails')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Recording Player Modal */}
      <Modal
        isOpen={isPlayerOpen}
        onClose={() => {
          setIsPlayerOpen(false);
          setSelectedRecording(null);
        }}
        title={t('recordingsPage.recordingPlayer')}
        size="xl"
      >
        {selectedRecording && (
          <div className="space-y-6">
            {/* Recording Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">{t('recordingsPage.durationInfo')}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDuration(selectedRecording.durationSeconds)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">{t('recordingsPage.size')}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatFileSize(selectedRecording.sizeBytes)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">{t('recordingsPage.dateInfo')}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(selectedRecording.createdAt)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">{t('recordingsPage.format')}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white uppercase">
                  {selectedRecording.format || 'WAV'}
                </p>
              </div>
            </div>

            {/* Player */}
            <RecordingPlayer
              recordingId={selectedRecording.id}
              recordingUrl={`${apiClient.defaults.baseURL}/recordings/${selectedRecording.id}/stream`}
              duration={selectedRecording.durationSeconds}
            />

            {/* Transcription */}
            <TranscriptionViewer
              recordingId={selectedRecording.id}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => handleDownload(selectedRecording)}
              >
                <Download className="w-4 h-4 me-2" />
                {t('recordingsPage.download')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsPlayerOpen(false);
                  setSelectedRecording(null);
                }}
              >
                {t('recordingsPage.close')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Click outside to close filter dropdown */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </motion.div>
  );
};

export default Recordings;
