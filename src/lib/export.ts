/**
 * Export Utilities
 * Functions for exporting data to CSV, Excel, and PDF
 */

import { format } from 'date-fns';

/**
 * Export data to CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers
  const csvHeaders = headers
    ? Object.values(headers)
    : Object.keys(data[0] as Record<string, any>);

  // Create CSV content
  const csvContent = [
    csvHeaders.join(','),
    ...data.map((row) =>
      Object.values(row)
        .map((value) => {
          // Escape commas and quotes
          const stringValue = String(value ?? '');
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to JSON
 */
export function exportToJSON<T>(data: T, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export table to Excel (CSV format, can be opened in Excel)
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>
): void {
  // Excel can open CSV files, so we use CSV format
  exportToCSV(data, filename, headers);
}

/**
 * Print current page
 */
export function printPage(): void {
  window.print();
}

/**
 * Export data as printable HTML
 */
export function exportToPrintableHTML(
  title: string,
  content: string,
  styles?: string
): void {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <style>
          ${styles || ''}
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
            @page { margin: 1cm; }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1e293b;
            line-height: 1.6;
          }
          h1 { color: #0f172a; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: 600; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated: ${format(new Date(), 'PPpp')}</p>
        ${content}
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.onload = () => {
      win.print();
    };
  }
}
