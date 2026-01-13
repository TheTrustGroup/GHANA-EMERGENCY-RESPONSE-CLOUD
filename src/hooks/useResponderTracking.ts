'use client';

/**
 * useResponderTracking Hook
 * Tracks responder locations and updates map markers
 */

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface Responder {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'available' | 'dispatched';
  incidentId?: string;
}

interface UseResponderTrackingProps {
  map: mapboxgl.Map | null;
  responders: Responder[];
  showRoutes?: boolean;
}

export function useResponderTracking({
  map,
  responders,
  showRoutes = false,
}: UseResponderTrackingProps) {
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const routesRef = useRef<Map<string, any>>(new Map());
  const [previousPositions, setPreviousPositions] = useState<Map<string, { lat: number; lng: number }>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!map) return;

    // Remove markers that no longer exist
    const currentIds = new Set(responders.map((r) => r.id));
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
        routesRef.current.get(id)?.remove();
        routesRef.current.delete(id);
      }
    });

    // Add/update responder markers
    responders.forEach((responder) => {
      const existingMarker = markersRef.current.get(responder.id);
      const color = responder.status === 'dispatched' ? '#9333ea' : '#10b981'; // Purple for dispatched, green for available
      const prevPos = previousPositions.get(responder.id);

      if (existingMarker) {
        // Update marker position with high accuracy
        const currentLngLat = existingMarker.getLngLat();
        const newLngLat = [responder.longitude, responder.latitude] as [number, number];

        // Calculate distance moved (in degrees)
        const latDiff = Math.abs(currentLngLat.lat - newLngLat[1]);
        const lngDiff = Math.abs(currentLngLat.lng - newLngLat[0]);

        // Only animate if moved significantly (more than ~10 meters)
        if (prevPos && (latDiff > 0.0001 || lngDiff > 0.0001)) {
          // Smooth animation for significant movements
          const startPos = [prevPos.lng, prevPos.lat] as [number, number];
          const endPos = newLngLat;

          let progress = 0;
          const duration = 500; // Faster updates for real-time tracking
          const startTime = Date.now();

          const animate = () => {
            const elapsed = Date.now() - startTime;
            progress = Math.min(elapsed / duration, 1);

            const currentLng = startPos[0] + (endPos[0] - startPos[0]) * progress;
            const currentLat = startPos[1] + (endPos[1] - startPos[1]) * progress;

            existingMarker.setLngLat([currentLng, currentLat]);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              // Update previous position after animation completes
              setPreviousPositions((prev) => {
                const newMap = new Map(prev);
                newMap.set(responder.id, { lat: responder.latitude, lng: responder.longitude });
                return newMap;
              });
            }
          };

          animate();
        } else if (latDiff > 0.00001 || lngDiff > 0.00001) {
          // Small movements: update immediately without animation
          existingMarker.setLngLat(newLngLat);
        }
      } else {
        // Create new marker
        const el = document.createElement('div');
        el.className = 'responder-marker';
        el.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2" opacity="0.9"/>
            <path d="M12 6v6l4 2" stroke="white" stroke-width="2" fill="none"/>
          </svg>
        `;
        el.style.cursor = 'pointer';

        // Escape HTML to prevent XSS
        const escapeHtml = (text: string) => {
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        };

        const marker = new mapboxgl.Marker(el)
          .setLngLat([responder.longitude, responder.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-sm">${escapeHtml(responder.name)}</h3>
                <div class="mt-1 text-xs">
                  <div>Status: ${escapeHtml(responder.status)}</div>
                </div>
              </div>
            `)
          )
          .addTo(map);

        markersRef.current.set(responder.id, marker);
      }

      // Update route line if dispatched
      if (showRoutes && responder.status === 'dispatched' && responder.incidentId) {
        // TODO: Get incident location and draw route
        // For now, just store the responder position
      }

      // Update previous position only if marker was just created
      if (!existingMarker) {
        setPreviousPositions((prev) => {
          const newMap = new Map(prev);
          newMap.set(responder.id, { lat: responder.latitude, lng: responder.longitude });
          return newMap;
        });
      }
    });

    return () => {
      // Cleanup handled by map removal
    };
  }, [map, responders, showRoutes, previousPositions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      routesRef.current.forEach((route) => route.remove());
      routesRef.current.clear();
    };
  }, []);

  return {
    markers: markersRef.current,
  };
}

