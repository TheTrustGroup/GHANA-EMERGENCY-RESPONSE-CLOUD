'use client';

/**
 * LiveIncidentMap Component
 * Interactive Mapbox map with incident and responder markers
 */

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useIncidentMarkers } from '@/hooks/useIncidentMarkers';
import { useResponderTracking } from '@/hooks/useResponderTracking';
import { IncidentSeverity } from '@prisma/client';
import { MapErrorBoundary } from './MapErrorBoundary';

// Set Mapbox access token
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

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

interface Responder {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'available' | 'dispatched';
  incidentId?: string;
}

interface Agency {
  id: string;
  name: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
}

interface LiveIncidentMapProps {
  incidents: Incident[];
  responders?: Responder[];
  agencies?: Agency[];
  selectedIncidentId?: string;
  showAgencies?: boolean;
  showResponders?: boolean;
  onIncidentClick?: (incident: Incident) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
  mapStyle?: string; // For satellite map integration
}

export function LiveIncidentMap({
  incidents,
  responders = [],
  agencies = [],
  selectedIncidentId,
  showAgencies = false,
  showResponders = false,
  onIncidentClick,
  className,
  center = [-1.0232, 7.9465], // Ghana center
  zoom = 6,
  mapStyle = 'mapbox://styles/mapbox/streets-v12',
}: LiveIncidentMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const agencyMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const currentStyleRef = useRef<string>('');

  // Initialize map - only on client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mapContainer.current || map.current) return;

    // Support satellite map styles
    const styleMap: Record<string, string> = {
      'satellite-streets': 'mapbox://styles/mapbox/satellite-streets-v12',
      'satellite': 'mapbox://styles/mapbox/satellite-v9',
      'streets': 'mapbox://styles/mapbox/streets-v12',
    };

    const initialStyle = styleMap[mapStyle] || mapStyle || 'mapbox://styles/mapbox/streets-v12';
    currentStyleRef.current = initialStyle;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: center as [number, number],
      zoom: zoom,
      // Enable high accuracy for location tracking
      pitch: 0,
      bearing: 0,
      // Optimize for real-time updates
      antialias: true,
      // Improve location accuracy
      maxZoom: 18,
      minZoom: 3,
    });

    // Wait for style to load before accessing it
    map.current.on('style.load', () => {
      if (map.current) {
        try {
          const style = map.current.getStyle();
          currentStyleRef.current = style.name || initialStyle;
        } catch (error) {
          // Style might not be fully loaded yet
          currentStyleRef.current = initialStyle;
        }
      }
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control with high accuracy
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0, // Always get fresh position
        },
        trackUserLocation: true,
        showUserHeading: true,
        showUserLocation: true,
      }),
      'top-right'
    );
    
    // Ensure map is ready before adding markers
    map.current.on('load', () => {
      // Map is fully loaded and ready for markers
      if (map.current) {
        map.current.resize(); // Ensure proper sizing
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map style when prop changes
  useEffect(() => {
    if (!map.current) return;
    
    const styleMap: Record<string, string> = {
      'satellite-streets': 'mapbox://styles/mapbox/satellite-streets-v12',
      'satellite': 'mapbox://styles/mapbox/satellite-v9',
      'streets': 'mapbox://styles/mapbox/streets-v12',
    };
    
    const newStyle = styleMap[mapStyle] || mapStyle || 'mapbox://styles/mapbox/streets-v12';
    
    // Only update if style has changed
    if (currentStyleRef.current !== newStyle) {
      // Check if map is loaded before accessing style
      if (map.current.loaded()) {
        try {
          const currentStyle = map.current.getStyle();
          if (currentStyle.name !== newStyle) {
            map.current.setStyle(newStyle);
            currentStyleRef.current = newStyle;
          }
        } catch (error) {
          // Style not ready, set it anyway and update ref
          map.current.setStyle(newStyle);
          currentStyleRef.current = newStyle;
        }
      } else {
        // Map not loaded yet, wait for load event
        const handleLoad = () => {
          if (map.current && currentStyleRef.current !== newStyle) {
            map.current.setStyle(newStyle);
            currentStyleRef.current = newStyle;
            map.current.off('load', handleLoad);
          }
        };
        map.current.on('load', handleLoad);
      }
    }
  }, [mapStyle]);

  // Update map center and zoom when props change
  useEffect(() => {
    if (!map.current) return;
    map.current.flyTo({
      center: center as [number, number],
      zoom: zoom,
      duration: 1000,
    });
  }, [center, zoom]);

  // Use incident markers hook
  useIncidentMarkers({
    map: map.current,
    incidents,
    onIncidentClick,
    selectedIncidentId,
  });

  // Use responder tracking hook
  useResponderTracking({
    map: map.current,
    responders: showResponders ? responders : [],
    showRoutes: true,
  });

  // Add agency markers
  useEffect(() => {
    if (!map.current || !showAgencies) {
      // Remove agency markers if not showing
      agencyMarkersRef.current.forEach((marker) => marker.remove());
      agencyMarkersRef.current = [];
      return;
    }

    // Remove existing agency markers
    agencyMarkersRef.current.forEach((marker) => marker.remove());
    agencyMarkersRef.current = [];

    // Add new agency markers
    agencies.forEach((agency) => {
      if (agency.latitude && agency.longitude) {
        const el = document.createElement('div');
        el.className = 'agency-marker';
        el.innerHTML = '🏢';
        el.style.fontSize = '20px';
        el.style.cursor = 'pointer';

        // Escape HTML to prevent XSS
        const escapeHtml = (text: string) => {
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        };

        const marker = new mapboxgl.Marker(el)
          .setLngLat([agency.longitude, agency.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-sm">${escapeHtml(agency.name)}</h3>
                <p class="text-xs text-muted-foreground">${escapeHtml(agency.type)}</p>
              </div>
            `)
          )
          .addTo(map.current!);

        agencyMarkersRef.current.push(marker);
      }
    });

    return () => {
      agencyMarkersRef.current.forEach((marker) => marker.remove());
      agencyMarkersRef.current = [];
    };
  }, [agencies, showAgencies]);

  // Fly to selected incident
  useEffect(() => {
    if (!map.current || !selectedIncidentId) return;

    const incident = incidents.find((i) => i.id === selectedIncidentId);
    if (incident) {
      map.current.flyTo({
        center: [incident.longitude, incident.latitude],
        zoom: 14,
        duration: 1000,
      });
    }
  }, [selectedIncidentId, incidents]);

  // Only render map on client to prevent hydration errors
  if (typeof window === 'undefined') {
    return (
      <div className={className}>
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <MapErrorBoundary>
      <div className={className}>
        <div ref={mapContainer} className="h-full w-full" />
      </div>
    </MapErrorBoundary>
  );
}

