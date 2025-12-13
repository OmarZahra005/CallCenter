import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Star, MessageSquare, CheckCircle, Save, FileText, AlertTriangle, ListTodo, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge, Select, Textarea } from '../../../components/ui';
import { staggerContainer, staggerItem, fadeUp } from '../../../utils/animations';
import apiClient from '../../../api/client';

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
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Scorecard state
  const [evaluationForm, setEvaluationForm] = useState<EvaluationForm | null>(null);
  const [scores, setScores] = useState<CriteriaScore[]>([]);
  const [comments, setComments] = useState('');
  const [existingScorecard, setExistingScorecard] = useState<ExistingScorecard | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Transcription state
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [isLoadingTranscription, setIsLoadingTranscription] = useState(false);

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
        evaluatorId: '11111111-1111-1111-1111-111111111111', // TODO: Get from auth context
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
        evaluatorId: '11111111-1111-1111-1111-111111111111', // TODO: Get from auth context
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
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quality Assurance</h1>
          <p className="text-gray-500 dark:text-gray-400">Review and score agent interactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'reviewed', label: 'Reviewed' },
              { value: 'flagged', label: 'Flagged' },
            ]}
          />
          <Button>Export Report</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recordings List */}
        <motion.div variants={staggerItem} className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Recordings</h2>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  Loading recordings...
                </div>
              ) : recordings.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No recordings found. Make test calls to see them here.
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                  {recordings.map((recording) => (
                    <motion.button
                      key={recording.id}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      onClick={() => handleRecordingSelect(recording)}
                      className={`w-full p-4 text-start transition-colors ${
                        selectedRecording?.id === recording.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">{recording.agentName}</span>
                      <Badge
                        variant={recording.status === 'reviewed' ? 'success' : recording.status === 'flagged' ? 'danger' : 'default'}
                        size="sm"
                      >
                        {recording.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{recording.customerId}</span>
                      <span>{recording.duration}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{recording.date}</div>
                    {recording.score !== undefined && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{recording.score}%</span>
                      </div>
                    )}
                  </motion.button>
                ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Player & Scorecard */}
        <motion.div variants={staggerItem} className="lg:col-span-2 space-y-6">
          {/* Audio Player */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recording Playback</h3>

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

                  {/* Waveform Visualization */}
                  <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    <div className="flex items-end gap-0.5 h-16">
                      {Array.from({ length: 60 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            height: `${20 + Math.random() * 80}%`,
                            opacity: i < (currentTime / duration) * 60 ? 1 : 0.3
                          }}
                          transition={{ duration: 0.1 }}
                          className={`w-1 rounded-full ${
                            i < (currentTime / duration) * 60 ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div
                    className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 cursor-pointer"
                    onClick={(e) => {
                      if (audioRef.current) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        audioRef.current.currentTime = percent * duration;
                      }
                    }}
                  >
                    <motion.div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 10);
                      }}>
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          if (audioRef.current) {
                            isPlaying ? audioRef.current.pause() : audioRef.current.play();
                            setIsPlaying(!isPlaying);
                          }
                        }}
                        className="w-10 h-10 rounded-full"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        if (audioRef.current) audioRef.current.currentTime = Math.min(duration, currentTime + 10);
                      }}>
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-gray-400" />
                      <Button variant="ghost" size="sm" onClick={() => {
                        if (audioUrl) {
                          const a = document.createElement('a');
                          a.href = audioUrl;
                          a.download = `recording-${selectedRecording?.id}.wav`;
                          a.click();
                        }
                      }}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Select a recording to play
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scorecard */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Scorecard {evaluationForm ? `- ${evaluationForm.name}` : ''}
                </h3>
                <div className="text-2xl font-bold gradient-text">
                  {totalScore}/{maxScore}
                </div>
              </div>
              {existingScorecard && (
                <Badge variant="info" size="sm" className="mt-2">
                  Previously scored: {existingScorecard.percentage.toFixed(0)}%
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {!evaluationForm ? (
                <div className="text-center text-gray-500 py-8">
                  No evaluation form available. Please create one first.
                </div>
              ) : !selectedRecording ? (
                <div className="text-center text-gray-500 py-8">
                  Select a recording to start scoring
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {scores.map((score) => (
                      <div key={score.criteriaId}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {score.criteriaName}
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={score.maxPoints}
                              value={score.pointsEarned}
                              onChange={(e) => handleScoreChange(score.criteriaId, parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-center border rounded-md dark:bg-gray-800 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-500">/ {score.maxPoints}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(score.pointsEarned / score.maxPoints) * 100}%` }}
                            transition={{ duration: 0.3 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comments */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Supervisor Comments
                    </label>
                    <Textarea
                      placeholder="Add feedback for the agent..."
                      rows={3}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button onClick={handleSubmitReview} disabled={isSaving}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Review
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Transcription & Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Call Analysis
                </h3>
                {transcription && (
                  <Badge
                    variant={transcription.status === 2 ? 'success' : transcription.status === 3 ? 'danger' : 'warning'}
                    size="sm"
                  >
                    {getTranscriptionStatusText(transcription.status)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedRecording ? (
                <div className="text-center text-gray-500 py-8">
                  Select a recording to view analysis
                </div>
              ) : isLoadingTranscription ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2" />
                  Loading transcription...
                </div>
              ) : !transcription ? (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No transcription available for this recording
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Sentiment & Summary Section */}
                  {(transcription.sentiment || transcription.summary) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sentiment Badge */}
                      {transcription.sentiment && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Sentiment</h4>
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getSentimentColor(transcription.sentiment)}`}>
                            {getSentimentIcon(transcription.sentiment)}
                            <span className="font-medium capitalize">{transcription.sentiment}</span>
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      {transcription.summary && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Summary</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{transcription.summary}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Detected Issues */}
                  {transcription.detectedIssues && parseJsonArray(transcription.detectedIssues).length > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Detected Issues
                      </h4>
                      <ul className="space-y-2">
                        {parseJsonArray(transcription.detectedIssues).map((issue, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Items */}
                  {transcription.actionItems && parseJsonArray(transcription.actionItems).length > 0 && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                        <ListTodo className="w-4 h-4" />
                        Suggested Action Items
                      </h4>
                      <ul className="space-y-2">
                        {parseJsonArray(transcription.actionItems).map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-blue-600 dark:text-blue-300">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Full Transcript */}
                  {transcription.content && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Full Transcript
                        </span>
                        <span className="text-xs text-gray-400">
                          {transcription.wordCount} words
                        </span>
                      </h4>
                      <div className="max-h-64 overflow-y-auto">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {transcription.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Confidence & Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {transcription.confidence && (
                      <span>Confidence: {(transcription.confidence * 100).toFixed(0)}%</span>
                    )}
                    {transcription.completedAt && (
                      <span>Processed: {new Date(transcription.completedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QualityAssurance;
