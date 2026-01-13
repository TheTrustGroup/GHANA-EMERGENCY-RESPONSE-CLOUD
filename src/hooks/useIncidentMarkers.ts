'use client';

/**
 * useIncidentMarkers Hook
 * Manages incident markers on the map with real-time updates
 */

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { IncidentSeverity } from '@prisma/client';
import { getSeverityColor, createMarkerIcon } from '@/lib/map-utils';

interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: string;
  category: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  district: string;
  region: string;
}

interface UseIncidentMarkersProps {
  map: mapboxgl.Map | null;
  incidents: Incident[];
  onIncidentClick?: (incident: Incident) => void;
  selectedIncidentId?: string;
}

export function useIncidentMarkers({
  map,
  incidents,
  onIncidentClick,
  selectedIncidentId,
}: UseIncidentMarkersProps) {
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupsRef = useRef<Map<string, mapboxgl.Popup>>(new Map());

  // Add/update markers when incidents change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!map) return;

    // Remove markers that no longer exist
    const currentIds = new Set(incidents.map((i) => i.id));
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
        popupsRef.current.delete(id);
      }
    });

    // Add/update markers
    incidents.forEach((incident) => {
      const existingMarker = markersRef.current.get(incident.id);
      const color = getSeverityColor(incident.severity);
      const isPulsing = incident.severity === IncidentSeverity.CRITICAL;
      const isSelected = selectedIncidentId === incident.id;

      if (existingMarker) {
        // Update existing marker position with high accuracy
        const currentLngLat = existingMarker.getLngLat();
        const newLngLat = [incident.longitude, incident.latitude] as [number, number];

        // Only update if position actually changed (avoid unnecessary updates)
        // 0.0001 degrees ≈ 11 meters - ensures accurate positioning
        if (
          Math.abs(currentLngLat.lng - newLngLat[0]) > 0.0001 ||
          Math.abs(currentLngLat.lat - newLngLat[1]) > 0.0001
        ) {
          existingMarker.setLngLat(newLngLat);
        }
      } else {
        // Create new marker
        const el = document.createElement('div');
        el.className = 'incident-marker';
        el.innerHTML = createMarkerIcon(color, isSelected ? 35 : 30, isPulsing);
        el.style.cursor = 'pointer';
        el.style.width = `${isSelected ? 35 : 30}px`;
        el.style.height = `${isSelected ? 35 : 30}px`;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([incident.longitude, incident.latitude])
          .addTo(map);

        // Escape HTML to prevent XSS
        const escapeHtml = (text: string) => {
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        };

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2 min-w-[200px]">
            <h3 class="font-semibold text-sm">${escapeHtml(incident.title)}</h3>
            <div class="mt-1 space-y-1 text-xs">
              <div><span class="font-medium">Severity:</span> ${escapeHtml(incident.severity)}</div>
              <div><span class="font-medium">Status:</span> ${escapeHtml(incident.status)}</div>
              <div><span class="font-medium">Location:</span> ${escapeHtml(incident.district)}, ${escapeHtml(incident.region)}</div>
              <div class="mt-2">
                <button
                  class="w-full rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                  onclick="window.open('/dashboard/incidents/${incident.id}', '_blank')"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        `);

        marker.setPopup(popup);

        // Handle click
        marker.getElement().addEventListener('click', () => {
          onIncidentClick?.(incident);
        });

        markersRef.current.set(incident.id, marker);
        popupsRef.current.set(incident.id, popup);
      }

      // Update marker appearance if selected
      if (isSelected) {
        const marker = markersRef.current.get(incident.id);
        if (marker) {
          const el = marker.getElement();
          el.innerHTML = createMarkerIcon(color, 35, isPulsing);
          el.style.width = '35px';
          el.style.height = '35px';
        }
      }
    });

    return () => {
      // Cleanup is handled by the map removal
    };
  }, [map, incidents, selectedIncidentId, onIncidentClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      popupsRef.current.clear();
    };
  }, []);

  return {
    markers: markersRef.current,
    highlightIncident: (incidentId: string) => {
      const marker = markersRef.current.get(incidentId);
      if (marker && map) {
        const lngLat = marker.getLngLat();
        map.flyTo({
          center: [lngLat.lng, lngLat.lat],
          zoom: 14,
        });
        marker.togglePopup();
      }
    },
  };
}

