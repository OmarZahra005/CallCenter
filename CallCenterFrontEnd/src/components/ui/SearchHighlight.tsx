import { useMemo } from 'react';

interface SearchHighlightProps {
  text: string;
  query: string;
  highlightClassName?: string;
  className?: string;
}

export const SearchHighlight = ({
  text,
  query,
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100 rounded px-0.5',
  className,
}: SearchHighlightProps) => {
  const parts = useMemo(() => {
    if (!query.trim()) return [{ text, highlight: false }];

    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const segments = text.split(regex);

    return segments.map((segment, index) => ({
      text: segment,
      highlight: index % 2 === 1,
    }));
  }, [text, query]);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.highlight ? (
          <mark key={index} className={highlightClassName}>
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </span>
  );
};

// Escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default SearchHighlight;
