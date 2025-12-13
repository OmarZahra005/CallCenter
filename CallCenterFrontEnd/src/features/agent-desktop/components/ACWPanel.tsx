import { useState, useEffect, useCallback } from 'react';
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
  PhoneForwarded,
  XCircle,
  Voicemail,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, Button, Badge } from '../../../components/ui';

// Disposition options (Standard Set)
const DISPOSITION_OPTIONS = [
  { value: 'resolved', label: 'Resolved', icon: CheckCircle2, color: 'text-green-600 dark:text-green-400' },
  { value: 'escalated', label: 'Escalated', icon: ArrowUpCircle, color: 'text-red-600 dark:text-red-400' },
  { value: 'follow_up', label: 'Follow-up Required', icon: RotateCcw, color: 'text-blue-600 dark:text-blue-400' },
  { value: 'transferred', label: 'Transferred', icon: PhoneForwarded, color: 'text-purple-600 dark:text-purple-400' },
  { value: 'no_resolution', label: 'No Resolution', icon: XCircle, color: 'text-orange-600 dark:text-orange-400' },
  { value: 'voicemail', label: 'Voicemail Left', icon: Voicemail, color: 'text-gray-600 dark:text-gray-400' },
] as const;

type DispositionValue = typeof DISPOSITION_OPTIONS[number]['value'];

interface ACWPanelProps {
  isVisible: boolean;
  callId?: string;
  customerName?: string;
  callDuration?: number;
  acwTimeoutSeconds?: number;
  onComplete: (data: ACWFormData) => void;
  onSkip?: () => void;
}

export interface ACWFormData {
  disposition: DispositionValue;
  notes: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

export const ACWPanel = ({
  isVisible,
  callId,
  customerName,
  callDuration,
  acwTimeoutSeconds = 30,
  onComplete,
  onSkip,
}: ACWPanelProps) => {
  // Form state
  const [disposition, setDisposition] = useState<DispositionValue | ''>('');
  const [notes, setNotes] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Timer state
  const [remainingTime, setRemainingTime] = useState(acwTimeoutSeconds);
  const [isTimerWarning, setIsTimerWarning] = useState(false);

  // Validation
  const isFormValid = disposition !== '' && notes.trim().length > 0;
  const canSubmit = isFormValid && (!followUpRequired || followUpDate !== '');

  // Reset form when panel becomes visible
  useEffect(() => {
    if (isVisible) {
      setDisposition('');
      setNotes('');
      setFollowUpRequired(false);
      setFollowUpDate('');
      setRemainingTime(acwTimeoutSeconds);
      setIsTimerWarning(false);
    }
  }, [isVisible, acwTimeoutSeconds]);

  // Countdown timer
  useEffect(() => {
    if (!isVisible || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        const newTime = prev - 1;
        if (newTime <= 10 && !isTimerWarning) {
          setIsTimerWarning(true);
        }
        if (newTime <= 0) {
          // Auto-skip when timer expires
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

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;

    onComplete({
      disposition: disposition as DispositionValue,
      notes,
      followUpRequired,
      followUpDate: followUpRequired ? followUpDate : undefined,
    });
  }, [canSubmit, disposition, notes, followUpRequired, followUpDate, onComplete]);

  // Get selected disposition details
  const selectedDisposition = DISPOSITION_OPTIONS.find((opt) => opt.value === disposition);

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
              {/* Disposition Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Call Disposition <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border rounded-xl flex items-center justify-between transition-colors ${
                      disposition
                        ? 'border-gray-300 dark:border-gray-600'
                        : 'border-amber-400 dark:border-amber-500'
                    } hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  >
                    {selectedDisposition ? (
                      <div className="flex items-center gap-2">
                        <selectedDisposition.icon className={`w-5 h-5 ${selectedDisposition.color}`} />
                        <span className="text-gray-900 dark:text-white">{selectedDisposition.label}</span>
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
                        className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
                      >
                        {DISPOSITION_OPTIONS.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setDisposition(option.value);
                                setIsDropdownOpen(false);
                                // Auto-check follow-up if "Follow-up Required" is selected
                                if (option.value === 'follow_up') {
                                  setFollowUpRequired(true);
                                }
                              }}
                              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                disposition === option.value ? 'bg-amber-50 dark:bg-amber-900/30' : ''
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${option.color}`} />
                              <span className="text-gray-900 dark:text-white">{option.label}</span>
                              {disposition === option.value && (
                                <CheckCircle2 className="w-4 h-4 text-amber-500 ml-auto" />
                              )}
                            </button>
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
                    Please select a disposition and add notes to complete ACW
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
