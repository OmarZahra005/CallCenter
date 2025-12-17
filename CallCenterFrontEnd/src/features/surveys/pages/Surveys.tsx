import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  FileText,
  BarChart2,
  Copy,
  Edit2,
  Trash2,
  MoreVertical,
  Play,
  Pause,
  X,
  ClipboardCheck,
  TrendingUp,
  Users,
  MessageSquare,
  Star,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge } from '../../../components/ui';
import { staggerContainer, staggerItem, fadeUp } from '../../../utils/animations';
import apiClient from '../../../api/client';
import { SurveyBuilder } from '../components/SurveyBuilder';
import { SurveyResults } from '../components/SurveyResults';

// Types
type QuestionType = 'rating' | 'nps' | 'text' | 'multiChoice' | 'yesNo';
type SurveyTrigger = 'afterCall' | 'afterChat' | 'afterTicket' | 'manual';

interface SurveyQuestion {
  id: string;
  type: QuestionType;
  question: string;
  required: boolean;
  options?: string[];
  minValue?: number;
  maxValue?: number;
  order: number;
}

interface Survey {
  id: string;
  name: string;
  description?: string;
  type: 'CSAT' | 'NPS' | 'Custom';
  trigger: SurveyTrigger;
  isActive: boolean;
  questions: SurveyQuestion[];
  thankYouMessage?: string;
  expirationDays?: number;
  responseCount?: number;
  averageScore?: number;
  createdAt: string;
  updatedAt: string;
}

// Mock data generator
const generateMockSurveys = (): Survey[] => [
  {
    id: 'survey-1',
    name: 'Post-Call Satisfaction',
    description: 'Sent automatically after each call',
    type: 'CSAT',
    trigger: 'afterCall',
    isActive: true,
    responseCount: 156,
    averageScore: 4.2,
    questions: [
      {
        id: 'q1',
        type: 'rating',
        question: 'How satisfied are you with our service?',
        required: true,
        minValue: 1,
        maxValue: 5,
        order: 0,
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Any additional feedback?',
        required: false,
        order: 1,
      },
    ],
    thankYouMessage: 'Thank you for your feedback!',
    expirationDays: 7,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-10T14:30:00Z',
  },
  {
    id: 'survey-2',
    name: 'NPS Survey',
    description: 'Net Promoter Score survey',
    type: 'NPS',
    trigger: 'afterTicket',
    isActive: true,
    responseCount: 89,
    averageScore: 8.1,
    questions: [
      {
        id: 'q1',
        type: 'nps',
        question: 'How likely are you to recommend us to a friend?',
        required: true,
        minValue: 0,
        maxValue: 10,
        order: 0,
      },
    ],
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-03-08T11:00:00Z',
  },
  {
    id: 'survey-3',
    name: 'Chat Support Feedback',
    description: 'Collect feedback after chat sessions',
    type: 'CSAT',
    trigger: 'afterChat',
    isActive: false,
    responseCount: 45,
    averageScore: 3.8,
    questions: [
      {
        id: 'q1',
        type: 'rating',
        question: 'How helpful was our chat support?',
        required: true,
        order: 0,
      },
      {
        id: 'q2',
        type: 'multiChoice',
        question: 'What best describes your issue?',
        required: true,
        options: ['Technical Support', 'Billing', 'Product Information', 'Other'],
        order: 1,
      },
    ],
    createdAt: '2024-02-20T15:00:00Z',
    updatedAt: '2024-02-20T15:00:00Z',
  },
];

export const Surveys = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [viewingResults, setViewingResults] = useState<Survey | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Fetch surveys
  const { data: surveys = [], isLoading } = useQuery<Survey[]>({
    queryKey: ['surveys'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/surveys');
        return response.data.items || response.data || [];
      } catch {
        return generateMockSurveys();
      }
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
      if (survey.id) {
        return apiClient.put(`/surveys/${survey.id}`, survey);
      }
      return apiClient.post('/surveys', survey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      setShowBuilder(false);
      setEditingSurvey(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/surveys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch(`/surveys/${id}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
  });

  // Filtered surveys
  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      searchQuery === '' ||
      survey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || survey.type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && survey.isActive) ||
      (statusFilter === 'inactive' && !survey.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats
  const stats = {
    total: surveys.length,
    active: surveys.filter((s) => s.isActive).length,
    totalResponses: surveys.reduce((sum, s) => sum + (s.responseCount || 0), 0),
    avgScore:
      surveys.filter((s) => s.averageScore).length > 0
        ? (
            surveys
              .filter((s) => s.averageScore)
              .reduce((sum, s) => sum + (s.averageScore || 0), 0) /
            surveys.filter((s) => s.averageScore).length
          ).toFixed(1)
        : '0',
  };

  const handleEdit = (survey: Survey) => {
    setEditingSurvey(survey);
    setShowBuilder(true);
    setActiveDropdown(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this survey?')) {
      deleteMutation.mutate(id);
    }
    setActiveDropdown(null);
  };

  const handleToggleActive = (survey: Survey) => {
    toggleActiveMutation.mutate({ id: survey.id, isActive: !survey.isActive });
    setActiveDropdown(null);
  };

  const handleDuplicate = (survey: Survey) => {
    const duplicated = {
      ...survey,
      id: undefined,
      name: `${survey.name} (Copy)`,
      isActive: false,
    };
    saveMutation.mutate(duplicated as any);
    setActiveDropdown(null);
  };

  const getTriggerLabel = (trigger: SurveyTrigger) => {
    const labels: Record<SurveyTrigger, string> = {
      afterCall: 'After Call',
      afterChat: 'After Chat',
      afterTicket: 'After Ticket',
      manual: 'Manual',
    };
    return labels[trigger];
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-5"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Survey Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create and manage customer satisfaction surveys
            </p>
          </div>
          <Button onClick={() => setShowBuilder(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Survey
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Surveys</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Play className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalResponses}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Score</p>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgScore}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={staggerItem}>
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search surveys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="CSAT">CSAT</option>
              <option value="NPS">NPS</option>
              <option value="Custom">Custom</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Surveys List */}
      <motion.div variants={staggerItem}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : filteredSurveys.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No surveys found
            </h3>
            <p className="text-gray-500 mb-4">
              {surveys.length === 0
                ? "You haven't created any surveys yet."
                : 'No surveys match your filters.'}
            </p>
            {surveys.length === 0 && (
              <Button onClick={() => setShowBuilder(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Survey
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSurveys.map((survey) => (
              <motion.div
                key={survey.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {survey.name}
                          </h3>
                          <Badge
                            variant={survey.isActive ? 'success' : 'default'}
                            size="sm"
                          >
                            {survey.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" size="sm">
                            {survey.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {getTriggerLabel(survey.trigger)}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveDropdown(activeDropdown === survey.id ? null : survey.id)
                          }
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>

                        <AnimatePresence>
                          {activeDropdown === survey.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => handleEdit(survey)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDuplicate(survey)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Copy className="w-4 h-4" />
                                  Duplicate
                                </button>
                                <button
                                  onClick={() => handleToggleActive(survey)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  {survey.isActive ? (
                                    <>
                                      <Pause className="w-4 h-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4" />
                                      Activate
                                    </>
                                  )}
                                </button>
                                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                <button
                                  onClick={() => handleDelete(survey.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Description */}
                    {survey.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {survey.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {survey.questions.length}
                        </p>
                        <p className="text-xs text-gray-500">Questions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {survey.responseCount || 0}
                        </p>
                        <p className="text-xs text-gray-500">Responses</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {survey.averageScore?.toFixed(1) || '-'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">Avg Score</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(survey)}
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setViewingResults(survey)}
                      >
                        <BarChart2 className="w-3 h-3 mr-1" />
                        Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Survey Builder Modal */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowBuilder(false);
              setEditingSurvey(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <SurveyBuilder
                  survey={editingSurvey}
                  onSave={async (survey) => {
                    await saveMutation.mutateAsync(survey as any);
                  }}
                  onCancel={() => {
                    setShowBuilder(false);
                    setEditingSurvey(null);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Survey Results Modal */}
      <AnimatePresence>
        {viewingResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setViewingResults(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <SurveyResults
                  surveyId={viewingResults.id}
                  surveyName={viewingResults.name}
                  surveyType={viewingResults.type}
                  onClose={() => setViewingResults(null)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Surveys;
