import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'glass' | 'gradient' | 'flat';
  hover?: boolean | 'lift' | 'glow' | 'border';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, padding, children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl transition-all duration-300';

    const variants = {
      default: `
        bg-white dark:bg-gray-800 border border-gray-100/80 dark:border-gray-700/50
        shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_16px_-8px_rgba(0,0,0,0.08)]
      `,
      bordered: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700',
      elevated: `
        bg-white dark:bg-gray-800 border border-gray-100/50 dark:border-gray-700/30
        shadow-[0_2px_4px_rgba(0,0,0,0.02),0_4px_8px_rgba(0,0,0,0.04),0_16px_32px_rgba(0,0,0,0.06),0_32px_64px_rgba(0,0,0,0.04)]
      `,
      glass: `
        bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl
        border border-white/30 dark:border-gray-700/30
        shadow-[0_8px_32px_rgba(0,0,0,0.08)]
      `,
      gradient: `
        bg-white dark:bg-gray-800 border border-gray-100/50 dark:border-gray-700/30
        shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_16px_-8px_rgba(0,0,0,0.08)]
        bg-gradient-to-br from-white via-white to-gray-50/50
        dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50
      `,
      flat: 'bg-gray-50 dark:bg-gray-800/50',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const getHoverAnimation = () => {
      if (!hover) return undefined;

      if (hover === 'glow') {
        return {
          y: -2,
          boxShadow: '0 0 0 1px rgba(139, 126, 255, 0.1), 0 4px 8px rgba(0, 0, 0, 0.04), 0 16px 32px -8px rgba(0, 0, 0, 0.12), 0 0 40px rgba(139, 126, 255, 0.1)',
        };
      }

      if (hover === 'border') {
        return {
          y: -2,
          borderColor: 'rgba(139, 126, 255, 0.3)',
        };
      }

      // Default 'lift' hover
      return {
        y: -4,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.04), 0 16px 32px -8px rgba(0, 0, 0, 0.12)',
      };
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          padding && paddings[padding],
          className
        )}
        whileHover={getHoverAnimation()}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-6 py-4 border-b border-gray-100 dark:border-gray-700/50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-5', className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-6 py-4 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30 rounded-b-2xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
export default Card;
