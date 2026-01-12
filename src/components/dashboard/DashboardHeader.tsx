'use client';

/**
 * Premium Dashboard Header Component
 * Consistent header with breadcrumb, title, and actions
 */

import { ReactNode } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function DashboardHeader({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn('border-b border-border bg-card/80 dark:bg-card/90 backdrop-blur-md sticky top-0 z-20', className)}>
      <div className="px-6 sm:px-8 py-4 sm:py-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
            <Link
              href="/dashboard"
              className="hover:text-foreground transition-colors flex items-center"
            >
              <Home className="h-4 w-4" />
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Title and Description */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                {title}
              </h1>
              {badge && <div>{badge}</div>}
            </div>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
