/**
 * Database Utility Functions
 * Helper functions for database operations and data validation
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Check if coordinates are within Ghana's boundaries
 * Ghana approximate boundaries:
 * Latitude: 4.5°N to 11.2°N
 * Longitude: 3.2°W to 1.3°E
 */
export function isWithinGhana(lat: number, lon: number): boolean {
  return lat >= 4.5 && lat <= 11.2 && lon >= -3.2 && lon <= 1.3;
}

/**
 * Format Ghana phone number to standard format (+233...)
 * Accepts various formats and normalizes to +233XXXXXXXXX
 */
export function formatGhanaPhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Handle different formats
  if (cleaned.startsWith('233')) {
    // Already has country code
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    // Local format (0XX...)
    return `+233${cleaned.substring(1)}`;
  } else if (cleaned.length === 9) {
    // 9 digits without leading 0
    return `+233${cleaned}`;
  } else {
    // Assume it's already in correct format or return as is
    return cleaned.startsWith('+') ? cleaned : `+233${cleaned}`;
  }
}

/**
 * Get Ghana region from coordinates
 * Maps coordinates to approximate regions
 */
export function getRegionFromCoordinates(
  lat: number,
  lon: number
): string | null {
  // Greater Accra Region (Accra, Tema)
  if (lat >= 5.4 && lat <= 6.0 && lon >= -0.5 && lon <= 0.3) {
    return 'Greater Accra';
  }
  // Ashanti Region (Kumasi)
  else if (lat >= 6.5 && lat <= 7.0 && lon >= -2.0 && lon <= -1.5) {
    return 'Ashanti';
  }
  // Western Region (Takoradi)
  else if (lat >= 4.8 && lat <= 5.2 && lon >= -2.5 && lon <= -1.8) {
    return 'Western';
  }
  // Northern Region (Tamale)
  else if (lat >= 9.2 && lat <= 9.6 && lon >= -1.0 && lon <= -0.5) {
    return 'Northern';
  }
  // Eastern Region
  else if (lat >= 5.8 && lat <= 6.8 && lon >= -0.8 && lon <= 0.5) {
    return 'Eastern';
  }
  // Central Region
  else if (lat >= 5.0 && lat <= 5.8 && lon >= -1.5 && lon <= -0.5) {
    return 'Central';
  }
  // Volta Region
  else if (lat >= 5.8 && lat <= 7.0 && lon >= 0.0 && lon <= 1.3) {
    return 'Volta';
  }
  // Upper East Region
  else if (lat >= 10.5 && lat <= 11.2 && lon >= -1.5 && lon <= -0.5) {
    return 'Upper East';
  }
  // Upper West Region
  else if (lat >= 9.8 && lat <= 10.5 && lon >= -3.2 && lon <= -2.0) {
    return 'Upper West';
  }
  // Brong Ahafo Region
  else if (lat >= 7.0 && lat <= 8.5 && lon >= -3.0 && lon <= -1.5) {
    return 'Brong Ahafo';
  }
  // Western North Region
  else if (lat >= 5.5 && lat <= 6.5 && lon >= -2.8 && lon <= -2.0) {
    return 'Western North';
  }
  // Ahafo Region
  else if (lat >= 6.5 && lat <= 7.5 && lon >= -2.5 && lon <= -1.8) {
    return 'Ahafo';
  }
  // Bono Region
  else if (lat >= 7.5 && lat <= 8.5 && lon >= -2.8 && lon <= -1.8) {
    return 'Bono';
  }
  // Bono East Region
  else if (lat >= 7.5 && lat <= 8.5 && lon >= -1.8 && lon <= -0.5) {
    return 'Bono East';
  }
  // Oti Region
  else if (lat >= 7.5 && lat <= 8.5 && lon >= 0.0 && lon <= 0.8) {
    return 'Oti';
  }
  // North East Region
  else if (lat >= 9.8 && lat <= 10.5 && lon >= -1.5 && lon <= -0.5) {
    return 'North East';
  }
  // Savannah Region
  else if (lat >= 8.5 && lat <= 9.8 && lon >= -2.5 && lon <= -1.0) {
    return 'Savannah';
  }
  // Western Region (additional coverage)
  else if (lat >= 4.5 && lat <= 5.5 && lon >= -3.2 && lon <= -1.8) {
    return 'Western';
  }

  return null;
}

/**
 * Get Ghana district from coordinates
 * Simplified version - returns a default district based on region
 */
export function getDistrictFromCoordinates(
  lat: number,
  lon: number
): string {
  const region = getRegionFromCoordinates(lat, lon);

  // Return a default district name based on region
  // In a real implementation, this would use a more detailed mapping
  if (region === 'Greater Accra') {
    return 'Accra Metropolitan';
  } else if (region === 'Ashanti') {
    return 'Kumasi Metropolitan';
  } else if (region === 'Western') {
    return 'Sekondi-Takoradi Metropolitan';
  } else if (region === 'Northern') {
    return 'Tamale Metropolitan';
  } else if (region === 'Eastern') {
    return 'Koforidua';
  } else if (region === 'Central') {
    return 'Cape Coast Metropolitan';
  } else if (region === 'Volta') {
    return 'Ho Municipal';
  } else if (region === 'Upper East') {
    return 'Bolgatanga Municipal';
  } else if (region === 'Upper West') {
    return 'Wa Municipal';
  }

  // Default fallback
  return 'Unknown District';
}
