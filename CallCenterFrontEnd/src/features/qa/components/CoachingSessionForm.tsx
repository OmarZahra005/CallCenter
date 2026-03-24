import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  User,
  UserCheck,
  Target,
  ListChecks,
  FileText,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui';
import apiClient from '../../../api/client';

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

interface Agent {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface CoachingSessionFormProps {
  session?: CoachingSession | null;
  onSave: () => void;
  onCancel: () => void;
}

// Duration options
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

export const CoachingSessionForm = ({
  session,
  onSave,
  onCancel,
}: CoachingSessionFormProps) => {
  const { t } = useTranslation();

  // Session type options
  const SESSION_TYPES = [
    { value: 'OneOnOne', label: t('coachingSessionForm.oneOnOne'), description: t('coachingSessionForm.oneOnOneDesc') },
    { value: 'Group', label: t('coachingSessionForm.groupLabel'), description: t('coachingSessionForm.groupDesc') },
    { value: 'Remedial', label: t('coachingSessionForm.remedialLabel'), description: t('coachingSessionForm.remedialDesc') },
    { value: 'Development', label: t('coachingSessionForm.developmentLabel'), description: t('coachingSessionForm.developmentDesc') },
  ];

  // Status options
  const STATUS_OPTIONS = [
    { value: 'Scheduled', label: t('coachingSessionForm.scheduledStatus') },
    { value: 'Completed', label: t('coachingSessionForm.completedStatus') },
    { value: 'Cancelled', label: t('coachingSessionForm.cancelledStatus') },
    { value: 'NoShow', label: t('coachingSessionForm.noShowStatus') },
  ];

  // Form state
  const [agentId, setAgentId] = useState('');
  const [coachId, setCoachId] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('OneOnOne');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [status, setStatus] = useState<SessionStatus>('Scheduled');
  const [topicsCovered, setTopicsCovered] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch agents list
  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ['agents-list'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/agents');
        return response.data.items || response.data || [];
      } catch {
        // Return mock data for development
        return [
          { id: 'agent-1', name: 'John Smith', email: 'john@example.com', role: 'Agent' },
          { id: 'agent-2', name: 'Emily Davis', email: 'emily@example.com', role: 'Agent' },
          { id: 'agent-3', name: 'Michael Brown', email: 'michael@example.com', role: 'Agent' },
          { id: 'coach-1', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Supervisor' },
          { id: 'coach-2', name: 'David Wilson', email: 'david@example.com', role: 'Supervisor' },
        ];
      }
    },
  });

  // Filter agents and supervisors
  const agentsList = agents.filter((a) => a.role === 'Agent' || !a.role);
  const coachesList = agents.filter((a) => a.role === 'Supervisor' || a.role === 'Admin' || !a.role);

  // Initialize form data if editing
  useEffect(() => {
    if (session) {
      setAgentId(session.agentId);
      setCoachId(session.coachId);
      setSessionType(session.sessionType);
      setDurationMinutes(session.durationMinutes);
      setStatus(session.status);
      setTopicsCovered(session.topicsCovered || '');
      setActionItems(session.actionItems || '');
      setNotes(session.notes || '');

      // Parse date and time
      const date = new Date(session.sessionDate);
      setSessionDate(date.toISOString().split('T')[0]);
      setSessionTime(date.toTimeString().slice(0, 5));
    } else {
      // Default values for new session
      const now = new Date();
      now.setHours(now.getHours() + 1);
      now.setMinutes(0);
      setSessionDate(now.toISOString().split('T')[0]);
      setSessionTime(now.toTimeString().slice(0, 5));
    }
  }, [session]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!agentId) {
      newErrors.agentId = t('coachingSessionForm.agentRequired');
    }
    if (!coachId) {
      newErrors.coachId = t('coachingSessionForm.coachRequired');
    }
    if (!sessionDate) {
      newErrors.sessionDate = t('coachingSessionForm.dateRequired');
    }
    if (!sessionTime) {
      newErrors.sessionTime = t('coachingSessionForm.timeRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Combine date and time
      const dateTime = new Date(`${sessionDate}T${sessionTime}`);

      const payload = {
        agentId,
        coachId,
        sessionType,
        sessionDate: dateTime.toISOString(),
        durationMinutes,
        status,
        topicsCovered: topicsCovered || undefined,
        actionItems: actionItems || undefined,
        notes: notes || undefined,
      };

      if (session) {
        await apiClient.put(`/coaching-sessions/${session.id}`, payload);
      } else {
        await apiClient.post('/coaching-sessions', payload);
      }
    },
    onSuccess: () => {
      onSave();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      saveMutation.mutate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Participants */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <User className="w-4 h-4 inline me-1" />
            {t('coachingSessionForm.agentLabel')} <span className="text-red-500">*</span>
          </label>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.agentId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">{t('coachingSessionForm.selectAgent')}</option>
            {agentsList.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
          {errors.agentId && (
            <p className="mt-1 text-sm text-red-500">{errors.agentId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <UserCheck className="w-4 h-4 inline me-1" />
            {t('coachingSessionForm.coachLabel')} <span className="text-red-500">*</span>
          </label>
          <select
            value={coachId}
            onChange={(e) => setCoachId(e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.coachId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">{t('coachingSessionForm.selectCoach')}</option>
            {coachesList.map((coach) => (
              <option key={coach.id} value={coach.id}>
                {coach.name}
              </option>
            ))}
          </select>
          {errors.coachId && (
            <p className="mt-1 text-sm text-red-500">{errors.coachId}</p>
          )}
        </div>
      </div>

      {/* Session Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('coachingSessionForm.sessionType')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SESSION_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setSessionType(type.value as SessionType)}
              className={`p-3 border rounded-lg text-start transition-colors ${
                sessionType === type.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <p className={`font-medium text-sm ${
                sessionType === type.value
                  ? 'text-primary-700 dark:text-primary-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {type.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Calendar className="w-4 h-4 inline me-1" />
            {t('coachingSessionForm.date')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.sessionDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.sessionDate && (
            <p className="mt-1 text-sm text-red-500">{errors.sessionDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Clock className="w-4 h-4 inline me-1" />
            {t('coachingSessionForm.time')} <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={sessionTime}
            onChange={(e) => setSessionTime(e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.sessionTime ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.sessionTime && (
            <p className="mt-1 text-sm text-red-500">{errors.sessionTime}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('coachingSessionForm.duration')}
          </label>
          <select
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {DURATION_OPTIONS.map((mins) => (
              <option key={mins} value={mins}>
                {t('coachingSessionForm.minutesOption', { count: mins })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status (only for editing) */}
      {session && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('coachingSessionForm.status')}
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as SessionStatus)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Topics */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <Target className="w-4 h-4 inline me-1" />
          {t('coachingSessionForm.topicsToCover')}
        </label>
        <input
          type="text"
          value={topicsCovered}
          onChange={(e) => setTopicsCovered(e.target.value)}
          placeholder={t('coachingSessionForm.topicsPlaceholder')}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">{t('coachingSessionForm.separateTopics')}</p>
      </div>

      {/* Action Items */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <ListChecks className="w-4 h-4 inline me-1" />
          {t('coachingSessionForm.actionItemsLabel')}
        </label>
        <textarea
          value={actionItems}
          onChange={(e) => setActionItems(e.target.value)}
          placeholder={t('coachingSessionForm.actionItemsPlaceholder')}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <FileText className="w-4 h-4 inline me-1" />
          {t('coachingSessionForm.notesLabel')}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('coachingSessionForm.notesPlaceholder')}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Error display */}
      {saveMutation.isError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {t('coachingSessionForm.saveFailed')}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" type="button" onClick={onCancel}>
          {t('coachingSessionForm.cancel')}
        </Button>
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 me-2 animate-spin" />
              {t('coachingSessionForm.saving')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 me-2" />
              {session ? t('coachingSessionForm.updateSession') : t('coachingSessionForm.scheduleSession')}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CoachingSessionForm;
