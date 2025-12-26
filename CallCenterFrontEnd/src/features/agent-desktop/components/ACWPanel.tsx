import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck,
  Clock,
  FileText,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Phone,
  ArrowUpCircle,
  RotateCcw,
  XCircle,
  ChevronDown,
  Smile,
  Meh,
  Frown,
  PhoneMissed,
  PhoneOff,
  Tag,
} from 'lucide-react';
import { Card, CardContent, Button, Badge } from '../../../components/ui';
import apiClient from '../../../api/client';

// Disposition categories matching backend enum
type DispositionCategory = 'Resolved' | 'Callback' | 'Escalated' | 'NoAnswer' | 'Abandoned';

// Sentiment types matching backend enum
type Sentiment = 'Positive' | 'Neutral' | 'Negative';

// Backend disposition type
interface BackendDisposition {
  id: string;
  name: string;
  description?: string;
  category: DispositionCategory;
  requiresFollowup: boolean;
  isActive: boolean;
}

// Category configuration with icons and colors
const CATEGORY_CONFIG: Record<DispositionCategory, {
  icon: typeof CheckCircle2;
  color: string;
  bgColor: string;
  label: string;
}> = {
  Resolved: {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Resolved',
  },
  Callback: {
    icon: RotateCcw,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'Callback Required',
  },
  Escalated: {
    icon: ArrowUpCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Escalated',
  },
  NoAnswer: {
    icon: PhoneMissed,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    label: 'No Answer',
  },
  Abandoned: {
    icon: PhoneOff,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    label: 'Abandoned',
  },
};

// Sentiment configuration
const SENTIMENT_OPTIONS: { value: Sentiment; icon: typeof Smile; color: string; label: string }[] = [
  { value: 'Positive', icon: Smile, color: 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30', label: 'Positive' },
  { value: 'Neutral', icon: Meh, color: 'text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30', label: 'Neutral' },
  { value: 'Negative', icon: Frown, color: 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30', label: 'Negative' },
];

// Fallback dispositions when API is not available
const FALLBACK_DISPOSITIONS: BackendDisposition[] = [
  { id: 'resolved-1', name: 'Issue Resolved', description: 'Customer issue was fully resolved', category: 'Resolved', requiresFollowup: false, isActive: true },
  { id: 'resolved-2', name: 'Information Provided', description: 'Customer received requested information', category: 'Resolved', requiresFollowup: false, isActive: true },
  { id: 'callback-1', name: 'Callback Scheduled', description: 'Follow-up call scheduled with customer', category: 'Callback', requiresFollowup: true, isActive: true },
  { id: 'callback-2', name: 'Awaiting Customer Response', description: 'Waiting for customer to provide information', category: 'Callback', requiresFollowup: true, isActive: true },
  { id: 'escalated-1', name: 'Escalated to Supervisor', description: 'Issue requires supervisor attention', category: 'Escalated', requiresFollowup: true, isActive: true },
  { id: 'escalated-2', name: 'Escalated to Technical Team', description: 'Technical issue requires specialist', category: 'Escalated', requiresFollowup: true, isActive: true },
  { id: 'noanswer-1', name: 'No Answer', description: 'Customer did not answer the call', category: 'NoAnswer', requiresFollowup: true, isActive: true },
  { id: 'noanswer-2', name: 'Voicemail Left', description: 'Left voicemail for customer', category: 'NoAnswer', requiresFollowup: true, isActive: true },
  { id: 'abandoned-1', name: 'Customer Disconnected', description: 'Customer hung up during call', category: 'Abandoned', requiresFollowup: false, isActive: true },
  { id: 'abandoned-2', name: 'Call Dropped', description: 'Call was dropped due to technical issues', category: 'Abandoned', requiresFollowup: false, isActive: true },
];

interface ACWPanelProps {
  isVisible: boolean;
  callId?: string;
  conversationId?: string;
  customerName?: string;
  callDuration?: number;
  acwTimeoutSeconds?: number;
  onComplete: (data: ACWFormData) => void;
  onSkip?: () => void;
}

export interface ACWFormData {
  dispositionId: string;
  dispositionCategory: DispositionCategory;
  dispositionName: string;
  notes: string;
  sentiment: Sentiment;
  followUpRequired: boolean;
  followUpDate?: string;
  tags?: string[];
}

export const ACWPanel = ({
  isVisible,
  callId,
  conversationId: _conversationId,
  customerName,
  callDuration,
  acwTimeoutSeconds = 120,
  onComplete,
  onSkip,
}: ACWPanelProps) => {
  // Form state
  const [selectedDisposition, setSelectedDisposition] = useState<BackendDisposition | null>(null);
  const [notes, setNotes] = useState('');
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<DispositionCategory | null>(null);

  // Timer state
  const [remainingTime, setRemainingTime] = useState(acwTimeoutSeconds);
  const [isTimerWarning, setIsTimerWarning] = useState(false);

  // Fetch dispositions from backend
  const { data: dispositions = FALLBACK_DISPOSITIONS } = useQuery<BackendDisposition[]>({
    queryKey: ['dispositions'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/dispositions/active');
        return response.data;
      } catch (err) {
        console.warn('Dispositions endpoint not available, using fallback:', err);
        return FALLBACK_DISPOSITIONS;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  });

  // Group dispositions by category
  const groupedDispositions = dispositions.reduce((acc, disp) => {
    if (!acc[disp.category]) {
      acc[disp.category] = [];
    }
    acc[disp.category].push(disp);
    return acc;
  }, {} as Record<DispositionCategory, BackendDisposition[]>);

  // Validation
  const isFormValid = selectedDisposition !== null && notes.trim().length > 0 && sentiment !== null;
  const canSubmit = isFormValid && (!followUpRequired || followUpDate !== '');

  // Reset form when panel becomes visible
  useEffect(() => {
    if (isVisible) {
      setSelectedDisposition(null);
      setNotes('');
      setSentiment(null);
      setFollowUpRequired(false);
      setFollowUpDate('');
      setTags([]);
      setTagInput('');
      setRemainingTime(acwTimeoutSeconds);
      setIsTimerWarning(false);
      setIsDropdownOpen(false);
      setExpandedCategory(null);
    }
  }, [isVisible, acwTimeoutSeconds]);

  // Auto-set follow-up based on disposition
  useEffect(() => {
    if (selectedDisposition) {
      setFollowUpRequired(selectedDisposition.requiresFollowup);
    }
  }, [selectedDisposition]);

  // Countdown timer
  useEffect(() => {
    if (!isVisible || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        const newTime = prev - 1;
        if (newTime <= 30 && !isTimerWarning) {
          setIsTimerWarning(true);
        }
        if (newTime <= 0) {
          onSkip?.();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, remainingTime, isTimerWarning, onSkip]);

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Format timer display
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get minimum date for follow-up (tomorrow)
  const getMinFollowUpDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Handle tag addition
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!canSubmit || !selectedDisposition || !sentiment) return;

    onComplete({
      dispositionId: selectedDisposition.id,
      dispositionCategory: selectedDisposition.category,
      dispositionName: selectedDisposition.name,
      notes,
      sentiment,
      followUpRequired,
      followUpDate: followUpRequired ? followUpDate : undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
  }, [canSubmit, selectedDisposition, notes, sentiment, followUpRequired, followUpDate, tags, onComplete]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.disposition-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isDropdownOpen]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <Card variant="bordered" className="overflow-hidden border-2 border-amber-400 dark:border-amber-500">
            {/* Header with Timer */}
            <div className="bg-amber-50 dark:bg-amber-900/30 px-6 py-4 border-b border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center"
                  >
                    <ClipboardCheck className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                      After Call Work
                    </h3>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Complete call wrap-up before taking next call
                    </p>
                  </div>
                </div>

                {/* Timer */}
                <motion.div
                  animate={isTimerWarning ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isTimerWarning ? Infinity : 0 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                    isTimerWarning
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-lg font-mono font-bold">{formatTimer(remainingTime)}</span>
                </motion.div>
              </div>

              {/* Call Summary */}
              {(callId || customerName || callDuration) && (
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
                  {customerName && (
                    <div className="flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-400">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{customerName}</span>
                    </div>
                  )}
                  {callDuration !== undefined && (
                    <Badge variant="default" size="sm">
                      Duration: {formatDuration(callDuration)}
                    </Badge>
                  )}
                  {callId && (
                    <span className="text-xs text-amber-600 dark:text-amber-500">
                      ID: {callId.slice(0, 8)}
                    </span>
                  )}
                </div>
              )}
            </div>

            <CardContent className="p-6 space-y-5">
              {/* Customer Sentiment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Customer Sentiment <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {SENTIMENT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = sentiment === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSentiment(option.value)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? `border-current ${option.color.replace('hover:', '')} bg-opacity-20`
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        } ${option.color}`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? '' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${isSelected ? '' : 'text-gray-600 dark:text-gray-400'}`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Disposition Dropdown */}
              <div className="disposition-dropdown">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Call Disposition <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border rounded-xl flex items-center justify-between transition-colors ${
                      selectedDisposition
                        ? 'border-gray-300 dark:border-gray-600'
                        : 'border-amber-400 dark:border-amber-500'
                    } hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  >
                    {selectedDisposition ? (
                      <div className="flex items-center gap-2">
                        {(() => {
                          const config = CATEGORY_CONFIG[selectedDisposition.category];
                          const Icon = config.icon;
                          return (
                            <>
                              <div className={`w-6 h-6 rounded-full ${config.bgColor} flex items-center justify-center`}>
                                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                              </div>
                              <div>
                                <span className="text-gray-900 dark:text-white">{selectedDisposition.name}</span>
                                <span className={`ml-2 text-xs ${config.color}`}>({config.label})</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <span className="text-gray-400">Select disposition...</span>
                    )}
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden max-h-80 overflow-y-auto"
                      >
                        {(Object.keys(CATEGORY_CONFIG) as DispositionCategory[]).map((category) => {
                          const config = CATEGORY_CONFIG[category];
                          const Icon = config.icon;
                          const categoryDispositions = groupedDispositions[category] || [];
                          const isExpanded = expandedCategory === category;

                          if (categoryDispositions.length === 0) return null;

                          return (
                            <div key={category} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                              {/* Category Header */}
                              <button
                                type="button"
                                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                                className={`w-full px-4 py-2 text-left flex items-center justify-between ${config.bgColor} hover:opacity-90 transition-opacity`}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className={`w-4 h-4 ${config.color}`} />
                                  <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                                  <span className="text-xs text-gray-500">({categoryDispositions.length})</span>
                                </div>
                                <ChevronDown
                                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                />
                              </button>

                              {/* Category Dispositions */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="overflow-hidden"
                                  >
                                    {categoryDispositions.map((disp) => (
                                      <button
                                        key={disp.id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedDisposition(disp);
                                          setIsDropdownOpen(false);
                                        }}
                                        className={`w-full px-6 py-2 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                          selectedDisposition?.id === disp.id ? 'bg-amber-50 dark:bg-amber-900/30' : ''
                                        }`}
                                      >
                                        <div className="flex-1">
                                          <span className="text-sm text-gray-900 dark:text-white">{disp.name}</span>
                                          {disp.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                              {disp.description}
                                            </p>
                                          )}
                                        </div>
                                        {disp.requiresFollowup && (
                                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                            Follow-up
                                          </span>
                                        )}
                                        {selectedDisposition?.id === disp.id && (
                                          <CheckCircle2 className="w-4 h-4 text-amber-500" />
                                        )}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Call Notes <span className="text-red-500">*</span>
                  </div>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Summarize the call and any actions taken..."
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    notes.trim()
                      ? 'border-gray-300 dark:border-gray-600'
                      : 'border-amber-400 dark:border-amber-500'
                  }`}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {notes.length} characters
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags <span className="text-gray-400 text-xs font-normal">(optional, max 5)</span>
                  </div>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="w-4 h-4 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center"
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {tags.length < 5 && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add a tag..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Follow-up Required */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={followUpRequired}
                    onChange={(e) => {
                      setFollowUpRequired(e.target.checked);
                      if (!e.target.checked) {
                        setFollowUpDate('');
                      }
                    }}
                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-amber-500 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Follow-up Required
                    </span>
                    {selectedDisposition?.requiresFollowup && (
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        Recommended
                      </span>
                    )}
                  </div>
                </label>

                <AnimatePresence>
                  {followUpRequired && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-8">
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Follow-up Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          min={getMinFollowUpDate()}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Validation Warning */}
              {!isFormValid && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm text-amber-700 dark:text-amber-400">
                    Please select sentiment, disposition, and add notes to complete ACW
                  </span>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    variant="primary"
                    size="lg"
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 dark:disabled:bg-gray-700"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Complete ACW
                  </Button>
                </motion.div>

                {onSkip && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={onSkip}
                      variant="secondary"
                      size="lg"
                      className="px-6"
                      title="Skip ACW and return to available"
                    >
                      Skip
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ACWPanel;
