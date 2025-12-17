import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Copy,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  ArrowUpRight,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card, Button } from '../../../components/ui';
import apiClient from '../../../api/client';
import { useSignalR } from '../../../hooks/useSignalR';

// Types matching backend entities
type AiSuggestionType = 'Response' | 'Article' | 'Escalation' | 'Closing';
type AiSuggestionFeedback = 'Helpful' | 'NotHelpful' | 'Ignored';

interface AiSuggestion {
  id: string;
  conversationId: string;
  agentId: string;
  suggestionType: AiSuggestionType;
  content: string;
  confidenceScore: number;
  wasUsed: boolean;
  feedback: AiSuggestionFeedback | null;
  createdAt: string;
  // Additional fields for article suggestions
  articleId?: string;
  articleTitle?: string;
}

interface AiSuggestionsPanelProps {
  conversationId: string | null;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  onUseSuggestion?: (suggestion: AiSuggestion) => void;
}

// Suggestion type icons and colors
const suggestionTypeConfig: Record<AiSuggestionType, { icon: typeof Sparkles; color: string; bgColor: string; label: string }> = {
  Response: {
    icon: MessageSquare,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'Suggested Response',
  },
  Article: {
    icon: BookOpen,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Knowledge Article',
  },
  Escalation: {
    icon: ArrowUpRight,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    label: 'Escalation Suggestion',
  },
  Closing: {
    icon: Check,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    label: 'Closing Script',
  },
};

// Format confidence as percentage
const formatConfidence = (score: number): string => {
  return `${Math.round(score * 100)}%`;
};

// Get confidence color
const getConfidenceColor = (score: number): string => {
  if (score >= 0.8) return 'text-green-600 dark:text-green-400';
  if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

export const AiSuggestionsPanel = ({
  conversationId,
  isCollapsible = true,
  defaultExpanded = true,
  onUseSuggestion,
}: AiSuggestionsPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch AI suggestions for the conversation
  const { data: suggestions = [], isLoading, error, refetch } = useQuery<AiSuggestion[]>({
    queryKey: ['ai-suggestions', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      try {
        const response = await apiClient.get(`/conversations/${conversationId}/suggestions`);
        return response.data;
      } catch (err) {
        // If endpoint doesn't exist yet, return empty array
        console.warn('AI suggestions endpoint not available:', err);
        return [];
      }
    },
    enabled: !!conversationId,
    refetchInterval: 15000, // Refetch every 15 seconds for new suggestions
    retry: false, // Don't retry if endpoint doesn't exist
  });

  // Provide feedback on suggestion
  const feedbackMutation = useMutation({
    mutationFn: async ({ suggestionId, feedback }: { suggestionId: string; feedback: AiSuggestionFeedback }) => {
      const response = await apiClient.put(`/ai-suggestions/${suggestionId}/feedback`, { feedback });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-suggestions', conversationId] });
    },
  });

  // Mark suggestion as used
  const useSuggestionMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      const response = await apiClient.put(`/ai-suggestions/${suggestionId}/used`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-suggestions', conversationId] });
    },
  });

  // Subscribe to SignalR for real-time suggestions
  const { connection } = useSignalR();

  useEffect(() => {
    if (!connection || !conversationId) return;

    const handleNewSuggestion = (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) {
        queryClient.invalidateQueries({ queryKey: ['ai-suggestions', conversationId] });
      }
    };

    connection.on('AiSuggestionCreated', handleNewSuggestion);

    return () => {
      connection.off('AiSuggestionCreated', handleNewSuggestion);
    };
  }, [connection, conversationId, queryClient]);

  const toggleExpanded = () => {
    if (isCollapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleCopy = async (suggestion: AiSuggestion) => {
    try {
      await navigator.clipboard.writeText(suggestion.content);
      setCopiedId(suggestion.id);
      setTimeout(() => setCopiedId(null), 2000);

      // Mark as used when copied
      useSuggestionMutation.mutate(suggestion.id);

      if (onUseSuggestion) {
        onUseSuggestion(suggestion);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleFeedback = (suggestionId: string, feedback: AiSuggestionFeedback) => {
    feedbackMutation.mutate({ suggestionId, feedback });
  };

  // Filter out suggestions that have been marked as not helpful
  const activeSuggestions = suggestions.filter(s => s.feedback !== 'NotHelpful');

  return (
    <Card variant="bordered" className="overflow-hidden">
      {/* Header */}
      <div
        className={`p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between ${
          isCollapsible ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''
        }`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="w-5 h-5 text-purple-500" />
            {activeSuggestions.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            )}
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">AI Suggestions</h3>
          {activeSuggestions.length > 0 && (
            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs rounded-full">
              {activeSuggestions.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {conversationId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                refetch();
              }}
              className="p-1"
              title="Refresh suggestions"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
          {isCollapsible && (
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              {/* Suggestions List */}
              <div className="max-h-80 overflow-y-auto space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>AI suggestions unavailable</p>
                    <p className="text-xs mt-1">Feature coming soon</p>
                  </div>
                ) : !conversationId ? (
                  <div className="text-center py-8 text-gray-500">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No active conversation</p>
                    <p className="text-xs mt-1">Suggestions will appear during calls</p>
                  </div>
                ) : activeSuggestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No suggestions yet</p>
                    <p className="text-xs mt-1">AI will analyze the conversation</p>
                  </div>
                ) : (
                  activeSuggestions.map((suggestion, index) => {
                    const config = suggestionTypeConfig[suggestion.suggestionType];
                    const Icon = config.icon;

                    return (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 ${config.bgColor} border border-gray-200 dark:border-gray-700 rounded-lg`}
                      >
                        {/* Suggestion Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${config.bgColor} flex items-center justify-center`}>
                              <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                            </div>
                            <span className={`text-xs font-medium ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`text-xs ${getConfidenceColor(suggestion.confidenceScore)}`}>
                              {formatConfidence(suggestion.confidenceScore)} confidence
                            </span>
                          </div>
                        </div>

                        {/* Suggestion Content */}
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                          {suggestion.content}
                        </p>

                        {/* Article Link (if applicable) */}
                        {suggestion.suggestionType === 'Article' && suggestion.articleId && (
                          <a
                            href={`/knowledge-base?articleId=${suggestion.articleId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mb-3"
                          >
                            <BookOpen className="w-3 h-3" />
                            {suggestion.articleTitle || 'View Article'}
                          </a>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(suggestion)}
                              className="text-xs h-7 px-2"
                            >
                              {copiedId === suggestion.id ? (
                                <>
                                  <Check className="w-3 h-3 mr-1 text-green-500" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                            {suggestion.wasUsed && (
                              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Used
                              </span>
                            )}
                          </div>

                          {/* Feedback Buttons */}
                          {!suggestion.feedback && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleFeedback(suggestion.id, 'Helpful')}
                                disabled={feedbackMutation.isPending}
                                className="p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-400 hover:text-green-600 transition-colors"
                                title="Helpful"
                              >
                                {feedbackMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ThumbsUp className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleFeedback(suggestion.id, 'NotHelpful')}
                                disabled={feedbackMutation.isPending}
                                className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-colors"
                                title="Not helpful"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          {suggestion.feedback === 'Helpful' && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              Helpful
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default AiSuggestionsPanel;
