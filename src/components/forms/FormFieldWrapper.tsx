'use client';

/**
 * FormFieldWrapper Component
 * Wrapper for form fields that integrates with react-hook-form
 * Provides consistent error handling and validation feedback
 */

import { ReactNode } from 'react';
import { FieldError } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface FormFieldWrapperProps {
  label: string;
  error?: FieldError | string;
  helpText?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormFieldWrapper({
  label,
  error,
  helpText,
  required,
  children,
  className,
}: FormFieldWrapperProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {helpText && !errorMessage && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      {errorMessage && (
        <p className="text-xs text-destructive flex items-center gap-1" role="alert">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}
