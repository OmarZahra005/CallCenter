import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  shimmer?: boolean;
  variant?: 'default' | 'wave' | 'pulse';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Skeleton = ({ className, shimmer = true, variant = 'wave', rounded = 'lg' }: SkeletonProps) => {
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  if (variant === 'pulse') {
    return (
      <motion.div
        className={cn(
          'bg-gray-200 dark:bg-gray-700',
          roundedClasses[rounded],
          className
        )}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    );
  }

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700 overflow-hidden relative',
        roundedClasses[rounded],
        shimmer && variant === 'wave' && 'skeleton-wave',
        shimmer && variant === 'default' && 'shimmer',
        className
      )}
    />
  );
};

// Pre-built skeleton variants
const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cn('space-y-2.5', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        rounded="md"
      />
    ))}
  </div>
);

const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('p-5 space-y-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50', className)}>
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10" rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" rounded="md" />
        <Skeleton className="h-3 w-1/2" rounded="md" />
      </div>
    </div>
    <SkeletonText lines={3} />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 w-20" rounded="lg" />
      <Skeleton className="h-8 w-20" rounded="lg" />
    </div>
  </div>
);

const SkeletonTable = ({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex gap-4 pb-2 border-b border-gray-100 dark:border-gray-700/50">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" rounded="md" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 items-center py-1">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton
            key={j}
            className={cn(
              'h-6 flex-1',
              j === 0 && 'max-w-[120px]',
            )}
            rounded="md"
          />
        ))}
      </div>
    ))}
  </div>
);

const SkeletonAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };
  return <Skeleton className={sizes[size]} rounded="full" />;
};

const SkeletonMetricCard = ({ className }: { className?: string }) => (
  <div className={cn('p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50', className)}>
    <div className="flex justify-between items-start mb-3">
      <Skeleton className="h-4 w-24" rounded="md" />
      <Skeleton className="h-8 w-8" rounded="lg" />
    </div>
    <Skeleton className="h-8 w-20 mb-2" rounded="md" />
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-12" rounded="md" />
      <Skeleton className="h-4 w-16" rounded="md" />
    </div>
  </div>
);

const SkeletonList = ({ items = 5, className }: { items?: number; className?: string }) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 flex-shrink-0" rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" rounded="md" />
          <Skeleton className="h-3 w-1/2" rounded="md" />
        </div>
      </div>
    ))}
  </div>
);

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonAvatar, SkeletonMetricCard, SkeletonList };
export default Skeleton;
