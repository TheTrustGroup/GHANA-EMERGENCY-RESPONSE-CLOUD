'use client';

/**
 * Export Button Component
 * Dropdown menu for exporting data in various formats
 */

import { Download, FileText, FileSpreadsheet, FileJson, Printer } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { exportToCSV, exportToJSON, exportToExcel, printPage } from '@/lib/export';

interface ExportButtonProps<T extends Record<string, any>> {
  data: T[];
  filename: string;
  headers?: Record<keyof T, string>;
  onExport?: (format: 'csv' | 'excel' | 'json' | 'print') => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function ExportButton<T extends Record<string, any>>({
  data,
  filename,
  headers,
  onExport,
  variant = 'outline',
  size = 'sm',
}: ExportButtonProps<T>) {
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'print') => {
    switch (format) {
      case 'csv':
        exportToCSV(data, filename, headers);
        break;
      case 'excel':
        exportToExcel(data, filename, headers);
        break;
      case 'json':
        exportToJSON(data, filename);
        break;
      case 'print':
        printPage();
        break;
    }
    onExport?.(format);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size === 'md' ? 'default' : size} data-export-trigger>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('print')}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
