'use client';

/**
 * Real-Time Indicator Component
 * Shows real-time data update status
 */

import { Radio, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/accessibility/keyboard';

interface RealTimeIndicatorProps {
  isLive?: boolean;
  lastUpdate?: Date;
  updateInterval?: number;
  className?: string;
}

export function RealTimeIndicator({
  isLive = true,
  lastUpdate,
  updateInterval: _updateInterval = 30000,
  className,
}: RealTimeIndicatorProps) {
  const reducedMotion = prefersReducedMotion();

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Never';
    const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-xs',
        className
      )}
    >
      {isLive ? (
        <>
          <motion.div
            animate={reducedMotion ? {} : { scale: [1, 1.2, 1] }}
            transition={reducedMotion ? {} : { duration: 2, repeat: Infinity }}
            className="relative"
          >
            <Radio className="h-3 w-3 text-green-600" aria-hidden="true" />
            {!reducedMotion && (
              <motion.span
                className="absolute inset-0 rounded-full bg-green-600 opacity-75"
                animate={{ scale: [1, 2, 1], opacity: [0.75, 0, 0.75] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
          <Wifi className="h-3 w-3 text-green-600" aria-hidden="true" />
          <span className="font-medium text-green-700 dark:text-green-400">
            Live
          </span>
          {lastUpdate && (
            <span className="text-muted-foreground">
              Updated {formatLastUpdate()}
            </span>
          )}
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">Offline</span>
        </>
      )}
    </div>
  );
}
