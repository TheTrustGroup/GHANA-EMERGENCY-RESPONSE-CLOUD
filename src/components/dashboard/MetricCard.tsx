'use client';

/**
 * Premium Metric Card Component
 * Reusable metric display with animations and trend indicators
 */

import { useEffect, useState } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: number | string;
  change?: number; // Percentage change
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  accentColor?: string; // Left border color
  iconBg?: string; // Icon background color
  animate?: boolean;
  tooltip?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  accentColor = '#2563eb',
  iconBg = 'bg-blue-100',
  animate = true,
  tooltip,
  className,
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!animate || typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    // Animate counter
    const duration = 1000;
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
    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500';

  return (
    <Card
      className={cn(
        'border-l-4 bg-card/90 dark:bg-card/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group',
        className
      )}
      style={{ borderLeftColor: accentColor }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          {Icon && (
            <div className={cn('rounded-lg p-2 transition-transform group-hover:scale-110', iconBg, 'dark:opacity-90')}>
              <Icon className="h-5 w-5" style={{ color: accentColor }} />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'text-4xl font-bold text-foreground mb-2 transition-opacity duration-500',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
        >
          {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
        </div>
        {change !== undefined && (
          <div className={cn('flex items-center text-xs font-medium', trendColor, 'dark:text-opacity-90')}>
            {TrendIcon && <TrendIcon className="mr-1.5 h-3.5 w-3.5" />}
            <span>
              {change > 0 ? '+' : ''}
              {change.toFixed(1)}%
            </span>
            <span className="ml-1 text-muted-foreground">vs. yesterday</span>
          </div>
        )}
        {tooltip && (
          <p className="mt-2 text-xs text-muted-foreground font-medium">{tooltip}</p>
        )}
      </CardContent>
    </Card>
  );
}
