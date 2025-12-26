import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download, Star,
  MessageSquare, CheckCircle, Save, FileText, AlertTriangle, ListTodo,
  TrendingUp, TrendingDown, Minus, Search, Clock, User, Phone,
  ChevronDown, ChevronRight, BarChart3, Headphones, ClipboardCheck,
  Zap, Target, Award, XCircle, RefreshCw, LayoutDashboard, ClipboardList
} from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge, Textarea } from '../../../components/ui';
import { staggerContainer, staggerItem, fadeUp } from '../../../utils/animations';
import apiClient from '../../../api/client';
import { QaDashboardStats } from '../components/QaDashboardStats';
import { useAuthStore } from '../../../store/authStore';

interface CallLog {
  id: string;
  providerCallId: string;
  fromNumber: string;
  toNumber: string;
  direction: string;
  status: string;
  startedAtUtc: string;
  endedAtUtc: string | null;
  recordingUrl: string | null;
  assignedAgentId?: string;
  assignedAgentIdentity?: string;
}

interface Recording {
  id: string;
  agentId?: string;
  agentName: string;
  customerId: string;
  duration: string;
  date: string;
  score?: number;
  status: 'pending' | 'reviewed' | 'flagged';
  callRecordingId?: string;
  providerCallId?: string;
  recordingPath?: string;
}

interface EvaluationForm {
  id: string;
  name: string;
  description?: string;
  maxScore: number;
  passingScore: number;
  isActive: boolean;
  criteria: FormCriteria[];
}

interface FormCriteria {
  id: string;
  name: string;
  description?: string;
  maxScore: number;
  weight: number;
  order: number;
  isCritical: boolean;
}

interface CriteriaScore {
  criteriaId: string;
  criteriaName: string;
  pointsEarned: number;
  maxPoints: number;
  comments?: string;
}

interface ExistingScorecard {
  id: string;
  formId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: string;
  passed: boolean;
  comments?: string;
  details: CriteriaScore[];
}

interface Transcription {
  id: string;
  recordingId: string;
  content?: string;
  language?: string;
  confidence?: number;
  status: number; // 0=Pending, 1=Processing, 2=Completed, 3=Failed
  wordCount: number;
  createdAt: string;
  completedAt?: string;
  // AI Analysis fields
  summary?: string;
  sentiment?: string;
  detectedIssues?: string; // JSON array
  actionItems?: string; // JSON array
}

const QualityAssurance = () => {
  // Get current user from auth store
  const user = useAuthStore((state) => state.user);

  // View toggle state
  const [activeView, setActiveView] = useState<'dashboard' | 'evaluations'>('dashboard');

  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Enhanced player state
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Scorecard state
  const [evaluationForm, setEvaluationForm] = useState<EvaluationForm | null>(null);
  const [scores, setScores] = useState<CriteriaScore[]>([]);
  const [comments, setComments] = useState('');
  const [existingScorecard, setExistingScorecard] = useState<ExistingScorecard | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCriteria, setExpandedCriteria] = useState<string[]>([]);

  // Transcription state
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [isLoadingTranscription, setIsLoadingTranscription] = useState(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'summary' | 'issues' | 'transcript'>('summary');

  // Fetch evaluation forms on mount
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await apiClient.get('/qa/forms');
        const forms: EvaluationForm[] = response.data;
        if (forms.length > 0) {
          const form = forms[0];
          setEvaluationForm(form);
          // Initialize scores from form criteria
          initializeScores(form);
        }
      } catch (error) {
        console.error('Failed to fetch evaluation forms:', error);
      }
    };
    fetchForms();
  }, []);

  const initializeScores = (form: EvaluationForm) => {
    const initialScores = form.criteria.map(c => ({
      criteriaId: c.id,
      criteriaName: c.name,
      pointsEarned: 0,
      maxPoints: c.maxScore,
      comments: ''
    }));
    setScores(initialScores);
  };

  // Fetch call logs with recordings from API
  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const response = await apiClient.get('/call-logs/recent');
        const callLogs: CallLog[] = response.data;

        // Convert to Recording format and filter only calls with recordings
        const callsWithRecordings = callLogs
          .filter(call => call.recordingUrl)
          .map(call => ({
            id: call.id,
            agentId: call.assignedAgentId,
            agentName: call.assignedAgentIdentity || (call.direction === 'inbound' ? 'Agent' : 'Outbound'),
            customerId: call.fromNumber,
            duration: calculateDuration(call),
            date: new Date(call.startedAtUtc).toLocaleString(),
            status: 'pending' as const,
            callRecordingId: call.recordingUrl || undefined,
            providerCallId: call.providerCallId,
            recordingPath: call.recordingUrl || undefined,
          }));

        setRecordings(callsWithRecordings);
      } catch (error) {
        console.error('Failed to fetch call logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCallLogs();
  }, []);

  const calculateDuration = (call: CallLog): string => {
    if (!call.endedAtUtc) return 'N/A';
    const start = new Date(call.startedAtUtc).getTime();
    const end = new Date(call.endedAtUtc).getTime();
    const durationSeconds = Math.floor((end - start) / 1000);
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalScore = scores.reduce((sum, s) => sum + s.pointsEarned, 0);
  const maxScore = scores.reduce((sum, s) => sum + s.maxPoints, 0);

  const loadRecording = async (recordingPath: string) => {
    try {
      const streamResponse = await apiClient.get(`/recordings/stream-by-path`, {
        params: { path: recordingPath },
        responseType: 'blob'
      });

      const blob = streamResponse.data;
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Failed to load recording:', error);
    }
  };

  const loadExistingScorecard = async (providerCallId: string) => {
    try {
      // Use call SID to lookup scorecard
      const response = await apiClient.get(`/qa/scorecards/call/${encodeURIComponent(providerCallId)}`);
      const scorecard: ExistingScorecard = response.data;
      setExistingScorecard(scorecard);
      setComments(scorecard.comments || '');

      // Update scores from existing scorecard
      if (scorecard.details && scorecard.details.length > 0) {
        setScores(scorecard.details.map(d => ({
          criteriaId: d.criteriaId,
          criteriaName: d.criteriaName || '',
          pointsEarned: d.pointsEarned,
          maxPoints: d.maxPoints,
          comments: d.comments
        })));
      }
    } catch {
      // No existing scorecard - reset to defaults
      setExistingScorecard(null);
      if (evaluationForm) {
        initializeScores(evaluationForm);
      }
      setComments('');
    }
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadTranscription = async (providerCallId: string) => {
    setIsLoadingTranscription(true);
    setTranscription(null);
    try {
      // Use the call SID (providerCallId) to lookup transcription
      const response = await apiClient.get(`/transcriptions/call/${encodeURIComponent(providerCallId)}`);
      setTranscription(response.data);
    } catch {
      // No transcription available yet
      setTranscription(null);
    } finally {
      setIsLoadingTranscription(false);
    }
  };

  const handleRecordingSelect = (recording: Recording) => {
    setSelectedRecording(recording);
    if (recording.recordingPath) {
      loadRecording(recording.recordingPath);
    }
    // Load existing scorecard and transcription using providerCallId
    if (recording.providerCallId) {
      loadExistingScorecard(recording.providerCallId);
      loadTranscription(recording.providerCallId);
    }
  };

  const handleScoreChange = (criteriaId: string, value: number) => {
    setScores(prev => prev.map(s =>
      s.criteriaId === criteriaId
        ? { ...s, pointsEarned: Math.min(Math.max(0, value), s.maxPoints) }
        : s
    ));
  };

  // Filtering logic
  const filteredRecordings = recordings.filter(recording => {
    const matchesSearch = searchQuery === '' ||
      recording.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recording.customerId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || recording.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats calculation
  const stats = {
    total: recordings.length,
    pending: recordings.filter(r => r.status === 'pending').length,
    reviewed: recordings.filter(r => r.status === 'reviewed').length,
    flagged: recordings.filter(r => r.status === 'flagged').length,
    avgScore: recordings.filter(r => r.score !== undefined).length > 0
      ? Math.round(recordings.filter(r => r.score !== undefined).reduce((sum, r) => sum + (r.score || 0), 0) / recordings.filter(r => r.score !== undefined).length)
      : 0
  };

  // Playback speed control
  const handlePlaybackSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  // Volume control
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  // Toggle criteria expansion
  const toggleCriteriaExpansion = (criteriaId: string) => {
    setExpandedCriteria(prev =>
      prev.includes(criteriaId)
        ? prev.filter(id => id !== criteriaId)
        : [...prev, criteriaId]
    );
  };

  // Score percentage calculation
  const scorePercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const isPassing = evaluationForm ? totalScore >= evaluationForm.passingScore : false;

  // Helper functions for transcription analysis
  const parseJsonArray = (jsonStr?: string): string[] => {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  const getSentimentColor = (sentiment?: string): string => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'negative': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return <TrendingUp className="w-4 h-4" />;
      case 'negative': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getTranscriptionStatusText = (status: number): string => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Processing';
      case 2: return 'Completed';
      case 3: return 'Failed';
      default: return 'Unknown';
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedRecording || !evaluationForm) return;
    setIsSaving(true);
    try {
      const request = {
        formId: evaluationForm.id,
        callRecordingId: selectedRecording.id,
        agentId: selectedRecording.agentId || '11111111-1111-1111-1111-111111111111',
        evaluatorId: user?.id || '00000000-0000-0000-0000-000000000001',
        totalScore,
        maxScore,
        passingScore: evaluationForm.passingScore,
        status: 0, // Draft
        comments,
        evaluationDate: new Date().toISOString().split('T')[0],
        details: scores.map(s => ({
          criteriaId: s.criteriaId,
          pointsEarned: s.pointsEarned,
          maxPoints: s.maxPoints,
          comments: s.comments
        }))
      };

      await apiClient.post('/qa/scorecards', request);
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedRecording || !evaluationForm) return;
    setIsSaving(true);
    try {
      const request = {
        formId: evaluationForm.id,
        callRecordingId: selectedRecording.id,
        agentId: selectedRecording.agentId || '11111111-1111-1111-1111-111111111111',
        evaluatorId: user?.id || '00000000-0000-0000-0000-000000000001',
        totalScore,
        maxScore,
        passingScore: evaluationForm.passingScore,
        status: 1, // Completed
        comments,
        evaluationDate: new Date().toISOString().split('T')[0],
        details: scores.map(s => ({
          criteriaId: s.criteriaId,
          pointsEarned: s.pointsEarned,
          maxPoints: s.maxPoints,
          comments: s.comments
        }))
      };

      await apiClient.post('/qa/scorecards', request);

      // Update recording status in list
      setRecordings(prev => prev.map(r =>
        r.id === selectedRecording.id
          ? { ...r, status: 'reviewed' as const, score: Math.round((totalScore / maxScore) * 100) }
          : r
      ));

      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-5"
    >
      {/* Header with View Toggle */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quality Assurance</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Review and score agent interactions</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'dashboard'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('evaluations')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'evaluations'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Evaluations
              </button>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <QaDashboardStats />
        </motion.div>
      )}

      {/* Evaluations View */}
      {activeView === 'evaluations' && (
        <>
          {/* Stats Cards */}
          <motion.div variants={fadeUp}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Headphones className="w-4 h-4" />
                  <span className="text-xs font-medium">Total</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">Pending</span>
                </div>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Reviewed</span>
                </div>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.reviewed}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-medium">Flagged</span>
                </div>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.flagged}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-medium">Avg Score</span>
                </div>
                <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{stats.avgScore}%</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recordings List - Left Panel */}
        <motion.div variants={staggerItem} className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  Recordings
                </h2>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {filteredRecordings.length} of {recordings.length}
                </span>
              </div>
              {/* Search & Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by agent or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex gap-1">
                  {['all', 'pending', 'reviewed', 'flagged'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        statusFilter === status
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                  <p className="text-sm text-gray-500">Loading recordings...</p>
                </div>
              ) : filteredRecordings.length === 0 ? (
                <div className="p-8 text-center">
                  <Headphones className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500">
                    {recordings.length === 0 ? 'No recordings found' : 'No matching recordings'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700/50 max-h-[calc(100vh-380px)] overflow-y-auto">
                  {filteredRecordings.map((recording) => (
                    <motion.button
                      key={recording.id}
                      whileHover={{ x: 2 }}
                      onClick={() => handleRecordingSelect(recording)}
                      className={`w-full p-3 text-start transition-all border-l-3 ${
                        selectedRecording?.id === recording.id
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-l-primary-500'
                          : 'border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            recording.status === 'reviewed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            recording.status === 'flagged' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            <User className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {recording.agentName}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {recording.customerId}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={recording.status === 'reviewed' ? 'success' : recording.status === 'flagged' ? 'danger' : 'default'}
                          size="sm"
                          className="shrink-0"
                        >
                          {recording.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {recording.duration}
                          </span>
                          <span>{recording.date}</span>
                        </div>
                        {recording.score !== undefined && (
                          <div className={`flex items-center gap-1 font-medium ${
                            recording.score >= 80 ? 'text-green-600' :
                            recording.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            <Star className="w-3 h-3 fill-current" />
                            {recording.score}%
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Player & Scorecard - Right Panel */}
        <motion.div variants={staggerItem} className="lg:col-span-8 space-y-5">
          {/* Audio Player - Enhanced */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-800 dark:to-primary-900 p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Recording Playback</h3>
                    {selectedRecording && (
                      <p className="text-xs text-white/70">{selectedRecording.agentName} - {selectedRecording.date}</p>
                    )}
                  </div>
                </div>
                {audioUrl && (
                  <div className="flex items-center gap-2">
                    {/* Playback Speed */}
                    <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
                      <Zap className="w-3 h-3" />
                      <select
                        value={playbackSpeed}
                        onChange={(e) => handlePlaybackSpeedChange(parseFloat(e.target.value))}
                        className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="0.5" className="text-gray-900">0.5x</option>
                        <option value="0.75" className="text-gray-900">0.75x</option>
                        <option value="1" className="text-gray-900">1x</option>
                        <option value="1.25" className="text-gray-900">1.25x</option>
                        <option value="1.5" className="text-gray-900">1.5x</option>
                        <option value="2" className="text-gray-900">2x</option>
                      </select>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={() => {
                        if (audioUrl) {
                          const a = document.createElement('a');
                          a.href = audioUrl;
                          a.download = `recording-${selectedRecording?.id}.wav`;
                          a.click();
                        }
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <CardContent className="p-4">
              {audioUrl ? (
                <>
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={() => {
                      if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
                    }}
                    onLoadedMetadata={() => {
                      if (audioRef.current) setDuration(audioRef.current.duration);
                    }}
                    onEnded={() => setIsPlaying(false)}
                  />

                  {/* Waveform Visualization - Compact */}
                  <div className="h-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-3 flex items-center justify-center overflow-hidden px-2">
                    <div className="flex items-end gap-0.5 h-12 w-full">
                      {Array.from({ length: 80 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            height: `${20 + Math.random() * 80}%`,
                            opacity: i < (currentTime / duration) * 80 ? 1 : 0.3
                          }}
                          transition={{ duration: 0.1 }}
                          className={`flex-1 max-w-1 rounded-full ${
                            i < (currentTime / duration) * 80 ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar with better interaction */}
                  <div
                    className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-3 cursor-pointer relative group"
                    onClick={(e) => {
                      if (audioRef.current) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        audioRef.current.currentTime = percent * duration;
                      }
                    }}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full relative"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md border-2 border-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  </div>

                  {/* Controls - Better Layout */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400 w-24">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 10);
                        }}
                        title="Skip back 10s"
                      >
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          if (audioRef.current) {
                            isPlaying ? audioRef.current.pause() : audioRef.current.play();
                            setIsPlaying(!isPlaying);
                          }
                        }}
                        className="w-12 h-12 rounded-full"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (audioRef.current) audioRef.current.currentTime = Math.min(duration, currentTime + 10);
                        }}
                        title="Skip forward 10s"
                      >
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2 w-24 justify-end">
                      <button onClick={toggleMute} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-16 h-1 accent-primary-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <Play className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Select a recording to play</p>
                  <p className="text-xs text-gray-400 mt-1">Choose from the list on the left</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scorecard & Analysis - Side by Side on larger screens */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Scorecard */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Scorecard
                    </h3>
                  </div>
                  {existingScorecard && (
                    <Badge variant="info" size="sm">
                      Previously: {existingScorecard.percentage.toFixed(0)}%
                    </Badge>
                  )}
                </div>
                {evaluationForm && (
                  <p className="text-xs text-gray-500 mt-1">{evaluationForm.name}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {!evaluationForm ? (
                  <div className="text-center py-6">
                    <ClipboardCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">No evaluation form available</p>
                  </div>
                ) : !selectedRecording ? (
                  <div className="text-center py-6">
                    <Target className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">Select a recording to start scoring</p>
                  </div>
                ) : (
                  <>
                    {/* Score Summary Ring */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-4">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-gray-200 dark:text-gray-700"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${scorePercentage * 1.76} 176`}
                            className={`${
                              isPassing ? 'text-green-500' : scorePercentage >= 50 ? 'text-yellow-500' : 'text-red-500'
                            } transition-all duration-500`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-sm font-bold ${
                            isPassing ? 'text-green-600' : scorePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {scorePercentage}%
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {totalScore}<span className="text-sm font-normal text-gray-500">/{maxScore}</span>
                        </p>
                        <p className={`text-xs font-medium ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                          {isPassing ? 'Passing' : 'Below Passing'} (min: {evaluationForm.passingScore})
                        </p>
                      </div>
                    </div>

                    {/* Criteria List - Compact */}
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                      {scores.map((score) => {
                        const percentage = Math.round((score.pointsEarned / score.maxPoints) * 100);
                        const isExpanded = expandedCriteria.includes(score.criteriaId);
                        return (
                          <div
                            key={score.criteriaId}
                            className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden"
                          >
                            <button
                              onClick={() => toggleCriteriaExpansion(score.criteriaId)}
                              className="w-full p-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                                )}
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                  {score.criteriaName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      percentage >= 80 ? 'bg-green-500' :
                                      percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-12 text-right">
                                  {score.pointsEarned}/{score.maxPoints}
                                </span>
                              </div>
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="border-t border-gray-100 dark:border-gray-700"
                                >
                                  <div className="p-3 bg-gray-50 dark:bg-gray-800/30">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs text-gray-500">Score:</span>
                                      <div className="flex items-center gap-1">
                                        {[...Array(score.maxPoints)].map((_, i) => (
                                          <button
                                            key={i}
                                            onClick={() => handleScoreChange(score.criteriaId, i + 1)}
                                            className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                                              i < score.pointsEarned
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-gray-300'
                                            }`}
                                          >
                                            {i + 1}
                                          </button>
                                        ))}
                                        <button
                                          onClick={() => handleScoreChange(score.criteriaId, 0)}
                                          className="ml-1 text-xs text-gray-400 hover:text-gray-600"
                                        >
                                          Clear
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>

                    {/* Comments */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Supervisor Comments
                      </label>
                      <Textarea
                        placeholder="Add feedback for the agent..."
                        rows={2}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving}>
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        Draft
                      </Button>
                      <Button size="sm" onClick={handleSubmitReview} disabled={isSaving}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        Submit
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Call Analysis - Tabbed Interface */}
            <Card>
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Call Analysis</h3>
                  </div>
                  {transcription && (
                    <Badge
                      variant={transcription.status === 2 ? 'success' : transcription.status === 3 ? 'danger' : 'default'}
                      size="sm"
                    >
                      {getTranscriptionStatusText(transcription.status)}
                    </Badge>
                  )}
                </div>

                {/* Tabs */}
                {selectedRecording && transcription && (
                  <div className="flex border-b border-gray-200 dark:border-gray-700 -mx-4 px-4">
                    {[
                      { id: 'summary', label: 'Summary', icon: FileText },
                      { id: 'issues', label: 'Issues', icon: AlertTriangle, count: parseJsonArray(transcription.detectedIssues).length },
                      { id: 'transcript', label: 'Transcript', icon: MessageSquare },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveAnalysisTab(tab.id as 'summary' | 'issues' | 'transcript')}
                        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeAnalysisTab === tab.id
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                            tab.id === 'issues' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                {!selectedRecording ? (
                  <div className="text-center py-6">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">Select a recording to view analysis</p>
                  </div>
                ) : isLoadingTranscription ? (
                  <div className="text-center py-6">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                    <p className="text-sm text-gray-500">Loading analysis...</p>
                  </div>
                ) : !transcription ? (
                  <div className="text-center py-6">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">No transcription available</p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeAnalysisTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                    >
                      {/* Summary Tab */}
                      {activeAnalysisTab === 'summary' && (
                        <div className="space-y-4">
                          {/* Sentiment */}
                          {transcription.sentiment && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getSentimentColor(transcription.sentiment)}`}>
                                {getSentimentIcon(transcription.sentiment)}
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Overall Sentiment</p>
                                <p className="font-medium text-gray-900 dark:text-white capitalize">{transcription.sentiment}</p>
                              </div>
                              {transcription.confidence && (
                                <div className="ml-auto text-right">
                                  <p className="text-xs text-gray-500">Confidence</p>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {(transcription.confidence * 100).toFixed(0)}%
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Summary */}
                          {transcription.summary && (
                            <div>
                              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Summary</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{transcription.summary}</p>
                            </div>
                          )}

                          {/* Action Items */}
                          {transcription.actionItems && parseJsonArray(transcription.actionItems).length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <ListTodo className="w-3 h-3" />
                                Action Items
                              </h4>
                              <div className="space-y-1.5">
                                {parseJsonArray(transcription.actionItems).map((item, index) => (
                                  <div key={index} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Metadata Footer */}
                          {transcription.completedAt && (
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                              <p className="text-xs text-gray-400">
                                Analyzed {new Date(transcription.completedAt).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Issues Tab */}
                      {activeAnalysisTab === 'issues' && (
                        <div className="space-y-3">
                          {parseJsonArray(transcription.detectedIssues).length > 0 ? (
                            <>
                              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-3">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  {parseJsonArray(transcription.detectedIssues).length} issue(s) detected
                                </span>
                              </div>
                              {parseJsonArray(transcription.detectedIssues).map((issue, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30"
                                >
                                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                  <p className="text-sm text-red-700 dark:text-red-300">{issue}</p>
                                </div>
                              ))}
                            </>
                          ) : (
                            <div className="text-center py-6">
                              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500" />
                              <p className="text-sm font-medium text-green-600 dark:text-green-400">No issues detected</p>
                              <p className="text-xs text-gray-500 mt-1">This call appears to meet quality standards</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Transcript Tab */}
                      {activeAnalysisTab === 'transcript' && (
                        <div>
                          {transcription.content ? (
                            <>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-gray-500">{transcription.wordCount} words</span>
                                {transcription.language && (
                                  <Badge variant="default" size="sm">{transcription.language}</Badge>
                                )}
                              </div>
                              <div className="max-h-[300px] overflow-y-auto bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-mono">
                                  {transcription.content}
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-6">
                              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm text-gray-500">Transcript not available</p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
        </>
      )}
    </motion.div>
  );
};

export default QualityAssurance;
