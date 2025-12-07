import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

type MotionConflictProps = 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, MotionConflictProps> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  iconOnly?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, iconOnly, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center font-medium
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
      active:scale-[0.97]
      relative overflow-hidden
    `;

    const variants = {
      primary: `
        bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 text-white
        hover:from-primary-500 hover:via-primary-400 hover:to-primary-500
        focus:ring-primary-500/50
        shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/35
        hover:-translate-y-0.5
      `,
      secondary: `
        bg-gray-100 text-gray-900
        hover:bg-gray-200
        focus:ring-gray-500/50
        dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600
        shadow-sm hover:shadow-md
        hover:-translate-y-0.5
      `,
      outline: `
        border-2 border-gray-200 text-gray-700 bg-transparent
        hover:bg-gray-50 hover:border-gray-300
        focus:ring-primary-500/50
        dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-500
        hover:-translate-y-0.5
      `,
      ghost: `
        text-gray-700 bg-transparent
        hover:bg-gray-100
        focus:ring-gray-500/50
        dark:text-gray-300 dark:hover:bg-gray-800
      `,
      danger: `
        bg-gradient-to-br from-red-600 via-red-500 to-red-600 text-white
        hover:from-red-500 hover:via-red-400 hover:to-red-500
        focus:ring-red-500/50
        shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35
        hover:-translate-y-0.5
      `,
      success: `
        bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-600 text-white
        hover:from-emerald-500 hover:via-emerald-400 hover:to-emerald-500
        focus:ring-emerald-500/50
        shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35
        hover:-translate-y-0.5
      `,
      warning: `
        bg-gradient-to-br from-amber-500 via-amber-400 to-amber-500 text-amber-950
        hover:from-amber-400 hover:via-amber-300 hover:to-amber-400
        focus:ring-amber-500/50
        shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35
        hover:-translate-y-0.5
      `,
      info: `
        bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 text-white
        hover:from-blue-500 hover:via-blue-400 hover:to-blue-500
        focus:ring-blue-500/50
        shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35
        hover:-translate-y-0.5
      `,
    };

    const sizes = {
      xs: 'px-2.5 py-1 text-xs gap-1 rounded-lg',
      sm: 'px-3.5 py-1.5 text-sm gap-1.5 rounded-xl',
      md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
      lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
      xl: 'px-8 py-4 text-lg gap-3 rounded-2xl',
    };

    const iconOnlySizes = {
      xs: 'p-1 rounded-lg',
      sm: 'p-1.5 rounded-xl',
      md: 'p-2.5 rounded-xl',
      lg: 'p-3 rounded-xl',
      xl: 'p-4 rounded-2xl',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          iconOnly ? iconOnlySizes[size] : sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !isLoading ? { scale: 0.97 } : undefined}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        {...props}
      >
        {isLoading ? (
          <motion.svg
            className={cn(
              size === 'xs' ? 'h-3 w-3' :
              size === 'sm' ? 'h-3.5 w-3.5' :
              size === 'xl' ? 'h-5 w-5' :
              'h-4 w-4'
            )}
            fill="none"
            viewBox="0 0 24 24"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </motion.svg>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
