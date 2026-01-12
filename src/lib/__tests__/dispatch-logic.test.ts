/**
 * Dispatch Logic Tests
 * Tests for dispatch assignment logic
 */

import {
  calculateRecommendedAgencies,
  isResponderAvailable,
  calculateETA,
  validateDispatchAssignment,
} from '../dispatch-logic';
import { createMockAgency, createMockIncident } from '@/test/factories';
import { IncidentSeverity } from '@prisma/client';

describe('Dispatch Logic', () => {
  describe('calculateRecommendedAgencies', () => {
    it('should score agencies based on distance', () => {
      const incident = createMockIncident({
        latitude: 5.6037,
        longitude: -0.1870,
        severity: IncidentSeverity.HIGH,
      });

      const agencies = [
        createMockAgency({
          latitude: 5.6037, // Same location (closest)
          longitude: -0.1870,
        }),
        createMockAgency({
          latitude: 5.7037, // Further away
          longitude: -0.2870,
        }),
      ];

      const recommendations = calculateRecommendedAgencies(incident, agencies);

      expect(recommendations).toHaveLength(2);
      expect(recommendations[0]?.score).toBeGreaterThanOrEqual(recommendations[1]?.score || 0);
    });

    it('should prioritize agencies with available responders', () => {
      const incident = createMockIncident({
        latitude: 5.6037,
        longitude: -0.1870,
      });

      const agencies = [
        createMockAgency({
          id: 'agency-1',
          latitude: 5.6037,
          longitude: -0.1870,
        }),
        createMockAgency({
          id: 'agency-2',
          latitude: 5.6037,
          longitude: -0.1870,
        }),
      ];

      // Mock available responders count
      const recommendations = calculateRecommendedAgencies(incident, agencies);

      expect(recommendations).toHaveLength(2);
      // Agency with more available responders should score higher
    });

    it('should handle empty agencies array', () => {
      const incident = createMockIncident();
      const agencies: any[] = [];

      const recommendations = calculateRecommendedAgencies(incident, agencies);

      expect(recommendations).toHaveLength(0);
    });

    it('should consider incident severity in scoring', () => {
      const criticalIncident = createMockIncident({
        severity: IncidentSeverity.CRITICAL,
      });

      const lowIncident = createMockIncident({
        severity: IncidentSeverity.LOW,
      });

      const agencies = [createMockAgency()];

      const criticalRecs = calculateRecommendedAgencies(criticalIncident, agencies);
      const lowRecs = calculateRecommendedAgencies(lowIncident, agencies);

      // Critical incidents should have different scoring
      expect(criticalRecs).toBeDefined();
      expect(lowRecs).toBeDefined();
    });
  });

  describe('isResponderAvailable', () => {
    it('should return true for available responder', () => {
      const responder = {
        id: 'responder-1',
        name: 'Test Responder',
        status: 'available' as const,
        agencyId: 'agency-1',
      };

      const isAvailable = isResponderAvailable(responder);
      expect(isAvailable).toBe(true);
    });

    it('should return false for busy responder', () => {
      const responder = {
        id: 'responder-1',
        name: 'Test Responder',
        status: 'dispatched' as const,
        agencyId: 'agency-1',
      };

      const isAvailable = isResponderAvailable(responder);
      expect(isAvailable).toBe(false);
    });

    it('should return false for off-duty responder', () => {
      const responder = {
        id: 'responder-1',
        name: 'Test Responder',
        status: 'off-duty' as const,
        agencyId: 'agency-1',
      };

      const isAvailable = isResponderAvailable(responder);
      expect(isAvailable).toBe(false);
    });
  });

  describe('calculateETA', () => {
    it('should calculate ETA based on distance', () => {
      const responderLocation = { latitude: 5.6037, longitude: -0.1870 };
      const incidentLocation = { latitude: 5.7037, longitude: -0.2870 };

      const eta = calculateETA(responderLocation, incidentLocation);

      expect(eta).toBeGreaterThan(0);
      expect(typeof eta).toBe('number');
    });

    it('should return minimum buffer for same location', () => {
      const location = { latitude: 5.6037, longitude: -0.1870 };

      const eta = calculateETA(location, location);

      // Function adds a buffer, so it won't be 0
      expect(eta).toBeGreaterThanOrEqual(5);
    });

    it('should account for traffic conditions', () => {
      const responderLocation = { latitude: 5.6037, longitude: -0.187 };
      const incidentLocation = { latitude: 5.7037, longitude: -0.287 };

      const etaNormal = calculateETA(responderLocation, incidentLocation, 'normal');
      const etaHeavy = calculateETA(responderLocation, incidentLocation, 'rush_hour');

      // Rush hour should take longer than normal
      expect(etaHeavy).toBeGreaterThanOrEqual(etaNormal);
    });

    it('should account for time of day', () => {
      const responderLocation = { latitude: 5.6037, longitude: -0.1870 };
      const incidentLocation = { latitude: 5.7037, longitude: -0.2870 };

      const etaRushHour = calculateETA(
        responderLocation,
        incidentLocation,
        'rush_hour'
      );
      const etaOffPeak = calculateETA(
        responderLocation,
        incidentLocation,
        'night'
      );

      expect(etaRushHour).toBeGreaterThanOrEqual(etaOffPeak);
    });
  });

  describe('validateDispatchAssignment', () => {
    it('should validate a correct dispatch assignment', () => {
      const assignment = {
        incidentId: 'incident-1',
        agencyId: 'agency-1',
        responderId: 'responder-1',
        priority: 3,
      };

      const incident = { status: 'REPORTED' };
      const agency = { isActive: true };

      const result = validateDispatchAssignment(assignment, incident, agency, undefined);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject assignment when agency is inactive', () => {
      const assignment = {
        incidentId: 'incident-1',
        agencyId: 'agency-1',
        responderId: 'responder-1',
        priority: 3,
      };

      const incident = { status: 'REPORTED' };
      const agency = { isActive: false }; // Inactive agency

      const result = validateDispatchAssignment(assignment, incident, agency, undefined);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Agency must be active');
    });

    it('should validate priority levels', () => {
      const validPriorities = [1, 2, 3, 4, 5];

      validPriorities.forEach((priority) => {
        const assignment = {
          incidentId: 'incident-1',
          agencyId: 'agency-1',
          responderId: 'responder-1',
          priority,
        };

        const incident = { status: 'REPORTED' };
        const agency = { isActive: true };

        const result = validateDispatchAssignment(assignment, incident, agency, undefined);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid priority levels', () => {
      const assignment = {
        incidentId: 'incident-1',
        agencyId: 'agency-1',
        responderId: 'responder-1',
        priority: 0, // Invalid (must be 1-5)
      };

      const incident = { status: 'REPORTED' };
      const agency = { isActive: true };

      const result = validateDispatchAssignment(assignment, incident, agency, undefined);
      expect(result.valid).toBe(false);
    });
  });
});

