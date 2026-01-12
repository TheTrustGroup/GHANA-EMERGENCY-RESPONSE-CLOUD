'use client';

/**
 * HeatMap Component
 * Geographic heatmap visualization using Mapbox GL JS
 */

import { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IncidentSeverity } from '@prisma/client';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface HeatMapPoint {
  latitude: number;
  longitude: number;
  intensity: number; // 0-1 scale
  severity?: IncidentSeverity;
}

interface HeatMapProps {
  title?: string;
  description?: string;
  points: HeatMapPoint[];
  height?: number;
  onPointClick?: (point: HeatMapPoint) => void;
}

export function HeatMap({
  title,
  description,
  points,
  height = 400,
  onPointClick,
}: HeatMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-1.0232, 7.9465], // Ghana center
      zoom: 6,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !map.current || points.length === 0) return;

    // Create GeoJSON for heatmap
    const geojson = {
      type: 'FeatureCollection' as const,
      features: points.map((point) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [point.longitude, point.latitude],
        },
        properties: {
          intensity: point.intensity,
          severity: point.severity,
        },
      })),
    };

    const sourceId = 'heatmap-source';
    const layerId = 'heatmap-layer';

    // Remove existing source and layer if they exist
    if (map.current.getSource(sourceId)) {
      map.current.removeLayer(layerId);
      map.current.removeSource(sourceId);
    }

    // Add heatmap source
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: geojson as any,
    });

    // Add heatmap layer
    map.current.addLayer({
      id: layerId,
      type: 'heatmap',
      source: sourceId,
      maxzoom: 15,
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'intensity'],
          0,
          0,
          1,
          1,
        ],
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0,
          1,
          9,
          3,
        ],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(33, 102, 172, 0)',
          0.2,
          'rgb(103, 169, 207)',
          0.4,
          'rgb(209, 229, 240)',
          0.6,
          'rgb(253, 219, 199)',
          0.8,
          'rgb(239, 138, 98)',
          1,
          'rgb(178, 24, 43)',
        ],
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0,
          2,
          9,
          20,
        ],
        'heatmap-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7,
          1,
          9,
          0.8,
        ],
      },
    });

    // Fit bounds to points
    if (points.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      points.forEach((point) => {
        bounds.extend([point.longitude, point.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }

    // Handle clicks
    if (onPointClick) {
      map.current.on('click', layerId, (e) => {
        const feature = e.features?.[0];
        if (feature && feature.geometry.type === 'Point') {
          const point: HeatMapPoint = {
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
            intensity: feature.properties?.intensity || 0,
            severity: feature.properties?.severity,
          };
          onPointClick(point);
        }
      });
    }

    return () => {
      if (map.current && map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current && map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    };
  }, [mapLoaded, points, onPointClick]);

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div ref={mapContainer} style={{ width: '100%', height }} />
      </CardContent>
    </Card>
  );
}

