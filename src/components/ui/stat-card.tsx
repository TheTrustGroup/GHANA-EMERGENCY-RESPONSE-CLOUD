/**
 * Stat Card Component
 * Dashboard metric card with trend indicator
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: number; // Percentage change
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  description?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  description,
  className,
}: StatCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return null;
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {change !== undefined && TrendIcon && (
          <div className={cn('flex items-center gap-1 mt-2 text-xs', getTrendColor())}>
            <TrendIcon className="h-3 w-3" aria-hidden="true" />
            <span>
              {Math.abs(change)}% {trend === 'up' ? 'increase' : 'decrease'} from last
              period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

