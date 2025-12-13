import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareText,
  Plus,
  Send,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Card, Button } from '../../../components/ui';
import apiClient from '../../../api/client';
import { useSignalR } from '../../../hooks/useSignalR';
import { useAuthStore } from '../../../store/authStore';

interface ConversationNote {
  id: string;
  conversationId: string;
  agentId: string;
  agentName: string;
  content: string;
  createdAt: string;
}

interface NotesPanelProps {
  conversationId: string | null;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

// Format time ago
const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const NotesPanel = ({
  conversationId,
  isCollapsible = true,
  defaultExpanded = true,
}: NotesPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [noteContent, setNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const notesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // Fetch notes for the conversation
  const { data: notes = [], isLoading, error } = useQuery<ConversationNote[]>({
    queryKey: ['conversation-notes', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await apiClient.get(`/conversations/${conversationId}/notes`);
      return response.data;
    },
    enabled: !!conversationId,
    refetchInterval: 30000, // Refetch every 30 seconds as backup
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId || !user?.id) throw new Error('Missing required data');
      const response = await apiClient.post(`/conversations/${conversationId}/notes?agentId=${user.id}`, {
        content,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-notes', conversationId] });
      setNoteContent('');
      setIsAddingNote(false);
    },
  });

  // Subscribe to SignalR note events
  const { connection } = useSignalR();

  useEffect(() => {
    if (!connection || !conversationId) return;

    const handleNoteAdded = (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) {
        queryClient.invalidateQueries({ queryKey: ['conversation-notes', conversationId] });
      }
    };

    connection.on('NoteAdded', handleNoteAdded);

    return () => {
      connection.off('NoteAdded', handleNoteAdded);
    };
  }, [connection, conversationId, queryClient]);

  // Scroll to bottom when notes change
  useEffect(() => {
    if (notes.length > 0) {
      notesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [notes.length]);

  const toggleExpanded = () => {
    if (isCollapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    addNoteMutation.mutate(noteContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

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
          <MessageSquareText className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Conversation Notes</h3>
          {notes.length > 0 && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
              {notes.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isAddingNote && conversationId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingNote(true);
                setIsExpanded(true);
                setTimeout(() => textareaRef.current?.focus(), 100);
              }}
              className="p-1"
            >
              <Plus className="w-4 h-4" />
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
              {/* Add Note Form */}
              {isAddingNote && (
                <div className="mb-4">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Add a note... (Press Enter to send)"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={3}
                      disabled={addNoteMutation.isPending}
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!noteContent.trim() || addNoteMutation.isPending}
                      className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addNoteMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {noteContent.length} characters
                    </span>
                    <button
                      onClick={() => {
                        setIsAddingNote(false);
                        setNoteContent('');
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Notes List */}
              <div className="max-h-64 overflow-y-auto space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <p>Failed to load notes</p>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquareText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="mb-2">No notes yet</p>
                    {conversationId && !isAddingNote && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setIsAddingNote(true);
                          setTimeout(() => textareaRef.current?.focus(), 100);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add First Note
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {notes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-yellow-200 dark:bg-yellow-700 flex items-center justify-center">
                              <User className="w-3 h-3 text-yellow-700 dark:text-yellow-200" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {note.agentName || 'Agent'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(note.createdAt)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </motion.div>
                    ))}
                    <div ref={notesEndRef} />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default NotesPanel;
