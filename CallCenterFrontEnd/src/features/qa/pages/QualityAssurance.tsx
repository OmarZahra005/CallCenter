import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Star, MessageSquare, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge, Select, Textarea } from '../../../components/ui';
import { staggerContainer, staggerItem, fadeUp } from '../../../utils/animations';

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
}

interface Recording {
  id: string;
  agentName: string;
  customerId: string;
  duration: string;
  date: string;
  score?: number;
  status: 'pending' | 'reviewed' | 'flagged';
  callRecordingId?: string;
  providerCallId?: string;
}

interface ScoreCategory {
  id: string;
  name: string;
  maxScore: number;
  score: number;
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

  // Fetch call logs with recordings from API
  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/call-logs/recent', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const callLogs: CallLog[] = await response.json();

          // Convert to Recording format and filter only calls with recordings
          const callsWithRecordings = callLogs
            .filter(call => call.recordingUrl)
            .map(call => ({
              id: call.id,
              agentName: call.direction === 'inbound' ? 'Agent' : 'Outbound',
              customerId: call.fromNumber,
              duration: calculateDuration(call),
              date: new Date(call.startedAtUtc).toLocaleString(),
              status: 'pending' as const,
              callRecordingId: call.recordingUrl || undefined,
              providerCallId: call.providerCallId,
            }));

          setRecordings(callsWithRecordings);
        }
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

  const scoreCategories: ScoreCategory[] = [
    { id: '1', name: 'Greeting & Introduction', maxScore: 10, score: 9 },
    { id: '2', name: 'Problem Understanding', maxScore: 20, score: 18 },
    { id: '3', name: 'Product Knowledge', maxScore: 20, score: 16 },
    { id: '4', name: 'Communication Skills', maxScore: 20, score: 19 },
    { id: '5', name: 'Resolution Quality', maxScore: 20, score: 17 },
    { id: '6', name: 'Closing & Follow-up', maxScore: 10, score: 8 },
  ];

  const totalScore = scoreCategories.reduce((sum, cat) => sum + cat.score, 0);
  const maxScore = scoreCategories.reduce((sum, cat) => sum + cat.maxScore, 0);

  const loadRecording = async (providerCallId: string) => {
    try {
      const token = localStorage.getItem('authToken');

      // First, get the recording by CallSid
      const recordingResponse = await fetch(`/api/recordings/call-sid/${providerCallId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!recordingResponse.ok) {
        console.error('Recording not found for call:', providerCallId);
        return;
      }

      const recording = await recordingResponse.json();

      // Then stream the actual recording file
      const streamResponse = await fetch(`/api/recordings/${recording.id}/stream`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (streamResponse.ok) {
        const blob = await streamResponse.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error('Failed to load recording:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordingSelect = (recording: Recording) => {
    setSelectedRecording(recording);
    if (recording.providerCallId) {
      loadRecording(recording.providerCallId);
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
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
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
                    {recording.score && (
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
                <h3 className="font-semibold">Scorecard</h3>
                <div className="text-2xl font-bold gradient-text">
                  {totalScore}/{maxScore}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scoreCategories.map((category) => (
                  <div key={category.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {category.score}/{category.maxScore}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(category.score / category.maxScore) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
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
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <Button variant="outline">Save Draft</Button>
                <Button>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QualityAssurance;
