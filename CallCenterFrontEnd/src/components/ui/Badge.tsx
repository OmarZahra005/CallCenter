import { type HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

type MotionConflictProps = 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd';

interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, MotionConflictProps> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  pulse?: boolean;
  dot?: boolean;
  glow?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', shape = 'pill', pulse = false, dot = false, glow = false, icon, children, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      danger: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      primary: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    };

    const dotColors = {
      default: 'bg-gray-500',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
      info: 'bg-blue-500',
      primary: 'bg-primary-500',
    };

    const glowColors = {
      default: 'shadow-gray-500/20',
      success: 'shadow-emerald-500/30',
      warning: 'shadow-amber-500/30',
      danger: 'shadow-red-500/30',
      info: 'shadow-blue-500/30',
      primary: 'shadow-primary-500/30',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-1 text-xs gap-1.5',
      lg: 'px-3 py-1.5 text-sm gap-1.5',
    };

    const shapes = {
      rounded: 'rounded-lg',
      pill: 'rounded-full',
      square: 'rounded-md',
    };

    return (
      <motion.span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium',
          variants[variant],
          sizes[size],
          shapes[shape],
          glow && `shadow-lg ${glowColors[variant]}`,
          className
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        {...props}
      >
        {dot && (
          <motion.span
            className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])}
            animate={pulse ? {
              scale: [1, 1.3, 1],
              opacity: [1, 0.7, 1],
            } : undefined}
            transition={pulse ? {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            } : undefined}
          />
        )}
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </motion.span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
