import { cn } from '../../utils/cn';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink = ({ href, children, className }: SkipLinkProps) => {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]',
        'focus:bg-white focus:dark:bg-gray-800 focus:px-4 focus:py-2 focus:rounded-lg',
        'focus:shadow-lg focus:border focus:border-gray-200 focus:dark:border-gray-700',
        'focus:text-primary-600 focus:dark:text-primary-400 focus:font-medium',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        className
      )}
    >
      {children}
    </a>
  );
};

export default SkipLink;
