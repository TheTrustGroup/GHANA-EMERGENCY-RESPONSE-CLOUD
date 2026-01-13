'use client';

/**
 * useLocationTracking Hook
 * Custom hook for GPS location tracking
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

interface UseLocationTrackingOptions {
  enabled?: boolean;
  updateInterval?: number; // milliseconds
  dispatchId?: string;
  onLocationUpdate?: (location: Location) => void;
}

export function useLocationTracking({
  enabled = false,
  updateInterval = 30000, // 30 seconds
  dispatchId,
  onLocationUpdate,
}: UseLocationTrackingOptions = {}) {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const { toast } = useToast();

  const updateLocationMutation = trpc.dispatch.updateLocation.useMutation({
    onError: (error) => {
      console.error('Failed to update location:', error);
      toast({
        title: 'Location Update Failed',
        description: 'Could not send location to server',
        variant: 'destructive',
      });
    },
  });

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return false;
    }

    // Check if permissions API is available
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(result.state);

      } catch (e) {
        // Permissions API might not be fully supported
        console.warn('Permissions API not fully supported:', e);
      }
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setError(null);
          resolve(true);
        },
        (err) => {
          setError(err.message);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  const updateLocation = useCallback(
    (position: GeolocationPosition) => {
      const newLocation: Location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp),
      };

      setLocation(newLocation);
      setError(null);
      onLocationUpdate?.(newLocation);

      // Send to server if dispatch ID is provided
      if (dispatchId) {
        updateLocationMutation.mutate({
          id: dispatchId,
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
        });
      }
    },
    [dispatchId, onLocationUpdate, updateLocationMutation]
  );

  const startTracking = useCallback(async () => {
    if (!enabled) return;

    const hasPermission = await requestPermission();
    if (!hasPermission) {
      setError('Location permission denied');
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation not available');
      return;
    }

    setIsTracking(true);
    setError(null);

    // Get initial location
    navigator.geolocation.getCurrentPosition(updateLocation, (err) => {
      setError(err.message);
      setIsTracking(false);
    });

    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      updateLocation,
      (err) => {
        setError(err.message);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: updateInterval,
        maximumAge: 0,
      }
    );
  }, [enabled, requestPermission, updateLocation, updateInterval]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [enabled, startTracking, stopTracking]);

  return {
    location,
    error,
    isTracking,
    permissionStatus,
    requestPermission,
    startTracking,
    stopTracking,
  };
}

