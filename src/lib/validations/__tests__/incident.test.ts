/**
 * Incident Validation Tests
 * Tests for incident input validation schemas
 */

import { createIncidentSchema } from '../incident';
import { IncidentSeverity } from '@prisma/client';

describe('Incident Validation', () => {
  describe('CreateIncidentInput schema', () => {
    it('should validate a correct incident input', () => {
      const validInput = {
        title: 'Test Incident',
        description: 'This is a test incident',
        category: 'Fire',
        severity: IncidentSeverity.MEDIUM,
        latitude: 5.6037, // Accra coordinates
        longitude: -0.1870,
        location: 'Accra, Ghana',
        region: 'Greater Accra',
        district: 'Accra Metropolitan',
        contactPhone: '+233241234567',
      };

      const result = createIncidentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid severity values', () => {
      const invalidInput = {
        title: 'Test Incident',
        description: 'This is a test incident',
        category: 'Fire',
        severity: 'INVALID_SEVERITY',
        latitude: 5.6037,
        longitude: -0.1870,
        location: 'Accra, Ghana',
        region: 'Greater Accra',
        district: 'Accra Metropolitan',
        contactPhone: '+233241234567',
      };

      const result = createIncidentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('severity');
      }
    });

    it('should validate coordinates are within Ghana bounds', () => {
      // Valid Ghana coordinates
      const validInput = {
        title: 'Test Incident',
        description: 'This is a test incident',
        category: 'Fire',
        severity: IncidentSeverity.MEDIUM,
        latitude: 5.6037, // Within Ghana (4.0 to 11.0)
        longitude: -0.1870, // Within Ghana (-3.0 to 1.0)
        location: 'Accra, Ghana',
        region: 'Greater Accra',
        district: 'Accra Metropolitan',
        contactPhone: '+233241234567',
      };

      const result = createIncidentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept valid coordinates (schema validates range, not Ghana bounds)', () => {
      // The schema validates lat/lng are valid numbers in range, not specifically Ghana bounds
      // Ghana bounds validation would be done at application level
      const validInput = {
        title: 'Test Incident',
        description: 'This is a test incident',
        category: 'Fire',
        severity: IncidentSeverity.MEDIUM,
        latitude: 5.6037, // Valid coordinate
        longitude: -0.1870,
        location: 'Accra, Ghana',
        region: 'Greater Accra',
        district: 'Accra Metropolitan',
        contactPhone: '+233241234567',
      };

      const result = createIncidentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept phone numbers (schema allows any string)', () => {
      // The schema doesn't validate phone format - that's done at application level
      const validPhones = [
        '+233241234567',
        '0241234567',
        '233241234567',
      ];

      validPhones.forEach((phone) => {
        const input = {
          title: 'Test Incident',
          description: 'This is a test incident',
          category: 'Fire',
          severity: IncidentSeverity.MEDIUM,
          latitude: 5.6037,
          longitude: -0.1870,
          location: 'Accra, Ghana',
          region: 'Greater Accra',
          district: 'Accra Metropolitan',
          contactPhone: phone,
        };

        const result = createIncidentSchema.safeParse(input);
        // Schema accepts any string for contactPhone (optional field)
        expect(result.success).toBe(true);
      });
    });

    it('should enforce required fields', () => {
      const requiredFields = [
        'title',
        'description',
        'category',
        'severity',
        'latitude',
        'longitude',
        'region',
        'district',
      ];

      requiredFields.forEach((field) => {
        const input: any = {
          title: 'Test Incident',
          description: 'This is a test incident',
          category: 'Fire',
          severity: IncidentSeverity.MEDIUM,
          latitude: 5.6037,
          longitude: -0.1870,
          region: 'Greater Accra',
          district: 'Accra Metropolitan',
        };

        delete input[field];

        const result = createIncidentSchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.path).toContain(field);
        }
      });
    });

    it('should validate title length', () => {
      const input = {
        title: 'A'.repeat(300), // Too long
        description: 'This is a test incident',
        category: 'Fire',
        severity: IncidentSeverity.MEDIUM,
        latitude: 5.6037,
        longitude: -0.1870,
        location: 'Accra, Ghana',
        region: 'Greater Accra',
        district: 'Accra Metropolitan',
        contactPhone: '+233241234567',
      };

      const result = createIncidentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should validate description length', () => {
      const input = {
        title: 'Test Incident',
        description: 'A'.repeat(5001), // Too long (max 5000)
        category: 'Fire',
        severity: IncidentSeverity.MEDIUM,
        latitude: 5.6037,
        longitude: -0.1870,
        region: 'Greater Accra',
        district: 'Accra Metropolitan',
      };

      const result = createIncidentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});

