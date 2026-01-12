'use client';

/**
 * Premium Quick Action Card Component
 * Consistent action button card with icon, label, and description
 */

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: 'bg-card hover:bg-muted text-foreground border-border dark:bg-card/90 dark:hover:bg-muted/80',
  primary: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-950/70 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800',
  success: 'bg-green-50 hover:bg-green-100 dark:bg-green-950/50 dark:hover:bg-green-950/70 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800',
  warning: 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/50 dark:hover:bg-yellow-950/70 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800',
  danger: 'bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-950/70 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800',
};

export function QuickActionCard({
  icon: Icon,
  label,
  description,
  href,
  onClick,
  variant = 'default',
  className,
}: QuickActionCardProps) {
  const content = (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
        variantStyles[variant],
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'rounded-lg p-2 transition-transform group-hover:scale-110',
            variant === 'primary' ? 'bg-blue-100' :
            variant === 'success' ? 'bg-green-100' :
            variant === 'warning' ? 'bg-yellow-100' :
            variant === 'danger' ? 'bg-red-100' :
            'bg-slate-100'
          )}>
            <Icon className={cn(
              'h-5 w-5',
              variant === 'primary' ? 'text-blue-600' :
              variant === 'success' ? 'text-green-600' :
              variant === 'warning' ? 'text-yellow-600' :
              variant === 'danger' ? 'text-red-600' :
              'text-slate-600'
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-foreground/90 transition-colors">
              {label}
            </h3>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
