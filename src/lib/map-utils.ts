/**
 * Map Utility Functions
 * Helper functions for map operations and data formatting
 */

import { IncidentSeverity } from '@prisma/client';
import {
  Flame,
  Heart,
  Car,
  CloudRain,
  Shield,
  Wrench,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';

export type IncidentCategory =
  | 'fire'
  | 'medical'
  | 'accident'
  | 'natural_disaster'
  | 'crime'
  | 'infrastructure'
  | 'other';

/**
 * Get color for incident severity
 */
export function getSeverityColor(severity: IncidentSeverity): string {
  const colors: Record<IncidentSeverity, string> = {
    LOW: '#10b981', // Green
    MEDIUM: '#f59e0b', // Orange
    HIGH: '#ef4444', // Red
    CRITICAL: '#991b1b', // Dark red
  };
  return colors[severity];
}

/**
 * Get icon component for incident category
 */
export function getCategoryIcon(category: IncidentCategory): LucideIcon {
  const icons: Record<IncidentCategory, LucideIcon> = {
    fire: Flame,
    medical: Heart,
    accident: Car,
    natural_disaster: CloudRain,
    crime: Shield,
    infrastructure: Wrench,
    other: AlertCircle,
  };
  return icons[category] || AlertCircle;
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lon: number): string {
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}

/**
 * Calculate bounding box for a set of incidents
 */
export function calculateBounds(incidents: Array<{ latitude: number; longitude: number }>): {
  north: number;
  south: number;
  east: number;
  west: number;
} | null {
  if (incidents.length === 0) return null;

  let north = incidents[0].latitude;
  let south = incidents[0].latitude;
  let east = incidents[0].longitude;
  let west = incidents[0].longitude;

  incidents.forEach((incident) => {
    if (incident.latitude > north) north = incident.latitude;
    if (incident.latitude < south) south = incident.latitude;
    if (incident.longitude > east) east = incident.longitude;
    if (incident.longitude < west) west = incident.longitude;
  });

  return { north, south, east, west };
}

/**
 * Create SVG marker icon
 */
export function createMarkerIcon(
  color: string,
  size: number = 30,
  pulse: boolean = false
): string {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="2" opacity="0.9"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
      ${pulse ? '<circle cx="15" cy="15" r="12" fill="${color}" opacity="0.3" class="animate-ping"/>' : ''}
    </svg>
  `;
}

/**
 * Create cluster icon
 */
export function createClusterIcon(count: number, size: number = 40): string {
  const color = count > 10 ? '#ef4444' : count > 5 ? '#f59e0b' : '#10b981';
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${count}</text>
    </svg>
  `;
}

/**
 * Calculate distance between two points (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

