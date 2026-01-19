'use client';

/**
 * Enhanced Textarea Component
 * Improved accessibility, validation feedback, and user experience
 */

import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { getFieldAriaLabel, getFieldAriaDescription } from '@/lib/accessibility/aria';

export interface EnhancedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helpText?: string;
  success?: boolean;
  required?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
}

export const EnhancedTextarea = forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  (
    {
      label,
      error,
      helpText,
      success,
      required,
      maxLength,
      showCharCount,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const inputId = id || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helpId = helpText ? `${inputId}-help` : undefined;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCharCount && maxLength) {
        setCharCount(e.target.value.length);
      }
      props.onChange?.(e);
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium',
              error && 'text-destructive',
              success && 'text-success',
              required && "after:content-['*'] after:ml-1 after:text-destructive"
            )}
          >
            {label}
          </Label>
          {showCharCount && maxLength && (
            <span
              className={cn(
                'text-xs text-muted-foreground',
                charCount > maxLength * 0.9 && 'text-warning',
                charCount >= maxLength && 'text-destructive'
              )}
              aria-live="polite"
            >
              {charCount} / {maxLength}
            </span>
          )}
        </div>

        <div className="relative">
          <Textarea
            ref={ref}
            id={inputId}
            className={cn(
              'transition-all duration-200 resize-y',
              error &&
                'border-destructive focus:border-destructive focus:ring-destructive',
              success &&
                'border-success focus:border-success focus:ring-success',
              isFocused && !error && !success && 'ring-2 ring-primary ring-offset-2',
              className
            )}
            aria-label={getFieldAriaLabel(label, required, !!error)}
            aria-describedby={cn(errorId, helpId)}
            aria-invalid={error ? 'true' : 'false'}
            aria-required={required ? 'true' : 'false'}
            maxLength={maxLength}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleChange}
            {...props}
          />

          {/* Success indicator */}
          {success && !error && (
            <div className="absolute right-3 top-3 text-success">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </div>
          )}

          {/* Error indicator */}
          {error && (
            <div className="absolute right-3 top-3 text-destructive">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Help text */}
        {helpText && !error && (
          <p
            id={helpId}
            className="text-xs text-muted-foreground"
            aria-label={getFieldAriaDescription(helpText)}
          >
            {helpText}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className="text-xs text-destructive flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

EnhancedTextarea.displayName = 'EnhancedTextarea';
