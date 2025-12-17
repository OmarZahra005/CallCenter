import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MessageSquare,
  Clock,
  User,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  AlertCircle,
  StickyNote,
  MoreVertical,
} from 'lucide-react';
import { Button, Badge, Textarea } from '../../../components/ui';
import apiClient from '../../../api/client';

interface CustomerNote {
  id: string;
  customerId: string;
  content: string;
  category?: string;
  authorId: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerNotesProps {
  customerId: string;
  customerName?: string;
  onClose?: () => void;
}

const NOTE_CATEGORIES = [
  { value: 'general', label: 'General', color: 'bg-gray-500' },
  { value: 'support', label: 'Support', color: 'bg-blue-500' },
  { value: 'billing', label: 'Billing', color: 'bg-green-500' },
  { value: 'complaint', label: 'Complaint', color: 'bg-red-500' },
  { value: 'feedback', label: 'Feedback', color: 'bg-purple-500' },
  { value: 'important', label: 'Important', color: 'bg-yellow-500' },
];

// Mock data for development
const generateMockNotes = (customerId: string): CustomerNote[] => [
  {
    id: 'note-1',
    customerId,
    content: 'Customer prefers to be contacted via email. They mentioned they work from 9 AM to 5 PM EST.',
    category: 'general',
    authorId: 'agent-1',
    authorName: 'John Smith',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-2',
    customerId,
    content: 'Had an issue with their last order. Provided a 10% discount code LOYAL10 as compensation.',
    category: 'support',
    authorId: 'agent-2',
    authorName: 'Emily Davis',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-3',
    customerId,
    content: 'VIP customer - handle with priority. Has been a customer since 2019.',
    category: 'important',
    authorId: 'agent-1',
    authorName: 'John Smith',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const CustomerNotes = ({
  customerId,
  customerName,
  onClose,
}: CustomerNotesProps) => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Fetch notes
  const { data: notes = [], isLoading } = useQuery<CustomerNote[]>({
    queryKey: ['customer-notes', customerId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/customers/${customerId}/notes`);
        return response.data.items || response.data || [];
      } catch {
        return generateMockNotes(customerId);
      }
    },
  });

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: async (data: { content: string; category: string }) => {
      return apiClient.post(`/customers/${customerId}/notes`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-notes', customerId] });
      setNewNote('');
      setNewCategory('general');
      setIsAdding(false);
    },
  });

  // Update note mutation
  const updateMutation = useMutation({
    mutationFn: async ({ noteId, data }: { noteId: string; data: { content: string; category: string } }) => {
      return apiClient.put(`/customers/${customerId}/notes/${noteId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-notes', customerId] });
      setEditingNoteId(null);
    },
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      return apiClient.delete(`/customers/${customerId}/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-notes', customerId] });
    },
  });

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    createMutation.mutate({ content: newNote, category: newCategory });
  };

  const handleUpdateNote = () => {
    if (!editContent.trim() || !editingNoteId) return;
    updateMutation.mutate({ noteId: editingNoteId, data: { content: editContent, category: editCategory } });
  };

  const handleStartEdit = (note: CustomerNote) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setEditCategory(note.category || 'general');
    setActiveMenu(null);
  };

  const handleDelete = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(noteId);
    }
    setActiveMenu(null);
  };

  const getCategoryInfo = (category?: string) => {
    return NOTE_CATEGORIES.find((c) => c.value === category) || NOTE_CATEGORIES[0];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <StickyNote className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Customer Notes</h3>
            {customerName && (
              <p className="text-sm text-gray-500">{customerName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Note
          </Button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Add Note Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a note..."
                rows={3}
                className="mb-3"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Category:</span>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  >
                    {NOTE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAdding(false);
                      setNewNote('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 mb-2">No notes yet</p>
            <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add First Note
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {notes.map((note) => {
              const categoryInfo = getCategoryInfo(note.category);
              const isEditing = editingNoteId === note.id;

              return (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {isEditing ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        autoFocus
                      />
                      <div className="flex items-center justify-between">
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                        >
                          {NOTE_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingNoteId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleUpdateNote}
                            disabled={!editContent.trim() || updateMutation.isPending}
                          >
                            {updateMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Save'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            size="sm"
                            className={`${categoryInfo.color} text-white border-0`}
                          >
                            {categoryInfo.label}
                          </Badge>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === note.id ? null : note.id)}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          <AnimatePresence>
                            {activeMenu === note.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                              >
                                <button
                                  onClick={() => handleStartEdit(note)}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(note.id)}
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {note.authorName || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerNotes;
