'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center
      font-semibold rounded-xl
      transition-all duration-200
      focus:outline-none focus:ring-4 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      relative overflow-hidden
      group
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-red-600 to-red-700
        hover:from-red-700 hover:to-red-800
        text-white
        shadow-lg shadow-red-500/50
        hover:shadow-xl hover:shadow-red-500/60
        hover:scale-[1.02]
        active:scale-[0.98]
        focus:ring-red-500/50
      `,
      secondary: `
        bg-gradient-to-r from-blue-600 to-blue-700
        hover:from-blue-700 hover:to-blue-800
        text-white
        shadow-lg shadow-blue-500/50
        hover:shadow-xl hover:shadow-blue-500/60
        hover:scale-[1.02]
        active:scale-[0.98]
        focus:ring-blue-500/50
      `,
      success: `
        bg-gradient-to-r from-green-600 to-green-700
        hover:from-green-700 hover:to-green-800
        text-white
        shadow-lg shadow-green-500/50
        hover:shadow-xl hover:shadow-green-500/60
        hover:scale-[1.02]
        active:scale-[0.98]
        focus:ring-green-500/50
      `,
      danger: `
        bg-gradient-to-r from-red-600 to-pink-600
        hover:from-red-700 hover:to-pink-700
        text-white
        shadow-lg shadow-red-500/50
        hover:shadow-xl hover:shadow-red-500/60
        hover:scale-[1.02]
        active:scale-[0.98]
        focus:ring-red-500/50
      `,
      ghost: `
        bg-transparent
        hover:bg-gray-100
        dark:hover:bg-gray-800
        text-gray-700
        dark:text-gray-300
        hover:scale-[1.02]
        active:scale-[0.98]
      `,
      outline: `
        bg-transparent
        border-2 border-gray-300
        hover:border-gray-400
        dark:border-gray-600
        dark:hover:border-gray-500
        text-gray-700
        dark:text-gray-300
        hover:bg-gray-50
        dark:hover:bg-gray-800
        hover:scale-[1.02]
        active:scale-[0.98]
      `,
    };

    const sizes = {
      xs: 'px-3 py-1.5 text-xs gap-1.5',
      sm: 'px-4 py-2 text-sm gap-2',
      md: 'px-6 py-3 text-base gap-2',
      lg: 'px-8 py-4 text-lg gap-3',
      xl: 'px-10 py-5 text-xl gap-3',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {/* Shine effect on hover */}
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </span>

        {/* Content */}
        <span className="relative flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : icon && iconPosition === 'left' ? (
            <span className="flex-shrink-0">{icon}</span>
          ) : null}
          
          {children}
          
          {!loading && icon && iconPosition === 'right' ? (
            <span className="flex-shrink-0">{icon}</span>
          ) : null}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
