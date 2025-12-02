import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={cn(
              'w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700',
              className
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ms-3">
            {label && (
              <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
