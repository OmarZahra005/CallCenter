import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'flushed';
  showCharCount?: boolean;
  maxLength?: number;
  success?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    label,
    error,
    helperText,
    id,
    leftIcon,
    rightIcon,
    size = 'md',
    variant = 'default',
    showCharCount = false,
    maxLength,
    success = false,
    onFocus,
    onBlur,
    onChange,
    value,
    defaultValue,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(
      (value as string)?.length || (defaultValue as string)?.length || 0
    );

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    const variants = {
      default: cn(
        'border rounded-xl bg-white dark:bg-gray-800',
        'border-gray-200 dark:border-gray-700',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(0,0,0,0.02)]',
        'focus:border-primary-500 dark:focus:border-primary-400',
        'focus:shadow-[0_0_0_3px_rgba(139,126,255,0.15),0_1px_2px_rgba(0,0,0,0.04)]'
      ),
      filled: cn(
        'border-0 rounded-xl bg-gray-100 dark:bg-gray-800',
        'focus:bg-gray-50 dark:focus:bg-gray-700',
        'focus:ring-2 focus:ring-primary-500/20'
      ),
      flushed: cn(
        'border-0 border-b-2 rounded-none bg-transparent px-0',
        'border-gray-200 dark:border-gray-700',
        'focus:border-primary-500 dark:focus:border-primary-400'
      ),
    };

    return (
      <div className="w-full">
        {label && (
          <motion.label
            htmlFor={id}
            className={cn(
              'block font-medium text-gray-700 dark:text-gray-300 mb-1.5',
              size === 'sm' ? 'text-xs' : 'text-sm'
            )}
            animate={{
              color: isFocused
                ? 'rgb(139, 126, 255)'
                : error
                  ? 'rgb(239, 68, 68)'
                  : success
                    ? 'rgb(16, 185, 129)'
                    : undefined
            }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        <div className="relative">
          {leftIcon && (
            <motion.div
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2',
                isFocused ? 'text-primary-500' : 'text-gray-400'
              )}
              animate={{ color: isFocused ? 'rgb(139, 126, 255)' : 'rgb(156, 163, 175)' }}
              transition={{ duration: 0.2 }}
            >
              {leftIcon}
            </motion.div>
          )}
          <motion.input
            ref={ref}
            id={id}
            value={value}
            defaultValue={defaultValue}
            maxLength={maxLength}
            className={cn(
              'w-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
              'transition-all duration-200',
              'focus:outline-none',
              sizes[size],
              variants[variant],
              error && 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]',
              success && !error && 'border-emerald-500 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            animate={error ? { x: [0, -4, 4, -4, 4, 0] } : undefined}
            transition={error ? { duration: 0.4 } : undefined}
            {...props}
          />
          {rightIcon && (
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              animate={{
                color: error
                  ? 'rgb(239, 68, 68)'
                  : success
                    ? 'rgb(16, 185, 129)'
                    : isFocused
                      ? 'rgb(139, 126, 255)'
                      : 'rgb(156, 163, 175)'
              }}
              transition={{ duration: 0.2 }}
            >
              {rightIcon}
            </motion.div>
          )}

          {/* Success indicator */}
          <AnimatePresence>
            {success && !error && !rightIcon && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-start mt-1.5 gap-2">
          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </motion.p>
            )}
            {helperText && !error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                {helperText}
              </motion.p>
            )}
          </AnimatePresence>

          {showCharCount && maxLength && (
            <motion.span
              className={cn(
                'text-xs ml-auto flex-shrink-0',
                charCount >= maxLength ? 'text-red-500' : 'text-gray-400'
              )}
              animate={charCount >= maxLength ? { scale: [1, 1.1, 1] } : undefined}
              transition={{ duration: 0.2 }}
            >
              {charCount}/{maxLength}
            </motion.span>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
