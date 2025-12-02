import { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && (
        <div className="mb-4 text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Pre-built empty state variants
const EmptyStateNoData = ({ onAction }: { onAction?: () => void }) => (
  <EmptyState
    icon={
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    }
    title="No data found"
    description="There's nothing here yet. Get started by creating your first item."
    action={onAction ? { label: 'Create New', onClick: onAction } : undefined}
  />
);

const EmptyStateNoResults = ({ onClear }: { onClear?: () => void }) => (
  <EmptyState
    icon={
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    title="No results found"
    description="Try adjusting your search or filter to find what you're looking for."
    action={onClear ? { label: 'Clear Filters', onClick: onClear } : undefined}
  />
);

const EmptyStateError = ({ onRetry }: { onRetry?: () => void }) => (
  <EmptyState
    icon={
      <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    }
    title="Something went wrong"
    description="We couldn't load the data. Please try again."
    action={onRetry ? { label: 'Retry', onClick: onRetry } : undefined}
  />
);

export { EmptyState, EmptyStateNoData, EmptyStateNoResults, EmptyStateError };
export default EmptyState;
