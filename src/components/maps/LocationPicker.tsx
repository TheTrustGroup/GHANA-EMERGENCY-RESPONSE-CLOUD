'use client';

/**
 * LocationPicker Component
 * Interactive Mapbox map for selecting incident location
 */

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, MapPin, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import { getRobustLocation } from '@/lib/geolocation/robust-geolocation';

// Set Mapbox access token
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  address?: string;
  region?: string;
  district?: string;
  onLocationChange: (location: {
    latitude: number;
    longitude: number;
    address?: string;
    region?: string;
    district?: string;
  }) => void;
  showAgencies?: boolean;
}

export function LocationPicker({
  latitude,
  longitude,
  address,
  region,
  district,
  onLocationChange,
  showAgencies = false,
}: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  // Fetch agencies if needed
  const { data: agencies } = trpc.agencies.getAll.useQuery(undefined, {
    enabled: showAgencies,
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: 13,
    });

    // Add marker
    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: '#ef4444',
    })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    // Handle marker drag
    marker.current.on('dragend', () => {
      const lngLat = marker.current?.getLngLat();
      if (lngLat) {
        reverseGeocode(lngLat.lat, lngLat.lng);
      }
    });

    // Handle map click
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      marker.current?.setLngLat([lng, lat]);
      reverseGeocode(lat, lng);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update marker position when props change
  useEffect(() => {
    if (map.current && marker.current) {
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 13,
      });
      marker.current.setLngLat([longitude, latitude]);
    }
  }, [latitude, longitude]);

  // Add agency markers
  useEffect(() => {
    if (!map.current || !agencies || !showAgencies) return;

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
      }
    });

    return () => {
      agencyMarkers.forEach((m) => m.remove());
    };
  }, [agencies, showAgencies]);

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&country=gh`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const placeName = feature.place_name;
        const context = feature.context || [];

        // Extract region and district from context
        let regionName = '';
        let districtName = '';

        context.forEach((ctx: any) => {
          if (ctx.id.startsWith('region')) {
            regionName = ctx.text;
          } else if (ctx.id.startsWith('district')) {
            districtName = ctx.text;
          }
        });

        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: placeName,
          region: regionName || region,
          district: districtName || district,
        });
      } else {
        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: undefined,
          region: region || '',
          district: district || '',
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: undefined,
          region: region || '',
          district: district || '',
        });
    }
  };

  // Geocode search query
  const handleSearch = async () => {
    if (!searchQuery.trim() || !map.current) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}&country=gh&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;

        map.current.flyTo({
          center: [lng, lat],
          zoom: 15,
        });

        marker.current?.setLngLat([lng, lat]);
        reverseGeocode(lat, lng);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Use current location with robust fallback strategies
  const handleUseCurrentLocation = async () => {
    setIsGeolocating(true);

    try {
      // Use robust geolocation with multiple fallback strategies
      const location = await getRobustLocation({
        enableHighAccuracy: true,
        timeout: 20000, // 20 seconds
        maximumAge: 300000, // 5 minutes - allow cached
        retries: 3, // Retry 3 times
        retryDelay: 1000, // 1 second between retries
      });

      const { latitude: lat, longitude: lng, accuracy } = location;
      setGpsAccuracy(accuracy);

      if (map.current) {
        map.current.flyTo({
          center: [lng, lat],
          zoom: location.source === 'ip' ? 12 : 15, // Less zoom for IP-based
        });
      }

      marker.current?.setLngLat([lng, lat]);
      reverseGeocode(lat, lng);
    } catch (error: any) {
      console.error('Geolocation error:', error);
      
      // Provide helpful error messages
      let errorMessage = 'Unable to get your location. ';
      if (error?.message?.includes('permission')) {
        errorMessage += 'Location permission was denied. Please enable location access in your browser settings, or click on the map to set your location manually.';
      } else if (error?.message?.includes('unavailable')) {
        errorMessage += 'Location information is unavailable. Please click on the map to set your location manually.';
      } else if (error?.message?.includes('timeout')) {
        errorMessage += 'Location request timed out. Please try again or click on the map to set your location manually.';
      } else {
        errorMessage += 'Please click on the map to set your location manually.';
      }
      
      // Log warning but don't block user
      console.warn(errorMessage);
      
      // Zoom to default location so user can still interact with map
      if (map.current) {
        map.current.flyTo({
          center: [longitude, latitude],
          zoom: 13,
        });
      }
    } finally {
      setIsGeolocating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleUseCurrentLocation}
          disabled={isGeolocating}
        >
          <Navigation className={cn('h-4 w-4', isGeolocating && 'animate-spin')} />
          <span className="ml-2 hidden sm:inline">My Location</span>
        </Button>
      </div>

      {/* Map */}
      <div className="relative">
        <div ref={mapContainer} className="h-96 w-full rounded-lg" />
        {gpsAccuracy && (
          <div className="absolute bottom-4 left-4 rounded bg-white/90 px-2 py-1 text-xs">
            GPS Accuracy: {Math.round(gpsAccuracy)}m
          </div>
        )}
      </div>

      {/* Location Info */}
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Selected Location</span>
          </div>
          {address && (
            <p className="text-sm text-muted-foreground">{address}</p>
          )}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Coordinates: </span>
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </div>
            {region && (
              <div>
                <span className="font-medium">Region: </span>
                {region}
              </div>
            )}
            {district && (
              <div>
                <span className="font-medium">District: </span>
                {district}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

