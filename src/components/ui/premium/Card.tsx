'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'gradient';
  hoverable?: boolean;
  clickable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      hoverable = false,
      clickable = false,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      rounded-2xl
      transition-all duration-300
      overflow-hidden
    `;

    const variants = {
      default: `
        bg-white
        dark:bg-gray-800
        border border-gray-200
        dark:border-gray-700
      `,
      bordered: `
        bg-white
        dark:bg-gray-800
        border-2 border-gray-200
        dark:border-gray-700
      `,
      elevated: `
        bg-white
        dark:bg-gray-800
        shadow-xl
        border border-gray-100
        dark:border-gray-800
      `,
      gradient: `
        bg-gradient-to-br from-white to-gray-50
        dark:from-gray-800 dark:to-gray-900
        border border-gray-200
        dark:border-gray-700
      `,
    };

    const hoverStyles = hoverable
      ? `
        hover:shadow-2xl
        hover:scale-[1.01]
        hover:-translate-y-1
      `
      : '';

    const clickableStyles = clickable
      ? `
        cursor-pointer
        active:scale-[0.99]
      `
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          hoverStyles,
          clickableStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-6 py-5 border-b border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-xl font-bold text-gray-900 dark:text-white',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6', className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
