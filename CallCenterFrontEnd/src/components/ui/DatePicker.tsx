import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { dropdownVariants } from '../../utils/animations';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, onChange, placeholder = 'Select date', label, error, disabled, className, minDate, maxDate }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value || new Date());

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleDateSelect = (day: number) => {
      const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      onChange?.(newDate);
      setIsOpen(false);
    };

    const navigateMonth = (delta: number) => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
    };

    const isDateDisabled = (day: number) => {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    };

    const isSelected = (day: number) => {
      if (!value) return false;
      return value.getDate() === day && value.getMonth() === viewDate.getMonth() && value.getFullYear() === viewDate.getFullYear();
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
      <div className={cn('relative', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}

        <button
          type="button"
          ref={ref as any}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all duration-200',
            'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className={cn('flex-1 text-start', !value && 'text-gray-400')}>
            {value ? formatDate(value) : placeholder}
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <motion.div
                variants={dropdownVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute z-50 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => navigateMonth(-1)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateMonth(1)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Day names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                  {paddingDays.map(i => (
                    <div key={`pad-${i}`} />
                  ))}
                  {days.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      disabled={isDateDisabled(day)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-sm transition-colors',
                        isSelected(day)
                          ? 'bg-primary-500 text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white',
                        isDateDisabled(day) && 'opacity-30 cursor-not-allowed'
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
