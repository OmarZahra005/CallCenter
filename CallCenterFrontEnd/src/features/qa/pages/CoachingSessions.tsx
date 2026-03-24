import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  Target,
  UserCheck,
  CalendarDays,
  ListChecks,
  FileText,
  X,
} from 'lucide-react';
import {
  Card,
  Button,
  Badge,
  Modal,
} from '../../../components/ui';
import { staggerContainer, staggerItem, fadeUp } from '../../../utils/animations';
import apiClient from '../../../api/client';
import { CoachingSessionForm } from '../components/CoachingSessionForm';

// Types
type SessionType = 'OneOnOne' | 'Group' | 'Remedial' | 'Development';
type SessionStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'NoShow';

interface CoachingSession {
  id: string;
  agentId: string;
  agentName?: string;
  coachId: string;
  coachName?: string;
  scorecardId?: string;
  sessionType: SessionType;
  sessionDate: string;
  durationMinutes: number;
  status: SessionStatus;
  topicsCovered?: string;
  actionItems?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const isToday = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isUpcoming = (dateStr: string): boolean => {
  return new Date(dateStr) > new Date();
};

const CoachingSessions = () => {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  // Session type config
  const SESSION_TYPE_CONFIG: Record<SessionType, { label: string; color: string; bgColor: string }> = {
    OneOnOne: { label: t('coachingSessions.oneOnOne'), color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    Group: { label: t('coachingSessions.group'), color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    Remedial: { label: t('coachingSessions.remedial'), color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
    Development: { label: t('coachingSessions.development'), color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  };

  // Session status config
  const SESSION_STATUS_CONFIG: Record<SessionStatus, { label: string; variant: 'success' | 'danger' | 'warning' | 'default'; icon: typeof CheckCircle }> = {
    Scheduled: { label: t('coachingSessions.scheduled'), variant: 'default', icon: Calendar },
    Completed: { label: t('coachingSessions.completed'), variant: 'success', icon: CheckCircle },
    Cancelled: { label: t('coachingSessions.cancelled'), variant: 'danger', icon: XCircle },
    NoShow: { label: t('coachingSessions.noShow'), variant: 'warning', icon: AlertCircle },
  };

  // Format date helpers
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateStr: string): string => {
    return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
  };

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<CoachingSession | null>(null);
  const [viewingSession, setViewingSession] = useState<CoachingSession | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CoachingSession | null>(null);
  const [_isFilterOpen, _setIsFilterOpen] = useState(false);

  // Fetch sessions
  const {
    data: sessions = [],
    isLoading,
    error: _error,
  } = useQuery<CoachingSession[]>({
    queryKey: ['coaching-sessions'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/coaching-sessions');
        return response.data;
      } catch (err) {
        console.warn('Coaching sessions API not available, using mock data');
        // Return mock data for development
        return [
          {
            id: '1',
            agentId: 'agent-1',
            agentName: 'John Smith',
            coachId: 'coach-1',
            coachName: 'Sarah Johnson',
            sessionType: 'OneOnOne' as SessionType,
            sessionDate: new Date().toISOString(),
            durationMinutes: 30,
            status: 'Scheduled' as SessionStatus,
            topicsCovered: 'Call handling, Customer satisfaction',
            notes: 'Focus on improving first call resolution',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            agentId: 'agent-2',
            agentName: 'Emily Davis',
            coachId: 'coach-1',
            coachName: 'Sarah Johnson',
            sessionType: 'Remedial' as SessionType,
            sessionDate: new Date(Date.now() - 86400000).toISOString(),
            durationMinutes: 45,
            status: 'Completed' as SessionStatus,
            topicsCovered: 'Script adherence, Product knowledge',
            actionItems: 'Complete product training module, Practice opening scripts',
            notes: 'Good progress on communication skills',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/coaching-sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-sessions'] });
      setDeleteConfirm(null);
    },
  });

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch =
        !searchTerm ||
        session.agentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.coachName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.topicsCovered?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
      const matchesType = typeFilter === 'all' || session.sessionType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [sessions, searchTerm, statusFilter, typeFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = sessions.length;
    const scheduled = sessions.filter((s) => s.status === 'Scheduled').length;
    const completed = sessions.filter((s) => s.status === 'Completed').length;
    const upcoming = sessions.filter((s) => s.status === 'Scheduled' && isUpcoming(s.sessionDate)).length;
    const todaySessions = sessions.filter((s) => isToday(s.sessionDate)).length;
    return { total, scheduled, completed, upcoming, todaySessions };
  }, [sessions]);

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || searchTerm;

  // Handlers
  const handleCreateNew = () => {
    setEditingSession(null);
    setIsFormOpen(true);
  };

  const handleEdit = (session: CoachingSession) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };

  const handleView = (session: CoachingSession) => {
    setViewingSession(session);
  };

  const handleFormSaved = () => {
    setIsFormOpen(false);
    setEditingSession(null);
    queryClient.invalidateQueries({ queryKey: ['coaching-sessions'] });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6 p-1"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-primary-600" />
              {t('coachingSessions.title')}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('coachingSessions.subtitle')}
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 me-2" />
            {t('coachingSessions.scheduleSession')}
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('coachingSessions.totalSessions')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('coachingSessions.today')}</p>
              <p className="text-2xl font-bold text-blue-600">{stats.todaySessions}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <CalendarDays className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('coachingSessions.upcoming')}</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.upcoming}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('coachingSessions.completed')}</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('coachingSessions.scheduled')}</p>
              <p className="text-2xl font-bold text-purple-600">{stats.scheduled}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={staggerItem}>
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('coachingSessions.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full ps-10 pe-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">{t('coachingSessions.allStatus')}</option>
                <option value="Scheduled">{t('coachingSessions.scheduled')}</option>
                <option value="Completed">{t('coachingSessions.completed')}</option>
                <option value="Cancelled">{t('coachingSessions.cancelled')}</option>
                <option value="NoShow">{t('coachingSessions.noShow')}</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">{t('coachingSessions.allTypes')}</option>
                <option value="OneOnOne">{t('coachingSessions.oneOnOne')}</option>
                <option value="Group">{t('coachingSessions.group')}</option>
                <option value="Remedial">{t('coachingSessions.remedial')}</option>
                <option value="Development">{t('coachingSessions.development')}</option>
              </select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="w-4 h-4 me-1" />
                  {t('coachingSessions.clearBtn')}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Sessions List */}
      <motion.div variants={staggerItem}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {hasActiveFilters ? t('coachingSessions.noMatchingSessions') : t('coachingSessions.noSessionsYet')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {hasActiveFilters
                ? t('coachingSessions.tryAdjusting')
                : t('coachingSessions.getStarted')}
            </p>
            {!hasActiveFilters && (
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 me-2" />
                {t('coachingSessions.scheduleSession')}
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredSessions.map((session, index) => {
                const typeConfig = SESSION_TYPE_CONFIG[session.sessionType];
                const statusConfig = SESSION_STATUS_CONFIG[session.status];
                const StatusIcon = statusConfig.icon;
                const today = isToday(session.sessionDate);

                return (
                  <motion.div
                    key={session.id}
                    variants={staggerItem}
                    initial="initial"
                    animate="animate"
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`overflow-hidden hover:shadow-md transition-shadow ${
                        today ? 'border-s-4 border-s-primary-500' : ''
                      }`}
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          {/* Date/Time */}
                          <div className="sm:w-32 flex-shrink-0">
                            <div className={`text-center p-3 rounded-lg ${today ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                              <p className={`text-xs font-medium ${today ? 'text-primary-600' : 'text-gray-500'}`}>
                                {today ? t('coachingSessions.todayLabel') : formatDate(session.sessionDate).split(',')[0]}
                              </p>
                              <p className={`text-lg font-bold ${today ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                                {formatTime(session.sessionDate)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {t('coachingSessions.min', { count: session.durationMinutes })}
                              </p>
                            </div>
                          </div>

                          {/* Session Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
                                {typeConfig.label}
                              </span>
                              <Badge variant={statusConfig.variant} size="sm">
                                <StatusIcon className="w-3 h-3 me-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                              <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">{t('coachingSessions.agentLabel')}</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {session.agentName || t('coachingSessions.unknown')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <UserCheck className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">{t('coachingSessions.coachLabel')}</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {session.coachName || t('coachingSessions.unknown')}
                                </span>
                              </div>
                            </div>

                            {session.topicsCovered && (
                              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Target className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{session.topicsCovered}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 sm:flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(session)}
                              title={t('coachingSessions.viewDetails')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(session)}
                              title={t('coachingSessions.editBtn')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(session)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title={t('coachingSessions.deleteBtn')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSession(null);
        }}
        title={editingSession ? t('coachingSessions.editSession') : t('coachingSessions.scheduleNew')}
        size="lg"
      >
        <CoachingSessionForm
          session={editingSession}
          onSave={handleFormSaved}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingSession(null);
          }}
        />
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={!!viewingSession}
        onClose={() => setViewingSession(null)}
        title={t('coachingSessions.sessionDetails')}
        size="lg"
      >
        {viewingSession && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${SESSION_TYPE_CONFIG[viewingSession.sessionType].bgColor} ${SESSION_TYPE_CONFIG[viewingSession.sessionType].color}`}>
                  {SESSION_TYPE_CONFIG[viewingSession.sessionType].label}
                </span>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mt-2">
                  {formatDateTime(viewingSession.sessionDate)}
                </h3>
                <p className="text-sm text-gray-500">{t('coachingSessions.minutes', { count: viewingSession.durationMinutes })}</p>
              </div>
              <Badge variant={SESSION_STATUS_CONFIG[viewingSession.status].variant} size="sm">
                {SESSION_STATUS_CONFIG[viewingSession.status].label}
              </Badge>
            </div>

            {/* Participants */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t('coachingSessions.agentLabel')}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {viewingSession.agentName || t('coachingSessions.unknown')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t('coachingSessions.coachLabel')}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {viewingSession.coachName || t('coachingSessions.unknown')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Topics */}
            {viewingSession.topicsCovered && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {t('coachingSessions.topicsCovered')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  {viewingSession.topicsCovered}
                </p>
              </div>
            )}

            {/* Action Items */}
            {viewingSession.actionItems && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <ListChecks className="w-4 h-4" />
                  {t('coachingSessions.actionItemsLabel')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg whitespace-pre-wrap">
                  {viewingSession.actionItems}
                </p>
              </div>
            )}

            {/* Notes */}
            {viewingSession.notes && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('coachingSessions.notesLabel')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg whitespace-pre-wrap">
                  {viewingSession.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setViewingSession(null);
                  handleEdit(viewingSession);
                }}
              >
                <Edit2 className="w-4 h-4 me-2" />
                {t('coachingSessions.editSessionBtn')}
              </Button>
              <Button onClick={() => setViewingSession(null)}>{t('coachingSessions.close')}</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title={t('coachingSessions.deleteSession')}
        size="sm"
      >
        {deleteConfirm && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">
                  {t('coachingSessions.deleteConfirm')}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {t('coachingSessions.deleteDesc', { date: formatDateTime(deleteConfirm.sessionDate) })}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                {t('coachingSessions.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                    {t('coachingSessions.deleting')}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 me-2" />
                    {t('coachingSessions.deleteAction')}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export { CoachingSessions };
export default CoachingSessions;
