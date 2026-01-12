/**
 * Export Utilities
 * Functions for exporting data to various formats
 */

// Note: These libraries would need to be installed:
// npm install jspdf jspdf-autotable xlsx

/**
 * Export data to CSV
 */
export function exportToCSV(data: any[], filename: string = 'export.csv'): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to Excel
 */
export async function exportToExcel(
  data: any[],
  filename: string = 'export.xlsx',
  sheetName: string = 'Sheet1'
): Promise<void> {
  try {
    // Dynamic import to avoid SSR issues
    const XLSX = await import('xlsx');
    
    if (data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Failed to export to Excel:', error);
    throw error;
  }
}

/**
 * Export data to PDF
 */
export async function exportToPDF(
  data: any[],
  title: string = 'Report',
  filename: string = 'export.pdf'
): Promise<void> {
  try {
    // Dynamic import to avoid SSR issues
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = data.map((row) => headers.map((header) => row[header] ?? ''));

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }, // Blue
      });
    } else {
      doc.setFontSize(12);
      doc.text('No data available', 14, 45);
    }

    doc.save(filename);
  } catch (error) {
    console.error('Failed to export to PDF:', error);
    // Fallback to CSV if PDF export fails
    exportToCSV(data, filename.replace('.pdf', '.csv'));
  }
}

/**
 * Export chart as image
 */
export function exportChartAsImage(
  chartElement: HTMLElement | null,
  filename: string = 'chart.png'
): void {
  if (!chartElement) return;

  const svg = chartElement.querySelector('svg');
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx?.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
}

/**
 * Generate report data structure
 */
export interface ReportData {
  title: string;
  period: { from: Date; to: Date };
  sections: Array<{
    title: string;
    data: any[];
    type: 'table' | 'chart' | 'metrics';
  }>;
  metadata: {
    generatedAt: Date;
    generatedBy: string;
  };
}

/**
 * Export comprehensive report
 */
export async function exportReport(
  report: ReportData,
  format: 'pdf' | 'excel' | 'csv' = 'pdf'
): Promise<void> {
  switch (format) {
    case 'pdf':
      // Combine all sections into one PDF
      const allData = report.sections.flatMap((section) => [
        { _section: section.title },
        ...section.data,
        {}, // Empty row for spacing
      ]);
      await exportToPDF(allData, report.title, `${report.title.replace(/\s+/g, '_')}.pdf`);
      break;
    case 'excel':
      // Create multiple sheets
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();
      
      report.sections.forEach((section, index) => {
        const worksheet = XLSX.utils.json_to_sheet(section.data);
        XLSX.utils.book_append_sheet(workbook, worksheet, section.title.substring(0, 31) || `Sheet${index + 1}`);
      });
      
      XLSX.writeFile(workbook, `${report.title.replace(/\s+/g, '_')}.xlsx`);
      break;
    case 'csv':
      // Export first section as CSV
      if (report.sections.length > 0) {
        exportToCSV(report.sections[0].data, `${report.title.replace(/\s+/g, '_')}.csv`);
      }
      break;
  }
}

