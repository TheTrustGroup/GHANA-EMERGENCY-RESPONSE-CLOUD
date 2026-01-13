/**
 * Analytics Tests
 * Tests for analytics calculation functions
 */

import {
  calculateResponseTime,
  calculateResolutionRate,
  calculateAgencyScore,
  calculateUtilizationRate,
} from '../analytics';
import { IncidentStatus } from '@prisma/client';
import type { incidents } from '@prisma/client';
import { createMockIncident } from '@/test/factories';

describe('Analytics Calculations', () => {
  describe('calculateResponseTime', () => {
    it('should calculate response time for resolved incident', () => {
      const incident = {
        createdAt: new Date('2024-01-01T10:00:00Z'),
        resolvedAt: new Date('2024-01-01T10:30:00Z'),
        status: IncidentStatus.RESOLVED,
      };

      const responseTime = calculateResponseTime(incident);

      expect(responseTime).toBe(30); // 30 minutes
    });

    it('should return null for unresolved incident', () => {
      const incident = {
        createdAt: new Date('2024-01-01T10:00:00Z'),
        resolvedAt: null,
        status: IncidentStatus.IN_PROGRESS,
      };

      const responseTime = calculateResponseTime(incident);

      expect(responseTime).toBeNull();
    });

    it('should handle incidents resolved in seconds', () => {
      const incident = {
        createdAt: new Date('2024-01-01T10:00:00Z'),
        resolvedAt: new Date('2024-01-01T10:00:30Z'),
        status: IncidentStatus.RESOLVED,
      };

      const responseTime = calculateResponseTime(incident);

      // Function rounds to nearest minute, so 30 seconds = 1 minute
      expect(responseTime).toBe(1);
    });

    it('should handle incidents resolved in hours', () => {
      const incident = {
        createdAt: new Date('2024-01-01T10:00:00Z'),
        resolvedAt: new Date('2024-01-01T13:00:00Z'),
        status: IncidentStatus.RESOLVED,
      };

      const responseTime = calculateResponseTime(incident);

      expect(responseTime).toBe(180); // 3 hours = 180 minutes
    });

    it('should use current time if resolvedAt is null but status is RESOLVED', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago

      const incident = {
        createdAt: past,
        resolvedAt: null,
        status: IncidentStatus.RESOLVED,
      };

      const responseTime = calculateResponseTime(incident);

      // Should use current time, so approximately 60 minutes
      expect(responseTime).toBeGreaterThan(55);
      expect(responseTime).toBeLessThan(65);
    });
  });

  describe('calculateResolutionRate', () => {
    it('should calculate resolution rate correctly', () => {
      const incidents = [
        { ...createMockIncident(), status: IncidentStatus.RESOLVED },
        { ...createMockIncident(), status: IncidentStatus.RESOLVED },
        { ...createMockIncident(), status: IncidentStatus.CLOSED },
        { ...createMockIncident(), status: IncidentStatus.IN_PROGRESS },
        { ...createMockIncident(), status: IncidentStatus.REPORTED },
      ] as unknown as Incident[];

      const rate = calculateResolutionRate(incidents);

      // 3 resolved out of 5 = 60%
      expect(rate).toBe(60);
    });

    it('should return 0 for empty array', () => {
      const rate = calculateResolutionRate([]);

      expect(rate).toBe(0);
    });

    it('should return 100 for all resolved incidents', () => {
      const incidents = [
        { ...createMockIncident(), status: IncidentStatus.RESOLVED },
        { ...createMockIncident(), status: IncidentStatus.CLOSED },
      ] as unknown as Incident[];

      const rate = calculateResolutionRate(incidents);

      expect(rate).toBe(100);
    });

    it('should return 0 for no resolved incidents', () => {
      const incidents = [
        { ...createMockIncident(), status: IncidentStatus.REPORTED },
        { ...createMockIncident(), status: IncidentStatus.IN_PROGRESS },
      ] as unknown as Incident[];

      const rate = calculateResolutionRate(incidents);

      expect(rate).toBe(0);
    });
  });

  describe('calculateAgencyScore', () => {
    it('should calculate agency score based on multiple factors', () => {
      const agency = {
        id: 'agency-1',
        name: 'Test Agency',
        incidents: [
          { ...createMockIncident(), status: IncidentStatus.RESOLVED },
          { ...createMockIncident(), status: IncidentStatus.RESOLVED },
          { ...createMockIncident(), status: IncidentStatus.REPORTED },
        ] as unknown as Incident[],
        avgResponseTime: 30,
      };

      const score = calculateAgencyScore(agency);

      expect(score.score).toBeGreaterThan(0);
      expect(score.score).toBeLessThanOrEqual(100);
      expect(score.incidentsHandled).toBe(3);
      expect(score.avgResponseTime).toBe(30);
    });

    it('should handle agency with no incidents', () => {
      const agency = {
        id: 'agency-1',
        name: 'Test Agency',
        incidents: [] as unknown as Incident[],
        avgResponseTime: 0,
      };

      const score = calculateAgencyScore(agency);

      expect(score.incidentsHandled).toBe(0);
      expect(score.score).toBeDefined();
    });

    it('should weight response time in score calculation', () => {
      const fastAgency = {
        id: 'agency-1',
        name: 'Fast Agency',
        incidents: [{ ...createMockIncident(), status: IncidentStatus.RESOLVED }] as unknown as Incident[],
        avgResponseTime: 15, // Fast
      };

      const slowAgency = {
        id: 'agency-2',
        name: 'Slow Agency',
        incidents: [{ ...createMockIncident(), status: IncidentStatus.RESOLVED }] as unknown as Incident[],
        avgResponseTime: 120, // Slow
      };

      const fastScore = calculateAgencyScore(fastAgency);
      const slowScore = calculateAgencyScore(slowAgency);

      // Fast agency should score higher
      expect(fastScore.score).toBeGreaterThan(slowScore.score);
    });

    it('should include all score factors', () => {
      const agency = {
        id: 'agency-1',
        name: 'Test Agency',
        incidents: [{ ...createMockIncident(), status: IncidentStatus.RESOLVED }] as unknown as Incident[],
        avgResponseTime: 30,
      };

      const score = calculateAgencyScore(agency);

      expect(score.factors).toBeDefined();
      expect(score.factors.responseTime).toBeDefined();
      expect(score.factors.resolutionRate).toBeDefined();
      expect(score.factors.volume).toBeDefined();
      expect(score.factors.consistency).toBeDefined();
    });
  });

  describe('calculateUtilizationRate', () => {
    it('should calculate utilization rate correctly', () => {
      const responder = {
        assignments: [
          {
            dispatchedAt: new Date('2024-01-01T10:00:00Z'),
            completedAt: new Date('2024-01-01T11:00:00Z'),
            status: 'completed',
          },
          {
            dispatchedAt: new Date('2024-01-01T12:00:00Z'),
            completedAt: new Date('2024-01-01T13:00:00Z'),
            status: 'completed',
          },
        ],
        totalHours: 24, // 24 hours period
      };

      const rate = calculateUtilizationRate(responder);

      // 2 hours active out of 24 = 8.33%
      expect(rate).toBeGreaterThan(8);
      expect(rate).toBeLessThan(9);
    });

    it('should return 0 for no assignments', () => {
      const responder = {
        assignments: [],
        totalHours: 24,
      };

      const rate = calculateUtilizationRate(responder);

      expect(rate).toBe(0);
    });

    it('should return 0 for zero total hours', () => {
      const responder = {
        assignments: [
          {
            dispatchedAt: new Date('2024-01-01T10:00:00Z'),
            completedAt: new Date('2024-01-01T11:00:00Z'),
            status: 'completed',
          },
        ],
        totalHours: 0,
      };

      const rate = calculateUtilizationRate(responder);

      expect(rate).toBe(0);
    });

    it('should handle incomplete assignments', () => {
      const responder = {
        assignments: [
          {
            dispatchedAt: new Date('2024-01-01T10:00:00Z'),
            completedAt: null,
            status: 'in_progress',
          },
        ],
        totalHours: 24,
      };

      const rate = calculateUtilizationRate(responder);

      // Incomplete assignments shouldn't count
      expect(rate).toBe(0);
    });

    it('should calculate 100% utilization correctly', () => {
      const responder = {
        assignments: [
          {
            dispatchedAt: new Date('2024-01-01T00:00:00Z'),
            completedAt: new Date('2024-01-01T24:00:00Z'),
            status: 'completed',
          },
        ],
        totalHours: 24,
      };

      const rate = calculateUtilizationRate(responder);

      expect(rate).toBe(100);
    });
  });
});

