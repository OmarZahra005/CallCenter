import { useState } from 'react';
import { cn } from '../../utils/cn';
import { exportToCSV, exportToExcel, exportToJSON } from '../../utils/export';

type ExportFormat = 'csv' | 'excel' | 'json';

interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  filename: string;
  columns?: { key: keyof T; label: string }[];
  formats?: ExportFormat[];
  className?: string;
  disabled?: boolean;
}

export const ExportButton = <T extends Record<string, unknown>>({
  data,
  filename,
  columns,
  formats = ['csv', 'excel', 'json'],
  className,
  disabled = false,
}: ExportButtonProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        exportToCSV(data, filename, columns);
        break;
      case 'excel':
        exportToExcel(data, filename, columns);
        break;
      case 'json':
        exportToJSON(data, filename);
        break;
    }
    setIsOpen(false);
  };

  const formatLabels: Record<ExportFormat, string> = {
    csv: 'CSV',
    excel: 'Excel',
    json: 'JSON',
  };

  const formatIcons: Record<ExportFormat, string> = {
    csv: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    excel: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    json: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  };

  if (formats.length === 1) {
    return (
      <button
        onClick={() => handleExport(formats[0])}
        disabled={disabled || data.length === 0}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
          'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export {formatLabels[formats[0]]}
      </button>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || data.length === 0}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
          'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute end-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            {formats.map((format) => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={formatIcons[format]} />
                </svg>
                {formatLabels[format]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
