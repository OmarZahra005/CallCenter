import { cn } from '../../utils/cn';
import { printContent } from '../../utils/export';

interface PrintButtonProps {
  targetId: string;
  title?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export const PrintButton = ({
  targetId,
  title,
  className,
  disabled = false,
  label = 'Print',
}: PrintButtonProps) => {
  return (
    <button
      onClick={() => printContent(targetId, title)}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
        'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
        'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      {label}
    </button>
  );
};

export default PrintButton;
