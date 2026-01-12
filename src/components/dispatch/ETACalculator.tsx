'use client';

/**
 * ETACalculator Component
 * Calculate and display estimated time of arrival
 */

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { calculateETA, formatETA, getTimeOfDay } from '@/lib/dispatch-logic';

interface ETACalculatorProps {
  responderLocation: { latitude: number; longitude: number } | null;
  incidentLocation: { latitude: number; longitude: number };
  updateInterval?: number; // milliseconds
}

export function ETACalculator({
  responderLocation,
  incidentLocation,
  updateInterval = 30000, // 30 seconds
}: ETACalculatorProps) {
  const [eta, setEta] = useState<number | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<'rush_hour' | 'normal' | 'night'>('normal');

  useEffect(() => {
    if (!responderLocation) {
      setEta(null);
      return;
    }

    const updateETA = () => {
      const currentTimeOfDay = getTimeOfDay();
      setTimeOfDay(currentTimeOfDay);
      const calculatedETA = calculateETA(responderLocation, incidentLocation, currentTimeOfDay);
      setEta(calculatedETA);
    };

    // Initial calculation
    updateETA();

    // Update periodically
    const interval = setInterval(updateETA, updateInterval);

    return () => clearInterval(interval);
  }, [responderLocation, incidentLocation, updateInterval]);

  if (!responderLocation || eta === null) {
    return (
      <Card className="p-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>ETA: Calculating...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Estimated Arrival</div>
            <div className="text-xs text-muted-foreground">
              {timeOfDay === 'rush_hour' && 'Rush hour traffic'}
              {timeOfDay === 'night' && 'Night time'}
              {timeOfDay === 'normal' && 'Normal traffic'}
            </div>
          </div>
        </div>
        <div className="text-lg font-bold text-blue-600">{formatETA(eta)}</div>
      </div>
    </Card>
  );
}

