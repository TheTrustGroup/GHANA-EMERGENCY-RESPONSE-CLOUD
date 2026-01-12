'use client';

/**
 * IncidentMapView Component
 * Map showing incident location with nearby agencies
 */

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Building2 } from 'lucide-react';
import { IncidentSeverity } from '@prisma/client';

// Set Mapbox access token
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

interface Agency {
  id: string;
  name: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
}

interface ResponderLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface IncidentMapViewProps {
  latitude: number;
  longitude: number;
  severity: IncidentSeverity;
  agencies?: Agency[];
  responderLocation?: ResponderLocation;
  className?: string;
}

const severityColors: Record<IncidentSeverity, string> = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  CRITICAL: '#991b1b',
};

export function IncidentMapView({
  latitude,
  longitude,
  severity,
  agencies = [],
  responderLocation,
  className,
}: IncidentMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: 13,
    });

    // Add incident marker
    const incidentMarker = new mapboxgl.Marker({
      color: severityColors[severity],
    })
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">Incident Location</h3>
            <p class="text-sm text-gray-600">Severity: ${severity}</p>
          </div>
        `)
      )
      .addTo(map.current);

    markers.current.push(incidentMarker);

    return () => {
      map.current?.remove();
    };
  }, []);

  // Add agency markers
  useEffect(() => {
    if (!map.current || !agencies) return;

    const agencyMarkers: mapboxgl.Marker[] = [];

    agencies.forEach((agency) => {
      if (agency.latitude && agency.longitude) {
        const el = document.createElement('div');
        el.className = 'agency-marker';
        el.innerHTML = '🏢';
        el.style.fontSize = '20px';
        el.style.cursor = 'pointer';

        const agencyMarker = new mapboxgl.Marker(el)
          .setLngLat([agency.longitude, agency.latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${agency.name}</h3>
                <p class="text-sm text-gray-600">${agency.type}</p>
              </div>
            `)
          )
          .addTo(map.current!);

        agencyMarkers.push(agencyMarker);
        markers.current.push(agencyMarker);
      }
    });

    return () => {
      agencyMarkers.forEach((m) => m.remove());
    };
  }, [agencies]);

  // Add responder location marker
  useEffect(() => {
    if (!map.current || !responderLocation) return;

    const responderMarker = new mapboxgl.Marker({
      color: '#3b82f6',
    })
      .setLngLat([responderLocation.longitude, responderLocation.latitude])
      .setPopup(
        new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">Responder Location</h3>
            <p class="text-sm text-gray-600">${responderLocation.name}</p>
          </div>
        `)
      )
      .addTo(map.current!);

    markers.current.push(responderMarker);

    return () => {
      responderMarker.remove();
    };
  }, [responderLocation]);

  return (
    <div className={className}>
      <div ref={mapContainer} className="h-96 w-full rounded-lg" />
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: severityColors[severity] }}
          />
          <span>Incident</span>
        </div>
        {agencies.length > 0 && (
          <div className="flex items-center gap-2">
            <Building2 className="h-3 w-3" />
            <span>Nearby Agencies</span>
          </div>
        )}
        {responderLocation && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Responder</span>
          </div>
        )}
      </div>
    </div>
  );
}

