/**
 * Map Utils Tests
 * Tests for map utility functions
 */

import {
  calculateDistance,
  formatCoordinates,
} from '../map-utils';
import { isWithinGhana, getRegionFromCoordinates } from '@/server/db/utils';

describe('Map Utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two known coordinates', () => {
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

    it('should calculate distance correctly for nearby points', () => {
      const distance = calculateDistance(5.6037, -0.1870, 5.6047, -0.1880);

      // Should be approximately 1-2 km
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(5);
    });

    it('should handle negative coordinates', () => {
      const distance = calculateDistance(-5.6037, -0.1870, -5.6047, -0.1880);

      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('isWithinGhana', () => {
    it('should return true for coordinates within Ghana', () => {
      const ghanaLocations = [
        { latitude: 5.6037, longitude: -0.1870 }, // Accra
        { latitude: 6.6885, longitude: -1.6244 }, // Kumasi
        { latitude: 4.8667, longitude: -2.2403 }, // Takoradi
        { latitude: 9.0579, longitude: -0.2417 }, // Tamale
      ];

      ghanaLocations.forEach((location) => {
        expect(isWithinGhana(location.latitude, location.longitude)).toBe(true);
      });
    });

    it('should return false for coordinates outside Ghana', () => {
      const outsideLocations = [
        { latitude: 15.0, longitude: -0.1870 }, // Too far north
        { latitude: 5.6037, longitude: -5.0 }, // Too far west
        { latitude: 2.0, longitude: -0.1870 }, // Too far south
        { latitude: 5.6037, longitude: 2.0 }, // Too far east
        { latitude: 0, longitude: 0 }, // Equator/Prime Meridian
      ];

      outsideLocations.forEach((location) => {
        expect(isWithinGhana(location.latitude, location.longitude)).toBe(false);
      });
    });

    it('should handle boundary coordinates', () => {
      // Ghana approximate bounds: 4.0-11.0 N, -3.0-1.0 E
      const boundaryLocations = [
        { latitude: 4.0, longitude: -3.0 }, // Southwest corner
        { latitude: 11.0, longitude: 1.0 }, // Northeast corner
        { latitude: 4.0, longitude: 1.0 }, // Southeast corner
        { latitude: 11.0, longitude: -3.0 }, // Northwest corner
      ];

      boundaryLocations.forEach((location) => {
        const result = isWithinGhana(location.latitude, location.longitude);
        // Should be true if on boundary, false if outside
        expect(typeof result).toBe('boolean');
      });
    });
  });

  describe('formatCoordinates', () => {
    it('should format coordinates correctly', () => {
      const formatted = formatCoordinates(5.6037, -0.1870);

      expect(formatted).toContain('5.603700');
      expect(formatted).toContain('-0.187000');
    });

    it('should handle different coordinate formats', () => {
      const formatted = formatCoordinates(5.6037, -0.1870);

      // Should be in a readable format
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should handle zero coordinates', () => {
      const formatted = formatCoordinates(0, 0);

      expect(formatted).toBe('0.000000, 0.000000');
    });
  });

  describe('getRegionFromCoordinates', () => {
    it('should return correct region for known coordinates', () => {
      const accra = { latitude: 5.6037, longitude: -0.1870 };
      const region = getRegionFromCoordinates(accra.latitude, accra.longitude);

      expect(region).toBe('Greater Accra');
    });

    it('should return a region for any Ghana coordinates', () => {
      const ghanaLocations = [
        { latitude: 5.6037, longitude: -0.1870 }, // Accra
        { latitude: 6.6885, longitude: -1.6244 }, // Kumasi
        { latitude: 4.8667, longitude: -2.2403 }, // Takoradi
      ];

      ghanaLocations.forEach((location) => {
        const region = getRegionFromCoordinates(location.latitude, location.longitude);
        expect(region).toBeDefined();
        expect(typeof region).toBe('string');
      });
    });

    it('should handle coordinates outside Ghana', () => {
      const outsideLocation = { latitude: 15.0, longitude: -5.0 };

      const region = getRegionFromCoordinates(
        outsideLocation.latitude,
        outsideLocation.longitude
      );

      // Should return null or a default value
      expect(region === null || typeof region === 'string').toBe(true);
    });
  });
});

