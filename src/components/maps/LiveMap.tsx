'use client';

/**
 * SIMPLE Live Map Component
 * Mapbox GL JS map showing all active incidents
 * Real-time updates via Pusher
 */

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { IncidentSeverity } from '@prisma/client';
import { pusherClient } from '@/lib/pusher-simple';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface Incident {
  id: string;
  title: string;
  category: string;
  severity: IncidentSeverity;
  latitude: number;
  longitude: number;
  status: string;
}

interface LiveMapProps {
  incidents?: Incident[];
  onIncidentClick?: (incident: Incident) => void;
  className?: string;
}

export function LiveMap({ incidents = [], onIncidentClick, className }: LiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());

  useEffect(() => {
    if (!mapContainer.current || !mapboxgl.accessToken) return;

    // Initialize map centered on Ghana (Accra)
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-0.1870, 5.6037], // Accra
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add incident markers
    incidents.forEach((incident) => {
      addMarker(incident);
    });

    // Subscribe to real-time updates
    const channel = pusherClient.subscribe('incidents');

    channel.bind('new-incident', (data: Incident) => {
      addMarker(data);
    });

    channel.bind('incident-updated', (data: Incident) => {
      updateMarker(data);
    });

    channel.bind('incident-resolved', (data: { id: string }) => {
      removeMarker(data.id);
    });

    return () => {
      // Cleanup
      markers.current.forEach((marker) => marker.remove());
      markers.current.clear();
      channel.unbind_all();
      channel.unsubscribe();
      map.current?.remove();
    };
  }, []);

  // Update markers when incidents change
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
    markers.current.forEach((marker) => marker.remove());
    markers.current.clear();

    // Add new markers
    incidents.forEach((incident) => {
      addMarker(incident);
    });
  }, [incidents]);

  const addMarker = (incident: Incident) => {
    if (!map.current) return;

    const color = getSeverityColor(incident.severity);
    const marker = new mapboxgl.Marker({
      color,
      scale: 1.2,
    })
      .setLngLat([incident.longitude, incident.latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-3 min-w-[200px]">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
              <p class="font-bold text-sm">${incident.title}</p>
            </div>
            <p class="text-xs text-gray-600 mb-2">${incident.category}</p>
            <button 
              class="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
              onclick="window.dispatchEvent(new CustomEvent('map-incident-click', { detail: '${incident.id}' }))"
            >
              View Details
            </button>
          </div>
        `)
      )
      .addTo(map.current);

    // Handle click
    marker.getElement().addEventListener('click', () => {
      onIncidentClick?.(incident);
    });

    // Listen for popup button clicks
    if (typeof window !== 'undefined') {
      window.addEventListener('map-incident-click', ((e: CustomEvent) => {
        if (e.detail === incident.id) {
          onIncidentClick?.(incident);
        }
      }) as EventListener);
    }

    markers.current.set(incident.id, marker);
  };

  const updateMarker = (incident: Incident) => {
    const marker = markers.current.get(incident.id);
    if (marker && map.current) {
      const color = getSeverityColor(incident.severity);
      marker.setLngLat([incident.longitude, incident.latitude]);
      // Update popup content
      marker.setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-3 min-w-[200px]">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
              <p class="font-bold text-sm">${incident.title}</p>
            </div>
            <p class="text-xs text-gray-600 mb-2">${incident.category}</p>
            <button 
              class="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
              onclick="window.dispatchEvent(new CustomEvent('map-incident-click', { detail: '${incident.id}' }))"
            >
              View Details
            </button>
          </div>
        `)
      );
    }
  };

  const removeMarker = (incidentId: string) => {
    const marker = markers.current.get(incidentId);
    if (marker) {
      marker.remove();
      markers.current.delete(incidentId);
    }
  };

  return (
    <div ref={mapContainer} className={`w-full h-full ${className || ''}`} />
  );
}

function getSeverityColor(severity: IncidentSeverity): string {
  switch (severity) {
    case 'CRITICAL':
      return '#dc2626'; // red-600
    case 'HIGH':
      return '#ea580c'; // orange-600
    case 'MEDIUM':
      return '#ca8a04'; // yellow-600
    default:
      return '#16a34a'; // green-600
  }
}
