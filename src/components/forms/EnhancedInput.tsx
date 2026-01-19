'use client';

/**
 * Enhanced Input Component
 * Improved accessibility, validation feedback, and user experience
 */

import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { getFieldAriaLabel, getFieldAriaDescription } from '@/lib/accessibility/aria';

export interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
  success?: boolean;
  required?: boolean;
  showPasswordToggle?: boolean;
  icon?: React.ReactNode;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      label,
      error,
      helpText,
      success,
      required,
      showPasswordToggle,
      icon,
      className,
      id,
      type,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helpId = helpText ? `${inputId}-help` : undefined;
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="space-y-2">
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

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}

          <Input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              'transition-all duration-200',
              icon && 'pl-10',
              isPassword && showPasswordToggle && 'pr-10',
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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Password toggle */}
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}

          {/* Success indicator */}
          {success && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </div>
          )}

          {/* Error indicator */}
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
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

EnhancedInput.displayName = 'EnhancedInput';
