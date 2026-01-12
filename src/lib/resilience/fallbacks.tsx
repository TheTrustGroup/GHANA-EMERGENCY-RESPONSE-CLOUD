/**
 * Resilience & Fallback Utilities
 * Graceful degradation when services fail
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pusherClient } from '@/lib/realtime/pusher-client';

/**
 * Fallback polling when Pusher real-time connection fails
 */
export function useFallbackPolling<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  enabled: boolean = true,
  interval: number = 30000
) {
  const [pusherConnected, setPusherConnected] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check Pusher connection status
    const checkConnection = () => {
      if (pusherClient && pusherClient.connection) {
        const state = pusherClient.connection.state;
        setPusherConnected(state === 'connected' || state === 'connecting');
      } else {
        setPusherConnected(false);
      }
    };

    // Initial check
    checkConnection();

    // Monitor connection state
    const intervalId = setInterval(checkConnection, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Use polling if Pusher fails
  return useQuery({
    queryKey,
    queryFn,
    enabled: !pusherConnected && enabled,
    refetchInterval: !pusherConnected ? interval : false,
  });
}

/**
 * Map fallback component when Mapbox fails to load
 */
export function MapFallback({
  latitude,
  longitude,
  address,
}: {
  latitude: number;
  longitude: number;
  address?: string;
}) {
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="bg-gray-100 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="font-semibold text-gray-700 mb-2">Map Temporarily Unavailable</p>
      {address && <p className="text-sm text-gray-600 mb-4">{address}</p>}
      <p className="text-sm text-gray-600 mb-4">
        Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </p>
      <Button
        variant="outline"
        onClick={() => {
          window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
        }}
      >
        Open in Google Maps
      </Button>
    </div>
  );
}

/**
 * Online/offline status hook
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Offline banner component
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-white px-4 py-2 text-center z-50 shadow-lg">
      <p className="font-semibold text-sm">
        ⚠️ You're offline. Actions will be queued and sent when connection returns.
      </p>
    </div>
  );
}

/**
 * Retry utility with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Safe async wrapper that never throws
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error('Safe async error:', error);
    return fallback;
  }
}
