/**
 * Database Utils Tests
 * Tests for database utility functions
 */

import { calculateDistance, formatGhanaPhone, isWithinGhana } from '../utils';

describe('Database Utils', () => {
  describe('calculateDistance (Haversine)', () => {
    it('should calculate distance using Haversine formula', () => {
      // Accra to Kumasi (approximately 200 km by road, ~180 km direct)
      const distance = calculateDistance(5.6037, -0.1870, 6.6885, -1.6244);

      // Should be approximately 180-200 km (direct distance)
      expect(distance).toBeGreaterThan(180);
      expect(distance).toBeLessThan(220);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(5.6037, -0.1870, 5.6037, -0.1870);

      expect(distance).toBe(0);
    });

    it('should handle coordinates across the equator', () => {
      const distance = calculateDistance(1.0, 0.0, -1.0, 0.0);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(250); // Approximately 222 km
    });

    it('should handle coordinates across the prime meridian', () => {
      const distance = calculateDistance(0.0, 1.0, 0.0, -1.0);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(250); // Approximately 222 km
    });
  });

  describe('formatGhanaPhone', () => {
    it('should format phone numbers to +233 format', () => {
      const testCases = [
        { input: '0241234567', expected: '+233241234567' },
        { input: '233241234567', expected: '+233241234567' },
        { input: '+233241234567', expected: '+233241234567' },
      ];

      testCases.forEach(({ input, expected }) => {
        const formatted = formatGhanaPhone(input);
        expect(formatted).toBe(expected);
      });
    });

    it('should handle various input formats', () => {
      const inputs = [
        '024 123 4567',
        '024-123-4567',
        '(024) 123-4567',
        '233 24 123 4567',
      ];

      inputs.forEach((input) => {
        const formatted = formatGhanaPhone(input);
        expect(formatted).toMatch(/^\+233\d{9}$/);
      });
    });

    it('should preserve valid +233 numbers', () => {
      const valid = '+233241234567';
      const formatted = formatGhanaPhone(valid);

      expect(formatted).toBe(valid);
    });

    it('should handle numbers with country code prefix', () => {
      const input = '233241234567';
      const formatted = formatGhanaPhone(input);

      expect(formatted).toBe('+233241234567');
    });
  });

  describe('isWithinGhana', () => {
    it('should return true for coordinates within Ghana', () => {
      const ghanaLocations = [
        { latitude: 5.6037, longitude: -0.1870 }, // Accra
        { latitude: 6.6885, longitude: -1.6244 }, // Kumasi
        { latitude: 4.8667, longitude: -2.2403 }, // Takoradi
        { latitude: 9.0579, longitude: -0.2417 }, // Tamale
        { latitude: 10.0404, longitude: -2.4944 }, // Wa
      ];

      ghanaLocations.forEach((location) => {
        expect(isWithinGhana(location.latitude, location.longitude)).toBe(true);
      });
    });

    it('should return false for coordinates outside Ghana', () => {
      const outsideLocations = [
        { latitude: 15.0, longitude: -0.1870 }, // Too far north (Mali)
        { latitude: 5.6037, longitude: -5.0 }, // Too far west (Côte d'Ivoire)
        { latitude: 2.0, longitude: -0.1870 }, // Too far south (Gulf of Guinea)
        { latitude: 5.6037, longitude: 2.0 }, // Too far east (Togo)
        { latitude: 0, longitude: 0 }, // Equator/Prime Meridian (Atlantic)
      ];

      outsideLocations.forEach((location) => {
        expect(isWithinGhana(location.latitude, location.longitude)).toBe(false);
      });
    });

    it('should handle boundary coordinates correctly', () => {
      // Ghana actual bounds: 4.5-11.2 N, -3.2-1.3 E (from utils.ts)
      const boundaryTests = [
        { latitude: 4.5, longitude: -3.2, expected: true }, // Southwest corner
        { latitude: 11.2, longitude: 1.3, expected: true }, // Northeast corner
        { latitude: 4.4, longitude: -3.2, expected: false }, // Just south
        { latitude: 11.3, longitude: 1.3, expected: false }, // Just north
        { latitude: 4.5, longitude: -3.3, expected: false }, // Just west
        { latitude: 4.5, longitude: 1.4, expected: false }, // Just east
      ];

      boundaryTests.forEach(({ latitude, longitude, expected }) => {
        const result = isWithinGhana(latitude, longitude);
        expect(result).toBe(expected);
      });
    });

    it('should handle edge cases', () => {
      expect(isWithinGhana(0, 0)).toBe(false);
      expect(isWithinGhana(90, 180)).toBe(false);
      expect(isWithinGhana(-90, -180)).toBe(false);
    });
  });
});

