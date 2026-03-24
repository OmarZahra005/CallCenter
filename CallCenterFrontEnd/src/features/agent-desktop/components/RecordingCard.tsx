import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Gauge,
} from 'lucide-react';
import { Card, CardContent, Button } from '../../../components/ui';

// Playback speed options
const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

interface RecordingCardProps {
  isVisible: boolean;
  callSid?: string;
  callId?: string;
  onOpenInQA?: (recordingId: string) => void;
}

interface RecordingInfo {
  id: string;
  callSid: string;
  duration: number;
  status: string;
  createdAt: string;
}

export const RecordingCard = ({
  isVisible,
  callSid,
  callId,
  onOpenInQA,
}: RecordingCardProps) => {
  const { t } = useTranslation();
  // Recording state
  const [recording, setRecording] = useState<RecordingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const maxRetries = 3;

  // Fetch recording when callSid changes
  useEffect(() => {
    const fetchRecording = async () => {
      if (!callSid || !isVisible) {
        setRecording(null);
        setAudioUrl(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/recordings/call-sid/${callSid}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError(t('agentDesktop.recordingNotAvailable'));
          } else {
            throw new Error('Failed to fetch recording');
          }
          return;
        }

        const data = await response.json();
        setRecording(data);
      } catch (err) {
        console.error('Error fetching recording:', err);
        setError(t('agentDesktop.recordingFailed'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecording();
  }, [callSid, isVisible]);

  // Load audio stream
  const loadAudio = useCallback(async () => {
    if (!recording || audioUrl) return;

    setIsAudioLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/recordings/${recording.id}/stream`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (err) {
      console.error('Error loading audio:', err);
      setError(t('agentDesktop.audioFailed'));
    } finally {
      setIsAudioLoading(false);
    }
  }, [recording, audioUrl]);

  // Clean up audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioUrl]);

  // Format time display
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Playback controls
  const togglePlay = async () => {
    if (!audioUrl) {
      await loadAudio();
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progress = progressRef.current;
    if (!audio || !progress || !audioUrl) return;

    const rect = progress.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    }
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.min(duration, audio.currentTime + 10);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Playback speed control
  const cyclePlaybackSpeed = () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    const newSpeed = PLAYBACK_SPEEDS[nextIndex];
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  // Apply playback speed when audio is loaded
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [audioUrl, playbackSpeed]);

  // Retry loading recording
  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      setError(t('agentDesktop.maxRetriesReached'));
      return;
    }

    setIsRetrying(true);
    setError(null);
    setRetryCount(prev => prev + 1);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/recordings/call-sid/${callSid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError(t('agentDesktop.recordingNotAvailable'));
        } else {
          throw new Error('Failed to fetch recording');
        }
        return;
      }

      const data = await response.json();
      setRecording(data);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching recording:', err);
      setError(t('agentDesktop.recordingFailed'));
    } finally {
      setIsRetrying(false);
    }
  }, [callSid, retryCount]);

  const handleDownload = async () => {
    if (!recording) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/recordings/${recording.id}/stream`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording-${callSid || callId || recording.id}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error downloading recording:', err);
    }
  };

  const handleOpenInQA = () => {
    if (recording && onOpenInQA) {
      onOpenInQA(recording.id);
    }
  };

  // Progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <Card variant="bordered" className="overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <Mic className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('agentDesktop.callRecording')}
                    </h4>
                    {recording && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {recording.id.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>

                {recording && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full"
                  >
                    <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      {t('agentDesktop.available')}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            <CardContent className="p-4">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">{t('agentDesktop.loadingRecording')}</span>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="flex items-center justify-center py-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
                      <p className="text-xs text-gray-400 mt-1">{t('agentDesktop.recordingProcessing')}</p>
                    </div>
                    {retryCount < maxRetries && callSid && (
                      <Button
                        onClick={handleRetry}
                        variant="secondary"
                        size="sm"
                        disabled={isRetrying}
                        className="mt-2"
                      >
                        {isRetrying ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('agentDesktop.retrying')}
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {t('agentDesktop.retry')} ({maxRetries - retryCount} left)
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Audio Player */}
              {recording && !isLoading && !error && (
                <div className="space-y-4">
                  {/* Hidden Audio Element */}
                  <audio ref={audioRef} src={audioUrl || undefined} preload="metadata" />

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div
                      ref={progressRef}
                      onClick={handleSeek}
                      className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
                    >
                      <motion.div
                        className="absolute h-full bg-red-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.1 }}
                      />
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ left: `calc(${progressPercent}% - 6px)` }}
                      />
                    </div>

                    {/* Time Display */}
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration || recording.duration)}</span>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center justify-center gap-2">
                    {/* Skip Back */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={skipBackward}
                      disabled={!audioUrl}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t('agentDesktop.skipBack')}
                    >
                      <SkipBack className="w-5 h-5" />
                    </motion.button>

                    {/* Play/Pause */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={togglePlay}
                      disabled={isAudioLoading}
                      className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAudioLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </motion.button>

                    {/* Skip Forward */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={skipForward}
                      disabled={!audioUrl}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t('agentDesktop.skipForward')}
                    >
                      <SkipForward className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Volume & Speed Controls */}
                  <div className="flex items-center justify-center gap-4">
                    {/* Volume Control */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title={isMuted ? t('agentDesktop.unmute') : t('agentDesktop.mute')}
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-gray-500 [&::-webkit-slider-thumb]:rounded-full"
                      />
                    </div>

                    {/* Playback Speed Control */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={cyclePlaybackSpeed}
                      disabled={!audioUrl}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title={t('agentDesktop.changeSpeed')}
                    >
                      <Gauge className="w-3 h-3" />
                      <span>{playbackSpeed}x</span>
                    </motion.button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button
                        onClick={handleDownload}
                        variant="secondary"
                        size="sm"
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t('agentDesktop.download')}
                      </Button>
                    </motion.div>

                    {onOpenInQA && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                        <Button
                          onClick={handleOpenInQA}
                          variant="primary"
                          size="sm"
                          className="w-full"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {t('agentDesktop.openInQa')}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* No Recording Available */}
              {!recording && !isLoading && !error && !callSid && (
                <div className="flex items-center justify-center py-6 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Mic className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('agentDesktop.noRecording')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RecordingCard;
