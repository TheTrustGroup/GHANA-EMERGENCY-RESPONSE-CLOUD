/**
 * Dispatch Business Logic
 * Core logic for dispatch assignment and management
 */

import { IncidentSeverity, AgencyType } from '@prisma/client';
import { calculateDistance } from './map-utils';

interface Incident {
  category: string;
  severity: IncidentSeverity;
  latitude: number;
  longitude: number;
}

interface Agency {
  id: string;
  name: string;
  type: AgencyType;
  latitude: number | null;
  longitude: number | null;
  activeIncidentsCount?: number;
  availableRespondersCount?: number;
  avgResponseTime?: number | null;
}

interface Responder {
  id: string;
  name: string;
  status: 'available' | 'dispatched' | 'off-duty';
  latitude?: number | null;
  longitude?: number | null;
  agencyId: string;
}

interface DispatchAssignment {
  incidentId: string;
  agencyId: string;
  responderId?: string;
  priority: number;
  notes?: string;
}

/**
 * Calculate recommended agencies for an incident
 * Returns agencies sorted by recommendation score
 */
export function calculateRecommendedAgencies(
  incident: Incident,
  agencies: Agency[]
): Array<Agency & { score: number; distance: number; reasons: string[] }> {
  const scored = agencies
    .filter((agency) => agency.latitude && agency.longitude)
    .map((agency) => {
      const distance = calculateDistance(
        incident.latitude,
        incident.longitude,
        agency.latitude!,
        agency.longitude!
      );

      let score = 0;
      const reasons: string[] = [];

      // Distance score (closer = better, max 30 points)
      const distanceScore = Math.max(0, 30 - distance * 2);
      score += distanceScore;
      if (distanceScore > 20) reasons.push('Very close to incident');

      // Category matching (max 25 points)
      const categoryMatch = getCategoryAgencyMatch(incident.category, agency.type);
      score += categoryMatch.score;
      if (categoryMatch.score > 15) reasons.push(categoryMatch.reason);

      // Availability score (max 20 points)
      const availableResponders = agency.availableRespondersCount || 0;
      const availabilityScore = Math.min(20, availableResponders * 5);
      score += availabilityScore;
      if (availabilityScore > 10) reasons.push(`${availableResponders} responders available`);

      // Workload score (less workload = better, max 15 points)
      const activeIncidents = agency.activeIncidentsCount || 0;
      const workloadScore = Math.max(0, 15 - activeIncidents * 2);
      score += workloadScore;
      if (workloadScore > 10) reasons.push('Low current workload');

      // Performance score (faster response = better, max 10 points)
      const avgResponseTime = agency.avgResponseTime || 60; // Default 60 minutes
      const performanceScore = Math.max(0, 10 - avgResponseTime / 6);
      score += performanceScore;
      if (performanceScore > 7) reasons.push('Fast response times');

      return {
        ...agency,
        score: Math.round(score),
        distance: Math.round(distance * 10) / 10,
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored;
}

/**
 * Match incident category to agency type
 */
function getCategoryAgencyMatch(
  category: string,
  agencyType: AgencyType
): { score: number; reason: string } {
  const matches: Record<string, AgencyType[]> = {
    fire: [AgencyType.FIRE_SERVICE, AgencyType.NADMO],
    medical: [AgencyType.AMBULANCE, AgencyType.NADMO],
    accident: [AgencyType.AMBULANCE, AgencyType.POLICE, AgencyType.FIRE_SERVICE],
    natural_disaster: [AgencyType.NADMO, AgencyType.FIRE_SERVICE],
    crime: [AgencyType.POLICE],
    infrastructure: [AgencyType.NADMO, AgencyType.FIRE_SERVICE],
  };

  const matchedTypes = matches[category] || [];
  if (matchedTypes.includes(agencyType)) {
    return {
      score: 25,
      reason: `Specialized in ${category} incidents`,
    };
  }

  // Partial match for general agencies
  if (agencyType === AgencyType.NADMO) {
    return { score: 15, reason: 'General emergency response' };
  }

  return { score: 5, reason: 'General agency' };
}

/**
 * Check if responder is available for dispatch
 */
export function isResponderAvailable(responder: Responder): boolean {
  return responder.status === 'available';
}

/**
 * Calculate estimated time of arrival
 * Factors: distance, average speed, time of day
 */
export function calculateETA(
  responderLocation: { latitude: number; longitude: number },
  incidentLocation: { latitude: number; longitude: number },
  timeOfDay?: 'rush_hour' | 'normal' | 'night'
): number {
  const distance = calculateDistance(
    responderLocation.latitude,
    responderLocation.longitude,
    incidentLocation.latitude,
    incidentLocation.longitude
  );

  // Average speeds (km/h)
  const speeds: Record<string, number> = {
    rush_hour: 30, // Slower during rush hour
    normal: 50, // Normal traffic
    night: 60, // Less traffic at night
  };

  const speed = speeds[timeOfDay || 'normal'] || 50;
  const timeInHours = distance / speed;
  const timeInMinutes = Math.ceil(timeInHours * 60);

  // Add buffer for urban areas
  const buffer = distance < 5 ? 5 : distance < 10 ? 10 : 15;

  return timeInMinutes + buffer;
}

/**
 * Format ETA for display
 */
export function formatETA(minutes: number): string {
  if (minutes < 60) {
    return `~${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `~${hours}h ${mins}m`;
}

/**
 * Validate dispatch assignment
 */
export function validateDispatchAssignment(
  assignment: DispatchAssignment,
  incident: { status: string },
  agency: { isActive: boolean },
  responder?: Responder
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Incident must be in valid status
  if (incident.status !== 'REPORTED' && incident.status !== 'DISPATCHED') {
    errors.push('Incident must be in REPORTED or DISPATCHED status');
  }

  // Agency must be active
  if (!agency.isActive) {
    errors.push('Agency must be active');
  }

  // If responder specified, validate
  if (assignment.responderId && responder) {
    if (!isResponderAvailable(responder)) {
      errors.push('Responder is not available');
    }

    if (responder.agencyId !== assignment.agencyId) {
      errors.push('Responder must belong to selected agency');
    }
  }

  // Priority must be valid
  if (assignment.priority < 1 || assignment.priority > 5) {
    errors.push('Priority must be between 1 and 5');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get time of day category
 */
export function getTimeOfDay(): 'rush_hour' | 'normal' | 'night' {
  const hour = new Date().getHours();

  // Rush hour: 7-9 AM and 5-7 PM
  if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19)) {
    return 'rush_hour';
  }

  // Night: 10 PM - 6 AM
  if (hour >= 22 || hour < 6) {
    return 'night';
  }

  return 'normal';
}

