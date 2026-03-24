import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  RotateCcw,
  Download,
  Loader2,
  AlertCircle,
  Mic,
  User,
  Headphones,
} from 'lucide-react';
import { Button } from '../../../components/ui';
import apiClient from '../../../api/client';

interface RecordingPlayerProps {
  recordingId: string;
  recordingUrl?: string; // Optional, kept for backward compatibility but not used
  duration: number;
  onTimeUpdate?: (currentTime: number) => void;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Format time helper
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const RecordingPlayer = ({
  recordingId,
  duration,
  onTimeUpdate,
}: RecordingPlayerProps) => {
  const { t } = useTranslation();

  // Audio element ref
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [audioChannel, setAudioChannel] = useState<'both' | 'agent' | 'customer'>('both');
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);

  // Waveform data (simulated - in real implementation would come from backend)
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Fetch audio with authentication and create blob URL
  useEffect(() => {
    let isMounted = true;
    let blobUrl: string | null = null;

    const fetchAudio = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch audio with auth headers via apiClient
        const response = await apiClient.get(`/recordings/${recordingId}/stream`, {
          responseType: 'blob',
        });

        if (isMounted) {
          // Create blob URL for the audio element
          const blob = new Blob([response.data], { type: 'audio/wav' });
          blobUrl = URL.createObjectURL(blob);
          setAudioBlobUrl(blobUrl);
        }
      } catch (err) {
        console.error('Failed to fetch recording:', err);
        if (isMounted) {
          setError(t('recordingPlayer.failedToLoad'));
          setIsLoading(false);
        }
      }
    };

    fetchAudio();

    // Cleanup blob URL on unmount
    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [recordingId, t]);

  // Generate simulated waveform data
  useEffect(() => {
    // Generate random waveform for visualization
    const bars = 100;
    const data: number[] = [];
    for (let i = 0; i < bars; i++) {
      // Create a more natural looking waveform
      const base = 0.3 + Math.random() * 0.4;
      const spike = Math.random() > 0.7 ? 0.3 : 0;
      data.push(Math.min(base + spike, 1));
    }
    setWaveformData(data);
  }, [recordingId]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawWaveform = () => {
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / waveformData.length;
      const playedRatio = currentTime / (audioDuration || 1);

      ctx.clearRect(0, 0, width, height);

      waveformData.forEach((value, index) => {
        const x = index * barWidth;
        const barHeight = value * height * 0.8;
        const y = (height - barHeight) / 2;

        const barRatio = index / waveformData.length;
        if (barRatio <= playedRatio) {
          // Played portion - gradient based on channel
          if (audioChannel === 'agent') {
            ctx.fillStyle = '#6366f1'; // Indigo for agent
          } else if (audioChannel === 'customer') {
            ctx.fillStyle = '#10b981'; // Green for customer
          } else {
            ctx.fillStyle = '#8b5cf6'; // Purple for both
          }
        } else {
          // Unplayed portion
          ctx.fillStyle = '#d1d5db'; // Gray
        }

        ctx.fillRect(x, y, barWidth - 1, barHeight);
      });
    };

    drawWaveform();
  }, [waveformData, currentTime, audioDuration, audioChannel]);

  // Audio event handlers
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration || duration);
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(audioRef.current.currentTime);
      onTimeUpdate?.(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleError = () => {
    setError(t('recordingPlayer.failedToLoad'));
    setIsLoading(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  // Playback controls
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error('Playback error:', err);
        setError(t('recordingPlayer.unableToPlay'));
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, t]);

  const handleSeek = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !audioRef.current) return;

      const rect = progressRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const newTime = (clickX / rect.width) * audioDuration;

      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [audioDuration]
  );

  const handleProgressDrag = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !progressRef.current || !audioRef.current) return;

      const rect = progressRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
      const newTime = (clickX / rect.width) * audioDuration;

      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [isDragging, audioDuration]
  );

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioDuration);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const restart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  // Volume controls
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Playback speed
  const cyclePlaybackSpeed = () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    const newSpeed = PLAYBACK_SPEEDS[nextIndex];
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  // Download - use blob URL if available for authenticated download
  const handleDownload = () => {
    if (audioBlobUrl) {
      const link = document.createElement('a');
      link.href = audioBlobUrl;
      link.download = `recording_${recordingId}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          skipBackward();
          break;
        case 'ArrowRight':
          skipForward();
          break;
        case 'm':
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  // Mouse up handler for drag
  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const progressPercentage = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Hidden audio element - uses blob URL for authenticated playback */}
      {audioBlobUrl && (
        <audio
          ref={audioRef}
          src={audioBlobUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={handleError}
          onCanPlay={handleCanPlay}
          preload="metadata"
        />
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !error && (
        <div className="flex items-center justify-center gap-2 p-4 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{t('recordingPlayer.loading')}</span>
        </div>
      )}

      {/* Player controls */}
      {!error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0.5 : 1 }}
          className="space-y-4"
        >
          {/* Channel selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('recordingPlayer.channel')}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setAudioChannel('both')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  audioChannel === 'both'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Headphones className="w-4 h-4" />
                {t('recordingPlayer.both')}
              </button>
              <button
                onClick={() => setAudioChannel('agent')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  audioChannel === 'agent'
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Mic className="w-4 h-4" />
                {t('recordingPlayer.agent')}
              </button>
              <button
                onClick={() => setAudioChannel('customer')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  audioChannel === 'customer'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <User className="w-4 h-4" />
                {t('recordingPlayer.customer')}
              </button>
            </div>
          </div>

          {/* Waveform visualization */}
          <div
            ref={progressRef}
            className="relative h-20 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer overflow-hidden"
            onClick={handleSeek}
            onMouseDown={() => setIsDragging(true)}
            onMouseMove={handleProgressDrag}
          >
            <canvas
              ref={canvasRef}
              width={600}
              height={80}
              className="w-full h-full"
            />
            {/* Progress indicator line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary-600 dark:bg-primary-400"
              style={{ left: `${progressPercentage}%` }}
            />
          </div>

          {/* Time display */}
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span className="font-mono">{formatTime(currentTime)}</span>
            <span className="font-mono">{formatTime(audioDuration)}</span>
          </div>

          {/* Main controls */}
          <div className="flex items-center justify-between">
            {/* Left controls - Skip/Play */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={restart}
                className="h-10 w-10 p-0"
                title={t('recordingPlayer.restart')}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipBackward}
                className="h-10 w-10 p-0"
                title={t('recordingPlayer.skipBack')}
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                variant="primary"
                onClick={togglePlay}
                className="h-12 w-12 rounded-full p-0"
                disabled={isLoading}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ms-0.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipForward}
                className="h-10 w-10 p-0"
                title={t('recordingPlayer.skipForward')}
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>

            {/* Center - Playback speed */}
            <button
              onClick={cyclePlaybackSpeed}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              title={t('recordingPlayer.playbackSpeed')}
            >
              {playbackSpeed}x
            </button>

            {/* Right controls - Volume & Download */}
            <div className="flex items-center gap-3">
              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              {/* Download */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="hidden sm:flex"
              >
                <Download className="w-4 h-4 me-1" />
                {t('recordingPlayer.download')}
              </Button>
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Space</kbd> {t('recordingPlayer.kbPlayPause')}
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">&larr;</kbd> {t('recordingPlayer.kbBack')}
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">&rarr;</kbd> {t('recordingPlayer.kbForward')}
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">M</kbd> {t('recordingPlayer.kbMute')}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RecordingPlayer;
