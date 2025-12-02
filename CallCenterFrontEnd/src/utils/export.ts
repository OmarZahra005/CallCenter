// CSV Export
export const exportToCSV = <T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
): void => {
  if (data.length === 0) return;

  const headers = columns
    ? columns.map((col) => col.label)
    : Object.keys(data[0]);

  const keys = columns
    ? columns.map((col) => col.key)
    : (Object.keys(data[0]) as Array<keyof T>);

  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      keys
        .map((key) => {
          const value = row[key];
          const stringValue = value === null || value === undefined ? '' : String(value);
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',')
    ),
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

// Excel Export (using CSV with BOM for Excel compatibility)
export const exportToExcel = <T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
): void => {
  if (data.length === 0) return;

  const headers = columns
    ? columns.map((col) => col.label)
    : Object.keys(data[0]);

  const keys = columns
    ? columns.map((col) => col.key)
    : (Object.keys(data[0]) as Array<keyof T>);

  const csvContent = [
    headers.join('\t'),
    ...data.map((row) =>
      keys
        .map((key) => {
          const value = row[key];
          return value === null || value === undefined ? '' : String(value);
        })
        .join('\t')
    ),
  ].join('\n');

  // Add BOM for Excel to recognize UTF-8
  const BOM = '\uFEFF';
  downloadFile(BOM + csvContent, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
};

// JSON Export
export const exportToJSON = <T>(data: T[], filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json;charset=utf-8;');
};

// Helper to download file
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Print functionality
export const printContent = (elementId: string, title?: string): void => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n');
      } catch {
        return '';
      }
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title || 'Print'}</title>
        <style>
          ${styles}
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

// Format data for export
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
