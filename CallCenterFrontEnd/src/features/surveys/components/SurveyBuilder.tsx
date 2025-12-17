import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  Star,
  MessageSquare,
  Hash,
  ToggleLeft,
  ChevronDown,
  ChevronUp,
  Save,
  Eye,
  AlertCircle,
  Loader2,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui';

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
  id?: string;
  name: string;
  description?: string;
  type: 'CSAT' | 'NPS' | 'Custom';
  trigger: SurveyTrigger;
  isActive: boolean;
  questions: SurveyQuestion[];
  thankYouMessage?: string;
  expirationDays?: number;
}

interface SurveyBuilderProps {
  survey?: Survey | null;
  onSave: (survey: Survey) => Promise<void>;
  onCancel: () => void;
}

const QUESTION_TYPES = [
  { value: 'rating', label: 'Star Rating', icon: Star, description: '1-5 stars' },
  { value: 'nps', label: 'NPS Score', icon: Hash, description: '0-10 scale' },
  { value: 'text', label: 'Free Text', icon: MessageSquare, description: 'Open response' },
  { value: 'multiChoice', label: 'Multiple Choice', icon: ToggleLeft, description: 'Select options' },
  { value: 'yesNo', label: 'Yes/No', icon: ToggleLeft, description: 'Binary choice' },
];

const TRIGGERS = [
  { value: 'afterCall', label: 'After Call', description: 'Send after call ends' },
  { value: 'afterChat', label: 'After Chat', description: 'Send after chat session' },
  { value: 'afterTicket', label: 'After Ticket', description: 'Send when ticket resolved' },
  { value: 'manual', label: 'Manual', description: 'Send manually' },
];

const generateId = () => `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const SurveyBuilder = ({
  survey,
  onSave,
  onCancel,
}: SurveyBuilderProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Survey['type']>('CSAT');
  const [trigger, setTrigger] = useState<SurveyTrigger>('afterCall');
  const [isActive, setIsActive] = useState(true);
  const [thankYouMessage, setThankYouMessage] = useState('Thank you for your feedback!');
  const [expirationDays, setExpirationDays] = useState(7);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');

  // Initialize form data
  useEffect(() => {
    if (survey) {
      setName(survey.name);
      setDescription(survey.description || '');
      setType(survey.type);
      setTrigger(survey.trigger);
      setIsActive(survey.isActive);
      setThankYouMessage(survey.thankYouMessage || 'Thank you for your feedback!');
      setExpirationDays(survey.expirationDays || 7);
      setQuestions(survey.questions);
    } else {
      // Add default CSAT question for new surveys
      setQuestions([
        {
          id: generateId(),
          type: 'rating',
          question: 'How satisfied are you with our service?',
          required: true,
          minValue: 1,
          maxValue: 5,
          order: 0,
        },
      ]);
      setExpandedQuestions([]);
    }
  }, [survey]);

  const addQuestion = (type: QuestionType) => {
    const newQuestion: SurveyQuestion = {
      id: generateId(),
      type,
      question: '',
      required: true,
      order: questions.length,
      ...(type === 'rating' && { minValue: 1, maxValue: 5 }),
      ...(type === 'nps' && { minValue: 0, maxValue: 10 }),
      ...(type === 'multiChoice' && { options: ['Option 1', 'Option 2'] }),
    };
    setQuestions([...questions, newQuestion]);
    setExpandedQuestions([...expandedQuestions, newQuestion.id]);
  };

  const updateQuestion = (id: string, updates: Partial<SurveyQuestion>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    setExpandedQuestions(expandedQuestions.filter((qId) => qId !== id));
  };

  const toggleQuestionExpansion = (id: string) => {
    setExpandedQuestions((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, {
        options: [...question.options, `Option ${question.options.length + 1}`],
      });
    }
  };

  const updateOption = (questionId: string, index: number, value: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[index] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, index: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.options && question.options.length > 2) {
      updateQuestion(questionId, {
        options: question.options.filter((_, i) => i !== index),
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Survey name is required';
    }

    if (questions.length === 0) {
      newErrors.questions = 'At least one question is required';
    }

    questions.forEach((q, i) => {
      if (!q.question.trim()) {
        newErrors[`question-${i}`] = 'Question text is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave({
        id: survey?.id,
        name,
        description,
        type,
        trigger,
        isActive,
        thankYouMessage,
        expirationDays,
        questions: questions.map((q, i) => ({ ...q, order: i })),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getQuestionTypeIcon = (questionType: QuestionType) => {
    const found = QUESTION_TYPES.find((t) => t.value === questionType);
    return found ? found.icon : HelpCircle;
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="flex-shrink-0 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Survey Name"
              className={`text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 ${
                errors.name ? 'text-red-500' : ''
              }`}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'questions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-1" />
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-4">
        <AnimatePresence mode="wait">
          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              {errors.questions && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.questions}
                </div>
              )}

              {/* Questions List */}
              <Reorder.Group
                axis="y"
                values={questions}
                onReorder={setQuestions}
                className="space-y-3"
              >
                {questions.map((question, index) => {
                  const isExpanded = expandedQuestions.includes(question.id);
                  const QuestionIcon = getQuestionTypeIcon(question.type);

                  return (
                    <Reorder.Item
                      key={question.id}
                      value={question}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      {/* Question Header */}
                      <div
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        onClick={() => toggleQuestionExpansion(question.id)}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                        <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-400">
                          {index + 1}
                        </span>
                        <QuestionIcon className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {question.question || 'New Question'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {QUESTION_TYPES.find((t) => t.value === question.type)?.label}
                          </p>
                        </div>
                        {question.required && (
                          <span className="text-xs text-red-500">*</span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeQuestion(question.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>

                      {/* Question Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-200 dark:border-gray-700"
                          >
                            <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
                              {/* Question Text */}
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Question Text
                                </label>
                                <input
                                  type="text"
                                  value={question.question}
                                  onChange={(e) =>
                                    updateQuestion(question.id, { question: e.target.value })
                                  }
                                  placeholder="Enter your question..."
                                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${
                                    errors[`question-${index}`]
                                      ? 'border-red-500'
                                      : 'border-gray-300 dark:border-gray-600'
                                  }`}
                                />
                                {errors[`question-${index}`] && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {errors[`question-${index}`]}
                                  </p>
                                )}
                              </div>

                              {/* Question Type Specific Options */}
                              {question.type === 'multiChoice' && question.options && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    Options
                                  </label>
                                  <div className="space-y-2">
                                    {question.options.map((option, optIndex) => (
                                      <div key={optIndex} className="flex items-center gap-2">
                                        <span className="w-4 h-4 rounded-full border-2 border-gray-300" />
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) =>
                                            updateOption(question.id, optIndex, e.target.value)
                                          }
                                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                        {question.options.length > 2 && (
                                          <button
                                            onClick={() => removeOption(question.id, optIndex)}
                                            className="p-1 text-gray-400 hover:text-red-500"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                    <button
                                      onClick={() => addOption(question.id)}
                                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                    >
                                      <Plus className="w-3 h-3" />
                                      Add Option
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Required Toggle */}
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={question.required}
                                  onChange={(e) =>
                                    updateQuestion(question.id, { required: e.target.checked })
                                  }
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  Required question
                                </span>
                              </label>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>

              {/* Add Question Buttons */}
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Add Question</p>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TYPES.map((qType) => (
                    <button
                      key={qType.value}
                      onClick={() => addQuestion(qType.value as QuestionType)}
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <qType.icon className="w-4 h-4 text-gray-500" />
                      {qType.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description for this survey..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Survey Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Survey Type
                </label>
                <div className="flex gap-2">
                  {(['CSAT', 'NPS', 'Custom'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        type === t
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trigger */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  When to Send
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TRIGGERS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTrigger(t.value as SurveyTrigger)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        trigger === t.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <p className={`text-sm font-medium ${
                        trigger === t.value
                          ? 'text-primary-700 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {t.label}
                      </p>
                      <p className="text-xs text-gray-500">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link Expiration (days)
                </label>
                <input
                  type="number"
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(parseInt(e.target.value) || 7)}
                  min={1}
                  max={30}
                  className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Thank You Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Thank You Message
                </label>
                <textarea
                  value={thankYouMessage}
                  onChange={(e) => setThankYouMessage(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setIsActive(!isActive)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isActive ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      isActive ? 'left-7' : 'left-1'
                    }`}
                  />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Survey is active
                </span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {name || 'Survey Preview'}
              </h3>
              {description && (
                <p className="text-sm text-gray-500 mb-6">{description}</p>
              )}
              <div className="space-y-6">
                {questions.map((q, i) => (
                  <div key={q.id}>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {i + 1}. {q.question || 'Question text'}
                      {q.required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    {q.type === 'rating' && (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className="w-8 h-8 text-gray-300" />
                        ))}
                      </div>
                    )}
                    {q.type === 'nps' && (
                      <div className="flex gap-1">
                        {[...Array(11)].map((_, n) => (
                          <button
                            key={n}
                            className="w-8 h-8 rounded border border-gray-300 text-sm text-gray-600"
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    )}
                    {q.type === 'text' && (
                      <textarea
                        disabled
                        placeholder="Type your response..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                        rows={3}
                      />
                    )}
                    {q.type === 'multiChoice' && q.options && (
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <label key={oi} className="flex items-center gap-2">
                            <input type="radio" disabled className="text-primary-600" />
                            <span className="text-sm text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === 'yesNo' && (
                      <div className="flex gap-3">
                        <button className="px-6 py-2 border border-gray-300 rounded-lg text-sm">
                          Yes
                        </button>
                        <button className="px-6 py-2 border border-gray-300 rounded-lg text-sm">
                          No
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6" onClick={() => setShowPreview(false)}>
                Close Preview
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex-shrink-0 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {survey ? 'Update Survey' : 'Create Survey'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SurveyBuilder;
