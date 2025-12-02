import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface NumberInputProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value = 0, onChange, min, max, step = 1, label, error, disabled, className, placeholder }, ref) => {
    const handleIncrement = () => {
      const newValue = value + step;
      if (max !== undefined && newValue > max) return;
      onChange?.(newValue);
    };

    const handleDecrement = () => {
      const newValue = value - step;
      if (min !== undefined && newValue < min) return;
      onChange?.(newValue);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value) || 0;
      if (min !== undefined && newValue < min) return;
      if (max !== undefined && newValue > max) return;
      onChange?.(newValue);
    };

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleDecrement}
            disabled={disabled || (min !== undefined && value <= min)}
            className={cn(
              'absolute start-0 p-2 rounded-s-lg border border-e-0 transition-colors',
              'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
              'hover:bg-gray-100 dark:hover:bg-gray-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Minus className="w-4 h-4" />
          </motion.button>

          <input
            ref={ref}
            type="number"
            value={value}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              'w-full px-12 py-2 text-center text-sm rounded-lg border transition-all duration-200',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            )}
          />

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleIncrement}
            disabled={disabled || (max !== undefined && value >= max)}
            className={cn(
              'absolute end-0 p-2 rounded-e-lg border border-s-0 transition-colors',
              'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
              'hover:bg-gray-100 dark:hover:bg-gray-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

export default NumberInput;
