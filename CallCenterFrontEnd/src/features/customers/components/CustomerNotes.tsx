import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

export const CustomerNotes = ({
  customerId,
  customerName,
  onClose,
}: CustomerNotesProps) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const NOTE_CATEGORIES = [
    { value: 'general', label: t('customerNotes.general'), color: 'bg-gray-500' },
    { value: 'support', label: t('customerNotes.support'), color: 'bg-blue-500' },
    { value: 'billing', label: t('customerNotes.billing'), color: 'bg-green-500' },
    { value: 'complaint', label: t('customerNotes.complaint'), color: 'bg-red-500' },
    { value: 'feedback', label: t('customerNotes.feedback'), color: 'bg-purple-500' },
    { value: 'important', label: t('customerNotes.important'), color: 'bg-yellow-500' },
  ];

  // Fetch notes from real backend API
  const { data: notes = [], isLoading } = useQuery<CustomerNote[]>({
    queryKey: ['customer-notes', customerId],
    queryFn: async () => {
      const response = await apiClient.get(`/customers/${customerId}/notes`);
      return Array.isArray(response.data) ? response.data : response.data.items || [];
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
    if (confirm(t('customerNotes.deleteConfirm'))) {
      deleteMutation.mutate(noteId);
    }
    setActiveMenu(null);
  };

  const getCategoryInfo = (category?: string) => {
    return NOTE_CATEGORIES.find((c) => c.value === category) || NOTE_CATEGORIES[0];
  };

  const isArabic = i18n.language === 'ar';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return t('customerNotes.today');
    } else if (diffDays === 1) {
      return t('customerNotes.yesterday');
    } else if (diffDays < 7) {
      return t('customerNotes.daysAgo', { count: diffDays });
    } else {
      return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('customerNotes.title')}</h3>
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
            <Plus className="w-4 h-4 me-1" />
            {t('customerNotes.addNote')}
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
                placeholder={t('customerNotes.writeNote')}
                rows={3}
                className="mb-3"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{t('customerNotes.category')}</span>
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
                    {t('common.cancel')}
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
                        <Save className="w-4 h-4 me-1" />
                        {t('common.save')}
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
            <p className="text-gray-500 mb-2">{t('customerNotes.noNotesYet')}</p>
            <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 me-1" />
              {t('customerNotes.addFirstNote')}
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
                            {t('common.cancel')}
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleUpdateNote}
                            disabled={!editContent.trim() || updateMutation.isPending}
                          >
                            {updateMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              t('common.save')
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
                            variant="default"
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
                                className="absolute end-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                              >
                                <button
                                  onClick={() => handleStartEdit(note)}
                                  className="w-full px-3 py-2 text-start text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  {t('common.edit')}
                                </button>
                                <button
                                  onClick={() => handleDelete(note.id)}
                                  className="w-full px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  {t('common.delete')}
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
                          {note.authorName || t('customerNotes.unknown')}
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
