'use client';

/**
 * MetricCard Component
 * Displays a single metric with trend and sparkline
 */

import { ArrowDown, ArrowUp, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useSpring, animated } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
  label: string;
  value: number | string;
  change?: number; // Percentage change
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ElementType;
  iconColor?: string;
  comparison?: string; // e.g., "vs. last period"
  sparkline?: Array<{ date: string; value: number }>;
  onClick?: () => void;
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  iconColor = 'text-blue-600',
  comparison,
  sparkline,
  onClick,
  className,
}: MetricCardProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  const animatedValue = useSpring({
    from: { number: 0 },
    number: inView && typeof value === 'number' ? value : 0,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 },
  });

  const displayValue = typeof value === 'number' ? (
    <animated.span>
      {animatedValue.number.to((n) => Math.round(n).toLocaleString())}
    </animated.span>
  ) : (
    value
  );

  return (
    <Card
      className={cn('cursor-pointer transition-all hover:shadow-md', className)}
      onClick={onClick}
      ref={ref}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {Icon && <Icon className={cn('h-4 w-4', iconColor)} />}
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', iconColor)}>{displayValue}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            {trend === 'up' && <ArrowUp className="h-3 w-3 text-green-500" />}
            {trend === 'down' && <ArrowDown className="h-3 w-3 text-red-500" />}
            {trend === 'neutral' && <TrendingUp className="h-3 w-3 text-gray-500" />}
            <span
              className={cn(
                change > 0 && 'text-green-500',
                change < 0 && 'text-red-500',
                change === 0 && 'text-gray-500'
              )}
            >
              {Math.abs(change).toFixed(1)}%
            </span>
            {comparison && <span className="text-muted-foreground ml-1">{comparison}</span>}
          </div>
        )}
        {sparkline && sparkline.length > 0 && (
          <div className="mt-3 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkline}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={iconColor.replace('text-', '#') || '#3b82f6'}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

