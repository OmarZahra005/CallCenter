import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  User,
  Mic,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  ListChecks,
} from 'lucide-react';
import { Button, Badge, Card } from '../../../components/ui';
import apiClient from '../../../api/client';

interface TranscriptionSegment {
  id: string;
  speaker: string | null;
  startTime: string; // TimeSpan as string from backend
  endTime: string;
  text: string;
  confidence: number | null;
}

interface Transcription {
  id: string;
  callRecordingId: string;
  content: string | null;
  language: string | null;
  confidence: number | null;
  status: 'Pending' | 'Processing' | 'Complete' | 'Failed';
  wordCount: number;
  createdAt: string;
  completedAt: string | null;
  summary: string | null;
  sentiment: string | null;
  detectedIssues: string | null;
  actionItems: string | null;
  segments: TranscriptionSegment[];
}

interface TranscriptionViewerProps {
  recordingId: string;
  onTimestampClick?: (timeInSeconds: number) => void;
}

// Parse TimeSpan string to seconds
const parseTimeSpan = (timeSpan: string): number => {
  if (!timeSpan) return 0;
  const parts = timeSpan.split(':');
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 0;
};

// Format seconds to mm:ss
const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Get sentiment icon and color
const getSentimentDisplay = (sentiment: string | null) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive':
      return {
        icon: ThumbsUp,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        label: 'Positive',
      };
    case 'negative':
      return {
        icon: ThumbsDown,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        label: 'Negative',
      };
    default:
      return {
        icon: Minus,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        label: 'Neutral',
      };
  }
};

// Get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Complete':
      return { variant: 'success' as const, icon: CheckCircle, label: 'Complete' };
    case 'Processing':
      return { variant: 'warning' as const, icon: Loader2, label: 'Processing' };
    case 'Failed':
      return { variant: 'danger' as const, icon: XCircle, label: 'Failed' };
    default:
      return { variant: 'default' as const, icon: Clock, label: 'Pending' };
  }
};

export const TranscriptionViewer = ({
  recordingId,
  onTimestampClick,
}: TranscriptionViewerProps) => {
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [copiedText, setCopiedText] = useState(false);

  // Fetch transcription
  const {
    data: transcription,
    isLoading,
    error,
  } = useQuery<Transcription>({
    queryKey: ['transcription', recordingId],
    queryFn: async () => {
      const response = await apiClient.get(`/transcriptions/recording/${recordingId}`);
      return response.data;
    },
    enabled: !!recordingId,
    retry: false,
    refetchInterval: (query) => {
      // Poll while processing
      const data = query.state.data;
      if (data?.status === 'Processing' || data?.status === 'Pending') {
        return 5000;
      }
      return false;
    },
  });

  // Request transcription mutation
  const requestTranscription = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/transcriptions/recording/${recordingId}/request`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transcription', recordingId] });
    },
  });

  // Parse JSON arrays from string fields
  const detectedIssues = useMemo(() => {
    if (!transcription?.detectedIssues) return [];
    try {
      return JSON.parse(transcription.detectedIssues);
    } catch {
      return [];
    }
  }, [transcription?.detectedIssues]);

  const actionItems = useMemo(() => {
    if (!transcription?.actionItems) return [];
    try {
      return JSON.parse(transcription.actionItems);
    } catch {
      return [];
    }
  }, [transcription?.actionItems]);

  // Filter segments by search
  const filteredSegments = useMemo(() => {
    if (!transcription?.segments) return [];
    if (!searchTerm) return transcription.segments;
    return transcription.segments.filter((segment) =>
      segment.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transcription?.segments, searchTerm]);

  // Handle timestamp click
  const handleTimestampClick = (segment: TranscriptionSegment) => {
    const seconds = parseTimeSpan(segment.startTime);
    onTimestampClick?.(seconds);
  };

  // Copy full transcription
  const copyTranscription = async () => {
    if (!transcription?.content) return;
    await navigator.clipboard.writeText(transcription.content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Highlight search matches
  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>');
  };

  // Get speaker display info
  const getSpeakerDisplay = (speaker: string | null) => {
    const isAgent = speaker?.toLowerCase().includes('agent') || speaker === 'Speaker 1';
    return {
      icon: isAgent ? Mic : User,
      label: speaker || 'Unknown',
      color: isAgent
        ? 'text-indigo-600 dark:text-indigo-400'
        : 'text-green-600 dark:text-green-400',
      bgColor: isAgent
        ? 'bg-indigo-100 dark:bg-indigo-900/30'
        : 'bg-green-100 dark:bg-green-900/30',
    };
  };

  const sentimentDisplay = getSentimentDisplay(transcription?.sentiment ?? null);
  const statusBadge = getStatusBadge(transcription?.status || 'Pending');
  const StatusIcon = statusBadge.icon;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-900 dark:text-white font-medium"
        >
          <FileText className="w-5 h-5 text-purple-600" />
          Transcription
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {transcription && (
          <Badge variant={statusBadge.variant} size="sm">
            <StatusIcon className={`w-3 h-3 mr-1 ${statusBadge.variant === 'warning' ? 'animate-spin' : ''}`} />
            {statusBadge.label}
          </Badge>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 p-8 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading transcription...</span>
              </div>
            )}

            {/* Error/No transcription state */}
            {!isLoading && (!transcription || error) && (
              <div className="text-center py-8 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <FileText className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  No Transcription Available
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  This recording hasn't been transcribed yet
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => requestTranscription.mutate()}
                  disabled={requestTranscription.isPending}
                >
                  {requestTranscription.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Request Transcription
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Processing state */}
            {!isLoading && transcription?.status === 'Processing' && (
              <div className="text-center py-8 px-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Loader2 className="w-10 h-10 mx-auto text-yellow-500 animate-spin mb-3" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Transcription in Progress
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This may take a few minutes. The page will update automatically.
                </p>
              </div>
            )}

            {/* Failed state */}
            {!isLoading && transcription?.status === 'Failed' && (
              <div className="text-center py-8 px-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle className="w-10 h-10 mx-auto text-red-500 mb-3" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Transcription Failed
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  There was an error processing this recording
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => requestTranscription.mutate()}
                  disabled={requestTranscription.isPending}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}

            {/* Complete transcription */}
            {!isLoading && transcription?.status === 'Complete' && (
              <div className="space-y-4">
                {/* AI Analysis Section */}
                {(transcription.summary || transcription.sentiment || detectedIssues.length > 0 || actionItems.length > 0) && (
                  <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
                    <button
                      onClick={() => setShowAnalysis(!showAnalysis)}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-gray-900 dark:text-white">AI Analysis</span>
                      </div>
                      {showAnalysis ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    <AnimatePresence>
                      {showAnalysis && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-4">
                            {/* Sentiment & Stats Row */}
                            <div className="flex flex-wrap gap-4">
                              {transcription.sentiment && (
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${sentimentDisplay.bgColor}`}>
                                  <sentimentDisplay.icon className={`w-4 h-4 ${sentimentDisplay.color}`} />
                                  <span className={`text-sm font-medium ${sentimentDisplay.color}`}>
                                    {sentimentDisplay.label} Sentiment
                                  </span>
                                </div>
                              )}
                              {transcription.confidence && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                  <span className="text-sm text-blue-700 dark:text-blue-400">
                                    {Math.round(transcription.confidence * 100)}% Confidence
                                  </span>
                                </div>
                              )}
                              {transcription.wordCount > 0 && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {transcription.wordCount} words
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Summary */}
                            {transcription.summary && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                                  <MessageSquare className="w-4 h-4" />
                                  Summary
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg p-3">
                                  {transcription.summary}
                                </p>
                              </div>
                            )}

                            {/* Detected Issues */}
                            {detectedIssues.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                  Detected Issues
                                </h5>
                                <ul className="space-y-1">
                                  {detectedIssues.map((issue: string, index: number) => (
                                    <li
                                      key={index}
                                      className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                                      {issue}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Action Items */}
                            {actionItems.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                                  <ListChecks className="w-4 h-4 text-green-500" />
                                  Action Items
                                </h5>
                                <ul className="space-y-1">
                                  {actionItems.map((item: string, index: number) => (
                                    <li
                                      key={index}
                                      className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                )}

                {/* Search & Actions */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search in transcription..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyTranscription}
                    className="flex-shrink-0"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-4 h-4 mr-1 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                {/* Search results count */}
                {searchTerm && (
                  <p className="text-sm text-gray-500">
                    Found {filteredSegments.length} segment{filteredSegments.length !== 1 ? 's' : ''} matching "{searchTerm}"
                  </p>
                )}

                {/* Transcription Segments */}
                <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                  {filteredSegments.length > 0 ? (
                    filteredSegments.map((segment, index) => {
                      const speakerDisplay = getSpeakerDisplay(segment.speaker);
                      const SpeakerIcon = speakerDisplay.icon;
                      const timestamp = parseTimeSpan(segment.startTime);

                      return (
                        <motion.div
                          key={segment.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="flex gap-3 group"
                        >
                          {/* Timestamp */}
                          <button
                            onClick={() => handleTimestampClick(segment)}
                            className="flex-shrink-0 text-xs font-mono text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors pt-1"
                            title="Click to jump to this time"
                          >
                            {formatTimestamp(timestamp)}
                          </button>

                          {/* Speaker indicator */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${speakerDisplay.bgColor} flex items-center justify-center`}>
                            <SpeakerIcon className={`w-4 h-4 ${speakerDisplay.color}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${speakerDisplay.color} mb-1`}>
                              {speakerDisplay.label}
                            </p>
                            <p
                              className="text-sm text-gray-700 dark:text-gray-300"
                              dangerouslySetInnerHTML={{ __html: highlightText(segment.text) }}
                            />
                            {segment.confidence && segment.confidence < 0.7 && (
                              <span className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 inline-flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Low confidence ({Math.round(segment.confidence * 100)}%)
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  ) : transcription.content ? (
                    // Fallback to plain content if no segments
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {transcription.content}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No transcript content available
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TranscriptionViewer;
