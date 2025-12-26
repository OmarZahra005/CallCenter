import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

// Types for the public survey API
interface SurveyData {
  token: string;
  status: string;
  questionCode: string;
  questionText: string;
  questionTextArabic: string;
  isExpired: boolean;
  isCompleted: boolean;
  rating?: number;
  respondedAt?: string;
}

interface SubmitResponse {
  callId: string;
  status: string;
  rating: number;
  respondedAt: string;
  message: string;
  messageArabic: string;
}

interface ErrorResponse {
  error: string;
  message: string;
  messageArabic: string;
}

// API functions
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001';

async function fetchSurvey(token: string): Promise<SurveyData> {
  const response = await fetch(`${API_BASE}/api/surveys/${token}`);
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  return response.json();
}

async function submitRating(token: string, rating: number): Promise<SubmitResponse> {
  const response = await fetch(`${API_BASE}/api/surveys/${token}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rating }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  return response.json();
}

// Rating button component
const RatingButton = ({
  value,
  selected,
  onClick,
  disabled,
}: {
  value: number;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}) => {
  const getColor = (val: number) => {
    if (val <= 2) return 'text-red-500 hover:bg-red-50 border-red-200';
    if (val === 3) return 'text-yellow-500 hover:bg-yellow-50 border-yellow-200';
    return 'text-green-500 hover:bg-green-50 border-green-200';
  };

  const getSelectedColor = (val: number) => {
    if (val <= 2) return 'bg-red-500 text-white border-red-500';
    if (val === 3) return 'bg-yellow-500 text-white border-yellow-500';
    return 'bg-green-500 text-white border-green-500';
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.1 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 font-bold text-xl sm:text-2xl
        transition-all duration-200 flex items-center justify-center
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${selected ? getSelectedColor(value) : getColor(value)}
      `}
    >
      {value}
    </motion.button>
  );
};

// Main component
export function PublicSurvey() {
  const { token } = useParams<{ token: string }>();
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch survey data
  useEffect(() => {
    if (!token) {
      setError({
        error: 'invalid_token',
        message: 'Invalid survey link.',
        messageArabic: 'رابط الاستبيان غير صالح.',
      });
      setLoading(false);
      return;
    }

    fetchSurvey(token)
      .then((data) => {
        setSurvey(data);
        if (data.isCompleted && data.rating) {
          setSelectedRating(data.rating);
          setSubmitted(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [token]);

  // Handle rating submission
  const handleSubmit = async () => {
    if (!token || selectedRating === null) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitRating(token, selectedRating);
      setSubmitted(true);
    } catch (err: unknown) {
      const errorResponse = err as ErrorResponse;
      setSubmitError(errorResponse?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    const isExpired = error.error === 'survey_expired';
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isExpired ? 'bg-yellow-100' : 'bg-red-100'}`}>
            {isExpired ? (
              <Clock className="w-8 h-8 text-yellow-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{error.message}</h1>
          <p className="text-gray-600 mb-4 font-arabic" dir="rtl">
            {error.messageArabic}
          </p>
        </motion.div>
      </div>
    );
  }

  // Already submitted state
  if (submitted || survey?.isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you for your feedback!</h1>
          <p className="text-gray-600 mb-4 font-arabic text-lg" dir="rtl">
            !شكراً لملاحظاتك
          </p>
          {selectedRating && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-2">Your rating / تقييمك</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 ${
                      star <= selectedRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Expired state (shouldn't reach here due to error handling, but just in case)
  if (survey?.isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">This survey has expired.</h1>
          <p className="text-gray-600 mb-4 font-arabic" dir="rtl">
            انتهت صلاحية هذا الاستبيان.
          </p>
        </motion.div>
      </div>
    );
  }

  // Main survey form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Rate Your Experience
          </h1>
          <p className="text-gray-600 font-arabic text-lg" dir="rtl">
            قيّم تجربتك
          </p>
        </div>

        {/* Question */}
        <div className="mb-8 text-center">
          <p className="text-lg text-gray-800 mb-2">{survey?.questionText}</p>
          <p className="text-gray-600 font-arabic" dir="rtl">
            {survey?.questionTextArabic}
          </p>
        </div>

        {/* Rating buttons */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((value) => (
            <RatingButton
              key={value}
              value={value}
              selected={selectedRating === value}
              onClick={() => setSelectedRating(value)}
              disabled={submitting}
            />
          ))}
        </div>

        {/* Rating labels */}
        <div className="flex justify-between text-sm text-gray-500 mb-8 px-2">
          <span>Poor / ضعيف</span>
          <span>Excellent / ممتاز</span>
        </div>

        {/* Submit error */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{submitError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          whileHover={selectedRating ? { scale: 1.02 } : undefined}
          whileTap={selectedRating ? { scale: 0.98 } : undefined}
          onClick={handleSubmit}
          disabled={selectedRating === null || submitting}
          className={`
            w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200
            ${
              selectedRating === null
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }
          `}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block"
              />
              Submitting...
            </span>
          ) : (
            <>
              Submit Rating
              <span className="block text-sm font-normal opacity-80 font-arabic">إرسال التقييم</span>
            </>
          )}
        </motion.button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Your feedback helps us improve our service.
          <br />
          <span className="font-arabic">ملاحظاتك تساعدنا على تحسين خدمتنا.</span>
        </p>
      </motion.div>
    </div>
  );
}

export default PublicSurvey;
