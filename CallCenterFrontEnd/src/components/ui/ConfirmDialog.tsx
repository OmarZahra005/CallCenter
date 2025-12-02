import { cn } from '../../utils/cn';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const iconPaths = {
    danger: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  };

  const iconColors = {
    danger: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const buttonVariants = {
    danger: 'danger' as const,
    warning: 'primary' as const,
    info: 'primary' as const,
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                variant === 'danger' && 'bg-red-100 dark:bg-red-900/30',
                variant === 'warning' && 'bg-yellow-100 dark:bg-yellow-900/30',
                variant === 'info' && 'bg-blue-100 dark:bg-blue-900/30'
              )}>
                <svg className={cn('w-5 h-5', iconColors[variant])} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths[variant]} />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </Button>
            <Button variant={buttonVariants[variant]} onClick={onConfirm} disabled={isLoading}>
              {isLoading ? 'Loading...' : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;
