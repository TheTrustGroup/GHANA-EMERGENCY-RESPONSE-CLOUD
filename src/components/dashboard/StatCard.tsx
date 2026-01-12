'use client';

/**
 * StatCard Component
 * Card displaying a metric with optional change indicator and trend
 */

import { useEffect, useState } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  change?: number; // Percentage change
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  tooltip?: string;
  animate?: boolean;
}

const colorClasses = {
  default: 'text-blue-600',
  primary: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
};

export function StatCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  color = 'default',
  tooltip,
  animate = true,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(0);

  useEffect(() => {
    if (!animate || typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    // Animate counter
    const duration = 1000; // 1 second
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, value);
      setDisplayValue(Math.floor(current));

      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, animate]);

  const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  const TrendIcon = trendIcon;
  const trendColor =
    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground';

  return (
    <Card className="relative premium-card group hover:scale-[1.02] transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground">{label}</CardTitle>
        {Icon && (
          <div className={cn(
            'rounded-lg p-2 premium-shadow-sm',
            color === 'danger' ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400' :
            color === 'warning' ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400' :
            color === 'success' ? 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400' :
            'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
          )}>
            <Icon className={cn('h-5 w-5', colorClasses[color], 'dark:opacity-90')} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground mb-2">{displayValue.toLocaleString()}</div>
        {change !== undefined && (
          <div className={cn('flex items-center text-xs font-medium', trendColor, 'dark:text-opacity-90')}>
            {TrendIcon && <TrendIcon className="mr-1.5 h-3.5 w-3.5" />}
            <span>
              {change > 0 ? '+' : ''}
              {change.toFixed(1)}% from last 24h
            </span>
          </div>
        )}
        {tooltip && (
          <p className="mt-2 text-xs text-muted-foreground font-medium">{tooltip}</p>
        )}
      </CardContent>
    </Card>
  );
}

