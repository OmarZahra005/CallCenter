import { cn } from '../../utils/cn';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

const Avatar = ({ src, alt, name, size = 'md', status, className }: AvatarProps) => {
  const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  const statusSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className={cn(
            'rounded-full object-cover',
            sizes[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center font-medium text-primary-600 dark:text-primary-400',
            sizes[size]
          )}
        >
          {name ? getInitials(name) : '?'}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 end-0 block rounded-full ring-2 ring-white dark:ring-gray-800',
            statusColors[status],
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
